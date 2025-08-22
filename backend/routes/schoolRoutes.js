const express = require('express');
const router = express.Router();

// Import controllers
const schoolController = require('../controllers/schoolController');

// Import middleware
const { protect } = require('../middlewares/authMiddleware');
// const { restrictTo } = require('../middlewares/roleMiddleware'); // Temporarily disabled for migration
const { extractSchoolFromSubdomain, requireSchool } = require('../middlewares/schoolMiddleware');

/**
 * @swagger
 * tags:
 *   name: Schools
 *   description: School management endpoints
 */

/**
 * @swagger
 * /schools/register:
 *   post:
 *     summary: Register a new school
 *     description: Register a new school with admin user information. The school will be in pending status until approved.
 *     tags: [Schools]
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
 *                 description: School name
 *               subdomain:
 *                 type: string
 *                 description: Unique subdomain for the school
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   website:
 *                     type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               description:
 *                 type: string
 *                 description: School description
 *               type:
 *                 type: string
 *                 enum: [primary, secondary, high, college, university, vocational, other]
 *                 description: Type of school
 *               adminInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Admin user name
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Admin user email
 *                   password:
 *                     type: string
 *                     format: password
 *                     description: Admin user password
 *     responses:
 *       201:
 *         description: School registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School registered successfully and pending approval
 *                 school:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     subdomain:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: pending
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Bad request - School with same name or subdomain already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', schoolController.registerSchool);

/**
 * @swagger
 * /schools/check-subdomain/{subdomain}:
 *   get:
 *     summary: Check subdomain availability
 *     description: Check if a subdomain is available for use
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: subdomain
 *         required: true
 *         schema:
 *           type: string
 *         description: Subdomain to check
 *     responses:
 *       200:
 *         description: Subdomain availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid subdomain format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/check-subdomain/:subdomain', schoolController.checkSubdomainAvailability);

// Protected routes - Super admin only
router.use(protect);
// router.use(restrictTo('superadmin')); // Temporarily disabled for migration

/**
 * @swagger
 * /schools:
 *   get:
 *     summary: Get all schools
 *     description: Retrieve a list of all schools. Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, suspended, inactive]
 *         description: Filter by school status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, subdomain, or email
 *     responses:
 *       200:
 *         description: A list of schools with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 schools:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/School'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', schoolController.getAllSchools);

/**
 * @swagger
 * /schools/{id}:
 *   get:
 *     summary: Get school by ID
 *     description: Retrieve a specific school by ID with admin users. Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *     responses:
 *       200:
 *         description: School details with admin users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 school:
 *                   $ref: '#/components/schemas/School'
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       lastLogin:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', schoolController.getSchoolById);

/**
 * @swagger
 * /schools/{id}:
 *   put:
 *     summary: Update school
 *     description: Update an existing school's information. Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subdomain:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *               address:
 *                 type: object
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [primary, secondary, high, college, university, vocational, other]
 *               settings:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: object
 *                   grading:
 *                     type: object
 *                   academicYear:
 *                     type: object
 *                   features:
 *                     type: object
 *     responses:
 *       200:
 *         description: School updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School updated successfully
 *                 school:
 *                   $ref: '#/components/schemas/School'
 *       400:
 *         description: Bad request - Subdomain already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', schoolController.updateSchool);

/**
 * @swagger
 * /schools/{id}:
 *   delete:
 *     summary: Delete school
 *     description: Mark a school as inactive (soft delete). Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *     responses:
 *       200:
 *         description: School marked as inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School marked as inactive
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', schoolController.deleteSchool);

/**
 * @swagger
 * /schools/{id}/status:
 *   put:
 *     summary: Update school status
 *     description: Update a school's status (active, pending, suspended, inactive). Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, pending, suspended, inactive]
 *                 description: New status for the school
 *     responses:
 *       200:
 *         description: School status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School status updated to active
 *                 school:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/status', schoolController.updateSchoolStatus);

/**
 * @swagger
 * /schools/{id}/subscription:
 *   put:
 *     summary: Update school subscription
 *     description: Update a school's subscription details. Accessible by super admins only.
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *                 description: Subscription plan
 *               status:
 *                 type: string
 *                 enum: [active, trial, expired, cancelled]
 *                 description: Subscription status
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Subscription start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Subscription end date
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method used
 *               paymentId:
 *                 type: string
 *                 description: Payment ID reference
 *     responses:
 *       200:
 *         description: School subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School subscription updated
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                     status:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     paymentMethod:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/subscription', schoolController.updateSchoolSubscription);

module.exports = router;
