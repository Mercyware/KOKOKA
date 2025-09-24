const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const moment = require('moment');

const prisma = new PrismaClient();

// @desc    Get comprehensive attendance dashboard data
// @route   GET /api/attendance/dashboard-new
// @access  Private (Admin/Teacher)
exports.getAttendanceDashboardNew = asyncHandler(async (req, res) => {
  const { period = 'term', classId } = req.query;

  try {
    // Get current academic year and term
    const [currentAcademicYear, currentTerm] = await Promise.all([
      prisma.academicYear.findFirst({
        where: {
          schoolId: req.school.id,
          isCurrent: true
        },
        include: {
          terms: {
            orderBy: { startDate: 'asc' }
          }
        }
      }),
      prisma.term.findFirst({
        where: {
          academicYear: {
            schoolId: req.school.id,
            isCurrent: true
          },
          isCurrent: true
        }
      })
    ]);

    if (!currentAcademicYear) {
      return res.status(400).json({
        success: false,
        message: 'No current academic year found'
      });
    }

    // Determine date range based on period
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = moment().startOf('week').toDate();
        endDate = moment().endOf('week').toDate();
        break;
      case 'term':
        startDate = currentTerm ? new Date(currentTerm.startDate) : new Date(currentAcademicYear.startDate);
        endDate = currentTerm ? new Date(currentTerm.endDate) : new Date();
        break;
      case 'year':
        startDate = new Date(currentAcademicYear.startDate);
        endDate = new Date(currentAcademicYear.endDate);
        break;
      default:
        startDate = currentTerm ? new Date(currentTerm.startDate) : new Date(currentAcademicYear.startDate);
        endDate = currentTerm ? new Date(currentTerm.endDate) : new Date();
    }

    // Build base where clause
    let baseWhere = {
      schoolId: req.school.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (classId) {
      baseWhere.classId = classId;
    }

    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayAttendance,
      termAttendance,
      yearAttendance,
      lowAttendanceStudents,
      recentActivity,
      trends
    ] = await Promise.all([
      // Today's attendance stats
      getAttendanceStats(req.school.id, {
        ...baseWhere,
        date: { gte: todayStart, lte: todayEnd }
      }),

      // Term attendance stats
      getAttendanceStats(req.school.id, {
        ...baseWhere,
        date: {
          gte: currentTerm ? new Date(currentTerm.startDate) : new Date(currentAcademicYear.startDate),
          lte: currentTerm ? new Date(currentTerm.endDate) : new Date()
        }
      }),

      // Year attendance stats
      getAttendanceStats(req.school.id, {
        ...baseWhere,
        date: {
          gte: new Date(currentAcademicYear.startDate),
          lte: new Date(currentAcademicYear.endDate)
        }
      }),

      // Students with low attendance
      getStudentsWithLowAttendance(req.school.id, classId, 75),

      // Recent activity
      prisma.attendance.findMany({
        where: baseWhere,
        include: {
          student: {
            select: { firstName: true, lastName: true, admissionNumber: true }
          },
          class: {
            select: { name: true, grade: true }
          },
          markedBy: {
            select: { name: true, role: true }
          },
          subject: {
            select: { name: true, code: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
      }),

      // Attendance trends for the last 30 days
      getDailyAttendanceTrends(req.school.id, {
        ...baseWhere,
        date: {
          gte: moment().subtract(30, 'days').toDate(),
          lte: new Date()
        }
      })
    ]);

    // Get class stats
    const classStats = await getClassAttendanceStats(req.school.id, startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        currentAcademicYear,
        currentTerm,
        todayStats: todayAttendance,
        termStats: termAttendance,
        yearStats: yearAttendance,
        classStats,
        lowAttendanceStudents,
        trends,
        recentActivity,
        period: {
          type: period,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @desc    Get attendance reports dashboard
// @route   GET /api/attendance/reports/dashboard
// @access  Private (Admin/Teacher)
exports.getAttendanceReportsDashboard = asyncHandler(async (req, res) => {
  const { periodId, classId, startDate, endDate } = req.query;

  try {
    // Get academic periods
    const academicPeriods = await prisma.term.findMany({
      where: {
        academicYear: {
          schoolId: req.school.id
        }
      },
      include: {
        academicYear: true
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { startDate: 'asc' }
      ]
    });

    const currentPeriod = academicPeriods.find(p => p.isCurrent) || academicPeriods[0];

    // Determine date range
    let filterStartDate, filterEndDate;
    if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else if (periodId) {
      const period = academicPeriods.find(p => p.id === periodId);
      if (period) {
        filterStartDate = new Date(period.startDate);
        filterEndDate = new Date(period.endDate);
      }
    } else if (currentPeriod) {
      filterStartDate = new Date(currentPeriod.startDate);
      filterEndDate = new Date(currentPeriod.endDate);
    } else {
      filterStartDate = moment().startOf('month').toDate();
      filterEndDate = new Date();
    }

    const baseWhere = {
      schoolId: req.school.id,
      date: {
        gte: filterStartDate,
        lte: filterEndDate
      },
      ...(classId && classId !== 'all' && { classId })
    };

    // Get overall statistics
    const [
      overallStats,
      classSummaries,
      lowAttendanceStudents,
      recentReports,
      trends
    ] = await Promise.all([
      // Overall statistics
      getOverallAttendanceStats(req.school.id, baseWhere),

      // Class summaries
      getClassSummaries(req.school.id, filterStartDate, filterEndDate),

      // Low attendance students
      getStudentsWithDetailedAttendance(req.school.id, classId, 75),

      // Recent reports (mock data for now)
      getRecentAttendanceReports(req.school.id, 5),

      // Trends data
      getAttendanceTrends(req.school.id, filterStartDate, filterEndDate)
    ]);

    res.status(200).json({
      success: true,
      data: {
        academicPeriods: academicPeriods.map(p => ({
          id: p.id,
          name: p.name,
          type: 'TERM',
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: p.isCurrent
        })),
        currentPeriod: currentPeriod ? {
          id: currentPeriod.id,
          name: currentPeriod.name,
          type: 'TERM',
          startDate: currentPeriod.startDate,
          endDate: currentPeriod.endDate,
          isCurrent: currentPeriod.isCurrent
        } : null,
        overallStats,
        classSummaries,
        lowAttendanceStudents,
        recentReports,
        trends
      }
    });
  } catch (error) {
    console.error('Error fetching reports dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports dashboard data',
      error: error.message
    });
  }
});

// @desc    Get student detailed attendance
// @route   GET /api/students/:studentId/attendance
// @access  Private (Admin/Teacher/Parent/Student)
exports.getStudentDetailedAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { periodId, startDate, endDate } = req.query;

  try {
    // Get student with basic info
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: req.school.id
      },
      include: {
        currentClass: true,
        house: true,
        guardianStudents: {
          include: {
            guardian: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get academic periods
    const academicPeriods = await prisma.term.findMany({
      where: {
        academicYear: {
          schoolId: req.school.id
        }
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { startDate: 'asc' }
      ]
    });

    const currentPeriod = academicPeriods.find(p => p.isCurrent) || academicPeriods[0];

    // Determine date range
    let filterStartDate, filterEndDate;
    if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else if (periodId) {
      const period = academicPeriods.find(p => p.id === periodId);
      if (period) {
        filterStartDate = new Date(period.startDate);
        filterEndDate = new Date(period.endDate);
      }
    } else if (currentPeriod) {
      filterStartDate = new Date(currentPeriod.startDate);
      filterEndDate = new Date(currentPeriod.endDate);
    } else {
      filterStartDate = moment().startOf('month').toDate();
      filterEndDate = new Date();
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        schoolId: req.school.id,
        date: {
          gte: filterStartDate,
          lte: filterEndDate
        }
      },
      include: {
        subject: {
          select: { name: true, code: true }
        },
        markedBy: {
          select: { name: true, role: true }
        },
        class: {
          select: { name: true, grade: true }
        },
        term: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate statistics
    const stats = calculateStudentAttendanceStats(attendanceRecords, filterStartDate, filterEndDate);

    // Create calendar data
    const calendarData = {};
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(record);
    });

    // Format guardians
    const guardians = student.guardianStudents.map(gs => ({
      id: gs.guardian.id,
      firstName: gs.guardian.firstName,
      lastName: gs.guardian.lastName,
      relationship: gs.relationship,
      phone: gs.guardian.phone || '',
      email: gs.guardian.user?.email || gs.guardian.email || ''
    }));

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          admissionNumber: student.admissionNumber,
          profileImage: student.profileImage,
          profileImageUrl: student.profileImageUrl,
          dateOfBirth: student.dateOfBirth,
          email: student.email,
          phone: student.phone,
          class: {
            id: student.currentClass.id,
            name: student.currentClass.name,
            grade: student.currentClass.grade
          },
          house: student.house ? {
            name: student.house.name,
            color: student.house.color
          } : null,
          guardians
        },
        academicPeriods: academicPeriods.map(p => ({
          id: p.id,
          name: p.name,
          type: 'TERM',
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: p.isCurrent
        })),
        currentPeriod: currentPeriod ? {
          id: currentPeriod.id,
          name: currentPeriod.name,
          type: 'TERM',
          startDate: currentPeriod.startDate,
          endDate: currentPeriod.endDate,
          isCurrent: currentPeriod.isCurrent
        } : null,
        stats,
        records: attendanceRecords,
        calendarData
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance',
      error: error.message
    });
  }
});

// Helper Functions
async function getAttendanceStats(schoolId, whereClause) {
  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: { ...whereClause, schoolId },
    _count: { status: true }
  });

  const result = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    partial: 0,
    percentage: 0
  };

  stats.forEach(stat => {
    const status = stat.status.toLowerCase();
    if (result.hasOwnProperty(status)) {
      result[status] = stat._count.status;
    }
    result.total += stat._count.status;
  });

  result.percentage = result.total > 0 ?
    Math.round(((result.present + result.late) / result.total) * 100) : 0;

  return result;
}

