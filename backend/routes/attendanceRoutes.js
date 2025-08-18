const express = require('express');
const {
  markAttendance,
  bulkMarkAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceStats,
  generateQRCode,
  scanQRAttendance
} = require('../controllers/attendanceController');
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

router.route('/qr-code/:classId')
  .get(authorize('admin', 'teacher'), generateQRCode);

// Routes accessible by Students (for QR attendance)
router.route('/qr-scan')
  .post(authorize('student'), scanQRAttendance);

// Routes accessible by Teachers, Admins, Students, and Parents
router.route('/student/:studentId')
  .get(authorize('admin', 'teacher', 'principal', 'student', 'parent'), getStudentAttendance);

module.exports = router;