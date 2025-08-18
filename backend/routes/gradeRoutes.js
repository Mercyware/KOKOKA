const express = require('express');
const {
  createOrUpdateGrade,
  bulkGradeStudents,
  getAssessmentGrades,
  getStudentGrades,
  gradeEssayWithAI,
  getGradeStats
} = require('../controllers/gradeController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for Teachers and Admins
router.route('/')
  .post(authorize('admin', 'teacher'), createOrUpdateGrade);

router.route('/bulk')
  .post(authorize('admin', 'teacher'), bulkGradeStudents);

router.route('/ai-grade')
  .post(authorize('admin', 'teacher'), gradeEssayWithAI);

router.route('/stats')
  .get(authorize('admin', 'principal'), getGradeStats);

// Routes for getting grades
router.route('/assessment/:assessmentId')
  .get(authorize('admin', 'teacher', 'principal'), getAssessmentGrades);

router.route('/student/:studentId')
  .get(authorize('admin', 'teacher', 'principal', 'student', 'parent'), getStudentGrades);

module.exports = router;