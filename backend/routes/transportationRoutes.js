const express = require('express');
const router = express.Router();
const transportationController = require('../controllers/transportationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Dashboard (accessible to all authenticated users)
router.get('/dashboard/stats', transportationController.getDashboardStats);

// Routes (Read accessible to all, write admin only)
router.get('/routes', transportationController.getRoutes);
router.get('/routes/:id', transportationController.getRoute);
router.post('/routes', roleMiddleware.restrictTo('admin'), transportationController.createRoute);
router.put('/routes/:id', roleMiddleware.restrictTo('admin'), transportationController.updateRoute);
router.delete('/routes/:id', roleMiddleware.restrictTo('admin'), transportationController.deleteRoute);

// Vehicles (Read accessible to all, write admin only)
router.get('/vehicles', transportationController.getVehicles);
router.get('/vehicles/:id', transportationController.getVehicle);
router.post('/vehicles', roleMiddleware.restrictTo('admin'), transportationController.createVehicle);
router.put('/vehicles/:id', roleMiddleware.restrictTo('admin'), transportationController.updateVehicle);
router.delete('/vehicles/:id', roleMiddleware.restrictTo('admin'), transportationController.deleteVehicle);

// Student Assignments (Read accessible to all, write admin/staff only)
router.get('/assignments', transportationController.getStudentAssignments);
router.get('/assignments/:id', transportationController.getStudentAssignment);
router.post('/assignments', roleMiddleware.restrictTo('admin', 'staff'), transportationController.createStudentAssignment);
router.put('/assignments/:id', roleMiddleware.restrictTo('admin', 'staff'), transportationController.updateStudentAssignment);
router.delete('/assignments/:id', roleMiddleware.restrictTo('admin', 'staff'), transportationController.deleteStudentAssignment);

// Vehicle Maintenance (Read accessible to all, write admin/staff only)
router.get('/vehicles/:vehicleId/maintenance', transportationController.getMaintenanceRecords);
router.post('/maintenance', roleMiddleware.restrictTo('admin', 'staff'), transportationController.createMaintenanceRecord);
router.put('/maintenance/:id', roleMiddleware.restrictTo('admin', 'staff'), transportationController.updateMaintenanceRecord);
router.delete('/maintenance/:id', roleMiddleware.restrictTo('admin', 'staff'), transportationController.deleteMaintenanceRecord);

module.exports = router;
