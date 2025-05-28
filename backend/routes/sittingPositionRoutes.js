const express = require('express');
const router = express.Router();
const sittingPositionController = require('../controllers/sittingPositionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Routes accessible by all authenticated users
router.get('/', sittingPositionController.getAllSittingPositions);
router.get('/:id', sittingPositionController.getSittingPositionById);
router.get('/class/:classId/arm/:classArmId', sittingPositionController.getSittingPositionsByClassAndArm);
router.get('/student/:studentId', sittingPositionController.getSittingPositionByStudent);
router.get('/academic-year/:academicYearId/term/:termId', sittingPositionController.getSittingPositionsByAcademicYearAndTerm);
router.get('/layout/class/:classId/arm/:classArmId', sittingPositionController.getClassroomLayout);

// Admin and teacher routes
router.use(roleMiddleware.restrictTo('admin', 'teacher'));

router.post('/', sittingPositionController.createSittingPosition);
router.put('/:id', sittingPositionController.updateSittingPosition);
router.delete('/:id', sittingPositionController.deleteSittingPosition);

module.exports = router;
