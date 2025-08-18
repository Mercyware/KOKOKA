const Guardian = require('../models/Guardian');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Assessment = require('../models/Assessment');
const Document = require('../models/Document');
const asyncHandler = require('express-async-handler');

// @desc    Get parent dashboard data
// @route   GET /api/parent-portal/dashboard
// @access  Private (Parent)
exports.getDashboard = asyncHandler(async (req, res) => {
  // Find guardian record for the current user
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    status: 'active'
  }).populate({
    path: 'students.student',
    select: 'firstName lastName admissionNumber currentClass photo',
    populate: {
      path: 'currentClass',
      select: 'name grade section'
    }
  });

  if (!guardian) {
    return res.status(404).json({
      success: false,
      message: 'Guardian profile not found'
    });
  }

  // Get students under guardian's care
  const studentIds = guardian.students.map(s => s.student._id);
  
  // Get recent attendance for all students (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentAttendance = await Attendance.find({
    student: { $in: studentIds },
    school: req.school._id,
    date: { $gte: sevenDaysAgo }
  })
    .populate('student', 'firstName lastName')
    .sort({ date: -1 });

  // Get recent grades for all students (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentGrades = await Grade.find({
    student: { $in: studentIds },
    school: req.school._id,
    gradedAt: { $gte: thirtyDaysAgo },
    status: 'graded'
  })
    .populate('student', 'firstName lastName')
    .populate({
      path: 'assessment',
      select: 'title type subject totalMarks',
      populate: {
        path: 'subject',
        select: 'name code'
      }
    })
    .sort({ gradedAt: -1 })
    .limit(10);

  // Get upcoming assessments for all students
  const upcomingAssessments = await Assessment.find({
    school: req.school._id,
    status: 'published',
    scheduledDate: { $gte: new Date() }
  })
    .populate('subject', 'name code')
    .populate('class', 'name grade section')
    .populate('teacher', 'name')
    .sort({ scheduledDate: 1 })
    .limit(10);

  // Filter assessments for guardian's students' classes
  const studentClassIds = guardian.students.map(s => s.student.currentClass?._id).filter(Boolean);
  const relevantUpcomingAssessments = upcomingAssessments.filter(assessment => 
    studentClassIds.includes(assessment.class._id.toString())
  );

  // Calculate attendance statistics for each student
  const attendanceStats = await Promise.all(
    guardian.students.map(async (studentRel) => {
      const stats = await Attendance.getAttendanceStats(req.school._id, { 
        student: studentRel.student._id 
      });
      return {
        student: studentRel.student,
        stats
      };
    })
  );

  // Get latest documents for students
  const recentDocuments = await Document.find({
    school: req.school._id,
    student: { $in: studentIds },
    status: 'active'
  })
    .populate('student', 'firstName lastName')
    .sort({ uploadedAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      guardian: {
        id: guardian._id,
        fullName: guardian.fullName,
        email: guardian.email,
        phone: guardian.phone,
        students: guardian.students,
        portalAccess: guardian.portalAccess
      },
      students: guardian.students.map(s => s.student),
      recentAttendance,
      recentGrades,
      upcomingAssessments: relevantUpcomingAssessments,
      attendanceStats,
      recentDocuments,
      summary: {
        totalStudents: guardian.students.length,
        recentAttendanceCount: recentAttendance.length,
        recentGradesCount: recentGrades.length,
        upcomingAssessmentsCount: relevantUpcomingAssessments.length
      }
    }
  });
});

// @desc    Get student details for parent
// @route   GET /api/parent-portal/students/:studentId
// @access  Private (Parent)
exports.getStudentDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Verify guardian has access to this student
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    'students.student': studentId,
    status: 'active'
  });

  if (!guardian) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this student information'
    });
  }

  // Get access level for this student
  const accessLevel = guardian.getAccessLevel(studentId);

  // Get student information
  const student = await Student.findOne({
    _id: studentId,
    school: req.school._id
  })
    .populate('currentClass', 'name grade section')
    .populate('academicYear', 'name startDate endDate');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get comprehensive student data based on access level
  const studentData = {
    id: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    admissionNumber: student.admissionNumber,
    photo: student.photo,
    currentClass: student.currentClass,
    academicYear: student.academicYear,
    accessLevel
  };

  // Add additional information based on access permissions
  if (accessLevel.academic) {
    // Get recent grades
    const grades = await Grade.find({
      student: studentId,
      school: req.school._id,
      status: 'graded'
    })
      .populate({
        path: 'assessment',
        select: 'title type subject totalMarks scheduledDate',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .sort({ gradedAt: -1 })
      .limit(20);

    studentData.recentGrades = grades;

    // Get grade trends
    const trends = await Grade.getStudentTrends(studentId, req.school._id, null, 6);
    studentData.gradeTrends = trends;
  }

  // Get attendance data
  const attendanceStats = await Attendance.getAttendanceStats(req.school._id, { 
    student: studentId 
  });
  const attendanceTrends = await Attendance.getStudentTrends(studentId, req.school._id, 30);
  
  studentData.attendance = {
    statistics: attendanceStats,
    trends: attendanceTrends
  };

  // Get upcoming assessments for student's class
  if (student.currentClass) {
    const upcomingAssessments = await Assessment.find({
      class: student.currentClass._id,
      school: req.school._id,
      status: 'published',
      scheduledDate: { $gte: new Date() }
    })
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .sort({ scheduledDate: 1 });

    studentData.upcomingAssessments = upcomingAssessments;
  }

  // Get student documents
  const documents = await Document.find({
    student: studentId,
    school: req.school._id,
    status: 'active'
  }).sort({ uploadedAt: -1 });

  studentData.documents = documents;

  res.status(200).json({
    success: true,
    data: studentData
  });
});

