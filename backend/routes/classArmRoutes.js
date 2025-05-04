const express = require('express');
const router = express.Router();
const classArmController = require('../controllers/classArmController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

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
 *                   class:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   classTeacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   capacity:
 *                     type: number
 *                     description: Maximum number of students
 *                   description:
 *                     type: string
 *                     description: Class arm description
 *                   location:
 *                     type: object
 *                     properties:
 *                       building:
 *                         type: string
 *                       floor:
 *                         type: string
 *                       roomNumber:
 *                         type: string
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
router.get('/', classArmController.getAllClassArms);

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
 *                 class:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     level:
 *                       type: number
 *                 academicYear:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 classTeacher:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                 capacity:
 *                   type: number
 *                 description:
 *                   type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     building:
 *                       type: string
 *                     floor:
 *                       type: string
 *                     roomNumber:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Class arm not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', classArmController.getClassArmById);

/**
 * @swagger
 * /api/class-arms/class/{classId}:
 *   get:
 *     summary: Get class arms by class
 *     description: Retrieve class arms for a specific class. Accessible by all authenticated users.
 *     tags: [Class Arms]
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
 *         description: List of class arms for the specified class
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
 *                   class:
 *                     type: string
 *                   academicYear:
 *                     type: string
 *                   classTeacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   capacity:
 *                     type: number
 *                   description:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/class/:classId', classArmController.getClassArmsByClass);

/**
 * @swagger
 * /api/class-arms/academic-year/{academicYearId}:
 *   get:
 *     summary: Get class arms by academic year
 *     description: Retrieve class arms for a specific academic year. Accessible by all authenticated users.
 *     tags: [Class Arms]
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
 *         description: List of class arms for the specified academic year
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
 *                   class:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *                   academicYear:
 *                     type: string
 *                   classTeacher:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                   capacity:
 *                     type: number
 *                   description:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', classArmController.getClassArmsByAcademicYear);

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
router.get('/:id/students', classArmController.getClassArmStudents);

// Admin and teacher routes
router.use(roleMiddleware.restrictTo('admin', 'teacher'));

/**
 * @swagger
 * /api/class-arms/{id}/assign-teacher:
 *   patch:
 *     summary: Assign class teacher
 *     description: Assign a teacher to a class arm. Accessible by admin and teacher users.
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
 *             required:
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: ID of the teacher to assign to the class arm
 *     responses:
 *       200:
 *         description: Teacher assigned to class arm successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 class:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 classTeacher:
 *                   type: string
 *                 capacity:
 *                   type: number
 *                 description:
 *                   type: string
 *       400:
 *         description: Staff member must be a teacher to be assigned as class teacher
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Class arm or teacher not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/assign-teacher', classArmController.assignClassTeacher);

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
 *               - class
 *               - academicYear
 *             properties:
 *               name:
 *                 type: string
 *                 description: Class arm name (e.g., "A", "B", "Red", "Blue")
 *               class:
 *                 type: string
 *                 description: ID of the class this arm belongs to
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this class arm belongs to
 *               classTeacher:
 *                 type: string
 *                 description: ID of the teacher assigned to this class arm
 *               capacity:
 *                 type: number
 *                 description: Maximum number of students
 *               description:
 *                 type: string
 *                 description: Class arm description
 *               location:
 *                 type: object
 *                 properties:
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   roomNumber:
 *                     type: string
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
 *                 class:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 classTeacher:
 *                   type: string
 *                 capacity:
 *                   type: number
 *                 description:
 *                   type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     building:
 *                       type: string
 *                     floor:
 *                       type: string
 *                     roomNumber:
 *                       type: string
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
router.post('/', classArmController.createClassArm);

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
 *               class:
 *                 type: string
 *                 description: ID of the class this arm belongs to
 *               academicYear:
 *                 type: string
 *                 description: ID of the academic year this class arm belongs to
 *               classTeacher:
 *                 type: string
 *                 description: ID of the teacher assigned to this class arm
 *               capacity:
 *                 type: number
 *                 description: Maximum number of students
 *               description:
 *                 type: string
 *                 description: Class arm description
 *               location:
 *                 type: object
 *                 properties:
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   roomNumber:
 *                     type: string
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
 *                 class:
 *                   type: string
 *                 academicYear:
 *                   type: string
 *                 classTeacher:
 *                   type: string
 *                 capacity:
 *                   type: number
 *                 description:
 *                   type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     building:
 *                       type: string
 *                     floor:
 *                       type: string
 *                     roomNumber:
 *                       type: string
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
router.put('/:id', classArmController.updateClassArm);

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
router.delete('/:id', classArmController.deleteClassArm);

module.exports = router;
