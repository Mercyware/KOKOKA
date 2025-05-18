const express = require('express');
const {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const schoolDataRoutes = require('./schoolDataRoutes');

// Apply authentication and school context middleware
router.use(schoolDataRoutes.filterBySchoolMiddleware);

router
  .route('/')
  .get(getSections)
  .post(restrictTo('admin', 'teacher'), createSection);

router
  .route('/:id')
  .get(getSection)
  .put(restrictTo('admin', 'teacher'), updateSection)
  .delete(restrictTo('admin'), deleteSection);

module.exports = router;
