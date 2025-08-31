const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const schoolMiddleware = require('../middlewares/schoolMiddleware');

// Apply authentication and school context middleware
router.use(authMiddleware.protect);
router.use(schoolMiddleware.extractSchoolFromSubdomain);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Retrieve a list of all subjects for the school
 *     tags: [Subjects]
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
 *     responses:
 *       200:
 *         description: List of subjects
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', subjectController.getAllSubjects);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Retrieve a specific subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */
router.get('/:id', subjectController.getSubjectById);

// Admin only routes
router.use(roleMiddleware.restrictTo('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create new subject
 *     description: Create a new subject for the school
 *     tags: [Subjects]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Subject name
 *               code:
 *                 type: string
 *                 description: Subject code
 *               description:
 *                 type: string
 *                 description: Subject description
 *               departmentId:
 *                 type: string
 *                 description: Department ID (optional)
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', subjectController.createSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update subject
 *     description: Update an existing subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Subject name
 *               code:
 *                 type: string
 *                 description: Subject code
 *               description:
 *                 type: string
 *                 description: Subject description
 *               departmentId:
 *                 type: string
 *                 description: Department ID (optional)
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */
router.put('/:id', subjectController.updateSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete subject
 *     description: Delete a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;