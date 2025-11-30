const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Risk Assessment Service
 * Assesses student risk levels for academic failure, dropout, etc.
 */
class RiskAssessmentService {
  /**
   * Assess student risk
   * @param {String} studentId - Student ID
   * @returns {Promise<Object>} - Risk assessment results
   */
  async assessStudent(studentId) {
    try {
      const student = await this.getStudentData(studentId);

      if (!student) {
        throw new Error('Student not found');
      }

      // Perform different risk assessments
      const assessments = [];

      // 1. Academic failure risk
      const academicRisk = await this.assessAcademicRisk(student);
      assessments.push(academicRisk);

      // 2. Dropout risk
      const dropoutRisk = this.assessDropoutRisk(student);
      assessments.push(dropoutRisk);

      // 3. Chronic absence risk
      const absenceRisk = this.assessAbsenceRisk(student);
      if (absenceRisk) assessments.push(absenceRisk);

      // Save assessments to database
      await this.saveAssessments(studentId, assessments);

      // Get overall risk level
      const overallRisk = this.calculateOverallRisk(assessments);

      return {
        studentId,
        overallRisk,
        assessments,
        assessedAt: new Date(),
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw error;
    }
  }

  /**
   * Assess academic failure risk
   */
  async assessAcademicRisk(student) {
    let riskScore = 0;
    const factors = [];
    const indicators = [];

    // Factor 1: Low GPA/Average (30 points)
    if (student.averageGradePoint !== null) {
      if (student.averageGradePoint < 2.0) {
        riskScore += 30;
        factors.push({ factor: 'Low GPA', impact: 30, value: student.averageGradePoint });
        indicators.push('GPA below 2.0');
      } else if (student.averageGradePoint < 2.5) {
        riskScore += 20;
        factors.push({ factor: 'Below Average GPA', impact: 20, value: student.averageGradePoint });
        indicators.push('GPA below 2.5');
      }
    }

    // Factor 2: Poor attendance (25 points)
    if (student.attendancePercentage !== null) {
      if (student.attendancePercentage < 75) {
        riskScore += 25;
        factors.push({ factor: 'Very Poor Attendance', impact: 25, value: student.attendancePercentage });
        indicators.push('Attendance below 75%');
      } else if (student.attendancePercentage < 85) {
        riskScore += 15;
        factors.push({ factor: 'Poor Attendance', impact: 15, value: student.attendancePercentage });
        indicators.push('Attendance below 85%');
      }
    }

    // Factor 3: Low assignment completion (20 points)
    if (student.assignmentCompletionRate !== null) {
      if (student.assignmentCompletionRate < 50) {
        riskScore += 20;
        factors.push({ factor: 'Very Low Assignment Completion', impact: 20, value: student.assignmentCompletionRate });
        indicators.push('Assignment completion below 50%');
      } else if (student.assignmentCompletionRate < 70) {
        riskScore += 12;
        factors.push({ factor: 'Low Assignment Completion', impact: 12, value: student.assignmentCompletionRate });
        indicators.push('Assignment completion below 70%');
      }
    }

    // Factor 4: Recent performance decline (15 points)
    const recentGrades = await this.getRecentGrades(student.id);
    if (recentGrades.length >= 3) {
      const trend = this.calculateTrend(recentGrades);
      if (trend < -5) {
        riskScore += 15;
        factors.push({ factor: 'Declining Performance', impact: 15, value: trend });
        indicators.push('Performance declining in recent assessments');
      }
    }

    // Factor 5: Multiple failed subjects (10 points)
    const failedCount = await this.getFailedSubjectsCount(student.id);
    if (failedCount > 0) {
      const impact = Math.min(failedCount * 5, 10);
      riskScore += impact;
      factors.push({ factor: 'Failed Subjects', impact, value: failedCount });
      indicators.push(`${failedCount} failed subject(s)`);
    }

    // Determine risk level
    const riskLevel = this.getRiskLevel(riskScore);

    // Generate recommendations
    const recommendations = this.getAcademicRecommendations(riskLevel, factors);

    return {
      riskType: 'ACADEMIC_FAILURE',
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      factors,
      indicators,
      recommendations,
    };
  }

  /**
   * Assess dropout risk
   */
  assessDropoutRisk(student) {
    let riskScore = 0;
    const factors = [];
    const indicators = [];

    // Factor 1: Chronic absenteeism (30 points)
    if (student.attendancePercentage !== null && student.attendancePercentage < 80) {
      const impact = 30 - (student.attendancePercentage - 50) / 2;
      riskScore += Math.max(0, impact);
      factors.push({ factor: 'Chronic Absenteeism', impact, value: student.attendancePercentage });
      indicators.push('High absence rate');
    }

    // Factor 2: Academic struggles (25 points)
    if (student.averageGradePoint !== null && student.averageGradePoint < 2.0) {
      riskScore += 25;
      factors.push({ factor: 'Academic Failure', impact: 25, value: student.averageGradePoint });
      indicators.push('Failing multiple subjects');
    }

    // Factor 3: Behavioral issues (20 points)
    // Note: Would need disciplinary records from database
    // Placeholder for now

    // Factor 4: Disengagement (15 points)
    if (student.participationScore !== null && student.participationScore < 50) {
      riskScore += 15;
      factors.push({ factor: 'Low Engagement', impact: 15, value: student.participationScore });
      indicators.push('Low class participation');
    }

    // Factor 5: Grade repetition (10 points)
    // Note: Would need historical data
    // Placeholder for now

    const riskLevel = this.getRiskLevel(riskScore);
    const recommendations = this.getDropoutRecommendations(riskLevel, factors);

    return {
      riskType: 'DROPOUT',
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      factors,
      indicators,
      recommendations,
    };
  }

  /**
   * Assess chronic absence risk
   */
  assessAbsenceRisk(student) {
    if (student.attendancePercentage === null || student.attendancePercentage >= 90) {
      return null; // No risk
    }

    let riskScore = 0;
    const factors = [];
    const indicators = [];

    // Current attendance rate
    const absenceRate = 100 - student.attendancePercentage;
    if (absenceRate > 20) {
      riskScore = 70 + absenceRate;
      factors.push({ factor: 'High Absence Rate', impact: 50, value: student.attendancePercentage });
      indicators.push(`${absenceRate.toFixed(1)}% absence rate`);
    } else if (absenceRate > 10) {
      riskScore = 40 + absenceRate * 2;
      factors.push({ factor: 'Elevated Absence Rate', impact: 30, value: student.attendancePercentage });
      indicators.push(`${absenceRate.toFixed(1)}% absence rate`);
    }

    const riskLevel = this.getRiskLevel(riskScore);
    const recommendations = this.getAbsenceRecommendations(riskLevel);

    return {
      riskType: 'CHRONIC_ABSENCE',
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      factors,
      indicators,
      recommendations,
    };
  }

  /**
   * Calculate overall risk level
   */
  calculateOverallRisk(assessments) {
    const highestScore = Math.max(...assessments.map((a) => a.riskScore));
    const criticalCount = assessments.filter((a) => a.riskLevel === 'CRITICAL').length;
    const highCount = assessments.filter((a) => a.riskLevel === 'HIGH').length;

    if (criticalCount > 0 || highestScore >= 75) {
      return { level: 'CRITICAL', score: highestScore };
    } else if (highCount > 0 || highestScore >= 50) {
      return { level: 'HIGH', score: highestScore };
    } else if (highestScore >= 30) {
      return { level: 'MODERATE', score: highestScore };
    } else {
      return { level: 'LOW', score: highestScore };
    }
  }

  /**
   * Get risk level from score
   */
  getRiskLevel(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Get academic failure recommendations
   */
  getAcademicRecommendations(riskLevel, factors) {
    const recommendations = [];

    if (riskLevel === 'CRITICAL') {
      recommendations.push({
        category: 'Immediate Intervention',
        action: 'Emergency academic intervention plan required',
        priority: 'CRITICAL',
        timeline: 'Immediate',
      });
      recommendations.push({
        category: 'Support Services',
        action: 'Assign academic counselor and tutors',
        priority: 'CRITICAL',
        timeline: 'Within 1 week',
      });
      recommendations.push({
        category: 'Parent Engagement',
        action: 'Mandatory parent meeting with principal',
        priority: 'HIGH',
        timeline: 'Within 3 days',
      });
    } else if (riskLevel === 'HIGH') {
      recommendations.push({
        category: 'Academic Support',
        action: 'Enroll in remedial classes and tutoring',
        priority: 'HIGH',
        timeline: 'Within 2 weeks',
      });
      recommendations.push({
        category: 'Monitoring',
        action: 'Weekly progress monitoring',
        priority: 'HIGH',
        timeline: 'Ongoing',
      });
      recommendations.push({
        category: 'Parent Engagement',
        action: 'Schedule parent-teacher conference',
        priority: 'MEDIUM',
        timeline: 'Within 2 weeks',
      });
    } else if (riskLevel === 'MODERATE') {
      recommendations.push({
        category: 'Academic Support',
        action: 'Provide study resources and guidance',
        priority: 'MEDIUM',
        timeline: 'Within 1 month',
      });
      recommendations.push({
        category: 'Monitoring',
        action: 'Biweekly progress checks',
        priority: 'MEDIUM',
        timeline: 'Ongoing',
      });
    }

    // Factor-specific recommendations
    factors.forEach((f) => {
      if (f.factor === 'Poor Attendance' || f.factor === 'Very Poor Attendance') {
        recommendations.push({
          category: 'Attendance',
          action: 'Address attendance issues',
          priority: 'HIGH',
          timeline: 'Immediate',
        });
      }
      if (f.factor.includes('Assignment')) {
        recommendations.push({
          category: 'Study Habits',
          action: 'Improve assignment completion and time management',
          priority: 'MEDIUM',
          timeline: 'Within 2 weeks',
        });
      }
    });

    return recommendations;
  }

  /**
   * Get dropout risk recommendations
   */
  getDropoutRecommendations(riskLevel, factors) {
    const recommendations = [];

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      recommendations.push({
        category: 'Retention Intervention',
        action: 'Implement comprehensive retention plan',
        priority: 'CRITICAL',
        timeline: 'Immediate',
      });
      recommendations.push({
        category: 'Counseling',
        action: 'Regular counseling sessions',
        priority: 'HIGH',
        timeline: 'Weekly',
      });
      recommendations.push({
        category: 'Family Support',
        action: 'Engage family in support plan',
        priority: 'HIGH',
        timeline: 'Within 1 week',
      });
    }

    return recommendations;
  }

  /**
   * Get chronic absence recommendations
   */
  getAbsenceRecommendations(riskLevel) {
    const recommendations = [];

    recommendations.push({
      category: 'Attendance Intervention',
      action: 'Implement attendance improvement plan',
      priority: riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      timeline: 'Immediate',
    });

    recommendations.push({
      category: 'Investigation',
      action: 'Identify and address barriers to attendance',
      priority: 'HIGH',
      timeline: 'Within 1 week',
    });

    return recommendations;
  }

  /**
   * Get student data
   */
  async getStudentData(studentId) {
    return prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: true,
      },
    });
  }

  /**
   * Get recent grades
   */
  async getRecentGrades(studentId, limit = 5) {
    const grades = await prisma.gradeEntry.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return grades.map((g) => ({
      score: (g.score / g.maxScore) * 100,
      date: g.createdAt,
    }));
  }

  /**
   * Calculate trend from grades
   */
  calculateTrend(grades) {
    if (grades.length < 2) return 0;

    const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
    const secondHalf = grades.slice(Math.floor(grades.length / 2));

    const firstAvg = firstHalf.reduce((sum, g) => sum + g.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, g) => sum + g.score, 0) / secondHalf.length;

    return secondAvg - firstAvg;
  }

  /**
   * Get count of failed subjects
   */
  async getFailedSubjectsCount(studentId) {
    const failedGrades = await prisma.gradeEntry.groupBy({
      by: ['subjectId'],
      where: {
        studentId,
        score: {
          lt: 50, // Assuming 50 is passing grade
        },
      },
      _count: true,
    });

    return failedGrades.length;
  }

  /**
   * Save assessments to database
   */
  async saveAssessments(studentId, assessments) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    // Calculate validity period (3 months)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    for (const assessment of assessments) {
      await prisma.riskAssessment.create({
        data: {
          studentId,
          schoolId: student.schoolId,
          riskType: assessment.riskType,
          riskLevel: assessment.riskLevel,
          riskScore: assessment.riskScore,
          factors: assessment.factors,
          indicators: assessment.indicators,
          recommendations: assessment.recommendations,
          validUntil,
        },
      });
    }

    // Update student's risk score
    const overallRisk = this.calculateOverallRisk(assessments);
    await prisma.student.update({
      where: { id: studentId },
      data: {
        riskScore: overallRisk.score,
        lastRiskAssessment: new Date(),
      },
    });
  }

  /**
   * Get at-risk students for a school
   */
  async getAtRiskStudents(schoolId, riskLevel = 'HIGH', limit = 50) {
    const riskScoreThreshold = riskLevel === 'CRITICAL' ? 75 : 50;

    return prisma.student.findMany({
      where: {
        schoolId,
        riskScore: {
          gte: riskScoreThreshold,
        },
      },
      include: {
        currentClass: {
          select: { name: true },
        },
        riskAssessments: {
          where: {
            resolved: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
        },
      },
      orderBy: {
        riskScore: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Resolve risk assessment
   */
  async resolveAssessment(assessmentId, notes = null) {
    return prisma.riskAssessment.update({
      where: { id: assessmentId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        notes,
      },
    });
  }
}

module.exports = new RiskAssessmentService();
