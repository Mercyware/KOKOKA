const express = require('express');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getStaffByDepartment,
  assignDepartmentHead
} = require('../controllers/departmentController');

const router = express.Router();

const { protect, authorize } = require('../middlewares/authMiddleware');
const { scopeToSchool } = require('../middlewares/schoolMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(scopeToSchool);

// Department routes
router.route('/')
  .get(getAllDepartments)
  .post(authorize('admin', 'superadmin'), createDepartment);

router.route('/:id')
  .get(getDepartmentById)
  .put(authorize('admin', 'superadmin'), updateDepartment)
  .delete(authorize('admin', 'superadmin'), deleteDepartment);

// Get staff in a department
router.route('/:id/staff')
  .get(getStaffByDepartment);

// Assign department head
router.route('/:id/head')
  .put(authorize('admin', 'superadmin'), assignDepartmentHead);

module.exports = router;
