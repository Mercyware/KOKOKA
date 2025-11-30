const express = require('express');
const {
  markAttendance,
  bulkMarkAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceStats,
  getAttendanceDashboard,
  generateAttendanceReport,
  getAttendanceReports,
  // New enhanced functions
  getClassRoster,
  takeClassAttendance,
  geofenceCheckIn,
  correctAttendance
} = require('../controllers/attendanceController');

// Import new dashboard controllers
const {
  getAttendanceDashboardNew,
  getAttendanceReportsDashboard,
  getStudentDetailedAttendance,
  getAttendanceAnalytics
} = require('../controllers/attendanceDashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible by Teachers and Admins
router.route('/')
  .post(authorize('admin', 'teacher'), markAttendance);

router.route('/bulk')
  .post(authorize('admin', 'teacher'), bulkMarkAttendance);

router.route('/class/:classId')
  .get(authorize('admin', 'teacher', 'principal'), getClassAttendance);

router.route('/stats')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceStats);

router.route('/dashboard')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceDashboard);

// New enhanced dashboard
router.route('/dashboard-new')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceDashboardNew);

// TODO: Implement generateQRCode function
// router.route('/qr-code/:classId')
//   .get(authorize('admin', 'teacher'), generateQRCode);

router.route('/reports')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceReports);

// New enhanced reports dashboard
router.route('/reports/dashboard')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceReportsDashboard);

router.route('/reports/generate')
  .post(authorize('admin', 'teacher', 'principal'), generateAttendanceReport);

// Analytics endpoint
router.route('/analytics')
  .get(authorize('admin', 'teacher', 'principal'), getAttendanceAnalytics);

// Enhanced class attendance routes
router.route('/class/:classId/roster')
  .get(authorize('admin', 'teacher', 'principal'), getClassRoster);

router.route('/class/:classId/take')
  .post(authorize('admin', 'teacher'), takeClassAttendance);

// Enhanced QR code attendance routes
// TODO: Implement createQRSession and getQRSessionStatus functions
// router.route('/qr-session')
//   .post(authorize('admin', 'teacher'), createQRSession);

// router.route('/qr-session/:sessionId')
//   .get(authorize('admin', 'teacher'), getQRSessionStatus);

// Automated attendance methods
router.route('/geofence-checkin')
  .post(authorize('student'), geofenceCheckIn);

// Administrative corrections
router.route('/:attendanceId/correct')
  .put(authorize('admin', 'principal'), correctAttendance);

// Routes accessible by Students (for QR attendance)
// TODO: Implement scanQRAttendance function
// router.route('/qr-scan')
//   .post(authorize('student'), scanQRAttendance);

// Routes accessible by Teachers, Admins, Students, and Parents
router.route('/student/:studentId')
  .get(authorize('admin', 'teacher', 'principal', 'student', 'parent'), getStudentAttendance);

module.exports = router;