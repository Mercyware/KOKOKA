const express = require('express');
const router = express.Router();
const {
  getParentDashboard,
  getStudentGrades,
  getStudentProgress,
  getStudentAttendance
} = require('../controllers/parentDashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { extractSchoolFromSubdomain } = require('../middlewares/schoolMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(extractSchoolFromSubdomain);

// Parent dashboard routes
router.get('/dashboard', getParentDashboard);
router.get('/students/:studentId/grades', getStudentGrades);
router.get('/students/:studentId/progress', getStudentProgress);
router.get('/students/:studentId/attendance', getStudentAttendance);

module.exports = router;