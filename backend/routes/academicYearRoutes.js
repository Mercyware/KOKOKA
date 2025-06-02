const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Check if academic year name exists

router.get('/check-name', academicYearController.checkAcademicYearName);

/**
 * @swagger
 * tags:
 *   name: Academic Years
 *   description: Academic year management endpoints
 */

/**
 * @swagger
 * /api/academic-years:
 *   get:
 *     summary: Get all academic years
 *     description: Retrieve a list of all academic years. Accessible by all authenticated users.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of academic years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Academic year ID
 *                   name:
 *                     type: string
 *                     description: Academic year name
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Start date of the academic year
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: End date of the academic year
 *                   isActive:
 *                     type: boolean
 *                     description: Whether this is the active academic year
 *                   description:
 *                     type: string
 *                     description: Academic year description
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
router.get('/', academicYearController.getAllAcademicYears);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   get:
 *     summary: Get academic year by ID
 *     description: Retrieve a specific academic year by ID. Accessible by all authenticated users.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: The academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', academicYearController.getAcademicYearById);

/**
 * @swagger
 * /api/academic-years/current/active:
 *   get:
 *     summary: Get current academic year
 *     description: Retrieve the academic year that includes the current date. Accessible by all authenticated users.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No current academic year found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/current/active', academicYearController.getCurrentAcademicYear);

/**
 * @swagger
 * /api/academic-years/active/year:
 *   get:
 *     summary: Get active academic year
 *     description: Retrieve the academic year that is marked as active. Accessible by all authenticated users.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The active academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No active academic year found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/active/year', academicYearController.getActiveAcademicYear);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/academic-years:
 *   post:
 *     summary: Create new academic year
 *     description: Create a new academic year. Accessible by admin users only.
 *     tags: [Academic Years]
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
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Academic year name (e.g., "2023-2024")
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the academic year
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the academic year
 *               isActive:
 *                 type: boolean
 *                 description: Whether this is the active academic year
 *               description:
 *                 type: string
 *                 description: Academic year description
 *     responses:
 *       201:
 *         description: Academic year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', academicYearController.createAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   put:
 *     summary: Update academic year
 *     description: Update an existing academic year. Accessible by admin users only.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Academic year name
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the academic year
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the academic year
 *               description:
 *                 type: string
 *                 description: Academic year description
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
router.put('/:id', academicYearController.updateAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   delete:
 *     summary: Delete academic year
 *     description: Delete an academic year. Accessible by admin users only.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Academic year deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', academicYearController.deleteAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}/set-active:
 *   patch:
 *     summary: Set active academic year
 *     description: Set an academic year as active and deactivate all others. Accessible by admin users only.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year set as active successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
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
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/set-active', academicYearController.setActiveAcademicYear);
/**
 * @swagger
 * /api/academic-years/set-active:
 *   patch:
 *     summary: Set active academic year
 *     description: Set an academic year as active and deactivate all others. Accessible by admin users only.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Academic year ID to set as active
 *     responses:
 *       200:
 *         description: Academic year set as active successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Academic year set as active successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = router;
