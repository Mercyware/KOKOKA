const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

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
      const resourceId = req.params.id || req.params.studentId || req.params.teacherId || req.params.userId;
      
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
