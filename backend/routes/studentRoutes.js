const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { requireSchool, filterBySchool, scopeToSchool } = require('../middlewares/schoolMiddleware');

// Import attendance dashboard controller for enhanced student attendance
const { getStudentDetailedAttendance } = require('../controllers/attendanceDashboardController');

// Configure multer for memory storage (we'll process in memory before S3 upload)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication and school context
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students. Accessible by admins and teachers.
 *     tags: [Students]
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
 *         description: Sort field (e.g., firstName, lastName, admissionNumber)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, graduated, transferred, suspended, expelled]
 *         description: Filter by student status
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by gender
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or admission number
 *       - in: query
 *         name: admissionDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by admission date (from)
 *       - in: query
 *         name: admissionDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by admission date (to)
 *     responses:
 *       200:
 *         description: A list of students with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
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
  studentController.getAllStudents
);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve a specific student by ID with detailed information. Accessible by admins, teachers, and the student themselves.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  studentController.getStudentById
);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create new student
 *     description: Create a new student record with optional guardian information. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - admissionNumber
 *               - class
 *               - dateOfBirth
 *               - gender
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Student's first name
 *               lastName:
 *                 type: string
 *                 description: Student's last name
 *               middleName:
 *                 type: string
 *                 description: Student's middle name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Student's email address
 *               admissionNumber:
 *                 type: string
 *                 description: Unique admission number
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: Date of admission
 *               class:
 *                 type: string
 *                 description: Reference to Class model ID
 *               section:
 *                 type: string
 *                 description: Class section
 *               rollNumber:
 *                 type: string
 *                 description: Roll number in class
 *               house:
 *                 type: string
 *                 description: School house
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Student's date of birth
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Student's gender
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-, unknown]
 *                 description: Student's blood group
 *               height:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     enum: [cm, in]
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     enum: [kg, lb]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   alternativePhone:
 *                     type: string
 *               guardians:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     relationship:
 *                       type: string
 *                       enum: [father, mother, grandfather, grandmother, uncle, aunt, sibling, legal guardian, other]
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     occupation:
 *                       type: string
 *                     address:
 *                       type: object
 *                     isPrimary:
 *                       type: boolean
 *               healthInfo:
 *                 type: object
 *                 properties:
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                   medicalConditions:
 *                     type: array
 *                     items:
 *                       type: string
 *               previousSchool:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   contactInfo:
 *                     type: string
 *               nationality:
 *                 type: string
 *               religion:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
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
  scopeToSchool,
  roleMiddleware.restrictTo('admin'),
  studentController.createStudent
);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student
 *     description: Update an existing student record with optional guardian information. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               class:
 *                 type: string
 *               section:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               house:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               height:
 *                 type: object
 *               weight:
 *                 type: object
 *               address:
 *                 type: object
 *               contactInfo:
 *                 type: object
 *               guardians:
 *                 type: array
 *                 items:
 *                   type: object
 *               healthInfo:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [active, graduated, transferred, suspended, expelled]
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  studentController.updateStudent
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete student
 *     description: Delete a student record and associated data. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  roleMiddleware.restrictTo('admin'),
  studentController.deleteStudent
);

