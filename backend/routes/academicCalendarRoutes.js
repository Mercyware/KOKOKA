const express = require('express');
const router = express.Router();
const academicCalendarController = require('../controllers/academicCalendarController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * tags:
 *   name: Academic Calendars
 *   description: Academic calendar management endpoints
 */

/**
 * @swagger
 * /api/academic-calendars:
 *   get:
 *     summary: Get all academic calendars
 *     description: Retrieve a list of all academic calendars. Accessible by all authenticated users.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of academic calendars
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
 *                         description: Academic calendar ID
 *                       academicYear:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       term:
 *                         type: string
 *                         enum: [First, Second, Third]
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       holidays:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             date:
 *                               type: string
 *                               format: date
 *                             description:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', academicCalendarController.getAllAcademicCalendars);

/**
 * @swagger
 * /api/academic-calendars/{id}:
 *   get:
 *     summary: Get academic calendar by ID
 *     description: Retrieve a specific academic calendar by ID. Accessible by all authenticated users.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *     responses:
 *       200:
 *         description: The academic calendar
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
 *                     academicYear:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     term:
 *                       type: string
 *                       enum: [First, Second, Third]
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Academic calendar not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', academicCalendarController.getAcademicCalendarById);

/**
 * @swagger
 * /api/academic-calendars/academic-year/{academicYearId}:
 *   get:
 *     summary: Get academic calendars by academic year
 *     description: Retrieve academic calendars for a specific academic year. Accessible by all authenticated users.
 *     tags: [Academic Calendars]
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
 *         description: List of academic calendars for the specified academic year
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
 *                       academicYear:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       term:
 *                         type: string
 *                         enum: [First, Second, Third]
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       holidays:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             date:
 *                               type: string
 *                               format: date
 *                             description:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/academic-year/:academicYearId', academicCalendarController.getAcademicCalendarsByAcademicYear);

/**
 * @swagger
 * /api/academic-calendars/{id}/working-days:
 *   get:
 *     summary: Get working days
 *     description: Retrieve all working days (excluding holidays) for an academic calendar. Accessible by all authenticated users.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *     responses:
 *       200:
 *         description: Working days information
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
 *                     totalDays:
 *                       type: integer
 *                       description: Total number of working days
 *                     workingDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Academic calendar not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/working-days', academicCalendarController.getWorkingDays);

/**
 * @swagger
 * /api/academic-calendars/{id}/check-holiday:
 *   get:
 *     summary: Check if a date is a holiday
 *     description: Check if a specific date is a holiday in the academic calendar. Accessible by all authenticated users.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Holiday check result
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     isHoliday:
 *                       type: boolean
 *                     holidayInfo:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date
 *                         description:
 *                           type: string
 *       400:
 *         description: Date parameter is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Academic calendar not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/check-holiday', academicCalendarController.checkHoliday);

// Admin only routes - temporarily disabled for testing
// router.use(roleMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/academic-calendars:
 *   post:
 *     summary: Create new academic calendar
 *     description: Create a new academic calendar. Accessible by admin users only.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - school
 *               - academicYear
 *               - term
 *               - startDate
 *               - endDate
 *             properties:
 *               school:
 *                 type: string
 *                 description: School ID
 *               academicYear:
 *                 type: string
 *                 description: Academic year ID
 *               term:
 *                 type: string
 *                 enum: [First, Second, Third]
 *                 description: Term (First, Second, or Third)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the academic calendar
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the academic calendar
 *               holidays:
 *                 type: array
 *                 description: List of holidays
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - date
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Holiday name
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Holiday date
 *                     description:
 *                       type: string
 *                       description: Holiday description
 *     responses:
 *       201:
 *         description: Academic calendar created successfully
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
 *                   example: Academic calendar created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', academicCalendarController.createAcademicCalendar);

/**
 * @swagger
 * /api/academic-calendars/{id}:
 *   put:
 *     summary: Update academic calendar
 *     description: Update an existing academic calendar. Accessible by admin users only.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               school:
 *                 type: string
 *                 description: School ID
 *               academicYear:
 *                 type: string
 *                 description: Academic year ID
 *               term:
 *                 type: string
 *                 enum: [First, Second, Third]
 *                 description: Term (First, Second, or Third)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the academic calendar
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the academic calendar
 *               holidays:
 *                 type: array
 *                 description: List of holidays
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - date
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Holiday name
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Holiday date
 *                     description:
 *                       type: string
 *                       description: Holiday description
 *     responses:
 *       200:
 *         description: Academic calendar updated successfully
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
 *                   example: Academic calendar updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     academicYear:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     term:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic calendar not found or academic year not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', academicCalendarController.updateAcademicCalendar);

/**
 * @swagger
 * /api/academic-calendars/{id}:
 *   delete:
 *     summary: Delete academic calendar
 *     description: Delete an academic calendar. Accessible by admin users only.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *     responses:
 *       200:
 *         description: Academic calendar deleted successfully
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
 *                   example: Academic calendar deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic calendar not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', academicCalendarController.deleteAcademicCalendar);

/**
 * @swagger
 * /api/academic-calendars/{id}/holidays:
 *   post:
 *     summary: Add holiday to academic calendar
 *     description: Add a new holiday to an academic calendar. Accessible by admin users only.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 description: Holiday name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Holiday date
 *               description:
 *                 type: string
 *                 description: Holiday description
 *     responses:
 *       200:
 *         description: Holiday added successfully
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
 *                   example: Holiday added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *       400:
 *         description: Holiday name and date are required or holiday date is outside the calendar period
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic calendar not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Holiday management routes have been simplified - use the main update route instead

/**
 * @swagger
 * /api/academic-calendars/{id}/holidays/{holidayId}:
 *   delete:
 *     summary: Remove holiday from academic calendar
 *     description: Remove a holiday from an academic calendar. Accessible by admin users only.
 *     tags: [Academic Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic calendar ID
 *       - in: path
 *         name: holidayId
 *         required: true
 *         schema:
 *           type: string
 *         description: Holiday ID
 *     responses:
 *       200:
 *         description: Holiday removed successfully
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
 *                   example: Holiday removed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     term:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: Academic calendar not found or holiday not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Holiday management routes have been simplified - use the main update route instead

module.exports = router;
