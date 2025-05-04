const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

// @route   GET /api/timetables
// @desc    Get all timetables
// @access  Private (Admin, Teacher, Student)
router.get(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  timetableController.getAllTimetables
);

// @route   GET /api/timetables/:id
// @desc    Get timetable by ID
// @access  Private (Admin, Teacher, Student)
router.get(
  '/:id',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  timetableController.getTimetableById
);

// @route   POST /api/timetables
// @desc    Create new timetable
// @access  Private (Admin)
router.post(
  '/',
  roleMiddleware.restrictTo('admin'),
  timetableController.createTimetable
);

// @route   PUT /api/timetables/:id
// @desc    Update timetable
// @access  Private (Admin)
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  timetableController.updateTimetable
);

// @route   DELETE /api/timetables/:id
// @desc    Delete timetable
// @access  Private (Admin)
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  timetableController.deleteTimetable
);

// @route   GET /api/timetables/class/:classId
// @desc    Get timetable by class
// @access  Private (Admin, Teacher, Student)
router.get(
  '/class/:classId',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  timetableController.getTimetableByClass
);

// @route   POST /api/timetables/generate
// @desc    Generate optimized timetable
// @access  Private (Admin)
router.post(
  '/generate',
  roleMiddleware.restrictTo('admin'),
  timetableController.generateTimetable
);

module.exports = router;
