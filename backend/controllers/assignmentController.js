const AssignmentService = require('../services/assignments/AssignmentService');
const SubmissionService = require('../services/assignments/SubmissionService');
const GradingService = require('../services/assignments/GradingService');
const LearningActivityService = require('../services/assignments/LearningActivityService');
const logger = require('../utils/logger');

/**
 * Create a new assignment
 */
exports.createAssignment = async (req, res) => {
  try {
    const teacherId = req.user.staff?.id;
    const schoolId = req.school.id;

    if (!teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create assignments',
      });
    }

    const assignment = await AssignmentService.createAssignment({
      ...req.body,
      teacherId,
      schoolId,
    });

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error(`Error creating assignment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get assignment by ID
 */
exports.getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const includeSubmissions = req.query.includeSubmissions === 'true';

    const assignment = await AssignmentService.getAssignment(id, includeSubmissions);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error(`Error fetching assignment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all assignments with filters
 */
exports.getAssignments = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const filters = {
      ...req.query,
      schoolId,
    };

    const result = await AssignmentService.getAssignments(filters);

    res.json({
      success: true,
      data: result.assignments,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    logger.error(`Error fetching assignments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update assignment
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await AssignmentService.updateAssignment(id, req.body);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error(`Error updating assignment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete assignment
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await AssignmentService.deleteAssignment(id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting assignment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get assignments for current student
 */
exports.getMyAssignments = async (req, res) => {
  try {
    const studentId = req.user.student?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint',
      });
    }

    const assignments = await AssignmentService.getStudentAssignments(studentId, req.query);

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    logger.error(`Error fetching student assignments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get assignment statistics
 */
exports.getAssignmentStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await AssignmentService.getAssignmentStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching assignment stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get pending assignments
 */
exports.getPendingAssignments = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const pending = await AssignmentService.getPendingAssignments(schoolId);

    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    logger.error(`Error fetching pending assignments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SUBMISSION ENDPOINTS ====================

/**
 * Submit assignment
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params; // assignment ID
    const studentId = req.user.student?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments',
      });
    }

    const submission = await SubmissionService.submitAssignment({
      assignmentId: id,
      studentId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(`Error submitting assignment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get submission by ID
 */
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await SubmissionService.getSubmission(id);

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(`Error fetching submission: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all submissions for an assignment
 */
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const submissions = await SubmissionService.getAssignmentSubmissions(id, req.query);

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error(`Error fetching assignment submissions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get current student's submissions
 */
exports.getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.student?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint',
      });
    }

    const submissions = await SubmissionService.getStudentSubmissions(studentId, req.query);

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error(`Error fetching student submissions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete submission
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.student?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Only students can delete submissions',
      });
    }

    await SubmissionService.deleteSubmission(id, studentId);

    res.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting submission: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get student submission statistics
 */
exports.getStudentSubmissionStats = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const stats = await SubmissionService.getStudentSubmissionStats(studentId, req.query);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching student submission stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get pending grading queue
 */
exports.getPendingGrading = async (req, res) => {
  try {
    const teacherId = req.user.staff?.id;
    const schoolId = req.school.id;

    if (!teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access grading queue',
      });
    }

    const queue = await SubmissionService.getPendingGradingQueue(teacherId, schoolId);

    res.json({
      success: true,
      data: queue,
    });
  } catch (error) {
    logger.error(`Error fetching pending grading: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GRADING ENDPOINTS ====================

/**
 * Grade a submission
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params; // submission ID
    const teacherId = req.user.staff?.id;

    if (!teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can grade submissions',
      });
    }

    const gradedSubmission = await GradingService.gradeSubmission({
      submissionId: id,
      ...req.body,
      gradedBy: teacherId,
    });

    res.json({
      success: true,
      data: gradedSubmission,
    });
  } catch (error) {
    logger.error(`Error grading submission: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Bulk grade submissions
 */
exports.bulkGradeSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.staff?.id;

    if (!teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can grade submissions',
      });
    }

    const result = await GradingService.bulkGradeSubmissions({
      ...req.body,
      gradedBy: teacherId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error bulk grading: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update grade
 */
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params; // submission ID

    const updated = await GradingService.updateGrade(id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error(`Error updating grade: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get grading statistics
 */
exports.getGradingStats = async (req, res) => {
  try {
    const { id } = req.params; // assignment ID

    const stats = await GradingService.getGradingStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching grading stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get grade comparison
 */
exports.getGradeComparison = async (req, res) => {
  try {
    const { id } = req.params; // submission ID

    const comparison = await GradingService.getGradeComparison(id);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error(`Error fetching grade comparison: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get comment templates
 */
exports.getCommentTemplates = async (req, res) => {
  try {
    const templates = GradingService.getCommentTemplates();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error(`Error fetching comment templates: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== LEARNING ACTIVITY ENDPOINTS ====================

/**
 * Track learning activity
 */
exports.trackActivity = async (req, res) => {
  try {
    const studentId = req.user.student?.id;

    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: 'Only students can track activities',
      });
    }

    const activity = await LearningActivityService.trackActivity({
      studentId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error(`Error tracking activity: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get student learning activities
 */
exports.getStudentActivities = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const result = await LearningActivityService.getStudentActivities(studentId, req.query);

    res.json({
      success: true,
      data: result.activities,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    logger.error(`Error fetching student activities: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get engagement metrics
 */
exports.getEngagementMetrics = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;
    const timeRange = parseInt(req.query.timeRange) || 30;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const metrics = await LearningActivityService.getEngagementMetrics(studentId, timeRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error(`Error fetching engagement metrics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get learning patterns
 */
exports.getLearningPatterns = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;
    const days = parseInt(req.query.days) || 30;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const patterns = await LearningActivityService.getLearningPatterns(studentId, days);

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    logger.error(`Error fetching learning patterns: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get participation score
 */
exports.getParticipationScore = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const score = await LearningActivityService.getParticipationScore(studentId);

    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    logger.error(`Error fetching participation score: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get time-on-task analytics
 */
exports.getTimeOnTask = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;
    const days = parseInt(req.query.days) || 30;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const analytics = await LearningActivityService.getTimeOnTaskAnalytics(studentId, days);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error(`Error fetching time-on-task analytics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get learning journey
 */
exports.getLearningJourney = async (req, res) => {
  try {
    const studentId = req.user.student?.id || req.params.studentId;
    const limit = parseInt(req.query.limit) || 50;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const journey = await LearningActivityService.getLearningJourney(studentId, limit);

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    logger.error(`Error fetching learning journey: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
