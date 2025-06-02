const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management endpoints
 */

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers
 *     description: Retrieve a list of all teachers. Accessible by admin, teacher, and student users.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g., name, employeeId)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or employee ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on leave, inactive]
 *         description: Filter by teacher status
 *     responses:
 *       200:
 *         description: A list of teachers
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
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       employeeId:
 *                         type: string
 *                       department:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       position:
 *                         type: string
 *                       qualifications:
 *                         type: array
 *                         items:
 *                           type: string
 *                       joinDate:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [active, on leave, inactive]
 *                       contactInfo:
 *                         type: object
 *                         properties:
 *                           phone:
 *                             type: string
 *                           alternativeEmail:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  teacherController.getAllTeachers
);

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     description: Retrieve a specific teacher by ID. Accessible by admin users, the teacher themselves, and students.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher details
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     employeeId:
 *                       type: string
 *                     department:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     position:
 *                       type: string
 *                     qualifications:
 *                       type: array
 *                       items:
 *                         type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     joinDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                     contactInfo:
 *                       type: object
 *                       properties:
 *                         phone:
 *                           type: string
 *                         alternativeEmail:
 *                           type: string
 *                         address:
 *                           type: object
 *                           properties:
 *                             street:
 *                               type: string
 *                             city:
 *                               type: string
 *                             state:
 *                               type: string
 *                             zipCode:
 *                               type: string
 *                             country:
 *                               type: string
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin', 'student']),
  teacherController.getTeacherById
);

/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: Create new teacher
 *     description: Create a new teacher record. Accessible by admin users only.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - employeeId
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID (must have role 'teacher')
 *               employeeId:
 *                 type: string
 *                 description: Unique employee ID
 *               department:
 *                 type: string
 *                 description: Department ID
 *               position:
 *                 type: string
 *                 description: Position or title
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Academic qualifications
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Subject specializations
 *               joinDate:
 *                 type: string
 *                 format: date
 *                 description: Date of joining
 *               status:
 *                 type: string
 *                 enum: [active, on leave, inactive]
 *                 description: Current status
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   alternativeEmail:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       201:
 *         description: Teacher created successfully
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
 *                     user:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     department:
 *                       type: string
 *                     position:
 *                       type: string
 *                     qualifications:
 *                       type: array
 *                       items:
 *                         type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     joinDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                     contactInfo:
 *                       type: object
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
  teacherController.createTeacher
);

/**
 * @swagger
 * /api/teachers/{id}:
 *   put:
 *     summary: Update teacher
 *     description: Update an existing teacher record. Accessible by admin users and the teacher themselves.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 description: Department ID
 *               position:
 *                 type: string
 *                 description: Position or title
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Academic qualifications
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Subject specializations
 *               status:
 *                 type: string
 *                 enum: [active, on leave, inactive]
 *                 description: Current status
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   alternativeEmail:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       200:
 *         description: Teacher updated successfully
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
 *                     user:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     department:
 *                       type: string
 *                     position:
 *                       type: string
 *                     qualifications:
 *                       type: array
 *                       items:
 *                         type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                     contactInfo:
 *                       type: object
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin']),
  teacherController.updateTeacher
);

/**
 * @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: Delete teacher
 *     description: Delete a teacher record. Accessible by admin users only.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
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
 *                   example: Teacher deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  teacherController.deleteTeacher
);

/**
 * @swagger
 * /api/teachers/{id}/classes:
 *   get:
 *     summary: Get teacher's assigned classes
 *     description: Retrieve all classes assigned to a specific teacher. Accessible by admin users and the teacher themselves.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year ID
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Filter by term ID
 *     responses:
 *       200:
 *         description: List of classes assigned to the teacher
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
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *                       section:
 *                         type: string
 *                       academicYear:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       subjects:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                       students:
 *                         type: number
 *                         description: Number of students in the class
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/classes',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin']),
  teacherController.getTeacherClasses
);

/**
 * @swagger
 * /api/teachers/{id}/schedule:
 *   get:
 *     summary: Get teacher's schedule
 *     description: Retrieve the teaching schedule for a specific teacher. Accessible by admin users, the teacher themselves, and students.
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year ID
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Filter by term ID
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by week (date within the week)
 *     responses:
 *       200:
 *         description: Teacher's schedule
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
 *                     teacher:
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
 *                     schedule:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                           periods:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 period:
 *                                   type: number
 *                                 startTime:
 *                                   type: string
 *                                   format: time
 *                                 endTime:
 *                                   type: string
 *                                   format: time
 *                                 subject:
 *                                   type: object
 *                                   properties:
 *                                     _id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                                 class:
 *                                   type: object
 *                                   properties:
 *                                     _id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                                 location:
 *                                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/schedule',
  roleMiddleware.restrictToOwnerOrRoles('teacher', ['admin', 'student']),
  teacherController.getTeacherSchedule
);

module.exports = router;
