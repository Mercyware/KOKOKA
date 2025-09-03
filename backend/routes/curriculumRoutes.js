const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const schoolMiddleware = require('../middlewares/schoolMiddleware');

// Apply authentication and school context middleware
router.use(authMiddleware.protect);
router.use(schoolMiddleware.extractSchoolFromSubdomain);

/**
 * @swagger
 * /api/curricula:
 *   get:
 *     summary: Get all curricula
 *     description: Retrieve a list of all curricula for the school
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [STANDARD, CAMBRIDGE, IB, NATIONAL, STEM, ARTS, VOCATIONAL, CUSTOM]
 *         description: Filter by curriculum type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, INACTIVE, ARCHIVED, UNDER_REVIEW]
 *         description: Filter by curriculum status
 *     responses:
 *       200:
 *         description: List of curricula
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', curriculumController.getAllCurricula);

/**
 * @swagger
 * /api/curricula/templates:
 *   get:
 *     summary: Get curriculum templates
 *     description: Retrieve available curriculum templates
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of curriculum templates
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/templates', curriculumController.getCurriculumTemplates);

/**
 * @swagger
 * /api/curricula/{id}:
 *   get:
 *     summary: Get curriculum by ID
 *     description: Retrieve a specific curriculum by ID
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Curriculum ID
 *     responses:
 *       200:
 *         description: Curriculum details
 *       404:
 *         description: Curriculum not found
 *       500:
 *         description: Server error
 */
router.get('/:id', curriculumController.getCurriculumById);

// Admin only routes
router.use(roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

/**
 * @swagger
 * /api/curricula:
 *   post:
 *     summary: Create new curriculum
 *     description: Create a new curriculum for the school
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Curriculum name
 *               description:
 *                 type: string
 *                 description: Curriculum description
 *               version:
 *                 type: string
 *                 description: Curriculum version
 *               type:
 *                 type: string
 *                 enum: [STANDARD, CAMBRIDGE, IB, NATIONAL, STEM, ARTS, VOCATIONAL, CUSTOM]
 *                 description: Curriculum type
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, INACTIVE, ARCHIVED, UNDER_REVIEW]
 *                 description: Curriculum status
 *               startYear:
 *                 type: integer
 *                 description: Starting academic year
 *               endYear:
 *                 type: integer
 *                 description: Ending academic year
 *     responses:
 *       201:
 *         description: Curriculum created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', curriculumController.createCurriculum);

/**
 * @swagger
 * /api/curricula/{id}:
 *   put:
 *     summary: Update curriculum
 *     description: Update an existing curriculum
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Curriculum ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Curriculum name
 *               description:
 *                 type: string
 *                 description: Curriculum description
 *               version:
 *                 type: string
 *                 description: Curriculum version
 *               type:
 *                 type: string
 *                 enum: [STANDARD, CAMBRIDGE, IB, NATIONAL, STEM, ARTS, VOCATIONAL, CUSTOM]
 *                 description: Curriculum type
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, INACTIVE, ARCHIVED, UNDER_REVIEW]
 *                 description: Curriculum status
 *               startYear:
 *                 type: integer
 *                 description: Starting academic year
 *               endYear:
 *                 type: integer
 *                 description: Ending academic year
 *     responses:
 *       200:
 *         description: Curriculum updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Curriculum not found
 *       500:
 *         description: Server error
 */
router.put('/:id', curriculumController.updateCurriculum);

/**
 * @swagger
 * /api/curricula/{id}/subjects:
 *   post:
 *     summary: Add subject to curriculum
 *     description: Add a subject to a curriculum
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Curriculum ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *               - gradeLevel
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: Subject ID
 *               gradeLevel:
 *                 type: integer
 *                 description: Grade level for the subject
 *               term:
 *                 type: integer
 *                 description: Term number (optional)
 *               hoursPerWeek:
 *                 type: integer
 *                 description: Hours per week for the subject
 *               isCore:
 *                 type: boolean
 *                 description: Whether the subject is core
 *               isOptional:
 *                 type: boolean
 *                 description: Whether the subject is optional
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prerequisite subject IDs
 *     responses:
 *       201:
 *         description: Subject added to curriculum successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Curriculum or subject not found
 *       500:
 *         description: Server error
 */
router.post('/:id/subjects', curriculumController.addSubjectToCurriculum);

// New enhanced routes
router.get('/:id/progress', curriculumController.getCurriculumProgress);
router.get('/:id/analytics', curriculumController.getCurriculumAnalytics);
router.patch('/:id/implementation', curriculumController.updateImplementationStatus);

/**
 * @swagger
 * /api/curricula/{id}:
 *   delete:
 *     summary: Delete curriculum
 *     description: Delete a curriculum
 *     tags: [Curricula]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Curriculum ID
 *     responses:
 *       200:
 *         description: Curriculum deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Curriculum not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', curriculumController.deleteCurriculum);

module.exports = router;