/**
 * @swagger
 * /students/{id}/attendance:
 *   get:
 *     summary: Get student attendance
 *     description: Retrieve attendance records for a specific student. Accessible by admins, teachers, and the student themselves.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Student attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [present, absent, late, excused]
 *                   remark:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/attendance',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  getStudentDetailedAttendance
);

/**
 * @swagger
 * /students/{id}/grades:
 *   get:
 *     summary: Get student grades
 *     description: Retrieve grade records for a specific student. Accessible by admins, teachers, and the student themselves.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Filter by specific exam
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *     responses:
 *       200:
 *         description: Student grade records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   exam:
 *                     type: object
 *                   score:
 *                     type: number
 *                   grade:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/grades',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  studentController.getStudentGrades
);

/**
 * @swagger
 * /students/{id}/guardians:
 *   post:
 *     summary: Add or update guardian
 *     description: Add a new guardian or update an existing guardian for a student. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - relationship
 *               - phone
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Guardian ID (if updating existing guardian)
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, grandfather, grandmother, uncle, aunt, sibling, legal guardian, other]
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               alternativePhone:
 *                 type: string
 *               occupation:
 *                 type: string
 *               employer:
 *                 type: string
 *               address:
 *                 type: object
 *               isEmergencyContact:
 *                 type: boolean
 *               isAuthorizedPickup:
 *                 type: boolean
 *               isPrimary:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guardian added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guardian'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:id/guardians',
  roleMiddleware.restrictTo('admin'),
  studentController.manageGuardian
);

/**
 * @swagger
 * /students/{id}/guardians/{guardianId}:
 *   delete:
 *     summary: Remove guardian from student
 *     description: Remove a guardian from a student. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guardian ID
 *     responses:
 *       200:
 *         description: Guardian removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Guardian removed from student successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id/guardians/:guardianId',
  roleMiddleware.restrictTo('admin'),
  studentController.removeGuardian
);

/**
 * @swagger
 * /students/{id}/documents:
 *   get:
 *     summary: Get student documents
 *     description: Retrieve documents for a specific student. Accessible by admins, teachers, and the student themselves.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/documents',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  studentController.getStudentDocuments
);

/**
 * @swagger
 * /students/{id}/documents:
 *   post:
 *     summary: Upload document for student
 *     description: Upload a new document for a student. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - fileUrl
 *               - fileName
 *               - fileType
 *               - fileSize
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [birth_certificate, medical_record, immunization_record, previous_school_record, transfer_certificate, report_card, id_card, passport, visa, residence_permit, guardian_id, fee_receipt, scholarship_document, special_needs_assessment, photo, other]
 *               description:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:id/documents',
  roleMiddleware.restrictTo('admin'),
  studentController.uploadDocument
);

/**
 * @swagger
 * /students/{id}/documents/{documentId}:
 *   delete:
 *     summary: Delete document
 *     description: Delete a document from a student. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id/documents/:documentId',
  roleMiddleware.restrictTo('admin'),
  studentController.deleteDocument
);

/**
 * @swagger
 * /students/{id}/documents/{documentId}/verify:
 *   put:
 *     summary: Verify document
 *     description: Verify a document for a student. Accessible by admins only.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id/documents/:documentId/verify',
  roleMiddleware.restrictTo('admin'),
  studentController.verifyDocument
);

/**
 * @swagger
 * /students/{id}/class-history:
 *   get:
 *     summary: Get student class history
 *     description: Retrieve class history for a specific student across academic years. Accessible by admins, teachers, and the student themselves.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student class history records
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
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *                   classArm:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   academicYear:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [active, completed, transferred, withdrawn]
 *                   remarks:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role or ownership
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/class-history',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  studentController.getStudentClassHistory
);

/**
 * @swagger
 * /students/{id}/profile-picture:
 *   post:
 *     summary: Upload student profile picture
 *     description: Upload a profile picture for a student. The image will be optimized and stored in S3.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePicture
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image file (JPEG, PNG, or WebP)
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
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
 *                   example: Profile picture uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         profileImageUrl:
 *                           type: string
 *                         photo:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     upload:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         publicUrl:
 *                           type: string
 *                         key:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:id/profile-picture',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  upload.single('profilePicture'),
  studentController.uploadProfilePicture
);

/**
 * @swagger
 * /students/{id}/profile-picture:
 *   delete:
 *     summary: Delete student profile picture
 *     description: Delete the profile picture for a student.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
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
 *                   example: Profile picture deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         profileImageUrl:
 *                           type: string
 *                           nullable: true
 *                         photo:
 *                           type: string
 *                           nullable: true
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id/profile-picture',
  roleMiddleware.restrictToOwnerOrRoles('student', ['admin', 'teacher']),
  studentController.deleteProfilePicture
);

module.exports = router;
