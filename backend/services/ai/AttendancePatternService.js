const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AIConfig = require('./AIConfig');

/**
 * Attendance Pattern Service
 * Detects patterns and anomalies in student attendance
 */
class AttendancePatternService {
  /**
   * Analyze student attendance and detect patterns
   * @param {String} studentId - Student ID
   * @param {Number} windowDays - Analysis window in days (default: 30)
   * @returns {Promise<Object>} - Detected patterns and insights
   */
  async analyzeStudent(studentId, windowDays = 30) {
    try {
      const config = AIConfig.getAttendanceConfig();
      const analysisWindow = windowDays || config.analysisWindowDays;

      // Get attendance records for the period
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - analysisWindow);

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId,
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (attendanceRecords.length === 0) {
        return {
          patterns: [],
          insights: [],
          summary: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            attendanceRate: 0,
          },
        };
      }

      // Calculate summary statistics
      const summary = this.calculateSummary(attendanceRecords);

      // Detect various patterns
      const patterns = [];
      const insights = [];

      // 1. Chronic Absence
      const chronicAbsence = this.detectChronicAbsence(attendanceRecords, summary);
      if (chronicAbsence) {
        patterns.push(chronicAbsence);
      }

      // 2. Day-of-week patterns
      const dayPatterns = this.detectDayPatterns(attendanceRecords);
      patterns.push(...dayPatterns);

      // 3. Subject-specific patterns
      const subjectPatterns = this.detectSubjectPatterns(attendanceRecords);
      patterns.push(...subjectPatterns);

      // 4. Trend analysis
      const trend = this.analyzeTrend(attendanceRecords);
      if (trend.insight) {
        insights.push(trend.insight);
      }

      // 5. Recent absence streak
      const absenceStreak = this.detectAbsenceStreak(attendanceRecords);
      if (absenceStreak) {
        patterns.push(absenceStreak);
      }

      // Save detected patterns to database
      await this.savePatterns(studentId, patterns);

      // Generate insights
      const generatedInsights = this.generateInsights(summary, patterns);
      await this.saveInsights(studentId, generatedInsights);

