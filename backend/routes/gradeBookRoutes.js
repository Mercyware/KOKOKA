const express = require('express');
const router = express.Router();
const {
  getGradeBooks,
  getGradeBook,
  createGradeBook,
  updateGradeBook,
  deleteGradeBook,
  addGradeEntry,
  updateGradeEntry,
  getGradeBookAnalytics
} = require('../controllers/gradeBookController');
const { protect } = require('../middlewares/authMiddleware');
const { extractSchoolFromSubdomain } = require('../middlewares/schoolMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(extractSchoolFromSubdomain);

// Grade book routes
router.route('/')
  .get(getGradeBooks)
  .post(createGradeBook);

router.route('/:id')
  .get(getGradeBook)
  .put(updateGradeBook)
  .delete(deleteGradeBook);

// Grade entry routes
router.post('/:id/grades', addGradeEntry);
router.put('/:gradeBookId/grades/:gradeEntryId', updateGradeEntry);

// Analytics routes
router.get('/:id/analytics', getGradeBookAnalytics);

module.exports = router;