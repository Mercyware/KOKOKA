const express = require('express');
const router = express.Router();
const {
  getClassSubjectHistory,
  getClassSubjectHistoryById,
  createClassSubjectHistory,
  updateClassSubjectHistory,
  deleteClassSubjectHistory,
  getSubjectsForClass,
  getClassesForSubject,
  bulkAssignSubjects,
  copyAssignments,
  debugSchoolContext
} = require('../controllers/classSubjectHistoryController');

// Debug route - should be first to avoid conflicts
// GET /api/class-subject-history/debug - Debug school context
router.get('/debug', debugSchoolContext);

// GET /api/class-subject-history - Get all class-subject assignments with filtering
router.get('/', getClassSubjectHistory);

// GET /api/class-subject-history/subjects-for-class - Get subjects for a specific class
router.get('/subjects-for-class', getSubjectsForClass);

// GET /api/class-subject-history/classes-for-subject - Get classes for a specific subject
router.get('/classes-for-subject', getClassesForSubject);

// POST /api/class-subject-history/bulk-assign - Bulk assign subjects to classes
router.post('/bulk-assign', bulkAssignSubjects);

// POST /api/class-subject-history/copy-assignments - Copy assignments between academic years
router.post('/copy-assignments', copyAssignments);

// GET /api/class-subject-history/:id - Get specific assignment by ID
router.get('/:id', getClassSubjectHistoryById);

// POST /api/class-subject-history - Create new class-subject assignment
router.post('/', createClassSubjectHistory);

// PUT /api/class-subject-history/:id - Update class-subject assignment
router.put('/:id', updateClassSubjectHistory);

// DELETE /api/class-subject-history/:id - Delete class-subject assignment
router.delete('/:id', deleteClassSubjectHistory);

module.exports = router;