const express = require('express');
const {
  getAllSubjectAssignments,
  getSubjectAssignmentById,
  createSubjectAssignment,
  updateSubjectAssignment,
  deleteSubjectAssignment,
  getTeacherAssignments,
  getClassAssignments
} = require('../controllers/subjectAssignmentController');

const router = express.Router();

// Routes
router.get('/', getAllSubjectAssignments);
router.get('/:id', getSubjectAssignmentById);
router.post('/', createSubjectAssignment);
router.put('/:id', updateSubjectAssignment);
router.delete('/:id', deleteSubjectAssignment);

// Special routes for getting assignments by teacher or class
router.get('/teacher/:staffId', getTeacherAssignments);
router.get('/class/:classId', getClassAssignments);

module.exports = router;