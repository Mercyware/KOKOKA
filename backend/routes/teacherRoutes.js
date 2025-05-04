const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin, Teacher, Student)
router.get(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  teacherController.getAllTeachers
);

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private (Admin, Own Teacher, Student)
router.get(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin', 'student']),
  teacherController.getTeacherById
);

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin)
router.post(
  '/',
  roleMiddleware.restrictTo('admin'),
  teacherController.createTeacher
);

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin, Own Teacher)
router.put(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin']),
  teacherController.updateTeacher
);

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  teacherController.deleteTeacher
);

// @route   GET /api/teachers/:id/classes
// @desc    Get teacher's assigned classes
// @access  Private (Admin, Own Teacher)
router.get(
  '/:id/classes',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin']),
  teacherController.getTeacherClasses
);

// @route   GET /api/teachers/:id/schedule
// @desc    Get teacher's schedule
// @access  Private (Admin, Own Teacher, Student)
router.get(
  '/:id/schedule',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin', 'student']),
  teacherController.getTeacherSchedule
);

module.exports = router;
