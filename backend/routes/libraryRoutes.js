const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Book routes
router.get('/books', libraryController.getAllBooks);
router.get('/books/:id', libraryController.getBookById);
router.post('/books', libraryController.createBook);
router.put('/books/:id', libraryController.updateBook);
router.delete('/books/:id', libraryController.deleteBook);

// Book issue routes
router.get('/issues', libraryController.getAllBookIssues);
router.post('/issues', libraryController.issueBook);
router.put('/issues/:id/return', libraryController.returnBook);

// Statistics
router.get('/stats', libraryController.getLibraryStats);

module.exports = router;
