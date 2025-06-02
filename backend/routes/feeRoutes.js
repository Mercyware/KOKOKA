const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Fees
 *   description: Fee management endpoints
 */

/**
 * @swagger
 * /api/fees:
 *   get:
 *     summary: Get all fees
 *     description: Retrieve a list of all fee records. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of fee records
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       student:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       academicYear:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       term:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       description:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [pending, partial, paid, overdue]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/',
  roleMiddleware.restrictTo('admin'),
  feeController.getAllFees
);

/**
 * @swagger
 * /api/fees/{id}:
 *   get:
 *     summary: Get fee by ID
 *     description: Retrieve a specific fee record by ID. Accessible by admin users and the student the fee belongs to.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     student:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     academicYear:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     term:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                           paymentDate:
 *                             type: string
 *                             format: date
 *                           paymentMethod:
 *                             type: string
 *                           receiptNumber:
 *                             type: string
 *                           notes:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: Fee not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin']),
  feeController.getFeeById
);

/**
 * @swagger
 * /api/fees:
 *   post:
 *     summary: Create new fee record
 *     description: Create a new fee record. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student
 *               - academicYear
 *               - term
 *               - amount
 *               - dueDate
 *             properties:
 *               student:
 *                 type: string
 *                 description: Student ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *               term:
 *                 type: string
 *                 description: Term ID
 *               description:
 *                 type: string
 *                 description: Fee description
 *               amount:
 *                 type: number
 *                 description: Fee amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for payment
 *               status:
 *                 type: string
 *                 enum: [pending, partial, paid, overdue]
 *                 description: Fee status
 *     responses:
 *       201:
 *         description: Fee record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     student:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  roleMiddleware.restrictTo('admin'),
  feeController.createFee
);

/**
 * @swagger
 * /api/fees/{id}:
 *   put:
 *     summary: Update fee record
 *     description: Update an existing fee record. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student:
 *                 type: string
 *                 description: Student ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *               term:
 *                 type: string
 *                 description: Term ID
 *               description:
 *                 type: string
 *                 description: Fee description
 *               amount:
 *                 type: number
 *                 description: Fee amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for payment
 *               status:
 *                 type: string
 *                 enum: [pending, partial, paid, overdue]
 *                 description: Fee status
 *     responses:
 *       200:
 *         description: Fee record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     student:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Fee not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  feeController.updateFee
);

/**
 * @swagger
 * /api/fees/{id}:
 *   delete:
 *     summary: Delete fee record
 *     description: Delete a fee record. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee record deleted successfully
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
 *                   example: Fee record deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Fee not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  feeController.deleteFee
);

/**
 * @swagger
 * /api/fees/student/{studentId}:
 *   get:
 *     summary: Get fees by student
 *     description: Retrieve all fee records for a specific student. Accessible by admin users and the student the fees belong to.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of fee records for the student
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       academicYear:
 *                         type: object
 *                       term:
 *                         type: object
 *                       description:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                       payments:
 *                         type: array
 *                         items:
 *                           type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: Student not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/student/:studentId',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin']),
  feeController.getFeesByStudent
);

/**
 * @swagger
 * /api/fees/payment:
 *   post:
 *     summary: Record fee payment
 *     description: Record a payment for a fee. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feeId
 *               - amount
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               feeId:
 *                 type: string
 *                 description: Fee ID
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank transfer, mobile money, check, other]
 *                 description: Method of payment
 *               receiptNumber:
 *                 type: string
 *                 description: Receipt number
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     student:
 *                       type: object
 *                     academicYear:
 *                       type: object
 *                     term:
 *                       type: object
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                           paymentDate:
 *                             type: string
 *                             format: date
 *                           paymentMethod:
 *                             type: string
 *                           receiptNumber:
 *                             type: string
 *                           notes:
 *                             type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Fee not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/payment',
  roleMiddleware.restrictTo('admin'),
  feeController.recordPayment
);

/**
 * @swagger
 * /api/fees/report:
 *   get:
 *     summary: Generate fee report
 *     description: Generate a report of fee collection. Accessible by admin users only.
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *       - in: query
 *         name: termId
 *         schema:
 *           type: string
 *         description: Filter by term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, partial, paid, overdue]
 *         description: Filter by fee status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *     responses:
 *       200:
 *         description: Fee report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFees:
 *                       type: number
 *                     totalCollected:
 *                       type: number
 *                     totalOutstanding:
 *                       type: number
 *                     collectionRate:
 *                       type: number
 *                     statusBreakdown:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         partial:
 *                           type: number
 *                         paid:
 *                           type: number
 *                         overdue:
 *                           type: number
 *                     recentPayments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     feesByClass:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/report',
  roleMiddleware.restrictTo('admin'),
  feeController.generateFeeReport
);

module.exports = router;