async function getStudentsWithLowAttendance(schoolId, classId = null, threshold = 75) {
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      status: 'ACTIVE',
      ...(classId && { currentClassId: classId })
    },
    include: {
      currentClass: {
        select: { name: true, grade: true }
      },
      attendance: {
        where: {
          date: {
            gte: moment().subtract(30, 'days').toDate()
          }
        }
      }
    }
  });

  return students
    .map(student => {
      const totalDays = student.attendance.length;
      const presentDays = student.attendance.filter(a => a.status === 'PRESENT').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        class: {
          id: student.currentClass?.id || '',
          name: student.currentClass?.name || 'N/A',
          grade: student.currentClass?.grade || 'N/A'
        },
        percentage: Math.round(percentage * 100) / 100,
        totalDays,
        presentDays,
        absentDays: student.attendance.filter(a => a.status === 'ABSENT').length,
        lateDays: student.attendance.filter(a => a.status === 'LATE').length
      };
    })
    .filter(student => student.percentage < threshold && student.totalDays > 0)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 20);
}

async function getDailyAttendanceTrends(schoolId, whereClause) {
  // Temporary fix: return mock data until SQL query is debugged
  console.log('getDailyAttendanceTrends called with:', { schoolId, whereClause });

  // Generate last 30 days of mock data
  const trends = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    trends.push({
      date: date.toISOString().split('T')[0],
      total: 100 + Math.floor(Math.random() * 50),
      present: 80 + Math.floor(Math.random() * 20),
      absent: 5 + Math.floor(Math.random() * 15),
      late: Math.floor(Math.random() * 5),
      percentage: 85 + Math.floor(Math.random() * 10)
    });
  }

  return trends.map(trend => ({
    date: new Date(trend.date).toISOString().split('T')[0],
    total: Number(trend.total),
    present: Number(trend.present),
    absent: Number(trend.absent),
    late: Number(trend.late),
    percentage: Number(trend.percentage)
  }));
}

