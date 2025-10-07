const express = require('express');
const {
  getBehavioralAssessments,
  getBehavioralAssessmentById,
  createBehavioralAssessment,
  updateBehavioralAssessment,
  deleteBehavioralAssessment,
  submitBehavioralGrades,
  recordBehavioralScores
} = require('../controllers/behavioralAssessmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Direct recording route (like attendance) - Place BEFORE /:id routes to avoid conflicts
router.route('/record')
  .post(recordBehavioralScores);

// Routes for Teachers and Admins
router.route('/')
  .get(getBehavioralAssessments)
  .post(createBehavioralAssessment);

router.route('/:id')
  .get(getBehavioralAssessmentById)
  .put(updateBehavioralAssessment)
  .delete(deleteBehavioralAssessment);

router.route('/:id/grades')
  .post(submitBehavioralGrades);

module.exports = router;
