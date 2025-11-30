const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * GradingService
 * Handles all assignment grading operations
 */
class GradingService {
  /**
   * Grade a submission
   */
  async gradeSubmission(data) {
    try {
      const {
        submissionId,
        grade,
        feedback,
        rubricScores = {},
        gradedBy,
      } = data;

      // Get submission details
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: true,
          student: true,
        },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Validate grade
      if (grade < 0 || grade > submission.assignment.maxPoints) {
        throw new Error(
          `Grade must be between 0 and ${submission.assignment.maxPoints}`
        );
      }

      // Apply late penalty if applicable
      let finalGrade = grade;
      if (submission.isLate && submission.assignment.latePenaltyPercentage > 0) {
        const penalty = (grade * submission.assignment.latePenaltyPercentage) / 100;
        finalGrade = Math.max(0, grade - penalty);
      }

      // Update submission with grade
      const gradedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: finalGrade,
          feedback,
          rubricScores,
          gradedAt: new Date(),
          gradedBy,
          status: 'GRADED',
        },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Track learning activity
      await this.trackGradingActivity({
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
        grade: finalGrade,
        maxPoints: submission.assignment.maxPoints,
      });

      // Update student performance metrics
      await this.updateStudentPerformance(submission.studentId);

      logger.info(`Submission graded: ${submissionId} - Grade: ${finalGrade}`);
      return gradedSubmission;
    } catch (error) {
      logger.error(`Error grading submission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk grade submissions with same feedback
   */
  async bulkGradeSubmissions(data) {
    try {
      const { submissionIds, grade, feedback, gradedBy } = data;

      const results = await Promise.all(
        submissionIds.map(async (submissionId) => {
          try {
            return await this.gradeSubmission({
              submissionId,
              grade,
              feedback,
              gradedBy,
            });
          } catch (error) {
            logger.error(`Error grading submission ${submissionId}: ${error.message}`);
            return {
              submissionId,
              error: error.message,
            };
          }
        })
      );

      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);

      logger.info(`Bulk grading completed: ${successful.length} successful, ${failed.length} failed`);

      return {
        successful,
        failed,
        total: submissionIds.length,
      };
    } catch (error) {
      logger.error(`Error in bulk grading: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update grade for a submission
   */
  async updateGrade(submissionId, data) {
    try {
      const { grade, feedback, rubricScores } = data;

      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: true,
        },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      if (grade !== undefined && (grade < 0 || grade > submission.assignment.maxPoints)) {
        throw new Error(
          `Grade must be between 0 and ${submission.assignment.maxPoints}`
        );
      }

      let finalGrade = grade;
      if (
        grade !== undefined &&
        submission.isLate &&
        submission.assignment.latePenaltyPercentage > 0
      ) {
        const penalty = (grade * submission.assignment.latePenaltyPercentage) / 100;
        finalGrade = Math.max(0, grade - penalty);
      }

      const updated = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: finalGrade !== undefined ? finalGrade : undefined,
          feedback: feedback !== undefined ? feedback : undefined,
          rubricScores: rubricScores !== undefined ? rubricScores : undefined,
          gradedAt: new Date(),
        },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Update student performance metrics
      await this.updateStudentPerformance(submission.studentId);

      logger.info(`Grade updated for submission: ${submissionId}`);
      return updated;
    } catch (error) {
      logger.error(`Error updating grade: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get grading statistics for an assignment
   */
  async getGradingStats(assignmentId) {
    try {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignmentId,
          status: { not: 'DRAFT' },
        },
        include: {
          assignment: true,
        },
      });

      const totalSubmissions = submissions.length;
      const gradedSubmissions = submissions.filter(s => s.grade !== null);
      const ungradedSubmissions = totalSubmissions - gradedSubmissions.length;

      const grades = gradedSubmissions.map(s => s.grade);

      let stats = {
        totalSubmissions,
        gradedCount: gradedSubmissions.length,
        ungradedCount: ungradedSubmissions,
        gradingProgress: totalSubmissions > 0
          ? ((gradedSubmissions.length / totalSubmissions) * 100).toFixed(2)
          : 0,
      };

      if (grades.length > 0) {
        const maxPoints = submissions[0].assignment.maxPoints;
        const sortedGrades = [...grades].sort((a, b) => a - b);

        stats = {
          ...stats,
          maxPoints,
          averageGrade: (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2),
          medianGrade: sortedGrades[Math.floor(sortedGrades.length / 2)],
          highestGrade: Math.max(...grades),
          lowestGrade: Math.min(...grades),
          averagePercentage: (
            (grades.reduce((sum, g) => sum + g, 0) / grades.length / maxPoints) * 100
          ).toFixed(2),
          gradeDistribution: this.calculateGradeDistribution(grades, maxPoints),
        };
      }

      return stats;
    } catch (error) {
      logger.error(`Error fetching grading stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate grade distribution
   */
  calculateGradeDistribution(grades, maxPoints) {
    const ranges = [
      { label: 'A (90-100%)', min: 0.9, max: 1.0, count: 0 },
      { label: 'B (80-89%)', min: 0.8, max: 0.89, count: 0 },
      { label: 'C (70-79%)', min: 0.7, max: 0.79, count: 0 },
      { label: 'D (60-69%)', min: 0.6, max: 0.69, count: 0 },
      { label: 'F (0-59%)', min: 0, max: 0.59, count: 0 },
    ];

    grades.forEach((grade) => {
      const percentage = grade / maxPoints;
      const range = ranges.find(r => percentage >= r.min && percentage <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }

  /**
   * Get grade comparison (student vs class average)
   */
  async getGradeComparison(submissionId) {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              submissions: {
                where: {
                  grade: { not: null },
                },
                select: {
                  grade: true,
                },
              },
            },
          },
        },
      });

      if (!submission || submission.grade === null) {
        throw new Error('Submission not found or not graded');
      }

      const classGrades = submission.assignment.submissions.map(s => s.grade);
      const classAverage = classGrades.length > 0
        ? classGrades.reduce((sum, g) => sum + g, 0) / classGrades.length
        : 0;

      const studentPercentage = (submission.grade / submission.assignment.maxPoints) * 100;
      const classAveragePercentage = (classAverage / submission.assignment.maxPoints) * 100;

      // Calculate percentile
      const lowerGrades = classGrades.filter(g => g < submission.grade).length;
      const percentile = classGrades.length > 0
        ? ((lowerGrades / classGrades.length) * 100).toFixed(0)
        : 0;

      return {
        studentGrade: submission.grade,
        studentPercentage: studentPercentage.toFixed(2),
        classAverage: classAverage.toFixed(2),
        classAveragePercentage: classAveragePercentage.toFixed(2),
        difference: (submission.grade - classAverage).toFixed(2),
        percentile: parseInt(percentile),
        totalSubmissions: classGrades.length,
      };
    } catch (error) {
      logger.error(`Error fetching grade comparison: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track grading activity
   */
  async trackGradingActivity(data) {
    try {
      const { studentId, assignmentId, grade, maxPoints } = data;

      await prisma.learningActivity.create({
        data: {
          studentId,
          assignmentId,
          activityType: 'GRADE_RECEIVED',
          metadata: {
            grade,
            maxPoints,
            percentage: ((grade / maxPoints) * 100).toFixed(2),
          },
          timestamp: new Date(),
        },
      });

      logger.info(`Grading activity tracked for student: ${studentId}`);
    } catch (error) {
      logger.error(`Error tracking grading activity: ${error.message}`);
      // Don't throw - activity tracking is non-critical
    }
  }

  /**
   * Update student performance metrics
   */
  async updateStudentPerformance(studentId) {
    try {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId,
          grade: { not: null },
        },
        include: {
          assignment: true,
        },
      });

      if (submissions.length === 0) return;

      const grades = submissions.map(s => s.grade);
      const maxPoints = submissions.map(s => s.assignment.maxPoints);

      const totalPoints = grades.reduce((sum, g) => sum + g, 0);
      const totalMaxPoints = maxPoints.reduce((sum, m) => sum + m, 0);

      const assignmentCompletionRate = (
        (submissions.length / (submissions.length + 1)) * 100 // Simplified calculation
      ).toFixed(2);

      await prisma.student.update({
        where: { id: studentId },
        data: {
          assignmentCompletionRate: parseFloat(assignmentCompletionRate),
          averageGradePoint: totalMaxPoints > 0
            ? parseFloat(((totalPoints / totalMaxPoints) * 100).toFixed(2))
            : null,
        },
      });

      logger.info(`Student performance metrics updated for: ${studentId}`);
    } catch (error) {
      logger.error(`Error updating student performance: ${error.message}`);
      // Don't throw - performance update is non-critical
    }
  }

  /**
   * Get comment templates for quick feedback
   */
  getCommentTemplates() {
    return {
      excellent: [
        'Excellent work! You demonstrated a thorough understanding of the concepts.',
        'Outstanding submission! Your analysis was comprehensive and well-structured.',
        'Great job! Your work exceeded expectations.',
      ],
      good: [
        'Good work! You showed a solid understanding of the material.',
        'Well done! Your submission meets all requirements.',
        'Nice job! Consider exploring the topic in more depth next time.',
      ],
      needsImprovement: [
        'You\'re on the right track, but more detail is needed in your analysis.',
        'Good effort! Review the feedback and focus on these areas for improvement.',
        'Please see me during office hours to discuss how to strengthen your work.',
      ],
      incomplete: [
        'This submission is incomplete. Please review the assignment requirements.',
        'Missing key components. Please resubmit with all required sections.',
        'Unable to grade fully due to incomplete work. Please complete and resubmit.',
      ],
    };
  }
}

module.exports = new GradingService();
