const express = require('express');
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment
} = require('../controllers/scoreController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for Teachers and Admins
router.route('/')
  .get(authorize('admin', 'teacher', 'principal'), getAssessments)
  .post(authorize('admin', 'teacher', 'principal'), createAssessment);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'principal', 'student'), getAssessmentById)
  .put(authorize('admin', 'teacher', 'principal'), updateAssessment);

module.exports = router;