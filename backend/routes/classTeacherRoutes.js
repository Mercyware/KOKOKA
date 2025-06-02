const express = require('express');
const router = express.Router();
const classTeacherController = require('../controllers/classTeacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Routes accessible by all authenticated users
router.get('/', classTeacherController.getAllClassTeachers);
router.get('/check', classTeacherController.checkClassTeacherExists);
router.get('/academic-year/:academicYearId', classTeacherController.getClassTeachersByAcademicYear);
router.get('/teacher/:teacherId', classTeacherController.getClassesByTeacher);
router.get('/:id', classTeacherController.getClassTeacherById);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

router.post('/', classTeacherController.createClassTeacher);
router.put('/:id', classTeacherController.updateClassTeacher);
router.delete('/:id', classTeacherController.deleteClassTeacher);

module.exports = router;
