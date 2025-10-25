const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Book routes (Read operations - accessible to all authenticated users)
router.get('/books', libraryController.getAllBooks);
router.get('/books/:id', libraryController.getBookById);

// Book management routes (Write operations - admin and librarian only)
router.post('/books', roleMiddleware.restrictTo('admin', 'librarian'), libraryController.createBook);
router.put('/books/:id', roleMiddleware.restrictTo('admin', 'librarian'), libraryController.updateBook);
router.delete('/books/:id', roleMiddleware.restrictTo('admin', 'librarian'), libraryController.deleteBook);

// Book issue routes
router.get('/issues', libraryController.getAllBookIssues);
router.post('/issues', roleMiddleware.restrictTo('admin', 'librarian', 'teacher'), libraryController.issueBook);
router.put('/issues/:id/return', roleMiddleware.restrictTo('admin', 'librarian', 'teacher'), libraryController.returnBook);

// Statistics (accessible to all authenticated users)
router.get('/stats', libraryController.getLibraryStats);

module.exports = router;
