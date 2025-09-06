const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const schoolMiddleware = require('../middlewares/schoolMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Apply school middleware to all routes
router.use(schoolMiddleware.extractSchoolFromSubdomain);

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Class management endpoints
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     description: Retrieve a list of all classes. Accessible by all authenticated users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Class ID
 *                   name:
 *                     type: string
 *                     description: Class name
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   level:
 *                     type: number
 *                     description: Class level
 *                   description:
 *                     type: string
 *                     description: Class description
 *                   subjects:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         code:
 *                           type: string
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
router.get('/', classController.getAllClasses);

/**
 * @swagger
 * /api/classes/with-sections:
 *   get:
 *     summary: Get all classes with their sections
 *     description: Retrieve a flattened list of class-section combinations. Accessible by all authenticated users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of class-section combinations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   class:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Class ID
 *                       name:
 *                         type: string
 *                         description: Class name
 *                       level:
 *                         type: string
 *                         description: Class level
 *                   section:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Section ID
 *                       name:
 *                         type: string
 *                         description: Section name
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/with-sections', classController.getClassesWithSections);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     description: Retrieve a specific class by ID. Accessible by all authenticated users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: The class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 level:
 *                   type: number
 *                 description:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Class not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', classController.getClassById);

/**
 * @swagger
 * /api/classes/academic-year/{academicYearId}:
 *   get:
 *     summary: Get classes by academic year
 *     description: Retrieve classes for a specific academic year. Accessible by all authenticated users.
 *     tags: [Classes]
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
 *         description: List of classes for the specified academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   academicYear:
 *                     type: string
 *                   level:
 *                     type: number
 *                   description:
 *                     type: string
 *                   subjects:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         code:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', classController.getClassesByAcademicYear);

// Admin and teacher routes
//router.use(roleMiddleware.restrictTo('admin', 'teacher'));

/**
 * @swagger
 * /api/classes/{id}/subjects:
 *   post:
 *     summary: Add subject to class
 *     description: Add a subject to a class. Accessible by admin and teacher users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: ID of the subject to add to the class
 *     responses:
 *       200:
 *         description: Subject added to class successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 level:
 *                   type: number
 *                 description:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Subject already added to this class
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Class or subject not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/subjects', classController.addSubjectToClass);

/**
 * @swagger
 * /api/classes/{id}/subjects:
 *   delete:
 *     summary: Remove subject from class
 *     description: Remove a subject from a class. Accessible by admin and teacher users.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: ID of the subject to remove from the class
 *     responses:
 *       200:
 *         description: Subject removed from class successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 level:
 *                   type: number
 *                 description:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Subject not in this class
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Class not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id/subjects', classController.removeSubjectFromClass);

/*
// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));
*/

/**
 * @swagger
 * /api/classes/bulk-update-grades:
 *   put:
 *     summary: Bulk update class grades
 *     description: Update grades for multiple classes at once. Used for drag and drop grade organization.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - grade
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Class ID
 *                     grade:
 *                       type: string
 *                       description: New grade level
 *     responses:
 *       200:
 *         description: Classes updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       grade:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/bulk-update-grades', classController.bulkUpdateGrades);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create new class
 *     description: Create a new class. Accessible by admin users only.
 *     tags: [Classes]
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
 *               - academicYear
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *                 description: Class name (e.g., "Grade 1")
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this class belongs to
 *               level:
 *                 type: number
 *                 description: Class level (e.g., 1 for Grade 1)
 *               description:
 *                 type: string
 *                 description: Class description
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subject IDs
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 level:
 *                   type: number
 *                 description:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic year or subjects not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', classController.createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update class
 *     description: Update an existing class. Accessible by admin users only.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Class name
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this class belongs to
 *               level:
 *                 type: number
 *                 description: Class level
 *               description:
 *                 type: string
 *                 description: Class description
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subject IDs
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 level:
 *                   type: number
 *                 description:
 *                   type: string
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class not found or academic year not found or subjects not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', classController.updateClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete class
 *     description: Delete a class. Accessible by admin users only.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Class not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', classController.deleteClass);

module.exports = router;
