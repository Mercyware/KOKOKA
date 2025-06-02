const express = require('express');
const {
  getHouses,
  getHouse,
  createHouse,
  updateHouse,
  deleteHouse
} = require('../controllers/houseController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const schoolDataRoutes = require('./schoolDataRoutes');

/**
 * @swagger
 * tags:
 *   name: Houses
 *   description: School house management endpoints
 */

// Apply authentication and school context middleware
router.use(schoolDataRoutes.filterBySchoolMiddleware);

/**
 * @swagger
 * /api/houses:
 *   get:
 *     summary: Get all houses
 *     description: Retrieve a list of all houses for the current school.
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of houses
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
 *                       name:
 *                         type: string
 *                       color:
 *                         type: string
 *                       description:
 *                         type: string
 *                       houseHead:
 *                         type: string
 *                         description: Reference to Staff model
 *                       school:
 *                         type: string
 *                         description: Reference to School model
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create new house
 *     description: Create a new house for the current school. Accessible by admin and teacher users.
 *     tags: [Houses]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: House name
 *               color:
 *                 type: string
 *                 description: House color (e.g., "red", "#FF0000")
 *               description:
 *                 type: string
 *                 description: House description
 *               houseHead:
 *                 type: string
 *                 description: Staff ID for house head
 *     responses:
 *       201:
 *         description: House created successfully
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
 *                     name:
 *                       type: string
 *                     color:
 *                       type: string
 *                     description:
 *                       type: string
 *                     houseHead:
 *                       type: string
 *                     school:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
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
router
  .route('/')
  .get(getHouses)
  .post(restrictTo('admin', 'teacher'), createHouse);

/**
 * @swagger
 * /api/houses/{id}:
 *   get:
 *     summary: Get house by ID
 *     description: Retrieve a specific house by ID.
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: House ID
 *     responses:
 *       200:
 *         description: House details
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
 *                     name:
 *                       type: string
 *                     color:
 *                       type: string
 *                     description:
 *                       type: string
 *                     houseHead:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     school:
 *                       type: string
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           admissionNumber:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: House not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update house
 *     description: Update an existing house. Accessible by admin and teacher users.
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: House ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: House name
 *               color:
 *                 type: string
 *                 description: House color
 *               description:
 *                 type: string
 *                 description: House description
 *               houseHead:
 *                 type: string
 *                 description: Staff ID for house head
 *     responses:
 *       200:
 *         description: House updated successfully
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
 *                     name:
 *                       type: string
 *                     color:
 *                       type: string
 *                     description:
 *                       type: string
 *                     houseHead:
 *                       type: string
 *                     school:
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
 *         description: House not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete house
 *     description: Delete a house. Accessible by admin users only.
 *     tags: [Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: House ID
 *     responses:
 *       200:
 *         description: House deleted successfully
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
 *                   example: House deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin role
 *       404:
 *         description: House not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route('/:id')
  .get(getHouse)
  .put(restrictTo('admin', 'teacher'), updateHouse)
  .delete(restrictTo('admin'), deleteHouse);

module.exports = router;
