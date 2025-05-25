const Staff = require('../models/Staff');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
exports.getAllStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ school: req.school.id })
    .populate('user', 'name email role profileImage')
    .populate('department', 'name');
  
  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private/Admin or Self
exports.getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ 
    _id: req.params.id,
    school: req.school.id
  })
    .populate('user', 'name email role profileImage')
    .populate('department', 'name description');
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Create new staff
// @route   POST /api/staff
// @access  Private/Admin
exports.createStaff = asyncHandler(async (req, res) => {
  const { 
    userId, employeeId, staffType, dateOfBirth, gender, nationalId, 
    address, contactInfo, qualifications, department, position, 
    schedule, experience, specializations, certifications, 
    achievements, salary, bankDetails, documents, status, accessPermissions 
  } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if staff with this employee ID already exists
  const staffExists = await Staff.findOne({ employeeId });
  if (staffExists) {
    res.status(400);
    throw new Error('Staff with this employee ID already exists');
  }
  
  // Create staff
  const staff = await Staff.create({
    user: userId,
    employeeId,
    staffType,
    dateOfBirth,
    gender,
    nationalId,
    address,
    contactInfo,
    qualifications,
    department,
    position,
    schedule,
    experience,
    specializations,
    certifications,
    achievements,
    salary,
    bankDetails,
    documents,
    status,
    accessPermissions
  });
  
  // Update user role based on staff type
  await User.findByIdAndUpdate(userId, { role: staffType });
  
  res.status(201).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
exports.updateStaff = asyncHandler(async (req, res) => {
  let staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  // If employee ID is being updated, check if it already exists
  if (req.body.employeeId && req.body.employeeId !== staff.employeeId) {
    const staffWithEmployeeId = await Staff.findOne({ employeeId: req.body.employeeId });
    if (staffWithEmployeeId) {
      res.status(400);
      throw new Error('Staff with this employee ID already exists');
    }
  }
  
  // If staff type is being updated, update user role as well
  if (req.body.staffType && req.body.staffType !== staff.staffType) {
    await User.findByIdAndUpdate(staff.user, { role: req.body.staffType });
  }
  
  staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  // Don't delete the user, just remove the staff record
  await staff.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff by user ID
// @route   GET /api/staff/user/:userId
// @access  Private/Admin or Self
exports.getStaffByUserId = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ 
    user: req.params.userId,
    school: req.school.id
  })
    .populate('user', 'name email role profileImage')
    .populate('department', 'name');
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Get staff by staff type
// @route   GET /api/staff/type/:staffType
// @access  Private/Admin
exports.getStaffByType = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ 
    staffType: req.params.staffType,
    school: req.school.id
  })
    .populate('user', 'name email role profileImage')
    .populate('department', 'name');
  
  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get staff by department
// @route   GET /api/staff/department/:departmentId
// @access  Private/Admin
exports.getStaffByDepartment = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ 
    department: req.params.departmentId,
    school: req.school.id
  })
    .populate('user', 'name email role profileImage')
    .populate('department', 'name');
  
  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Add staff attendance
// @route   POST /api/staff/:id/attendance
// @access  Private/Admin
exports.addStaffAttendance = asyncHandler(async (req, res) => {
  const { date, status, remark } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  staff.attendance.push({
    date,
    status,
    remark
  });
  
  await staff.save();
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Add staff leave
// @route   POST /api/staff/:id/leave
// @access  Private/Admin or Self
exports.addStaffLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason, documents } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  staff.leaves.push({
    leaveType,
    startDate,
    endDate,
    reason,
    documents,
    status: 'pending'
  });
  
  await staff.save();
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff leave status
// @route   PUT /api/staff/:id/leave/:leaveId
// @access  Private/Admin
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  const leave = staff.leaves.id(req.params.leaveId);
  
  if (!leave) {
    res.status(404);
    throw new Error('Leave not found');
  }
  
  leave.status = status;
  leave.approvedBy = req.user.id;
  
  await staff.save();
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Add staff performance review
// @route   POST /api/staff/:id/review
// @access  Private/Admin
exports.addPerformanceReview = asyncHandler(async (req, res) => {
  const { 
    reviewDate, ratings, comments, goals, overallRating 
  } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  staff.performanceReviews.push({
    reviewDate,
    reviewer: req.user.id,
    ratings,
    comments,
    goals,
    overallRating
  });
  
  await staff.save();
  
  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff access permissions
// @route   PUT /api/staff/:id/permissions
// @access  Private/Admin
exports.updateAccessPermissions = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }
  
  staff.accessPermissions = {
    ...staff.accessPermissions,
    ...req.body
  };
  
  await staff.save();
  
  res.status(200).json({
    success: true,
    data: staff
  });
});