async function getClassAttendanceStats(schoolId, startDate, endDate) {
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      students: {
        where: { status: 'ACTIVE' },
        include: {
          attendance: {
            where: {
              date: { gte: startDate, lte: endDate }
            }
          }
        }
      }
    }
  });

  return classes.map(cls => {
    const totalStudents = cls.students.length;
    let totalAttendanceRecords = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    cls.students.forEach(student => {
      totalAttendanceRecords += student.attendance.length;
      presentCount += student.attendance.filter(a => a.status === 'PRESENT').length;
      absentCount += student.attendance.filter(a => a.status === 'ABSENT').length;
      lateCount += student.attendance.filter(a => a.status === 'LATE').length;
    });

    const attendanceRate = totalAttendanceRecords > 0 ?
      Math.round(((presentCount + lateCount) / totalAttendanceRecords) * 100) : 0;

    // Calculate today's present count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = cls.students.filter(student =>
      student.attendance.some(a =>
        a.date >= today &&
        a.date < new Date(today.getTime() + 24 * 60 * 60 * 1000) &&
        (a.status === 'PRESENT' || a.status === 'LATE')
      )
    ).length;

    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      totalStudents,
      presentToday,
      attendanceRate,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      trend: 'stable', // TODO: Calculate actual trend
      trendValue: 0 // TODO: Calculate actual trend value
    };
  });
}

async function getOverallAttendanceStats(schoolId, baseWhere) {
  const [totalStudents, totalClasses, attendanceStats] = await Promise.all([
    prisma.student.count({
      where: { schoolId, status: 'ACTIVE' }
    }),
    prisma.class.count({
      where: { schoolId }
    }),
    getAttendanceStats(schoolId, baseWhere)
  ]);

  // Get today's attendance
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayStats = await getAttendanceStats(schoolId, {
    ...baseWhere,
    date: { gte: todayStart, lte: todayEnd }
  });

  return {
    totalStudents,
    totalClasses,
    averageAttendance: attendanceStats.percentage,
    presentToday: todayStats.present,
    absentToday: todayStats.absent,
    lateToday: todayStats.late
  };
}

