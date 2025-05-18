const express = require('express');
const {
  getHouses,
  getHouse,
  createHouse,
  updateHouse,
  deleteHouse
} = require('../controllers/houseController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const schoolDataRoutes = require('./schoolDataRoutes');

// Apply authentication and school context middleware
router.use(schoolDataRoutes.filterBySchoolMiddleware);

router
  .route('/')
  .get(getHouses)
  .post(restrictTo('admin', 'teacher'), createHouse);

router
  .route('/:id')
  .get(getHouse)
  .put(restrictTo('admin', 'teacher'), updateHouse)
  .delete(restrictTo('admin'), deleteHouse);

module.exports = router;
