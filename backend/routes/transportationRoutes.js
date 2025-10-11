const express = require('express');
const router = express.Router();
const transportationController = require('../controllers/transportationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Dashboard
router.get('/dashboard/stats', transportationController.getDashboardStats);

// Routes
router.get('/routes', transportationController.getRoutes);
router.get('/routes/:id', transportationController.getRoute);
router.post('/routes', transportationController.createRoute);
router.put('/routes/:id', transportationController.updateRoute);
router.delete('/routes/:id', transportationController.deleteRoute);

// Vehicles
router.get('/vehicles', transportationController.getVehicles);
router.get('/vehicles/:id', transportationController.getVehicle);
router.post('/vehicles', transportationController.createVehicle);
router.put('/vehicles/:id', transportationController.updateVehicle);
router.delete('/vehicles/:id', transportationController.deleteVehicle);

// Student Assignments
router.get('/assignments', transportationController.getStudentAssignments);
router.get('/assignments/:id', transportationController.getStudentAssignment);
router.post('/assignments', transportationController.createStudentAssignment);
router.put('/assignments/:id', transportationController.updateStudentAssignment);
router.delete('/assignments/:id', transportationController.deleteStudentAssignment);

// Vehicle Maintenance
router.get('/vehicles/:vehicleId/maintenance', transportationController.getMaintenanceRecords);
router.post('/maintenance', transportationController.createMaintenanceRecord);
router.put('/maintenance/:id', transportationController.updateMaintenanceRecord);
router.delete('/maintenance/:id', transportationController.deleteMaintenanceRecord);

module.exports = router;
