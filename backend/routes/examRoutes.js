const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management endpoints
 */

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     description: Retrieve a list of all exams. Accessible by admin and teacher users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of exams
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       subject:
 *                         type: string
 *                         description: Reference to Subject model
 *                       class:
 *                         type: string
 *                         description: Reference to Class model
 *                       academicYear:
 *                         type: string
 *                         description: Reference to AcademicYear model
 *                       term:
 *                         type: string
 *                         description: Reference to Term model
 *                       examDate:
 *                         type: string
 *                         format: date-time
 *                       duration:
 *                         type: integer
 *                         description: Duration in minutes
 *                       totalMarks:
 *                         type: integer
 *                       passMark:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [scheduled, ongoing, completed, cancelled]
 *                       createdBy:
 *                         type: string
 *                         description: Reference to User model
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
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.getAllExams
);

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     description: Retrieve a specific exam by ID. Accessible by admin, teacher, and student users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     subject:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     class:
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
 *                     examDate:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                     totalMarks:
 *                       type: integer
 *                     passMark:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Exam not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  examController.getExamById
);

/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Create new exam
 *     description: Create a new exam. Accessible by admin and teacher users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subject
 *               - class
 *               - academicYear
 *               - term
 *               - examDate
 *               - totalMarks
 *             properties:
 *               title:
 *                 type: string
 *                 description: Exam title
 *               description:
 *                 type: string
 *                 description: Exam description
 *               subject:
 *                 type: string
 *                 description: Subject ID
 *               class:
 *                 type: string
 *                 description: Class ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *               term:
 *                 type: string
 *                 description: Term ID
 *               examDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the exam
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               totalMarks:
 *                 type: integer
 *                 description: Total marks for the exam
 *               passMark:
 *                 type: integer
 *                 description: Pass mark for the exam
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 description: Exam status
 *     responses:
 *       201:
 *         description: Exam created successfully
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     class:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     examDate:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                     totalMarks:
 *                       type: integer
 *                     passMark:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.createExam
);

/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Update exam
 *     description: Update an existing exam. Accessible by admin and teacher users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Exam title
 *               description:
 *                 type: string
 *                 description: Exam description
 *               subject:
 *                 type: string
 *                 description: Subject ID
 *               class:
 *                 type: string
 *                 description: Class ID
 *               academicYear:
 *                 type: string
 *                 description: Academic Year ID
 *               term:
 *                 type: string
 *                 description: Term ID
 *               examDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the exam
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               totalMarks:
 *                 type: integer
 *                 description: Total marks for the exam
 *               passMark:
 *                 type: integer
 *                 description: Pass mark for the exam
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 description: Exam status
 *     responses:
 *       200:
 *         description: Exam updated successfully
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     class:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     examDate:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                     totalMarks:
 *                       type: integer
 *                     passMark:
 *                       type: integer
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
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Exam not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.updateExam
);

/**
 * @swagger
 * /api/exams/{id}:
 *   delete:
 *     summary: Delete exam
 *     description: Delete an exam. Accessible by admin users only.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
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
 *                   example: Exam deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Exam not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  examController.deleteExam
);

/**
 * @swagger
 * /api/exams/class/{classId}:
 *   get:
 *     summary: Get exams by class
 *     description: Retrieve all exams for a specific class. Accessible by admin, teacher, and student users.
 *     tags: [Exams]
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
 *         description: List of exams for the class
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
 *                       title:
 *                         type: string
 *                       subject:
 *                         type: object
 *                       examDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Class not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/class/:classId',
  roleMiddleware.restrictTo('admin', 'teacher', 'student'),
  examController.getExamsByClass
);

/**
 * @swagger
 * /api/exams/results:
 *   post:
 *     summary: Submit exam results
 *     description: Submit results for an exam. Accessible by admin and teacher users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - results
 *             properties:
 *               examId:
 *                 type: string
 *                 description: Exam ID
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - student
 *                     - marks
 *                   properties:
 *                     student:
 *                       type: string
 *                       description: Student ID
 *                     marks:
 *                       type: number
 *                       description: Marks obtained
 *                     comments:
 *                       type: string
 *                       description: Comments on student performance
 *     responses:
 *       201:
 *         description: Exam results submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       exam:
 *                         type: string
 *                       student:
 *                         type: string
 *                       marks:
 *                         type: number
 *                       grade:
 *                         type: string
 *                       comments:
 *                         type: string
 *                       submittedBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Exam or student not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/results',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.submitExamResults
);

/**
 * @swagger
 * /api/exams/{examId}/report:
 *   get:
 *     summary: Generate exam report
 *     description: Generate a report for a specific exam. Accessible by admin and teacher users.
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam report generated successfully
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
 *                     exam:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         subject:
 *                           type: object
 *                         class:
 *                           type: object
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalStudents:
 *                           type: integer
 *                         highestMark:
 *                           type: number
 *                         lowestMark:
 *                           type: number
 *                         averageMark:
 *                           type: number
 *                         passRate:
 *                           type: number
 *                         gradeDistribution:
 *                           type: object
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student:
 *                             type: object
 *                           marks:
 *                             type: number
 *                           grade:
 *                             type: string
 *                           rank:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Exam not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:examId/report',
  roleMiddleware.restrictTo('admin', 'teacher'),
  examController.generateExamReport
);

module.exports = router;
