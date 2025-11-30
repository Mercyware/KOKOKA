const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { requireSchool } = require('../middlewares/schoolMiddleware');

// All routes require authentication
router.use(protect);
router.use(requireSchool);

// Attendance Analytics
router.get('/attendance/student/:id', analyticsController.analyzeStudentAttendance);
router.get('/attendance/class/:id', analyticsController.analyzeClassAttendance);
router.get('/attendance/at-risk', analyticsController.getAtRiskStudents);
router.put('/attendance/patterns/:id/resolve', analyticsController.resolveAttendancePattern);

// Performance Predictions
router.get('/predictions/student/:id/grade', analyticsController.predictStudentGrade);

// Risk Assessment
router.get('/risk/student/:id', analyticsController.assessStudentRisk);
router.get('/risk/high-risk', analyticsController.getHighRiskStudents);
router.put('/risk/:id/resolve', analyticsController.resolveRiskAssessment);

// Comprehensive Analytics
router.get('/student/:id/comprehensive', analyticsController.getComprehensiveAnalytics);

module.exports = router;
