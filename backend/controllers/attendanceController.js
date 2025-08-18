const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const asyncHandler = require('express-async-handler');

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
exports.markAttendance = asyncHandler(async (req, res) => {
  const {
    studentId,
    classId,
    status,
    period,
    subjectId,
    method,
    location,
    notes,
    checkInTime,
    checkOutTime
  } = req.body;

  // Validate required fields
  if (!studentId || !classId || !status) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, class ID, and status are required'
    });
  }

  // Verify student exists and belongs to the school
  const student = await Student.findOne({
    _id: studentId,
    school: req.school._id
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get current academic year
  const currentAcademicYear = await AcademicYear.findOne({
    school: req.school._id,
    isCurrent: true
  });

  if (!currentAcademicYear) {
    return res.status(400).json({
      success: false,
      message: 'No current academic year found'
    });
  }

  // Check if attendance already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingAttendance = await Attendance.findOne({
    student: studentId,
    class: classId,
    school: req.school._id,
    period: period || 'full-day',
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (existingAttendance) {
    // Update existing attendance
    existingAttendance.status = status;
    existingAttendance.markedBy = req.user.id;
    existingAttendance.markedAt = new Date();
    existingAttendance.method = method || 'manual';
    existingAttendance.location = location;
    existingAttendance.notes = notes;
    existingAttendance.checkInTime = checkInTime;
    existingAttendance.checkOutTime = checkOutTime;
    existingAttendance.isModified = true;
    existingAttendance.modifiedBy = req.user.id;
    existingAttendance.modificationReason = 'Updated by teacher/admin';

    await existingAttendance.save();

    return res.status(200).json({
      success: true,
      data: existingAttendance,
      message: 'Attendance updated successfully'
    });
  }

  // Create new attendance record
  const attendance = await Attendance.create({
    school: req.school._id,
    student: studentId,
    class: classId,
    academicYear: currentAcademicYear._id,
    status,
    period: period || 'full-day',
    subject: subjectId,
    markedBy: req.user.id,
    method: method || 'manual',
    location,
    notes,
    checkInTime,
    checkOutTime
  });

  // Populate the response
  await attendance.populate([
    { path: 'student', select: 'firstName lastName admissionNumber' },
    { path: 'markedBy', select: 'name email' }
  ]);

  // Send notification to parents if student is absent
  if (status === 'absent' && !attendance.parentNotified) {
    // TODO: Implement parent notification logic
    // This could involve sending SMS, email, or push notifications
    attendance.parentNotified = true;
    attendance.notificationSentAt = new Date();
    await attendance.save();
  }

  res.status(201).json({
    success: true,
    data: attendance,
    message: 'Attendance marked successfully'
  });
});

// @desc    Bulk mark attendance for a class
// @route   POST /api/attendance/bulk
// @access  Private (Teacher/Admin)
exports.bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { classId, period, attendanceData, date } = req.body;

  // Validate required fields
  if (!classId || !attendanceData || !Array.isArray(attendanceData)) {
    return res.status(400).json({
      success: false,
      message: 'Class ID and attendance data array are required'
    });
  }

  // Get current academic year
  const currentAcademicYear = await AcademicYear.findOne({
    school: req.school._id,
    isCurrent: true
  });

  if (!currentAcademicYear) {
    return res.status(400).json({
      success: false,
      message: 'No current academic year found'
    });
  }

  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(attendanceDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const bulkOperations = [];
  const results = [];

  for (const item of attendanceData) {
    const { studentId, status, notes } = item;

    if (!studentId || !status) {
      continue; // Skip invalid entries
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      class: classId,
      school: req.school._id,
      period: period || 'full-day',
      date: {
        $gte: attendanceDate,
        $lt: nextDay
      }
    });

    if (existingAttendance) {
      // Update existing record
      bulkOperations.push({
        updateOne: {
          filter: { _id: existingAttendance._id },
          update: {
            status,
            markedBy: req.user.id,
            markedAt: new Date(),
            method: 'bulk',
            notes,
            isModified: true,
            modifiedBy: req.user.id,
            modificationReason: 'Bulk update by teacher/admin'
          }
        }
      });
    } else {
      // Create new record
      bulkOperations.push({
        insertOne: {
          document: {
            school: req.school._id,
            student: studentId,
            class: classId,
            academicYear: currentAcademicYear._id,
            date: attendanceDate,
            status,
            period: period || 'full-day',
            markedBy: req.user.id,
            method: 'bulk',
            notes
          }
        }
      });
    }
  }

  if (bulkOperations.length > 0) {
    const bulkResult = await Attendance.bulkWrite(bulkOperations);
    results.push({
      inserted: bulkResult.insertedCount,
      updated: bulkResult.modifiedCount,
      total: bulkOperations.length
    });
  }

  res.status(200).json({
    success: true,
    data: results,
    message: 'Bulk attendance marked successfully'
  });
});

