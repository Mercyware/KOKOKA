const express = require('express');
const {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  generateAIQuestions,
  getAssessmentStats,
  getStudentAssessments
} = require('../controllers/assessmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for Teachers and Admins
router.route('/')
  .get(authorize('admin', 'teacher', 'principal'), getAssessments)
  .post(authorize('admin', 'teacher'), createAssessment);

router.route('/stats')
  .get(authorize('admin', 'principal'), getAssessmentStats);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'principal', 'student'), getAssessment)
  .put(authorize('admin', 'teacher'), updateAssessment)
  .delete(authorize('admin', 'teacher'), deleteAssessment);

router.route('/:id/publish')
  .put(authorize('admin', 'teacher'), publishAssessment);

router.route('/:id/generate-questions')
  .post(authorize('admin', 'teacher'), generateAIQuestions);

// Routes for Students and Parents
router.route('/student/:studentId')
  .get(authorize('admin', 'teacher', 'principal', 'student', 'parent'), getStudentAssessments);

module.exports = router;