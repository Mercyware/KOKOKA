const express = require('express');
const {
  getDashboard,
  getStudentDetails,
  getStudentAttendance,
  getStudentGrades,
  updatePreferences,
  getCommunications,
  getPortalStats
} = require('../controllers/parentPortalController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes and restrict to parents
router.use(protect);
router.use(authorize('parent'));

// Dashboard route
router.route('/dashboard')
  .get(getDashboard);

// Portal statistics
router.route('/stats')
  .get(getPortalStats);

// Communication preferences
router.route('/preferences')
  .put(updatePreferences);

// Communication history
router.route('/communications')
  .get(getCommunications);

// Student-specific routes
router.route('/students/:studentId')
  .get(getStudentDetails);

router.route('/students/:studentId/attendance')
  .get(getStudentAttendance);

router.route('/students/:studentId/grades')
  .get(getStudentGrades);

module.exports = router;