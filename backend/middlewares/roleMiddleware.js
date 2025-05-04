const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');

// Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Restrict access to resource owner or specific roles
exports.restrictToOwnerOrRoles = (ownerType, roles = []) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.studentId || req.params.teacherId || req.params.staffId || req.params.userId;
      
      // If user has one of the specified roles, allow access
      if (roles.includes(req.user.role)) {
        return next();
      }
      
      // Check if user is the owner of the resource
      let isOwner = false;
      
      switch (ownerType) {
        case 'student':
          // Check if the logged-in user is the student
          const student = await Student.findById(resourceId);
          if (student && student.user.toString() === req.user.id) {
            isOwner = true;
          }
          break;
          
        case 'teacher':
          // Check if the logged-in user is the teacher
          const teacher = await Teacher.findById(resourceId);
          if (teacher && teacher.user.toString() === req.user.id) {
            isOwner = true;
          }
          break;
          
        case 'staff':
          // Check if the logged-in user is the staff member
          const staff = await Staff.findById(resourceId);
          if (staff && staff.user.toString() === req.user.id) {
            isOwner = true;
          }
          break;
          
        case 'user':
          // Check if the logged-in user is the user
          if (resourceId === req.user.id) {
            isOwner = true;
          }
          break;
          
        default:
          break;
      }
      
      if (isOwner) {
        return next();
      }
      
      // If not owner and not in allowed roles, deny access
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is teacher
exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required'
    });
  }
  next();
};

// Check if user is student
exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};

// Check if user is admin or teacher
exports.isAdminOrTeacher = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Admin or teacher access required'
    });
  }
  next();
};

// Check if user is cashier
exports.isCashier = (req, res, next) => {
  if (req.user.role !== 'cashier') {
    return res.status(403).json({
      success: false,
      message: 'Cashier access required'
    });
  }
  next();
};

// Check if user is librarian
exports.isLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') {
    return res.status(403).json({
      success: false,
      message: 'Librarian access required'
    });
  }
  next();
};

// Check if user is counselor
exports.isCounselor = (req, res, next) => {
  if (req.user.role !== 'counselor') {
    return res.status(403).json({
      success: false,
      message: 'Counselor access required'
    });
  }
  next();
};

// Check if user is nurse
exports.isNurse = (req, res, next) => {
  if (req.user.role !== 'nurse') {
    return res.status(403).json({
      success: false,
      message: 'Nurse access required'
    });
  }
  next();
};

// Check if user is staff (any staff type)
exports.isStaff = (req, res, next) => {
  const staffRoles = ['teacher', 'admin', 'cashier', 'librarian', 'counselor', 'nurse', 'security', 'maintenance', 'other'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  next();
};

// Check if user has financial access
exports.hasFinancialAccess = (req, res, next) => {
  const financialRoles = ['admin', 'cashier'];
  if (!financialRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Financial access required'
    });
  }
  next();
};

// Check if user has student management access
exports.hasStudentManagementAccess = (req, res, next) => {
  const studentManagementRoles = ['admin', 'teacher', 'counselor'];
  if (!studentManagementRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Student management access required'
    });
  }
  next();
};

// Check if user has staff management access
exports.hasStaffManagementAccess = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Staff management access required'
    });
  }
  next();
};
