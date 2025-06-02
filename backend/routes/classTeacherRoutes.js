const express = require('express');
const router = express.Router();
const classTeacherController = require('../controllers/classTeacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Class Teachers
 *   description: Class teacher management endpoints
 */

/**
 * @swagger
 * /api/class-teachers:
 *   get:
 *     summary: Get all class teachers
 *     description: Retrieve a list of all class teachers. Accessible by all authenticated users.
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of class teachers
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
 *                       teacher:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       class:
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', classTeacherController.getAllClassTeachers);

/**
 * @swagger
 * /api/class-teachers/check:
 *   get:
 *     summary: Check if class teacher exists
 *     description: Check if a class teacher assignment exists for a specific class and academic year
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: Class ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         required: true
 *         description: Academic Year ID
 *     responses:
 *       200:
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 exists:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/check', classTeacherController.checkClassTeacherExists);

/**
 * @swagger
 * /api/class-teachers/academic-year/{academicYearId}:
 *   get:
 *     summary: Get class teachers by academic year
 *     description: Retrieve all class teachers for a specific academic year
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: academicYearId
 *         schema:
 *           type: string
 *         required: true
 *         description: Academic Year ID
 *     responses:
 *       200:
 *         description: List of class teachers for the academic year
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
 *                       teacher:
 *                         type: object
 *                       class:
 *                         type: object
 *                       academicYear:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', classTeacherController.getClassTeachersByAcademicYear);

/**
 * @swagger
 * /api/class-teachers/teacher/{teacherId}:
 *   get:
 *     summary: Get classes by teacher
 *     description: Retrieve all classes assigned to a specific teacher
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         schema:
 *           type: string
 *         required: true
 *         description: Teacher ID
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
 *                       class:
 *                         type: object
 *                       academicYear:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/teacher/:teacherId', classTeacherController.getClassesByTeacher);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   get:
 *     summary: Get class teacher by ID
 *     description: Retrieve a specific class teacher assignment by ID
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class Teacher ID
 *     responses:
 *       200:
 *         description: Class teacher details
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
 *                     teacher:
 *                       type: object
 *                     class:
 *                       type: object
 *                     academicYear:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Class teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', classTeacherController.getClassTeacherById);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/class-teachers:
 *   post:
 *     summary: Create new class teacher assignment
 *     description: Assign a teacher as a class teacher for a specific class and academic year. Accessible by admin users only.
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacher
 *               - class
 *               - academicYear
 *             properties:
 *               teacher:
 *                 type: string
 *                 description: Teacher ID
 *               class:
 *                 type: string
 *                 description: Class ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *     responses:
 *       201:
 *         description: Class teacher assignment created successfully
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
 *                     teacher:
 *                       type: string
 *                     class:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', classTeacherController.createClassTeacher);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   put:
 *     summary: Update class teacher assignment
 *     description: Update an existing class teacher assignment. Accessible by admin users only.
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacher:
 *                 type: string
 *                 description: Teacher ID
 *               class:
 *                 type: string
 *                 description: Class ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *     responses:
 *       200:
 *         description: Class teacher assignment updated successfully
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
 *                     teacher:
 *                       type: string
 *                     class:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', classTeacherController.updateClassTeacher);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   delete:
 *     summary: Delete class teacher assignment
 *     description: Delete a class teacher assignment. Accessible by admin users only.
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class Teacher ID
 *     responses:
 *       200:
 *         description: Class teacher assignment deleted successfully
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
 *                   example: Class teacher deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', classTeacherController.deleteClassTeacher);

module.exports = router;
