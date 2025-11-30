const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * AssignmentService
 * Handles all assignment management operations
 */
class AssignmentService {
  /**
   * Create a new assignment
   */
  async createAssignment(data) {
    try {
      const {
        title,
        description,
        subjectId,
        classId,
        teacherId,
        schoolId,
        dueDate,
        maxPoints,
        instructions,
        attachments = [],
        allowLateSubmissions = true,
        latePenaltyPercentage = 10,
      } = data;

      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          subjectId,
          classId,
          teacherId,
          schoolId,
          dueDate: new Date(dueDate),
          maxPoints,
          instructions,
          attachments,
          allowLateSubmissions,
          latePenaltyPercentage,
          status: 'ACTIVE',
        },
        include: {
          subject: true,
          class: true,
          teacher: {
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

      logger.info(`Assignment created: ${assignment.id} - ${assignment.title}`);
      return assignment;
    } catch (error) {
      logger.error(`Error creating assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignment(assignmentId, includeSubmissions = false) {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          subject: true,
          class: true,
          teacher: {
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
          submissions: includeSubmissions ? {
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
          } : false,
        },
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      return assignment;
    } catch (error) {
      logger.error(`Error fetching assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all assignments with filters
   */
  async getAssignments(filters = {}) {
    try {
      const {
        schoolId,
        classId,
        subjectId,
        teacherId,
        status,
        fromDate,
        toDate,
        limit = 50,
        offset = 0,
      } = filters;

      const where = {};

      if (schoolId) where.schoolId = schoolId;
      if (classId) where.classId = classId;
      if (subjectId) where.subjectId = subjectId;
      if (teacherId) where.teacherId = teacherId;
      if (status) where.status = status;

      if (fromDate || toDate) {
        where.dueDate = {};
        if (fromDate) where.dueDate.gte = new Date(fromDate);
        if (toDate) where.dueDate.lte = new Date(toDate);
      }

      const [assignments, total] = await Promise.all([
        prisma.assignment.findMany({
          where,
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
            _count: {
              select: {
                submissions: true,
              },
            },
          },
          orderBy: { dueDate: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.assignment.count({ where }),
      ]);

      return {
        assignments,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`Error fetching assignments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(assignmentId, data) {
    try {
      const assignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
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
      });

      logger.info(`Assignment updated: ${assignmentId}`);
      return assignment;
    } catch (error) {
      logger.error(`Error updating assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId) {
    try {
      // Check if assignment has submissions
      const submissionCount = await prisma.assignmentSubmission.count({
        where: { assignmentId },
      });

      if (submissionCount > 0) {
        throw new Error('Cannot delete assignment with existing submissions');
      }

      await prisma.assignment.delete({
        where: { id: assignmentId },
      });

      logger.info(`Assignment deleted: ${assignmentId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assignments for a student
   */
  async getStudentAssignments(studentId, filters = {}) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { classId: true, schoolId: true },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      const { status, fromDate, toDate } = filters;
      const where = {
        schoolId: student.schoolId,
        classId: student.classId,
        status: status || 'ACTIVE',
      };

      if (fromDate || toDate) {
        where.dueDate = {};
        if (fromDate) where.dueDate.gte = new Date(fromDate);
        if (toDate) where.dueDate.lte = new Date(toDate);
      }

      const assignments = await prisma.assignment.findMany({
        where,
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
          submissions: {
            where: { studentId },
            orderBy: { submittedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Categorize assignments
      const now = new Date();
      const categorized = {
        upcoming: [],
        overdue: [],
        submitted: [],
        graded: [],
      };

      assignments.forEach((assignment) => {
        const submission = assignment.submissions[0];

        if (submission) {
          if (submission.grade !== null) {
            categorized.graded.push({ ...assignment, submission });
          } else {
            categorized.submitted.push({ ...assignment, submission });
          }
        } else if (new Date(assignment.dueDate) < now) {
          categorized.overdue.push(assignment);
        } else {
          categorized.upcoming.push(assignment);
        }
      });

      return categorized;
    } catch (error) {
      logger.error(`Error fetching student assignments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(assignmentId) {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          submissions: {
            include: {
              student: true,
            },
          },
          class: {
            include: {
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
        },
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const totalStudents = assignment.class._count.students;
      const totalSubmissions = assignment.submissions.length;
      const submissionRate = totalStudents > 0
        ? ((totalSubmissions / totalStudents) * 100).toFixed(2)
        : 0;

      const gradedSubmissions = assignment.submissions.filter(s => s.grade !== null);
      const gradingRate = totalSubmissions > 0
        ? ((gradedSubmissions.length / totalSubmissions) * 100).toFixed(2)
        : 0;

      const lateSubmissions = assignment.submissions.filter(
        s => new Date(s.submittedAt) > new Date(assignment.dueDate)
      );

      const grades = gradedSubmissions.map(s => s.grade).filter(g => g !== null);
      const averageGrade = grades.length > 0
        ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2)
        : 0;

      return {
        totalStudents,
        totalSubmissions,
        submissionRate: parseFloat(submissionRate),
        gradedSubmissions: gradedSubmissions.length,
        pendingGrading: totalSubmissions - gradedSubmissions.length,
        gradingRate: parseFloat(gradingRate),
        lateSubmissions: lateSubmissions.length,
        averageGrade: parseFloat(averageGrade),
        maxPoints: assignment.maxPoints,
      };
    } catch (error) {
      logger.error(`Error fetching assignment stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get pending assignments (overdue but not submitted)
   */
  async getPendingAssignments(schoolId) {
    try {
      const now = new Date();

      const assignments = await prisma.assignment.findMany({
        where: {
          schoolId,
          status: 'ACTIVE',
          dueDate: { lt: now },
        },
        include: {
          class: {
            include: {
              students: {
                select: {
                  id: true,
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
          },
          submissions: {
            select: {
              studentId: true,
            },
          },
          subject: true,
        },
      });

      // Find students who haven't submitted
      const pendingList = [];

      assignments.forEach((assignment) => {
        const submittedStudentIds = new Set(
          assignment.submissions.map(s => s.studentId)
        );

        const pendingStudents = assignment.class.students.filter(
          student => !submittedStudentIds.has(student.id)
        );

        if (pendingStudents.length > 0) {
          pendingList.push({
            assignment: {
              id: assignment.id,
              title: assignment.title,
              dueDate: assignment.dueDate,
              subject: assignment.subject,
            },
            pendingStudents: pendingStudents.map(s => ({
              id: s.id,
              name: s.user.name,
              email: s.user.email,
            })),
            daysOverdue: Math.floor(
              (now - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24)
            ),
          });
        }
      });

      return pendingList;
    } catch (error) {
      logger.error(`Error fetching pending assignments: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AssignmentService();
