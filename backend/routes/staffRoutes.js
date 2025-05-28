const express = require('express');
const router = express.Router();
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByUserId,
  getStaffByType,
  getStaffByDepartment,
  addStaffAttendance,
  addStaffLeave,
  updateLeaveStatus,
  addPerformanceReview,
  updateAccessPermissions
} = require('../controllers/staffController');

const { protect } = require('../middlewares/authMiddleware');
const { 
  isAdmin, 
  isStaff, 
  hasStaffManagementAccess, 
  restrictToOwnerOrRoles 
} = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff
 *     description: Retrieve a list of all staff members. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of staff members
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new staff member
 *     description: Create a new staff member. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - employeeId
 *               - staffType
 *               - dateOfBirth
 *               - gender
 *               - nationalId
 *               - department
 *               - position
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to associate with this staff
 *               employeeId:
 *                 type: string
 *                 description: Unique employee ID
 *               staffType:
 *                 type: string
 *                 enum: [teacher, admin, cashier, librarian, counselor, nurse, security, maintenance, other]
 *                 description: Type of staff
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Staff date of birth
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Staff gender
 *               nationalId:
 *                 type: string
 *                 description: National ID number
 *               department:
 *                 type: string
 *                 description: Department
 *               position:
 *                 type: string
 *                 description: Position
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Bad request - validation error or staff with employee ID already exists
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/')
  .get(protect, hasStaffManagementAccess, getAllStaff)
  .post(protect, hasStaffManagementAccess, createStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Get staff by ID
 *     description: Retrieve a staff member by ID. Accessible by admin or the staff member themselves.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have access to this staff record
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update staff
 *     description: Update a staff member. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique employee ID
 *               staffType:
 *                 type: string
 *                 enum: [teacher, admin, cashier, librarian, counselor, nurse, security, maintenance, other]
 *                 description: Type of staff
 *               department:
 *                 type: string
 *                 description: Department
 *               position:
 *                 type: string
 *                 description: Position
 *               status:
 *                 type: string
 *                 enum: [active, on leave, terminated, retired, suspended]
 *                 description: Staff status
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Bad request - validation error or staff with employee ID already exists
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete staff
 *     description: Delete a staff member. Requires admin access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
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
 *                   example: {}
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin access
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id')
  .get(protect, restrictToOwnerOrRoles('staff', ['admin']), getStaffById)
  .put(protect, hasStaffManagementAccess, updateStaff)
  .delete(protect, isAdmin, deleteStaff);

/**
 * @swagger
 * /api/staff/user/{userId}:
 *   get:
 *     summary: Get staff by user ID
 *     description: Retrieve a staff member by user ID. Accessible by admin or the staff member themselves.
 *     tags: [Staff]
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
 *         description: Staff details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have access to this staff record
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/user/:userId', protect, restrictToOwnerOrRoles('user', ['admin']), getStaffByUserId);

/**
 * @swagger
 * /api/staff/type/{staffType}:
 *   get:
 *     summary: Get staff by type
 *     description: Retrieve staff members by type. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [teacher, admin, cashier, librarian, counselor, nurse, security, maintenance, other]
 *         description: Staff type
 *     responses:
 *       200:
 *         description: List of staff members of the specified type
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/type/:staffType', protect, isStaff, getStaffByType);

/**
 * @swagger
 * /api/staff/department/{department}:
 *   get:
 *     summary: Get staff by department
 *     description: Retrieve staff members by department. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department name
 *     responses:
 *       200:
 *         description: List of staff members in the specified department
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/department/:department', protect, hasStaffManagementAccess, getStaffByDepartment);

/**
 * @swagger
 * /api/staff/{id}/attendance:
 *   post:
 *     summary: Add staff attendance
 *     description: Add attendance record for a staff member. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - status
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Attendance date
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, leave]
 *                 description: Attendance status
 *               remark:
 *                 type: string
 *                 description: Additional remarks
 *     responses:
 *       200:
 *         description: Attendance added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/attendance', protect, hasStaffManagementAccess, addStaffAttendance);

/**
 * @swagger
 * /api/staff/{id}/leave:
 *   post:
 *     summary: Add staff leave
 *     description: Add leave request for a staff member. Accessible by admin or the staff member themselves.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveType
 *               - startDate
 *               - endDate
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [sick, casual, maternity, paternity, study, unpaid, other]
 *                 description: Type of leave
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Leave start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Leave end date
 *               reason:
 *                 type: string
 *                 description: Reason for leave
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs to supporting documents
 *     responses:
 *       200:
 *         description: Leave request added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have access to this staff record
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/leave', protect, restrictToOwnerOrRoles('staff', ['admin']), addStaffLeave);

/**
 * @swagger
 * /api/staff/{id}/leave/{leaveId}:
 *   put:
 *     summary: Update leave status
 *     description: Update the status of a leave request. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *       - in: path
 *         name: leaveId
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Leave status
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       404:
 *         description: Staff or leave not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/leave/:leaveId', protect, hasStaffManagementAccess, updateLeaveStatus);

/**
 * @swagger
 * /api/staff/{id}/review:
 *   post:
 *     summary: Add performance review
 *     description: Add a performance review for a staff member. Requires staff management access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewDate
 *               - ratings
 *               - overallRating
 *             properties:
 *               reviewDate:
 *                 type: string
 *                 format: date
 *                 description: Date of review
 *               ratings:
 *                 type: object
 *                 properties:
 *                   jobKnowledge:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Rating for job knowledge
 *                   workQuality:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Rating for work quality
 *                   attendance:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Rating for attendance
 *                   communication:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Rating for communication
 *                   teamwork:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Rating for teamwork
 *               comments:
 *                 type: string
 *                 description: Comments on performance
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Goals for improvement
 *               overallRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Overall performance rating
 *     responses:
 *       200:
 *         description: Performance review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have staff management access
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/review', protect, hasStaffManagementAccess, addPerformanceReview);

/**
 * @swagger
 * /api/staff/{id}/permissions:
 *   put:
 *     summary: Update access permissions
 *     description: Update access permissions for a staff member. Requires admin access.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canViewStudentRecords:
 *                 type: boolean
 *                 description: Permission to view student records
 *               canEditStudentRecords:
 *                 type: boolean
 *                 description: Permission to edit student records
 *               canViewFinancialRecords:
 *                 type: boolean
 *                 description: Permission to view financial records
 *               canEditFinancialRecords:
 *                 type: boolean
 *                 description: Permission to edit financial records
 *               canViewStaffRecords:
 *                 type: boolean
 *                 description: Permission to view staff records
 *               canEditStaffRecords:
 *                 type: boolean
 *                 description: Permission to edit staff records
 *               canManageUsers:
 *                 type: boolean
 *                 description: Permission to manage users
 *               canManageSystem:
 *                 type: boolean
 *                 description: Permission to manage system settings
 *     responses:
 *       200:
 *         description: Access permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin access
 *       404:
 *         description: Staff not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/permissions', protect, isAdmin, updateAccessPermissions);

module.exports = router;
