const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI integration endpoints
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Generate AI response
 *     description: Generate an AI response based on user input
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the AI
 *               context:
 *                 type: string
 *                 description: Optional context for the AI
 *     responses:
 *       200:
 *         description: AI response generated successfully
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
 *                     response:
 *                       type: string
 *                       description: AI generated response
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/chat',
  aiController.generateResponse
);

/**
 * @swagger
 * /api/ai/history/{userId}:
 *   get:
 *     summary: Get conversation history
 *     description: Retrieve conversation history for a specific user
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
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
 *                       user:
 *                         type: string
 *                         description: User ID
 *                       message:
 *                         type: string
 *                         description: User message
 *                       response:
 *                         type: string
 *                         description: AI response
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of the conversation
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/history/:userId',
  roleMiddleware.restrictToOwnerOrRoles('user', ['admin']),
  aiController.getConversationHistory
);

/**
 * @swagger
 * /api/ai/study-materials:
 *   post:
 *     summary: Generate study materials
 *     description: Generate AI-powered study materials for a subject
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - topic
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Subject name
 *               topic:
 *                 type: string
 *                 description: Topic within the subject
 *               gradeLevel:
 *                 type: string
 *                 description: Grade level or class
 *               format:
 *                 type: string
 *                 enum: [notes, presentation, worksheet, summary]
 *                 description: Format of the study materials
 *     responses:
 *       200:
 *         description: Study materials generated successfully
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
 *                     content:
 *                       type: string
 *                       description: Generated study materials
 *                     format:
 *                       type: string
 *                       description: Format of the materials
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/study-materials',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateStudyMaterials
);

/**
 * @swagger
 * /api/ai/quiz:
 *   post:
 *     summary: Generate quiz questions
 *     description: Generate AI-powered quiz questions for a subject
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - topic
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Subject name
 *               topic:
 *                 type: string
 *                 description: Topic within the subject
 *               gradeLevel:
 *                 type: string
 *                 description: Grade level or class
 *               numberOfQuestions:
 *                 type: integer
 *                 description: Number of questions to generate
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: Difficulty level of the questions
 *               questionTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [multiple-choice, true-false, short-answer, essay]
 *                 description: Types of questions to generate
 *     responses:
 *       200:
 *         description: Quiz questions generated successfully
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
 *                       question:
 *                         type: string
 *                         description: Question text
 *                       type:
 *                         type: string
 *                         description: Question type
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Answer options (for multiple-choice)
 *                       answer:
 *                         type: string
 *                         description: Correct answer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/quiz',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateQuizQuestions
);

/**
 * @swagger
 * /api/ai/grade-essay:
 *   post:
 *     summary: Grade essay or long-form answer
 *     description: Use AI to grade an essay or long-form answer
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - essay
 *               - rubric
 *             properties:
 *               essay:
 *                 type: string
 *                 description: Student's essay or long-form answer
 *               rubric:
 *                 type: string
 *                 description: Grading rubric or criteria
 *               subject:
 *                 type: string
 *                 description: Subject of the essay
 *               maxScore:
 *                 type: integer
 *                 description: Maximum possible score
 *     responses:
 *       200:
 *         description: Essay graded successfully
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
 *                     score:
 *                       type: number
 *                       description: Assigned score
 *                     feedback:
 *                       type: string
 *                       description: Detailed feedback
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Strengths of the essay
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Areas for improvement
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/grade-essay',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.gradeEssay
);

/**
 * @swagger
 * /api/ai/learning-plan:
 *   post:
 *     summary: Generate personalized learning plan
 *     description: Generate a personalized learning plan for a student
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - subject
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *               subject:
 *                 type: string
 *                 description: Subject for the learning plan
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Student's strengths
 *               weaknesses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Student's areas for improvement
 *               learningStyle:
 *                 type: string
 *                 description: Student's learning style
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Learning goals
 *     responses:
 *       200:
 *         description: Learning plan generated successfully
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
 *                     plan:
 *                       type: string
 *                       description: Personalized learning plan
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           duration:
 *                             type: string
 *                           resources:
 *                             type: array
 *                             items:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: Student not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/learning-plan',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.generateLearningPlan
);

/**
 * @swagger
 * /api/ai/analyze-performance:
 *   post:
 *     summary: Analyze student performance
 *     description: Analyze a student's performance data and provide insights
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *               academicYearId:
 *                 type: string
 *                 description: ID of the academic year
 *               termId:
 *                 type: string
 *                 description: ID of the term
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific subjects to analyze
 *     responses:
 *       200:
 *         description: Performance analysis generated successfully
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
 *                     summary:
 *                       type: string
 *                       description: Overall performance summary
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Areas of strength
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Areas for improvement
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Recommendations for improvement
 *                     subjectAnalysis:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subject:
 *                             type: string
 *                           performance:
 *                             type: string
 *                           trend:
 *                             type: string
 *                           recommendations:
 *                             type: array
 *                             items:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have permission
 *       404:
 *         description: Student not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/analyze-performance',
  roleMiddleware.restrictTo('admin', 'teacher'),
  aiController.analyzePerformance
);

module.exports = router;