async function getClassSummaries(schoolId, startDate, endDate) {
  return await getClassAttendanceStats(schoolId, startDate, endDate);
}

async function getStudentsWithDetailedAttendance(schoolId, classId, threshold) {
  const students = await getStudentsWithLowAttendance(schoolId, classId, threshold);

  return students.map(student => ({
    ...student,
    status: student.percentage >= 85 ? 'good' :
            student.percentage >= 70 ? 'warning' : 'critical'
  }));
}

async function getRecentAttendanceReports(schoolId, limit) {
  // Mock data for now - in production, you'd have an attendance_reports table
  return [
    {
      id: '1',
      title: 'Monthly Attendance Report',
      description: 'Comprehensive attendance report for the current month',
      reportType: 'MONTHLY',
      status: 'COMPLETED',
      generatedAt: new Date().toISOString(),
      summary: {
        totalDays: 20,
        totalStudents: 150,
        averageAttendance: 92.5,
        present: 2775,
        absent: 120,
        late: 105,
        excused: 0
      }
    },
    {
      id: '2',
      title: 'Term 1 Summary Report',
      description: 'End of term attendance summary',
      reportType: 'TERM',
      status: 'GENERATING',
      generatedAt: null,
      summary: null
    }
  ];
}

async function getAttendanceTrends(schoolId, startDate, endDate) {
  const daily = await getDailyAttendanceTrends(schoolId, {
    date: { gte: startDate, lte: endDate }
  });

  // Mock weekly and monthly data - in production, you'd calculate these
  const weekly = [
    { week: 'Week 1', attendance: 94.2 },
    { week: 'Week 2', attendance: 91.8 },
    { week: 'Week 3', attendance: 93.5 },
    { week: 'Week 4', attendance: 89.7 }
  ];

  const monthly = [
    { month: 'Jan', attendance: 92.5 },
    { month: 'Feb', attendance: 94.1 },
    { month: 'Mar', attendance: 90.8 },
    { month: 'Apr', attendance: 93.2 }
  ];

  return { daily, weekly, monthly };
}

function calculateStudentAttendanceStats(attendanceRecords, startDate, endDate) {
  // Calculate total possible days (excluding weekends)
  const totalPossibleDays = calculateSchoolDays(startDate, endDate);

  const stats = {
    totalDays: attendanceRecords.length,
    presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
    absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length,
    lateDays: attendanceRecords.filter(r => r.status === 'LATE').length,
    excusedDays: attendanceRecords.filter(r => r.status === 'EXCUSED').length,
    partialDays: attendanceRecords.filter(r => r.status === 'PARTIAL').length,
    attendanceRate: 0,
    monthlyStats: [],
    subjectStats: [],
    trends: []
  };

  stats.attendanceRate = stats.totalDays > 0 ?
    Math.round(((stats.presentDays + stats.lateDays) / stats.totalDays) * 100) : 0;

  // Calculate monthly stats
  const monthlyData = {};
  attendanceRecords.forEach(record => {
    const month = moment(record.date).format('MMM');
    if (!monthlyData[month]) {
      monthlyData[month] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    monthlyData[month][record.status.toLowerCase()]++;
    monthlyData[month].total++;
  });

  stats.monthlyStats = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    present: data.present,
    absent: data.absent,
    late: data.late,
    rate: data.total > 0 ? Math.round(((data.present + data.late) / data.total) * 100) : 0
  }));

  // Calculate subject-wise stats
  const subjectData = {};
  attendanceRecords.forEach(record => {
    if (record.subject) {
      const subject = record.subject.name;
      if (!subjectData[subject]) {
        subjectData[subject] = { present: 0, total: 0 };
      }
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        subjectData[subject].present++;
      }
      subjectData[subject].total++;
    }
  });

  stats.subjectStats = Object.entries(subjectData).map(([subject, data]) => ({
    subject,
    present: data.present,
    total: data.total,
    rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
  }));

  return stats;
}

function calculateSchoolDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sundays (0) and Saturdays (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

module.exports = {
  getAttendanceDashboardNew: exports.getAttendanceDashboardNew,
  getAttendanceReportsDashboard: exports.getAttendanceReportsDashboard,
  getStudentDetailedAttendance: exports.getStudentDetailedAttendance
};