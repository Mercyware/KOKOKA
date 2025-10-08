const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Hostel routes
router.get('/hostels', hostelController.getAllHostels);
router.get('/hostels/:id', hostelController.getHostelById);
router.post('/hostels', hostelController.createHostel);
router.put('/hostels/:id', hostelController.updateHostel);
router.delete('/hostels/:id', hostelController.deleteHostel);

// Room routes
router.get('/hostels/:hostelId/rooms', hostelController.getHostelRooms);
router.post('/rooms', hostelController.createRoom);

// Allocation routes
router.get('/allocations', hostelController.getAllAllocations);
router.post('/allocations', hostelController.allocateStudent);
router.put('/allocations/:id/deallocate', hostelController.deallocateStudent);

// Statistics
router.get('/stats', hostelController.getHostelStats);

// Fee routes
router.get('/fees', hostelController.getHostelFees);
router.post('/fees', hostelController.upsertHostelFee);

module.exports = router;
