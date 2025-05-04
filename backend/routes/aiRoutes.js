const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

// @route   POST /api/ai/chat
// @desc    Generate AI response
// @access  Private (All authenticated users)
router.post(
  '/chat',
  aiController.generateResponse
);

// @route   GET /api/ai/history/:userId
// @desc    Get conversation history
// @access  Private (Admin, Own User)
router.get(
  '/history/:userId',
  roleMiddleware.restrictToOwnerOrRoles('user', ['admin']),
  aiController.getConversationHistory
);

// @route   POST /api/ai/study-materials
// @desc    Generate study materials
// @access  Private (Admin, Teacher)
router.post(
  '/study-materials',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateStudyMaterials
);

// @route   POST /api/ai/quiz
// @desc    Generate quiz questions
// @access  Private (Admin, Teacher)
router.post(
  '/quiz',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateQuizQuestions
);

// @route   POST /api/ai/grade-essay
// @desc    Grade essay or long-form answer
// @access  Private (Admin, Teacher)
router.post(
  '/grade-essay',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.gradeEssay
);

// @route   POST /api/ai/learning-plan
// @desc    Generate personalized learning plan
// @access  Private (Admin, Teacher)
router.post(
  '/learning-plan',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateLearningPlan
);

// @route   POST /api/ai/analyze-performance
// @desc    Analyze student performance
// @access  Private (Admin, Teacher)
router.post(
  '/analyze-performance',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.analyzePerformance
);

module.exports = router;
