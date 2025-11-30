const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * SubmissionService
 * Handles all assignment submission operations
 */
class SubmissionService {
  /**
   * Create or update a submission
   */
  async submitAssignment(data) {
    try {
      const {
        assignmentId,
        studentId,
        content,
        attachments = [],
        isDraft = false,
      } = data;

      // Get assignment details
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const submittedAt = new Date();
      const isLate = submittedAt > new Date(assignment.dueDate);

      // Check if submission already exists
      const existingSubmission = await prisma.assignmentSubmission.findFirst({
        where: {
          assignmentId,
          studentId,
        },
      });

      let submission;

      if (existingSubmission) {
        // Update existing submission
        submission = await prisma.assignmentSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            content,
            attachments,
            submittedAt: isDraft ? existingSubmission.submittedAt : submittedAt,
            status: isDraft ? 'DRAFT' : (isLate ? 'LATE' : 'SUBMITTED'),
            isLate: isDraft ? existingSubmission.isLate : isLate,
          },
          include: {
            assignment: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
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

        logger.info(
          `Submission updated: ${submission.id} for assignment: ${assignmentId}`
        );
      } else {
        // Create new submission
        submission = await prisma.assignmentSubmission.create({
          data: {
            assignmentId,
            studentId,
            content,
            attachments,
            submittedAt: isDraft ? null : submittedAt,
            status: isDraft ? 'DRAFT' : (isLate ? 'LATE' : 'SUBMITTED'),
            isLate: isDraft ? false : isLate,
          },
          include: {
            assignment: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
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

        logger.info(
          `Submission created: ${submission.id} for assignment: ${assignmentId}`
        );
      }

      // Track learning activity
      if (!isDraft) {
        await this.trackLearningActivity({
          studentId,
          assignmentId,
          activityType: 'ASSIGNMENT_SUBMISSION',
          metadata: {
            isLate,
            submittedAt,
          },
        });
      }

      return submission;
    } catch (error) {
      logger.error(`Error submitting assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmission(submissionId) {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              subject: true,
              class: true,
              teacher: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
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

      if (!submission) {
        throw new Error('Submission not found');
      }

      return submission;
    } catch (error) {
      logger.error(`Error fetching submission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId, filters = {}) {
    try {
      const { status, isGraded } = filters;

      const where = { assignmentId };

      if (status) {
        where.status = status;
      }

      if (isGraded !== undefined) {
        if (isGraded) {
          where.grade = { not: null };
        } else {
          where.grade = null;
        }
      }

      const submissions = await prisma.assignmentSubmission.findMany({
        where,
        include: {
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
        orderBy: { submittedAt: 'desc' },
      });

      return submissions;
    } catch (error) {
      logger.error(`Error fetching assignment submissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all submissions for a student
   */
  async getStudentSubmissions(studentId, filters = {}) {
    try {
      const { subjectId, status, fromDate, toDate } = filters;

      const where = { studentId };

      if (status) {
        where.status = status;
      }

      if (subjectId || fromDate || toDate) {
        where.assignment = {};
        if (subjectId) where.assignment.subjectId = subjectId;
        if (fromDate || toDate) {
          where.assignment.dueDate = {};
          if (fromDate) where.assignment.dueDate.gte = new Date(fromDate);
          if (toDate) where.assignment.dueDate.lte = new Date(toDate);
        }
      }

      const submissions = await prisma.assignmentSubmission.findMany({
        where,
        include: {
          assignment: {
            include: {
              subject: true,
              teacher: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return submissions;
    } catch (error) {
      logger.error(`Error fetching student submissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId, studentId) {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      if (submission.studentId !== studentId) {
        throw new Error('Unauthorized to delete this submission');
      }

      if (submission.grade !== null) {
        throw new Error('Cannot delete a graded submission');
      }

      await prisma.assignmentSubmission.delete({
        where: { id: submissionId },
      });

      logger.info(`Submission deleted: ${submissionId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting submission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get submission statistics for a student
   */
  async getStudentSubmissionStats(studentId, filters = {}) {
    try {
      const { subjectId, academicYearId } = filters;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { schoolId: true, classId: true },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      const assignmentWhere = {
        schoolId: student.schoolId,
        classId: student.classId,
        status: 'ACTIVE',
      };

      if (subjectId) assignmentWhere.subjectId = subjectId;

      const [assignments, submissions] = await Promise.all([
        prisma.assignment.count({ where: assignmentWhere }),
        prisma.assignmentSubmission.findMany({
          where: {
            studentId,
            assignment: assignmentWhere,
          },
          include: {
            assignment: true,
          },
        }),
      ]);

      const totalAssignments = assignments;
      const totalSubmissions = submissions.filter(s => s.status !== 'DRAFT').length;
      const gradedSubmissions = submissions.filter(s => s.grade !== null);
      const lateSubmissions = submissions.filter(s => s.isLate);

      const completionRate = totalAssignments > 0
        ? ((totalSubmissions / totalAssignments) * 100).toFixed(2)
        : 0;

      const grades = gradedSubmissions.map(s => s.grade);
      const averageGrade = grades.length > 0
        ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2)
        : 0;

      const onTimeSubmissions = totalSubmissions - lateSubmissions.length;
      const onTimeRate = totalSubmissions > 0
        ? ((onTimeSubmissions / totalSubmissions) * 100).toFixed(2)
        : 0;

      return {
        totalAssignments,
        totalSubmissions,
        completionRate: parseFloat(completionRate),
        gradedCount: gradedSubmissions.length,
        pendingGrading: totalSubmissions - gradedSubmissions.length,
        averageGrade: parseFloat(averageGrade),
        lateSubmissions: lateSubmissions.length,
        onTimeRate: parseFloat(onTimeRate),
      };
    } catch (error) {
      logger.error(`Error fetching student submission stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track learning activity
   */
  async trackLearningActivity(data) {
    try {
      const { studentId, assignmentId, activityType, metadata = {} } = data;

      await prisma.learningActivity.create({
        data: {
          studentId,
          assignmentId,
          activityType,
          metadata,
          timestamp: new Date(),
        },
      });

      logger.info(`Learning activity tracked for student: ${studentId}`);
    } catch (error) {
      logger.error(`Error tracking learning activity: ${error.message}`);
      // Don't throw - activity tracking is non-critical
    }
  }

  /**
   * Get pending grading queue for a teacher
   */
  async getPendingGradingQueue(teacherId, schoolId) {
    try {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignment: {
            teacherId,
            schoolId,
            status: 'ACTIVE',
          },
          status: { in: ['SUBMITTED', 'LATE'] },
          grade: null,
        },
        include: {
          assignment: {
            include: {
              subject: true,
              class: true,
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
        orderBy: [
          { isLate: 'desc' }, // Prioritize late submissions
          { submittedAt: 'asc' }, // Then oldest first
        ],
      });

      return submissions;
    } catch (error) {
      logger.error(`Error fetching pending grading queue: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SubmissionService();
