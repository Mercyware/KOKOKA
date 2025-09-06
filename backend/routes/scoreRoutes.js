const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Scores
 *   description: Student score management endpoints
 */

/**
 * @swagger
 * /api/scores/form-data:
 *   get:
 *     summary: Get form data for score entry
 *     description: Get classes, subjects, academic years, and terms for dropdowns
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Form data retrieved successfully
 */
router.get('/form-data', scoreController.getFormData);

/**
 * @swagger
 * /api/scores/assessments:
 *   get:
 *     summary: Get assessments for score entry
 *     description: Get published assessments filtered by class, subject, academic year, and term
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *         description: Filter by subject ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year ID
 *       - in: query
 *         name: termId
 *         schema:
 *           type: string
 *         description: Filter by term ID
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 */
router.get('/assessments', scoreController.getAssessments);

/**
 * @swagger
 * /api/scores/students:
 *   get:
 *     summary: Get students in a class
 *     description: Get all students enrolled in a specific class for a given academic year
 *     tags: [Scores]
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
 *         description: Students retrieved successfully
 */
router.get('/students', scoreController.getStudentsInClass);

/**
 * @swagger
 * /api/scores/assessment/{assessmentId}:
 *   get:
 *     summary: Get scores for an assessment
 *     description: Get all scores for a specific assessment
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Scores retrieved successfully
 */
router.get('/assessment/:assessmentId', scoreController.getScores);

// Teacher and admin routes
router.use(roleMiddleware.restrictTo('admin', 'teacher', 'principal', 'vice_principal'));

/**
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create or update a single score
 *     description: Create a new score or update an existing one for a student
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentId
 *               - studentId
 *               - marksObtained
 *             properties:
 *               assessmentId:
 *                 type: string
 *                 description: Assessment ID
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               marksObtained:
 *                 type: number
 *                 description: Marks obtained by the student
 *               totalMarks:
 *                 type: number
 *                 description: Total marks (optional, will use assessment total if not provided)
 *               feedback:
 *                 type: string
 *                 description: Feedback for the student
 *               privateNotes:
 *                 type: string
 *                 description: Private notes for teachers
 *     responses:
 *       200:
 *         description: Score saved successfully
 */
router.post('/', scoreController.createOrUpdateScore);

/**
 * @swagger
 * /api/scores/bulk:
 *   post:
 *     summary: Bulk create or update scores
 *     description: Create or update multiple scores at once
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scores
 *             properties:
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - assessmentId
 *                     - studentId
 *                     - marksObtained
 *                   properties:
 *                     assessmentId:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     marksObtained:
 *                       type: number
 *                     totalMarks:
 *                       type: number
 *                     feedback:
 *                       type: string
 *                     privateNotes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Scores processed successfully
 */
router.post('/bulk', scoreController.bulkCreateOrUpdateScores);

/**
 * @swagger
 * /api/scores/upload-csv:
 *   post:
 *     summary: Upload scores via CSV file
 *     description: Upload a CSV file containing student scores
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - csvFile
 *               - assessmentId
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with student scores
 *               assessmentId:
 *                 type: string
 *                 description: Assessment ID
 *     responses:
 *       200:
 *         description: CSV processed successfully
 */
router.post('/upload-csv', scoreController.uploadScoresCSV);

/**
 * @swagger
 * /api/scores/{id}:
 *   delete:
 *     summary: Delete a score
 *     description: Delete a specific score entry
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Score ID
 *     responses:
 *       200:
 *         description: Score deleted successfully
 */
router.delete('/:id', scoreController.deleteScore);

module.exports = router;
