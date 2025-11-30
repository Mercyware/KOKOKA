const express = require('express');
const router = express.Router();
const topicTrackingController = require('../controllers/topicTrackingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication to all routes (school middleware is applied globally in server.js)
router.use(authMiddleware.protect);

// ==================== CLASS TOPIC COVERAGE ROUTES ====================

// Get topics for a class and subject
router.get(
  '/class/:classId/subject/:subjectId/topics',
  topicTrackingController.getClassTopics
);

// Update topic coverage for a class
router.put(
  '/class/:classId/topic/:topicId/coverage',
  topicTrackingController.updateTopicCoverage
);

// Get coverage summary for a class
router.get(
  '/class/:classId/coverage-summary',
  topicTrackingController.getClassCoverageSummary
);

// ==================== STUDENT PROGRESS ROUTES ====================

// Get student topic progress
router.get(
  '/student/:studentId/progress',
  topicTrackingController.getStudentTopicProgress
);

// Update student topic progress
router.put(
  '/student/:studentId/topic/:topicId/progress',
  topicTrackingController.updateStudentTopicProgress
);

// Get student concept mastery
router.get(
  '/student/:studentId/concept-mastery',
  topicTrackingController.getStudentConceptMastery
);

// Record mastery evidence (called by teachers or automatically by assignment grading)
router.post(
  '/student/:studentId/concept/:conceptId/evidence',
  topicTrackingController.recordMasteryEvidence
);

module.exports = router;