      return {
        patterns,
        insights: [...insights, ...generatedInsights],
        summary,
        trend,
      };
    } catch (error) {
      console.error('Attendance analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze class attendance trends
   */
  async analyzeClass(classId, windowDays = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - windowDays);

      // Get all students in class
      const students = await prisma.student.findMany({
        where: { currentClassId: classId },
        select: { id: true, firstName: true, lastName: true },
      });

      // Analyze each student
      const analyses = await Promise.all(
        students.map(async (student) => {
          const analysis = await this.analyzeStudent(student.id, windowDays);
          return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            ...analysis,
          };
        })
      );

      // Calculate class-level statistics
      const classStats = this.calculateClassStats(analyses);

      // Identify at-risk students
      const atRiskStudents = analyses.filter(
        (a) => a.summary.attendanceRate < 85 || a.patterns.some((p) => p.severity === 'HIGH' || p.severity === 'CRITICAL')
      );

      return {
        classStats,
        atRiskStudents,
        totalStudents: students.length,
        analyses,
      };
    } catch (error) {
      console.error('Class analysis error:', error);
      throw error;
    }
  }

  /**
   * Get at-risk students
   */
  async getAtRiskStudents(schoolId, classId = null, threshold = 85) {
    const where = {
      schoolId,
      ...(classId && { currentClassId: classId }),
      attendancePercentage: {
        lt: threshold,
      },
    };

    return prisma.student.findMany({
      where,
      include: {
        currentClass: {
          select: { name: true },
        },
        attendancePatterns: {
          where: {
            resolved: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        attendancePercentage: 'asc',
      },
    });
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(records) {
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'PRESENT').length;
    const absentDays = records.filter((r) => r.status === 'ABSENT').length;
    const lateDays = records.filter((r) => r.status === 'LATE').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
    };
  }

  /**
   * Detect chronic absence (< 85% attendance)
   */
  detectChronicAbsence(records, summary) {
    if (summary.attendanceRate >= 85) return null;

    let severity = 'LOW';
    if (summary.attendanceRate < 75) severity = 'CRITICAL';
    else if (summary.attendanceRate < 80) severity = 'HIGH';
    else if (summary.attendanceRate < 85) severity = 'MODERATE';

    return {
      patternType: 'CHRONIC_ABSENCE',
      severity,
      description: `Attendance rate is ${summary.attendanceRate}%, below the required 85%`,
      confidence: 0.95,
      occurrences: summary.absentDays,
      recommendations: this.getChronicAbsenceRecommendations(severity),
    };
  }

  /**
   * Detect day-of-week patterns
   */
  detectDayPatterns(records) {
    const dayStats = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    records.forEach((record) => {
      const day = new Date(record.date).getDay();
      if (!dayStats[day]) {
        dayStats[day] = { present: 0, absent: 0, total: 0 };
      }
      dayStats[day].total++;
      if (record.status === 'PRESENT') dayStats[day].present++;
      else if (record.status === 'ABSENT') dayStats[day].absent++;
    });

    const patterns = [];

    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.total < 3) return; // Need at least 3 occurrences

      const absenceRate = (stats.absent / stats.total) * 100;

      // Pattern detected if >50% absent on specific day
      if (absenceRate > 50) {
        const dayName = dayNames[parseInt(day)];
        const patternType = day === '1' ? 'MONDAY_PATTERN' : day === '5' ? 'FRIDAY_PATTERN' : 'IRREGULAR';

        patterns.push({
          patternType,
          severity: absenceRate > 75 ? 'HIGH' : 'MODERATE',
          description: `Frequently absent on ${dayName}s (${absenceRate.toFixed(1)}% absence rate)`,
          confidence: 0.85,
          occurrences: stats.absent,
          dayPattern: { day: dayName, absenceRate },
          recommendations: [`Investigate reason for ${dayName} absences`, 'Schedule parent meeting'],
        });
      }
    });

    return patterns;
  }

  /**
   * Detect subject-specific patterns
   */
  detectSubjectPatterns(records) {
    const subjectStats = {};

    records.forEach((record) => {
      if (!record.subject) return;

      const subjectId = record.subject.id;
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          name: record.subject.name,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      subjectStats[subjectId].total++;
      if (record.status === 'PRESENT') subjectStats[subjectId].present++;
      else if (record.status === 'ABSENT') subjectStats[subjectId].absent++;
    });

    const patterns = [];

    Object.entries(subjectStats).forEach(([subjectId, stats]) => {
      if (stats.total < 3) return;

      const absenceRate = (stats.absent / stats.total) * 100;

      if (absenceRate > 40) {
        patterns.push({
          patternType: 'SUBJECT_SPECIFIC',
          severity: absenceRate > 60 ? 'HIGH' : 'MODERATE',
          description: `Frequently absent in ${stats.name} (${absenceRate.toFixed(1)}% absence rate)`,
          confidence: 0.8,
          occurrences: stats.absent,
          subjectPattern: { subjectId, subjectName: stats.name, absenceRate },
          recommendations: [
            `Investigate difficulty with ${stats.name}`,
            'Consider tutoring or extra help',
            'Speak with subject teacher',
          ],
        });
      }
    });

    return patterns;
  }

  /**
   * Analyze attendance trend
   */
  analyzeTrend(records) {
    if (records.length < 14) return { trend: 'INSUFFICIENT_DATA' };

    // Split into two halves
    const midpoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, midpoint);
    const secondHalf = records.slice(midpoint);

    const firstRate = (firstHalf.filter((r) => r.status === 'PRESENT').length / firstHalf.length) * 100;
    const secondRate = (secondHalf.filter((r) => r.status === 'PRESENT').length / secondHalf.length) * 100;

    const change = secondRate - firstRate;

    let trend, insight;

    if (change > 10) {
      trend = 'IMPROVING';
      insight = {
        insightType: 'TREND',
        insight: `Attendance improving: increased by ${change.toFixed(1)}% in recent period`,
        metrics: { firstRate, secondRate, change },
        actionable: false,
      };
    } else if (change < -10) {
      trend = 'DECLINING';
      insight = {
        insightType: 'ALERT',
        insight: `Attendance declining: decreased by ${Math.abs(change).toFixed(1)}% in recent period`,
        metrics: { firstRate, secondRate, change },
        actionable: true,
        actions: ['Schedule parent meeting', 'Investigate cause', 'Provide support'],
        priority: 8,
      };
    } else {
      trend = 'STABLE';
    }

    return { trend, change, insight };
  }

  /**
   * Detect consecutive absence streak
   */
  detectAbsenceStreak(records) {
    let maxStreak = 0;
    let currentStreak = 0;
    let streakStart = null;

    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].status === 'ABSENT') {
        currentStreak++;
        if (currentStreak === 1) streakStart = records[i].date;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    if (maxStreak >= 3) {
      return {
        patternType: 'IRREGULAR',
        severity: maxStreak >= 5 ? 'HIGH' : 'MODERATE',
        description: `Currently absent for ${maxStreak} consecutive days`,
        confidence: 0.9,
        occurrences: maxStreak,
        recommendations: [
          'Immediate parent contact required',
          'Verify student wellbeing',
          'Check for medical issues',
        ],
      };
    }

    return null;
  }

  /**
   * Generate actionable insights
   */
  generateInsights(summary, patterns) {
    const insights = [];

    // Low attendance alert
    if (summary.attendanceRate < 85) {
      insights.push({
        insightType: 'ALERT',
        insight: `Student attendance (${summary.attendanceRate}%) is below required threshold`,
        metrics: summary,
        actionable: true,
        actions: ['Send notification to parents', 'Schedule counseling session', 'Monitor closely'],
        priority: 9,
      });
    }

    // Multiple patterns detected
    if (patterns.length > 2) {
      insights.push({
        insightType: 'ANOMALY',
        insight: `Multiple attendance patterns detected (${patterns.length} issues)`,
        metrics: { patternCount: patterns.length },
        actionable: true,
        actions: ['Comprehensive review needed', 'Intervention plan required'],
        priority: 8,
      });
    }

    return insights;
  }

  /**
   * Get recommendations for chronic absence
   */
  getChronicAbsenceRecommendations(severity) {
    const base = ['Contact parents immediately', 'Schedule meeting with student and parents'];

    if (severity === 'CRITICAL') {
      return [...base, 'Principal intervention required', 'Consider formal warning', 'Develop attendance improvement plan'];
    } else if (severity === 'HIGH') {
      return [...base, 'Counselor involvement', 'Identify barriers to attendance', 'Weekly progress monitoring'];
    } else {
      return [...base, 'Monitor weekly', 'Provide support resources'];
    }
  }

  /**
   * Save patterns to database
   */
  async savePatterns(studentId, patterns) {
    const schoolId = await this.getStudentSchoolId(studentId);

    for (const pattern of patterns) {
      // Check if pattern already exists
      const existing = await prisma.attendancePattern.findFirst({
        where: {
          studentId,
          patternType: pattern.patternType,
          resolved: false,
        },
      });

      if (existing) {
        // Update existing pattern
        await prisma.attendancePattern.update({
          where: { id: existing.id },
          data: {
            severity: pattern.severity,
            description: pattern.description,
            occurrences: pattern.occurrences,
            confidence: pattern.confidence,
            recommendations: pattern.recommendations,
            dayPattern: pattern.dayPattern,
            subjectPattern: pattern.subjectPattern,
          },
        });
      } else {
        // Create new pattern
        await prisma.attendancePattern.create({
          data: {
            studentId,
            schoolId,
            patternType: pattern.patternType,
            severity: pattern.severity,
            description: pattern.description,
            startDate: new Date(),
            occurrences: pattern.occurrences,
            confidence: pattern.confidence,
            recommendations: pattern.recommendations,
            dayPattern: pattern.dayPattern,
            subjectPattern: pattern.subjectPattern,
          },
        });
      }
    }
  }

  /**
   * Save insights to database
   */
  async saveInsights(studentId, insights) {
    const schoolId = await this.getStudentSchoolId(studentId);

    for (const insight of insights) {
      await prisma.attendanceInsight.create({
        data: {
          studentId,
          schoolId,
          insightType: insight.insightType,
          insight: insight.insight,
          metrics: insight.metrics,
          actionable: insight.actionable,
          actions: insight.actions,
          priority: insight.priority || 5,
        },
      });
    }
  }

  /**
   * Calculate class-level statistics
   */
  calculateClassStats(analyses) {
    const total = analyses.length;
    if (total === 0) return {};

    const avgAttendance = analyses.reduce((sum, a) => sum + a.summary.attendanceRate, 0) / total;
    const belowThreshold = analyses.filter((a) => a.summary.attendanceRate < 85).length;
    const withPatterns = analyses.filter((a) => a.patterns.length > 0).length;

    return {
      totalStudents: total,
      averageAttendance: parseFloat(avgAttendance.toFixed(2)),
      studentsbelowThreshold: belowThreshold,
      percentageBelowThreshold: parseFloat(((belowThreshold / total) * 100).toFixed(2)),
      studentsWithPatterns: withPatterns,
    };
  }

  /**
   * Get student's school ID
   */
  async getStudentSchoolId(studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });
    return student?.schoolId;
  }

  /**
   * Mark pattern as resolved
   */
  async resolvePattern(patternId, notes = null) {
    return prisma.attendancePattern.update({
      where: { id: patternId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        notes,
      },
    });
  }
}

module.exports = new AttendancePatternService();
