const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Retrieve a list of all subjects. Accessible by all authenticated users.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Subject ID
 *                   name:
 *                     type: string
 *                     description: Subject name
 *                   code:
 *                     type: string
 *                     description: Subject code
 *                   description:
 *                     type: string
 *                     description: Subject description
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   department:
 *                     type: string
 *                     description: Department the subject belongs to
 *                   creditHours:
 *                     type: number
 *                     description: Credit hours for the subject
 *                   isElective:
 *                     type: boolean
 *                     description: Whether the subject is elective
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         level:
 *                           type: number
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
router.get('/', subjectController.getAllSubjects);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Retrieve a specific subject by ID. Accessible by all authenticated users.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: The subject
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 department:
 *                   type: string
 *                 creditHours:
 *                   type: number
 *                 isElective:
 *                   type: boolean
 *                 classes:
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Subject not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', subjectController.getSubjectById);

/**
 * @swagger
 * /api/subjects/academic-year/{academicYearId}:
 *   get:
 *     summary: Get subjects by academic year
 *     description: Retrieve subjects for a specific academic year. Accessible by all authenticated users.
 *     tags: [Subjects]
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
 *         description: List of subjects for the specified academic year
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
 *                   code:
 *                     type: string
 *                   description:
 *                     type: string
 *                   academicYear:
 *                     type: string
 *                   department:
 *                     type: string
 *                   creditHours:
 *                     type: number
 *                   isElective:
 *                     type: boolean
 *                   classes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         level:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', subjectController.getSubjectsByAcademicYear);

/**
 * @swagger
 * /api/subjects/class/{classId}:
 *   get:
 *     summary: Get subjects by class
 *     description: Retrieve subjects for a specific class. Accessible by all authenticated users.
 *     tags: [Subjects]
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
 *         description: List of subjects for the specified class
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
 *                   code:
 *                     type: string
 *                   description:
 *                     type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   department:
 *                     type: string
 *                   creditHours:
 *                     type: number
 *                   isElective:
 *                     type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/class/:classId', subjectController.getSubjectsByClass);

/**
 * @swagger
 * /api/subjects/{id}/teachers:
 *   get:
 *     summary: Get teachers assigned to subject
 *     description: Retrieve teachers assigned to a specific subject. Accessible by all authenticated users.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: List of teachers assigned to the specified subject
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
 *                   class:
 *                     type: string
 *                   academicYear:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Subject not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/teachers', subjectController.getSubjectTeachers);

// Admin and teacher routes
router.use(roleMiddleware.restrictTo('admin', 'teacher'));

/**
 * @swagger
 * /api/subjects/{id}/classes:
 *   post:
 *     summary: Add class to subject
 *     description: Add a class to a subject. Accessible by admin and teacher users.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: ID of the class to add to the subject
 *     responses:
 *       200:
 *         description: Class added to subject successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 department:
 *                   type: string
 *                 creditHours:
 *                   type: number
 *                 isElective:
 *                   type: boolean
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Class already added to this subject
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Subject or class not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/classes', subjectController.addClassToSubject);

/**
 * @swagger
 * /api/subjects/{id}/classes:
 *   delete:
 *     summary: Remove class from subject
 *     description: Remove a class from a subject. Accessible by admin and teacher users.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: ID of the class to remove from the subject
 *     responses:
 *       200:
 *         description: Class removed from subject successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 department:
 *                   type: string
 *                 creditHours:
 *                   type: number
 *                 isElective:
 *                   type: boolean
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Class not in this subject
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Subject not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id/classes', subjectController.removeClassFromSubject);

// Admin only routes
router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create new subject
 *     description: Create a new subject. Accessible by admin users only.
 *     tags: [Subjects]
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
 *               - code
 *               - academicYear
 *             properties:
 *               name:
 *                 type: string
 *                 description: Subject name
 *               code:
 *                 type: string
 *                 description: Subject code
 *               description:
 *                 type: string
 *                 description: Subject description
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this subject belongs to
 *               department:
 *                 type: string
 *                 description: Department the subject belongs to
 *               creditHours:
 *                 type: number
 *                 description: Credit hours for the subject
 *               isElective:
 *                 type: boolean
 *                 description: Whether the subject is elective
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of class IDs
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 department:
 *                   type: string
 *                 creditHours:
 *                   type: number
 *                 isElective:
 *                   type: boolean
 *                 classes:
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
 *         description: Academic year or classes not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', subjectController.createSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update subject
 *     description: Update an existing subject. Accessible by admin users only.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Subject name
 *               code:
 *                 type: string
 *                 description: Subject code
 *               description:
 *                 type: string
 *                 description: Subject description
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this subject belongs to
 *               department:
 *                 type: string
 *                 description: Department the subject belongs to
 *               creditHours:
 *                 type: number
 *                 description: Credit hours for the subject
 *               isElective:
 *                 type: boolean
 *                 description: Whether the subject is elective
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of class IDs
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 description:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 department:
 *                   type: string
 *                 creditHours:
 *                   type: number
 *                 isElective:
 *                   type: boolean
 *                 classes:
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
 *         description: Subject or academic year or classes not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', subjectController.updateSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete subject
 *     description: Delete a subject. Accessible by admin users only.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Subject not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
