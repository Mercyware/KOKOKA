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
 *   description: Teacher-Class assignment management endpoints
 */

/**
 * @swagger
 * /api/class-teachers:
 *   get:
 *     summary: Get all teacher-class assignments
 *     description: Retrieve a list of all teacher-class assignments with filtering options
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by Academic Year ID
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter by Teacher ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by Class ID
 *     responses:
 *       200:
 *         description: A list of teacher-class assignments
 */
router.get('/', classTeacherController.getClassTeacherAssignments);

/**
 * @swagger
 * /api/class-teachers/form-data:
 *   get:
 *     summary: Get form data for teacher-class assignments
 *     description: Get classes, academic years, and teachers for dropdowns
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Form data including classes, academic years, and teachers
 */
router.get('/form-data', classTeacherController.getFormData);

/**
 * @swagger
 * /api/class-teachers/available-teachers:
 *   get:
 *     summary: Get available teachers for assignment
 *     description: Get teachers not already assigned to a class in an academic year
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
 *         description: List of available teachers
 */
router.get('/available-teachers', classTeacherController.getAvailableTeachers);

/**
 * @swagger
 * /api/class-teachers/teacher/{teacherId}:
 *   get:
 *     summary: Get assignments by teacher
 *     description: Retrieve all class assignments for a specific teacher
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
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by Academic Year ID
 *     responses:
 *       200:
 *         description: List of class assignments for the teacher
 */
router.get('/teacher/:teacherId', classTeacherController.getTeacherAssignments);

/**
 * @swagger
 * /api/class-teachers/class/{classId}:
 *   get:
 *     summary: Get assignments by class
 *     description: Retrieve all teacher assignments for a specific class
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: Class ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by Academic Year ID
 *     responses:
 *       200:
 *         description: List of teacher assignments for the class
 */
router.get('/class/:classId', classTeacherController.getClassAssignments);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     description: Retrieve a specific teacher-class assignment by ID
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Teacher-class assignment details
 */
router.get('/:id', classTeacherController.getClassTeacherAssignment);

// Admin and Principal only routes
router.use(roleMiddleware.restrictTo('admin', 'principal', 'vice_principal'));

/**
 * @swagger
 * /api/class-teachers:
 *   post:
 *     summary: Create new teacher-class assignment
 *     description: Assign a teacher to a class for a specific academic year
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
 *               - teacherId
 *               - classId
 *               - academicYearId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: Teacher ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               academicYearId:
 *                 type: string
 *                 description: Academic Year ID
 *               isClassTeacher:
 *                 type: boolean
 *                 default: true
 *                 description: Whether this is a class teacher assignment
 *               isSubjectTeacher:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is a subject teacher assignment
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subject IDs if isSubjectTeacher is true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Assignment start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Assignment end date
 *               canMarkAttendance:
 *                 type: boolean
 *                 default: true
 *                 description: Permission to mark attendance
 *               canGradeAssignments:
 *                 type: boolean
 *                 default: true
 *                 description: Permission to grade assignments
 *               canManageClassroom:
 *                 type: boolean
 *                 default: false
 *                 description: Permission to manage classroom (class teacher only)
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Teacher-class assignment created successfully
 */
router.post('/', classTeacherController.createClassTeacherAssignment);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   put:
 *     summary: Update teacher-class assignment
 *     description: Update an existing teacher-class assignment
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isClassTeacher:
 *                 type: boolean
 *                 description: Whether this is a class teacher assignment
 *               isSubjectTeacher:
 *                 type: boolean
 *                 description: Whether this is a subject teacher assignment
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subject IDs
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Assignment start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Assignment end date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, COMPLETED, TRANSFERRED, CANCELLED]
 *                 description: Assignment status
 *               canMarkAttendance:
 *                 type: boolean
 *                 description: Permission to mark attendance
 *               canGradeAssignments:
 *                 type: boolean
 *                 description: Permission to grade assignments
 *               canManageClassroom:
 *                 type: boolean
 *                 description: Permission to manage classroom
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Teacher-class assignment updated successfully
 */
router.put('/:id', classTeacherController.updateClassTeacherAssignment);

/**
 * @swagger
 * /api/class-teachers/{id}:
 *   delete:
 *     summary: Delete teacher-class assignment
 *     description: Delete a teacher-class assignment
 *     tags: [Class Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Teacher-class assignment deleted successfully
 */
router.delete('/:id', classTeacherController.deleteClassTeacherAssignment);

module.exports = router;