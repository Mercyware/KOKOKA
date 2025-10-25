const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Hostel routes (Read operations - accessible to all authenticated users)
router.get('/hostels', hostelController.getAllHostels);
router.get('/hostels/:id', hostelController.getHostelById);

// Hostel management (Write operations - admin only)
router.post('/hostels', roleMiddleware.restrictTo('admin'), hostelController.createHostel);
router.put('/hostels/:id', roleMiddleware.restrictTo('admin'), hostelController.updateHostel);
router.delete('/hostels/:id', roleMiddleware.restrictTo('admin'), hostelController.deleteHostel);

// Room routes (Read accessible to all, write admin only)
router.get('/hostels/:hostelId/rooms', hostelController.getHostelRooms);
router.post('/rooms', roleMiddleware.restrictTo('admin'), hostelController.createRoom);

// Allocation routes (Read accessible to all, write admin/staff only)
router.get('/allocations', hostelController.getAllAllocations);
router.post('/allocations', roleMiddleware.restrictTo('admin', 'staff'), hostelController.allocateStudent);
router.put('/allocations/:id/deallocate', roleMiddleware.restrictTo('admin', 'staff'), hostelController.deallocateStudent);

// Statistics (accessible to all authenticated users)
router.get('/stats', hostelController.getHostelStats);

// Fee routes (Read accessible to all, write admin only)
router.get('/fees', hostelController.getHostelFees);
router.post('/fees', roleMiddleware.restrictTo('admin'), hostelController.upsertHostelFee);

module.exports = router;
