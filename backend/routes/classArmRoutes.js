const express = require('express');
const router = express.Router();
const classArmController = require('../controllers/classArmController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const schoolDataRoutes = require('./schoolDataRoutes');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/class-arms:
 *   get:
 *     summary: Get all class arms
 *     description: Retrieve a list of all class arms. Accessible by all authenticated users.
 *     tags: [Class Arms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of class arms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Class arm ID
 *                   name:
 *                     type: string
 *                     description: Class arm name
 *                   school:
 *                     type: string
 *                     description: School ID
 *                   description:
 *                     type: string
 *                     description: Class arm description
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
router.get('/', schoolDataRoutes.filterBySchoolMiddleware, classArmController.getAllClassArms);

/**
 * @swagger
 * /api/class-arms/{id}:
 *   get:
 *     summary: Get class arm by ID
 *     description: Retrieve a specific class arm by ID. Accessible by all authenticated users.
 *     tags: [Class Arms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class arm ID
 *     responses:
 *       200:
 *         description: The class arm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 school:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Class arm not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', schoolDataRoutes.filterBySchoolMiddleware, classArmController.getClassArmById);


/**
 * @swagger
 * /api/class-arms/{id}/students:
 *   get:
 *     summary: Get students in class arm
 *     description: Retrieve students for a specific class arm. Accessible by all authenticated users.
 *     tags: [Class Arms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class arm ID
 *     responses:
 *       200:
 *         description: List of students in the specified class arm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Class arm not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/students', schoolDataRoutes.filterBySchoolMiddleware, classArmController.getClassArmStudents);


// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/class-arms:
 *   post:
 *     summary: Create new class arm
 *     description: Create a new class arm. Accessible by admin users only.
 *     tags: [Class Arms]
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
 *                 description: Class arm name (e.g., "A", "B", "Red", "Blue")
 *               description:
 *                 type: string
 *                 description: Class arm description
 *     responses:
 *       201:
 *         description: Class arm created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 school:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class or academic year or teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', schoolDataRoutes.scopeToSchoolMiddleware, roleMiddleware.restrictTo('admin'), classArmController.createClassArm);

/**
 * @swagger
 * /api/class-arms/{id}:
 *   put:
 *     summary: Update class arm
 *     description: Update an existing class arm. Accessible by admin users only.
 *     tags: [Class Arms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class arm ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Class arm name
 *               description:
 *                 type: string
 *                 description: Class arm description
 *     responses:
 *       200:
 *         description: Class arm updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 school:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class arm or class or academic year or teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', schoolDataRoutes.scopeToSchoolMiddleware, roleMiddleware.restrictTo('admin'), classArmController.updateClassArm);

/**
 * @swagger
 * /api/class-arms/{id}:
 *   delete:
 *     summary: Delete class arm
 *     description: Delete a class arm. Accessible by admin users only.
 *     tags: [Class Arms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class arm ID
 *     responses:
 *       200:
 *         description: Class arm deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class arm deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class arm not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', schoolDataRoutes.requireSchoolMiddleware, roleMiddleware.restrictTo('admin'), classArmController.deleteClassArm);

module.exports = router;
