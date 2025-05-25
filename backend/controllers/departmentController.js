const Department = require('../models/Department');
const Staff = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin
exports.getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ school: req.school.id }).populate('head', 'name position');
  
  res.status(200).json({
    success: true,
    count: departments.length,
    departments
  });
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private/Admin
exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    school: req.school.id
  }).populate('head', 'name position');
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  res.status(200).json({
    success: true,
    department
  });
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description, headId, status } = req.body;
  
  // Check if department with this name already exists in this school
  const departmentExists = await Department.findOne({ 
    name,
    school: req.school.id
  });
  if (departmentExists) {
    res.status(400);
    throw new Error('Department with this name already exists');
  }
  
  // Create department
  const departmentData = {
    school: req.school.id,
    name,
    description,
    status: status || 'active'
  };
  
  // If headId is provided, check if staff exists
  if (headId) {
    const staff = await Staff.findById(headId);
    if (!staff) {
      res.status(404);
      throw new Error('Staff not found');
    }
    departmentData.head = headId;
  }
  
  const department = await Department.create(departmentData);
  
  res.status(201).json({
    success: true,
    department
  });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res) => {
  let department = await Department.findById(req.params.id);
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  // If name is being updated, check if it already exists in this school
  if (req.body.name && req.body.name !== department.name) {
    const departmentWithName = await Department.findOne({ 
      name: req.body.name,
      school: req.school.id
    });
    if (departmentWithName) {
      res.status(400);
      throw new Error('Department with this name already exists');
    }
  }
  
  // If headId is provided, check if staff exists
  if (req.body.headId) {
    const staff = await Staff.findById(req.body.headId);
    if (!staff) {
      res.status(404);
      throw new Error('Staff not found');
    }
    req.body.head = req.body.headId;
    delete req.body.headId;
  }
  
  department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('head', 'name position');
  
  res.status(200).json({
    success: true,
    department
  });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  // Check if any staff are assigned to this department
  const staffInDepartment = await Staff.countDocuments({ department: department.name });
  if (staffInDepartment > 0) {
    res.status(400);
    throw new Error('Cannot delete department with assigned staff. Please reassign staff first.');
  }
  
  await department.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff by department
// @route   GET /api/departments/:id/staff
// @access  Private/Admin
exports.getStaffByDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    school: req.school.id
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  const staff = await Staff.find({ 
    department: department._id,
    school: req.school.id
  }).populate('user', 'name email role');
  
  res.status(200).json({
    success: true,
    count: staff.length,
    staff
  });
});

// @desc    Assign head to department
// @route   PUT /api/departments/:id/head
// @access  Private/Admin
exports.assignDepartmentHead = asyncHandler(async (req, res) => {
  const { staffId } = req.body;
  
  if (!staffId) {
    res.status(400);
    throw new Error('Staff ID is required');
  }
  
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  const staff = await Staff.findById(staffId);
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  department.head = staffId;
  await department.save();
  
  const updatedDepartment = await Department.findById(req.params.id).populate('head', 'name position');
  
  res.status(200).json({
    success: true,
    department: updatedDepartment
  });
});
