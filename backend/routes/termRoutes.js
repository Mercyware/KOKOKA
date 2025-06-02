const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Terms
 *   description: Term management endpoints
 */

/**
 * @swagger
 * /api/terms:
 *   get:
 *     summary: Get all terms
 *     description: Retrieve a list of all terms. Accessible by all authenticated users.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of terms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Term ID
 *                   name:
 *                     type: string
 *                     description: Term name
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Start date of the term
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: End date of the term
 *                   isActive:
 *                     type: boolean
 *                     description: Whether this is the active term
 *                   description:
 *                     type: string
 *                     description: Term description
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', termController.getAllTerms);

/**
 * @swagger
 * /api/terms/{id}:
 *   get:
 *     summary: Get term by ID
 *     description: Retrieve a specific term by ID. Accessible by all authenticated users.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Term ID
 *     responses:
 *       200:
 *         description: The term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                 description:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Term not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', termController.getTermById);

/**
 * @swagger
 * /api/terms/academic-year/{academicYearId}:
 *   get:
 *     summary: Get terms by academic year
 *     description: Retrieve terms for a specific academic year. Accessible by all authenticated users.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: List of terms for the specified academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   academicYear:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   isActive:
 *                     type: boolean
 *                   description:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', termController.getTermsByAcademicYear);

/**
 * @swagger
 * /api/terms/current/active:
 *   get:
 *     summary: Get current term
 *     description: Retrieve the term that includes the current date. Accessible by all authenticated users.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                 description:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No current term found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/current/active', termController.getCurrentTerm);

/**
 * @swagger
 * /api/terms/active/term:
 *   get:
 *     summary: Get active term
 *     description: Retrieve the term that is marked as active. Accessible by all authenticated users.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The active term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                 description:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No active term found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/active/term', termController.getActiveTerm);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/terms:
 *   post:
 *     summary: Create new term
 *     description: Create a new term. Accessible by admin users only.
 *     tags: [Terms]
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
 *               - academicYear
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Term name (e.g., "Term 1")
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this term belongs to
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the term
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the term
 *               isActive:
 *                 type: boolean
 *                 description: Whether this is the active term
 *               description:
 *                 type: string
 *                 description: Term description
 *     responses:
 *       201:
 *         description: Term created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                 description:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', termController.createTerm);

/**
 * @swagger
 * /api/terms/{id}:
 *   put:
 *     summary: Update term
 *     description: Update an existing term. Accessible by admin users only.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Term ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Term name
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this term belongs to
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the term
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the term
 *               description:
 *                 type: string
 *                 description: Term description
 *     responses:
 *       200:
 *         description: Term updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                 description:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Term not found or academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', termController.updateTerm);

/**
 * @swagger
 * /api/terms/{id}:
 *   delete:
 *     summary: Delete term
 *     description: Delete a term. Accessible by admin users only.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Term ID
 *     responses:
 *       200:
 *         description: Term deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Term deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Term not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', termController.deleteTerm);

/**
 * @swagger
 * /api/terms/{id}/set-active:
 *   patch:
 *     summary: Set active term
 *     description: Set a term as active and deactivate all others. Accessible by admin users only.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Term ID
 *     responses:
 *       200:
 *         description: Term set as active successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 description:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Term not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/set-active', termController.setActiveTerm);

module.exports = router;
