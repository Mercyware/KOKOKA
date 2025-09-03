const express = require('express');
const router = express.Router();
const {
  getGlobalCurricula,
  getGlobalCurriculumById,
  createGlobalCurriculum,
  updateGlobalCurriculum,
  deleteGlobalCurriculum,
  adoptGlobalCurriculum,
  getGlobalCurriculumStats,
  getGlobalCurriculumSubjects
} = require('../controllers/globalCurriculumController');
const { protect } = require('../middlewares/authMiddleware');
const { extractSchoolFromSubdomain } = require('../middlewares/schoolMiddleware');

// Public routes (no authentication required)
router.get('/', getGlobalCurricula);
router.get('/stats', getGlobalCurriculumStats);
router.get('/:id', getGlobalCurriculumById);
router.get('/:id/subjects', getGlobalCurriculumSubjects);

// Protected routes (authentication required)
router.post('/', protect, createGlobalCurriculum);
router.put('/:id', protect, updateGlobalCurriculum);
router.delete('/:id', protect, deleteGlobalCurriculum);

// School-specific routes (require both auth and school context)
router.post('/:id/adopt', protect, extractSchoolFromSubdomain, adoptGlobalCurriculum);

module.exports = router;