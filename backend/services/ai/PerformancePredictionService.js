const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AIConfig = require('./AIConfig');

/**
 * Performance Prediction Service
 * Predicts student academic performance and final grades
 */
class PerformancePredictionService {
  /**
   * Predict student's final grade for a subject
   * @param {String} studentId - Student ID
   * @param {String} subjectId - Subject ID (optional, predicts all if not provided)
   * @param {String} timeframe - Prediction timeframe ('next_term', 'end_of_year')
   * @returns {Promise<Object>} - Prediction results
   */
  async predictGrade(studentId, subjectId = null, timeframe = 'end_of_year') {
    try {
      const config = AIConfig.getPredictionsConfig();

      if (!config.enabled) {
        throw new Error('Performance predictions are not enabled');
      }

      // Get student data
      const student = await this.getStudentData(studentId);

      if (!student) {
        throw new Error('Student not found');
      }

      const predictions = [];

      if (subjectId) {
        // Predict for specific subject
        const prediction = await this.predictSubjectGrade(student, subjectId, timeframe);
        if (prediction) predictions.push(prediction);
      } else {
        // Predict for all subjects
        const subjects = await this.getStudentSubjects(studentId);
        for (const subject of subjects) {
          const prediction = await this.predictSubjectGrade(student, subject.id, timeframe);
          if (prediction) predictions.push(prediction);
        }
      }

      // Save predictions to database
      await this.savePredictions(studentId, predictions);

      return {
        studentId,
        predictions,
        timeframe,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Grade prediction error:', error);
      throw error;
    }
  }

  /**
   * Predict grade for a specific subject
   */
  async predictSubjectGrade(student, subjectId, timeframe) {
    // Get subject performance history
    const subjectData = await this.getSubjectPerformance(student.id, subjectId);

    if (!subjectData || subjectData.grades.length === 0) {
      return null; // Not enough data
    }

    // Calculate current average
    const currentAverage = this.calculateAverage(subjectData.grades);

    // Apply prediction model
    const prediction = this.applyPredictionModel(student, subjectData, currentAverage);

    // Determine confidence level
    const confidence = this.calculateConfidence(subjectData, student);

    // Generate recommendations
    const recommendations = this.generateRecommendations(prediction, currentAverage, student);

    return {
      subjectId,
      subjectName: subjectData.subjectName,
      predictionType: 'SUBJECT_PERFORMANCE',
      currentValue: currentAverage,
      predictedValue: prediction.predicted,
      confidence,
      timeframe,
      factors: prediction.factors,
      recommendations,
    };
  }

  /**
   * Apply prediction model using weighted factors
   */
  applyPredictionModel(student, subjectData, currentAverage) {
    const weights = {
      currentAverage: 0.4,
      assignmentCompletion: 0.2,
      attendanceRate: 0.2,
      recentTrend: 0.15,
      participation: 0.05,
    };

    const factors = [];

    // Factor 1: Current average (40%)
    const avgScore = currentAverage * weights.currentAverage;
    factors.push({ factor: 'Current Average', value: currentAverage, weight: weights.currentAverage });

    // Factor 2: Assignment completion (20%)
    const assignmentScore = (student.assignmentCompletionRate || 80) * weights.assignmentCompletion;
    factors.push({
      factor: 'Assignment Completion',
      value: student.assignmentCompletionRate || 80,
      weight: weights.assignmentCompletion,
    });

    // Factor 3: Attendance rate (20%)
    const attendanceScore = (student.attendancePercentage || 90) * weights.attendanceRate;
    factors.push({ factor: 'Attendance Rate', value: student.attendancePercentage || 90, weight: weights.attendanceRate });

    // Factor 4: Recent trend (15%)
    const trend = this.calculateTrend(subjectData.grades);
    const trendScore = (currentAverage + trend) * weights.recentTrend;
    factors.push({ factor: 'Recent Trend', value: trend, weight: weights.recentTrend });

    // Factor 5: Participation (5%)
    const participationScore = (student.participationScore || 75) * weights.participation;
    factors.push({ factor: 'Participation', value: student.participationScore || 75, weight: weights.participation });

    // Calculate predicted score
    const predicted = Math.round(avgScore + assignmentScore + attendanceScore + trendScore + participationScore);

    // Ensure prediction is within valid range
    const clampedPrediction = Math.max(0, Math.min(100, predicted));

    return {
      predicted: clampedPrediction,
      factors,
    };
  }

  /**
   * Calculate confidence level based on data quality
   */
  calculateConfidence(subjectData, student) {
    let confidence = 0.5; // Base confidence

    // More data points = higher confidence
    if (subjectData.grades.length >= 5) confidence += 0.2;
    else if (subjectData.grades.length >= 3) confidence += 0.1;

    // Recent data = higher confidence
    const daysSinceLastGrade = this.daysSince(subjectData.lastGradeDate);
    if (daysSinceLastGrade < 14) confidence += 0.1;
    else if (daysSinceLastGrade < 30) confidence += 0.05;

    // Good attendance = higher confidence
    if (student.attendancePercentage >= 90) confidence += 0.1;
    else if (student.attendancePercentage >= 80) confidence += 0.05;

    // Consistent performance = higher confidence
    const variance = this.calculateVariance(subjectData.grades);
    if (variance < 10) confidence += 0.1;

    return Math.min(confidence, 0.95); // Max 95% confidence
  }

  /**
   * Calculate trend from recent grades
   */
  calculateTrend(grades) {
    if (grades.length < 2) return 0;

    // Use last 5 grades or all if less
    const recentGrades = grades.slice(-5);

    // Linear regression for trend
    const n = recentGrades.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = recentGrades.reduce((sum, g) => sum + g.score, 0);
    const sumXY = recentGrades.reduce((sum, g, i) => sum + i * g.score, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Return trend adjustment
    return slope * 2; // Amplify trend slightly
  }

  /**
   * Calculate variance in scores
   */
  calculateVariance(grades) {
    if (grades.length < 2) return 0;

    const scores = grades.map((g) => g.score);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const squaredDiffs = scores.map((s) => Math.pow(s - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length;

    return Math.sqrt(variance); // Return standard deviation
  }

  /**
   * Generate recommendations based on prediction
   */
  generateRecommendations(prediction, currentAverage, student) {
    const recommendations = [];
    const predicted = prediction.predicted;

    // Low prediction
    if (predicted < 50) {
      recommendations.push({
        category: 'Urgent Intervention',
        action: 'Immediate tutoring and extra support required',
        priority: 'HIGH',
        resources: ['Subject tutor', 'Remedial classes', 'Parent meeting'],
      });
    } else if (predicted < 70) {
      recommendations.push({
        category: 'Academic Support',
        action: 'Additional help needed to improve performance',
        priority: 'MEDIUM',
        resources: ['Study group', 'Extra practice materials', 'Teacher consultation'],
      });
    }

    // Declining trend
    if (predicted < currentAverage - 5) {
      recommendations.push({
        category: 'Performance Declining',
        action: 'Investigate cause of declining performance',
        priority: 'HIGH',
        resources: ['Counselor meeting', 'Check for external factors'],
      });
    }

    // Low attendance affecting performance
    if (student.attendancePercentage < 85) {
      recommendations.push({
        category: 'Attendance Issue',
        action: 'Improve attendance to boost performance',
        priority: 'HIGH',
        resources: ['Attendance monitoring', 'Parent engagement'],
      });
    }

    // Low assignment completion
    if (student.assignmentCompletionRate < 70) {
      recommendations.push({
        category: 'Assignment Completion',
        action: 'Focus on completing all assignments',
        priority: 'MEDIUM',
        resources: ['Time management training', 'Assignment reminders'],
      });
    }

    return recommendations;
  }

  /**
   * Get student data with analytics
   */
  async getStudentData(studentId) {
    return prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Get student's subjects
   */
  async getStudentSubjects(studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: {
          include: {
            subjectAssignments: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    return student?.currentClass?.subjectAssignments?.map((sa) => sa.subject) || [];
  }

  /**
   * Get subject performance history
   */
  async getSubjectPerformance(studentId, subjectId) {
    const gradeEntries = await prisma.gradeEntry.findMany({
      where: {
        studentId,
        subjectId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        subject: {
          select: { name: true },
        },
      },
    });

    if (gradeEntries.length === 0) return null;

    return {
      subjectName: gradeEntries[0].subject.name,
      grades: gradeEntries.map((g) => ({
        score: g.score,
        maxScore: g.maxScore,
        date: g.createdAt,
      })),
      lastGradeDate: gradeEntries[gradeEntries.length - 1].createdAt,
    };
  }

  /**
   * Calculate average score
   */
  calculateAverage(grades) {
    if (grades.length === 0) return 0;

    const total = grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
    return Math.round(total / grades.length);
  }

  /**
   * Calculate days since date
   */
  daysSince(date) {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Save predictions to database
   */
  async savePredictions(studentId, predictions) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    for (const pred of predictions) {
      await prisma.performancePrediction.create({
        data: {
          studentId,
          schoolId: student.schoolId,
          subjectId: pred.subjectId,
          predictionType: pred.predictionType,
          currentValue: pred.currentValue,
          predictedValue: pred.predictedValue,
          confidence: pred.confidence,
          timeframe: pred.timeframe,
          factors: pred.factors,
          recommendations: pred.recommendations,
          validFrom: new Date(),
          validUntil: this.calculateValidUntil(pred.timeframe),
          modelVersion: '1.0',
        },
      });
    }
  }

  /**
   * Calculate prediction validity period
   */
  calculateValidUntil(timeframe) {
    const date = new Date();

    switch (timeframe) {
      case 'next_term':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'end_of_year':
        date.setMonth(date.getMonth() + 6);
        break;
      default:
        date.setMonth(date.getMonth() + 3);
    }

    return date;
  }

  /**
   * Get prediction accuracy by comparing with actual results
   */
  async calculateAccuracy(predictionId) {
    const prediction = await prisma.performancePrediction.findUnique({
      where: { id: predictionId },
    });

    if (!prediction || !prediction.actualValue) {
      return null; // No actual value yet
    }

    const error = Math.abs(prediction.predictedValue - prediction.actualValue);
    const accuracy = Math.max(0, 100 - error);

    await prisma.performancePrediction.update({
      where: { id: predictionId },
      data: { accuracy },
    });

    return accuracy;
  }
}

module.exports = new PerformancePredictionService();
