const express = require('express');
const router = express.Router();
const studentClassHistoryController = require('../controllers/studentClassHistoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { scopeToSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(scopeToSchool);
router.use(filterBySchool);

// Get class history for a specific student
router.get('/student/:studentId', studentClassHistoryController.getStudentClassHistory);

// Add class history entry for a student
router.post('/', authorize('admin', 'principal', 'registrar'), studentClassHistoryController.addClassHistory);

// Update class history entry
router.put('/:historyId', authorize('admin', 'principal', 'registrar'), studentClassHistoryController.updateClassHistory);

// Delete class history entry
router.delete('/:historyId', authorize('admin', 'principal'), studentClassHistoryController.deleteClassHistory);

// Promote students to next class
router.post('/promote', authorize('admin', 'principal', 'registrar'), studentClassHistoryController.promoteStudents);

// Search students by class and academic year (including historical data)
router.get('/search', studentClassHistoryController.searchStudentsByClassAndYear);

module.exports = router;