// @desc    Get attendance for a class
// @route   GET /api/attendance/class/:classId
// @access  Private (Teacher/Admin)
exports.getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, period, status } = req.query;

  let query = {
    class: classId,
    school: req.school._id
  };

  // Add date filter if provided
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.date = {
      $gte: targetDate,
      $lt: nextDay
    };
  }

  // Add period filter if provided
  if (period) {
    query.period = period;
  }

  // Add status filter if provided
  if (status) {
    query.status = status;
  }

  const attendance = await Attendance.find(query)
    .populate('student', 'firstName lastName admissionNumber photo')
    .populate('markedBy', 'name email')
    .populate('subject', 'name code')
    .sort({ date: -1, 'student.lastName': 1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Teacher/Admin/Student/Parent)
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, period, academicYear } = req.query;

  let query = {
    student: studentId,
    school: req.school._id
  };

  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  // Add period filter if provided
  if (period) {
    query.period = period;
  }

  // Add academic year filter if provided
  if (academicYear) {
    query.academicYear = academicYear;
  }

  const attendance = await Attendance.find(query)
    .populate('class', 'name grade section')
    .populate('subject', 'name code')
    .populate('markedBy', 'name')
    .sort({ date: -1 });

  // Calculate attendance statistics
  const stats = await Attendance.getAttendanceStats(req.school._id, { student: studentId });

  // Get attendance trends for the last 30 days
  const trends = await Attendance.getStudentTrends(studentId, req.school._id, 30);

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance,
    statistics: stats,
    trends
  });
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin/Teacher)
exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const { classId, startDate, endDate, period } = req.query;

  let filters = {};

  // Add class filter if provided
  if (classId) {
    filters.class = classId;
  }

  // Add date range filter if provided
  if (startDate || endDate) {
    filters.date = {};
    if (startDate) {
      filters.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.date.$lte = end;
    }
  }

  // Add period filter if provided
  if (period) {
    filters.period = period;
  }

  const stats = await Attendance.getAttendanceStats(req.school._id, filters);

  // Get daily attendance trends for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyTrends = await Attendance.aggregate([
    {
      $match: {
        school: req.school._id,
        date: { $gte: thirtyDaysAgo },
        ...filters
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        totalStudents: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        late: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        date: '$_id',
        attendanceRate: {
          $multiply: [
            { $divide: ['$present', '$totalStudents'] },
            100
          ]
        }
      }
    },
    { $sort: { date: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: stats,
      dailyTrends
    }
  });
});

// @desc    Generate QR code for attendance
// @route   GET /api/attendance/qr-code/:classId
// @access  Private (Teacher/Admin)
exports.generateQRCode = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { period } = req.query;

  // Verify class exists and belongs to the school
  const classDoc = await Class.findOne({
    _id: classId,
    school: req.school._id
  });

  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: 'Class not found'
    });
  }

  // Generate unique QR code data
  const qrData = {
    classId,
    period: period || 'full-day',
    date: new Date().toISOString().split('T')[0],
    schoolId: req.school._id.toString(),
    token: require('crypto').randomBytes(16).toString('hex')
  };

  // In a real implementation, you would:
  // 1. Store the QR code data temporarily in Redis or database
  // 2. Generate actual QR code image using a library like 'qrcode'
  // 3. Return the QR code image or data URL

  res.status(200).json({
    success: true,
    data: {
      qrData,
      expiresIn: '24 hours',
      instructions: 'Students should scan this QR code to mark their attendance'
    },
    message: 'QR code generated successfully'
  });
});

// @desc    Mark attendance via QR code scan
// @route   POST /api/attendance/qr-scan
// @access  Private (Student)
exports.scanQRAttendance = asyncHandler(async (req, res) => {
  const { qrData, location } = req.body;

  if (!qrData) {
    return res.status(400).json({
      success: false,
      message: 'QR code data is required'
    });
  }

  // TODO: Validate QR code data and check if it's not expired
  // In a real implementation, you would verify the QR data against stored values

  const { classId, period, date } = qrData;

  // Get student record for the current user
  const student = await Student.findOne({
    user: req.user.id,
    school: req.school._id
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  // Mark attendance
  const attendance = await this.markAttendance({
    body: {
      studentId: student._id,
      classId,
      status: 'present',
      period,
      method: 'qr-code',
      location,
      checkInTime: new Date()
    },
    school: req.school,
    user: req.user
  });

  res.status(200).json({
    success: true,
    data: attendance,
    message: 'Attendance marked successfully via QR scan'
  });
});

module.exports = {
  markAttendance: exports.markAttendance,
  bulkMarkAttendance: exports.bulkMarkAttendance,
  getClassAttendance: exports.getClassAttendance,
  getStudentAttendance: exports.getStudentAttendance,
  getAttendanceStats: exports.getAttendanceStats,
  generateQRCode: exports.generateQRCode,
  scanQRAttendance: exports.scanQRAttendance
};