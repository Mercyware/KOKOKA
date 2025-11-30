const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireSchool } = require('../middlewares/schoolMiddleware');

// All routes require authentication and school context
router.use(protect);
router.use(requireSchool);

// ==================== ASSIGNMENT ROUTES ====================

// Create assignment (teachers only)
router.post('/', assignmentController.createAssignment);

// Get all assignments with filters
router.get('/', assignmentController.getAssignments);

// Get my assignments (student view)
router.get('/my-assignments', assignmentController.getMyAssignments);

// Get pending assignments (overdue)
router.get('/pending', assignmentController.getPendingAssignments);

// Get specific assignment
router.get('/:id', assignmentController.getAssignment);

// Update assignment
router.put('/:id', assignmentController.updateAssignment);

// Delete assignment
router.delete('/:id', assignmentController.deleteAssignment);

// Get assignment statistics
router.get('/:id/stats', assignmentController.getAssignmentStats);

// ==================== SUBMISSION ROUTES ====================

// Submit assignment
router.post('/:id/submit', assignmentController.submitAssignment);

// Get all submissions for an assignment
router.get('/:id/submissions', assignmentController.getAssignmentSubmissions);

// Get my submissions (student view)
router.get('/submissions/my-submissions', assignmentController.getMySubmissions);

// Get pending grading queue (teacher view)
router.get('/grading/pending', assignmentController.getPendingGrading);

// Get specific submission
router.get('/submissions/:id', assignmentController.getSubmission);

// Delete submission
router.delete('/submissions/:id', assignmentController.deleteSubmission);

// Get student submission statistics
router.get('/submissions/stats/student', assignmentController.getStudentSubmissionStats);
router.get('/submissions/stats/student/:studentId', assignmentController.getStudentSubmissionStats);

// ==================== GRADING ROUTES ====================

// Grade a submission
router.post('/submissions/:id/grade', assignmentController.gradeSubmission);

// Bulk grade submissions
router.post('/grading/bulk', assignmentController.bulkGradeSubmissions);

// Update grade
router.put('/submissions/:id/grade', assignmentController.updateGrade);

// Get grading statistics for assignment
router.get('/:id/grading/stats', assignmentController.getGradingStats);

// Get grade comparison for submission
router.get('/submissions/:id/comparison', assignmentController.getGradeComparison);

// Get comment templates
router.get('/grading/templates/comments', assignmentController.getCommentTemplates);

// ==================== LEARNING ACTIVITY ROUTES ====================

// Track learning activity
router.post('/activities/track', assignmentController.trackActivity);

// Get student learning activities
router.get('/activities/student', assignmentController.getStudentActivities);
router.get('/activities/student/:studentId', assignmentController.getStudentActivities);

// Get engagement metrics
router.get('/activities/engagement', assignmentController.getEngagementMetrics);
router.get('/activities/engagement/:studentId', assignmentController.getEngagementMetrics);

// Get learning patterns
router.get('/activities/patterns', assignmentController.getLearningPatterns);
router.get('/activities/patterns/:studentId', assignmentController.getLearningPatterns);

// Get participation score
router.get('/activities/participation', assignmentController.getParticipationScore);
router.get('/activities/participation/:studentId', assignmentController.getParticipationScore);

// Get time-on-task analytics
router.get('/activities/time-on-task', assignmentController.getTimeOnTask);
router.get('/activities/time-on-task/:studentId', assignmentController.getTimeOnTask);

// Get learning journey
router.get('/activities/journey', assignmentController.getLearningJourney);
router.get('/activities/journey/:studentId', assignmentController.getLearningJourney);

module.exports = router;