// @desc    Get attendance report for student
// @route   GET /api/parent-portal/students/:studentId/attendance
// @access  Private (Parent)
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, period } = req.query;

  // Verify access
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    'students.student': studentId,
    status: 'active'
  });

  if (!guardian) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this student information'
    });
  }

  // Build query for attendance
  let query = {
    student: studentId,
    school: req.school._id
  };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (period) query.period = period;

  const attendance = await Attendance.find(query)
    .populate('class', 'name grade section')
    .populate('subject', 'name code')
    .sort({ date: -1 });

  const stats = await Attendance.getAttendanceStats(req.school._id, { student: studentId });
  const trends = await Attendance.getStudentTrends(studentId, req.school._id, 30);

  res.status(200).json({
    success: true,
    data: {
      attendance,
      statistics: stats,
      trends
    }
  });
});

// @desc    Get grades report for student
// @route   GET /api/parent-portal/students/:studentId/grades
// @access  Private (Parent)
exports.getStudentGrades = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject, assessmentType, startDate, endDate } = req.query;

  // Verify access and check academic reports permission
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    'students.student': studentId,
    status: 'active'
  });

  if (!guardian) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this student information'
    });
  }

  const accessLevel = guardian.getAccessLevel(studentId);
  if (!accessLevel.academic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to academic reports for this student'
    });
  }

  // Build query
  let query = {
    student: studentId,
    school: req.school._id,
    status: 'graded'
  };

  if (startDate || endDate) {
    query.gradedAt = {};
    if (startDate) query.gradedAt.$gte = new Date(startDate);
    if (endDate) query.gradedAt.$lte = new Date(endDate);
  }

  const grades = await Grade.find(query)
    .populate({
      path: 'assessment',
      select: 'title type totalMarks subject scheduledDate',
      populate: {
        path: 'subject',
        select: 'name code'
      },
      match: {
        ...(subject && { subject }),
        ...(assessmentType && { type: assessmentType })
      }
    })
    .sort({ gradedAt: -1 });

  // Filter out grades where assessment population failed
  const validGrades = grades.filter(grade => grade.assessment);

  // Calculate statistics
  const totalGrades = validGrades.length;
  const averagePercentage = totalGrades > 0 
    ? validGrades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades 
    : 0;

  const trends = await Grade.getStudentTrends(studentId, req.school._id, subject, 6);

  res.status(200).json({
    success: true,
    data: {
      grades: validGrades,
      statistics: {
        totalGrades,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        highestPercentage: totalGrades > 0 ? Math.max(...validGrades.map(g => g.percentage)) : 0,
        lowestPercentage: totalGrades > 0 ? Math.min(...validGrades.map(g => g.percentage)) : 0
      },
      trends
    }
  });
});

// @desc    Update communication preferences
// @route   PUT /api/parent-portal/preferences
// @access  Private (Parent)
exports.updatePreferences = asyncHandler(async (req, res) => {
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    status: 'active'
  });

  if (!guardian) {
    return res.status(404).json({
      success: false,
      message: 'Guardian profile not found'
    });
  }

  const {
    communicationPreferences,
    portalAccess
  } = req.body;

  if (communicationPreferences) {
    guardian.communicationPreferences = {
      ...guardian.communicationPreferences,
      ...communicationPreferences
    };
  }

  if (portalAccess) {
    guardian.portalAccess = {
      ...guardian.portalAccess,
      ...portalAccess
    };
  }

  await guardian.save();

  res.status(200).json({
    success: true,
    data: guardian,
    message: 'Preferences updated successfully'
  });
});

// @desc    Get communication history
// @route   GET /api/parent-portal/communications
// @access  Private (Parent)
exports.getCommunications = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    status: 'active'
  });

  if (!guardian) {
    return res.status(404).json({
      success: false,
      message: 'Guardian profile not found'
    });
  }

  // This would typically query a communications/messages table
  // For now, return mock data structure
  const communications = [];
  
  res.status(200).json({
    success: true,
    data: communications,
    message: 'Communication history retrieved successfully'
  });
});

// @desc    Get parent portal statistics
// @route   GET /api/parent-portal/stats
// @access  Private (Parent)
exports.getPortalStats = asyncHandler(async (req, res) => {
  const guardian = await Guardian.findOne({
    user: req.user.id,
    school: req.school._id,
    status: 'active'
  }).populate('students.student', 'firstName lastName');

  if (!guardian) {
    return res.status(404).json({
      success: false,
      message: 'Guardian profile not found'
    });
  }

  const studentIds = guardian.students.map(s => s.student._id);

  // Get various statistics
  const [
    totalDocuments,
    unreadNotifications,
    totalGrades,
    averageAttendance
  ] = await Promise.all([
    Document.countDocuments({
      student: { $in: studentIds },
      school: req.school._id,
      status: 'active'
    }),
    0, // This would come from a notifications table
    Grade.countDocuments({
      student: { $in: studentIds },
      school: req.school._id,
      status: 'graded'
    }),
    Attendance.getAttendanceStats(req.school._id, { student: { $in: studentIds } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents: guardian.students.length,
      totalDocuments,
      unreadNotifications,
      totalGrades,
      averageAttendanceRate: averageAttendance.attendanceRate || 0,
      lastLogin: guardian.portalAccess.lastLogin,
      loginCount: guardian.portalAccess.loginCount
    }
  });
});

module.exports = {
  getDashboard: exports.getDashboard,
  getStudentDetails: exports.getStudentDetails,
  getStudentAttendance: exports.getStudentAttendance,
  getStudentGrades: exports.getStudentGrades,
  updatePreferences: exports.updatePreferences,
  getCommunications: exports.getCommunications,
  getPortalStats: exports.getPortalStats
};