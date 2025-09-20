const express = require('express');
const router = express.Router();
const staffSubjectAssignmentController = require('../controllers/staffSubjectAssignmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Staff Subject Assignments
 *   description: Staff subject assignment management endpoints
 */

/**
 * @swagger
 * /api/staff-subject-assignments:
 *   get:
 *     summary: Get all staff subject assignments
 *     description: Retrieve a list of all teacher subject assignments. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of teacher subject assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Assignment ID
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   subject:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   term:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         class:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 *                   assignedDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the assignment was made
 *                   isActive:
 *                     type: boolean
 *                     description: Whether the assignment is active
 *                   remarks:
 *                     type: string
 *                     description: Additional remarks
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
router.get('/', staffSubjectAssignmentController.getAllAssignments);

/**
 * @swagger
 * /api/teacher-subject-assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     description: Retrieve a specific teacher subject assignment by ID. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: The teacher subject assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                 subject:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 term:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           level:
 *                             type: number
 *                       classArms:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                 assignedDate:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 remarks:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Assignment not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', staffSubjectAssignmentController.getAssignmentById);

/**
 * @swagger
 * /api/teacher-subject-assignments/teacher/{teacherId}:
 *   get:
 *     summary: Get assignments by teacher
 *     description: Retrieve teacher subject assignments for a specific teacher. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: List of assignments for the specified teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teacher:
 *                     type: string
 *                   subject:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   term:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         class:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/teacher/:teacherId', staffSubjectAssignmentController.getAssignmentsByTeacher);

/**
 * @swagger
 * /api/teacher-subject-assignments/subject/{subjectId}:
 *   get:
 *     summary: Get assignments by subject
 *     description: Retrieve teacher subject assignments for a specific subject. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: List of assignments for the specified subject
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   subject:
 *                     type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   term:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         class:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/subject/:subjectId', staffSubjectAssignmentController.getAssignmentsBySubject);

/**
 * @swagger
 * /api/teacher-subject-assignments/academic-year/{academicYearId}:
 *   get:
 *     summary: Get assignments by academic year
 *     description: Retrieve teacher subject assignments for a specific academic year. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
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
 *         description: List of assignments for the specified academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   subject:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   academicYear:
 *                     type: string
 *                   term:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         class:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', staffSubjectAssignmentController.getAssignmentsByAcademicYear);

/**
 * @swagger
 * /api/teacher-subject-assignments/term/{termId}:
 *   get:
 *     summary: Get assignments by term
 *     description: Retrieve teacher subject assignments for a specific term. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: termId
 *         required: true
 *         schema:
 *           type: string
 *         description: Term ID
 *     responses:
 *       200:
 *         description: List of assignments for the specified term
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   subject:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   term:
 *                     type: string
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         class:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/term/:termId', staffSubjectAssignmentController.getAssignmentsByTerm);

/**
 * @swagger
 * /api/teacher-subject-assignments/class/{classId}:
 *   get:
 *     summary: Get assignments by class
 *     description: Retrieve teacher subject assignments for a specific class. Accessible by all authenticated users.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of assignments for the specified class
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   subject:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   term:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/class/:classId', staffSubjectAssignmentController.getAssignmentsByClass);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/teacher-subject-assignments:
 *   post:
 *     summary: Create new assignment
 *     description: Create a new teacher subject assignment. Accessible by admin users only.
 *     tags: [Teacher Subject Assignments]
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
 *               - subject
 *               - academicYear
 *               - term
 *             properties:
 *               teacher:
 *                 type: string
 *                 description: ID of the teacher
 *               subject:
 *                 type: string
 *                 description: ID of the subject
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year
 *               term:
 *                 type: string
 *                 description: ID of the term
 *               classes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - class
 *                   properties:
 *                     class:
 *                       type: string
 *                       description: ID of the class
 *               assignedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the assignment was made
 *               isActive:
 *                 type: boolean
 *                 description: Whether the assignment is active
 *               remarks:
 *                 type: string
 *                 description: Additional remarks
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 teacher:
 *                   type: string
 *                 subject:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 term:
 *                   type: string
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class:
 *                         type: string
 *                 assignedDate:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 remarks:
 *                   type: string
 *       400:
 *         description: Bad request - validation error or staff member must be a teacher
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Teacher, subject, academic year, term, class, or class arms not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', staffSubjectAssignmentController.createAssignment);

/**
 * @swagger
 * /api/teacher-subject-assignments/{id}:
 *   put:
 *     summary: Update assignment
 *     description: Update an existing teacher subject assignment. Accessible by admin users only.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacher:
 *                 type: string
 *                 description: ID of the teacher
 *               subject:
 *                 type: string
 *                 description: ID of the subject
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year
 *               term:
 *                 type: string
 *                 description: ID of the term
 *               classes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     class:
 *                       type: string
 *                       description: ID of the class
 *               isActive:
 *                 type: boolean
 *                 description: Whether the assignment is active
 *               remarks:
 *                 type: string
 *                 description: Additional remarks
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 teacher:
 *                   type: string
 *                 subject:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 term:
 *                   type: string
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       class:
 *                         type: string
 *                 assignedDate:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 remarks:
 *                   type: string
 *       400:
 *         description: Bad request - validation error or staff member must be a teacher
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Assignment, teacher, subject, academic year, term, class, or class arms not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', staffSubjectAssignmentController.updateAssignment);

/**
 * @swagger
 * /api/teacher-subject-assignments/{id}:
 *   delete:
 *     summary: Delete assignment
 *     description: Delete a teacher subject assignment. Accessible by admin users only.
 *     tags: [Teacher Subject Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assignment deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Assignment not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', staffSubjectAssignmentController.deleteAssignment);

module.exports = router;
