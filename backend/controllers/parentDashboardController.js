const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get parent dashboard overview
// @route   GET /api/parent/dashboard
// @access  Private/Parent
exports.getParentDashboard = asyncHandler(async (req, res) => {
  if (!req.school || req.user.role !== 'PARENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied or school not found'
    });
  }

  // Get parent/guardian information
  const guardian = await prisma.guardian.findFirst({
    where: {
      userId: req.user.id,
      schoolId: req.school.id
    },
    include: {
      guardianStudents: {
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true,
              photo: true,
              currentClass: {
                select: {
                  id: true,
                  name: true,
                  grade: true
                }
              },
              academicYear: {
                select: {
                  id: true,
                  name: true,
                  isCurrent: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!guardian) {
    return res.status(404).json({
      success: false,
      message: 'Guardian profile not found'
    });
  }

  const students = guardian.guardianStudents.map(gs => gs.student);
  const studentIds = students.map(s => s.id);

  // Get recent grades for all children
  const recentGrades = await prisma.gradeEntry.findMany({
    where: {
      studentId: { in: studentIds },
      gradedAt: { not: null }
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      gradeBook: {
        include: {
          subject: {
            select: {
              name: true,
              code: true
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      assessment: {
        select: {
          title: true,
          type: true
        }
      }
    },
    orderBy: {
      gradedAt: 'desc'
    },
    take: 20
  });

  // Get attendance summary
  const attendanceData = await prisma.attendance.groupBy({
    by: ['studentId', 'status'],
    where: {
      studentId: { in: studentIds },
      date: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
      }
    },
    _count: {
      status: true
    }
  });

  // Process attendance data
  const attendanceSummary = {};
  students.forEach(student => {
    attendanceSummary[student.id] = {
      student: student,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      percentage: 0
    };
  });

  attendanceData.forEach(att => {
    const summary = attendanceSummary[att.studentId];
    if (summary) {
      summary[att.status.toLowerCase()] = att._count.status;
      summary.total += att._count.status;
    }
  });

  // Calculate attendance percentages
  Object.keys(attendanceSummary).forEach(studentId => {
    const summary = attendanceSummary[studentId];
    if (summary.total > 0) {
      summary.percentage = Math.round((summary.present / summary.total) * 100);
    }
  });

  // Get upcoming assessments
  const upcomingAssessments = await prisma.assessment.findMany({
    where: {
      class: {
        students: {
          some: {
            id: { in: studentIds }
          }
        }
      },
      OR: [
        {
          scheduledDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
          }
        },
        {
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
          }
        }
      ]
    },
    include: {
      subject: {
        select: {
          name: true,
          code: true
        }
      },
      class: {
        select: {
          name: true,
          grade: true
        }
      },
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: [
      { scheduledDate: 'asc' },
      { dueDate: 'asc' }
    ],
    take: 10
  });

  // Get curriculum progress for all children
  const curriculumProgress = await prisma.curriculumProgressTracker.findMany({
    where: {
      studentId: { in: studentIds }
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      curriculum: {
        select: {
          name: true,
          type: true
        }
      },
      class: {
        select: {
          name: true,
          grade: true
        }
      }
    }
  });

  // Get recent grade reports
  const recentReports = await prisma.gradeReport.findMany({
    where: {
      studentId: { in: studentIds },
      status: 'PUBLISHED'
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      academicYear: {
        select: {
          name: true
        }
      },
      term: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 10
  });

  const dashboardData = {
    guardian: {
      id: guardian.id,
      name: `${guardian.firstName} ${guardian.lastName}`,
      email: guardian.email,
      phone: guardian.phone
    },
    students: students,
    recentGrades: recentGrades,
    attendanceSummary: Object.values(attendanceSummary),
    upcomingAssessments: upcomingAssessments,
    curriculumProgress: curriculumProgress,
    recentReports: recentReports,
    summary: {
      totalStudents: students.length,
      averageAttendance: Math.round(
        Object.values(attendanceSummary).reduce((sum, att) => sum + att.percentage, 0) / 
        Math.max(students.length, 1)
      ),
      newGrades: recentGrades.filter(g => 
        new Date(g.gradedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      upcomingAssessmentsCount: upcomingAssessments.length
    }
  };

  res.json({
    success: true,
    data: dashboardData,
    message: 'Parent dashboard data retrieved successfully'
  });
});

// @desc    Get detailed grades for a specific student
// @route   GET /api/parent/students/:studentId/grades
// @access  Private/Parent
exports.getStudentGrades = asyncHandler(async (req, res) => {
  if (!req.school || req.user.role !== 'PARENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied or school not found'
    });
  }

  const { studentId } = req.params;
  const { academicYearId, termId, subjectId } = req.query;

  // Verify parent has access to this student
  const guardianStudent = await prisma.guardianStudent.findFirst({
    where: {
      guardian: {
        userId: req.user.id,
        schoolId: req.school.id
      },
      studentId: studentId
    },
    include: {
      guardian: {
        include: {
          parentGradeAccess: {
            where: {
              studentId: studentId
            }
          }
        }
      }
    }
  });

  if (!guardianStudent) {
    return res.status(404).json({
      success: false,
      message: 'Student not found or access denied'
    });
  }

  // Check grade access permissions
  const gradeAccess = guardianStudent.guardian.parentGradeAccess[0];
  if (gradeAccess && !gradeAccess.hasGradeAccess) {
    return res.status(403).json({
      success: false,
      message: 'Grade access has been restricted'
    });
  }

  // Build where clause for grade entries
  const whereClause = {
    studentId: studentId,
    ...(academicYearId && {
      gradeBook: {
        academicYearId: academicYearId
      }
    }),
    ...(termId && {
      gradeBook: {
        termId: termId
      }
    }),
    ...(subjectId && {
      gradeBook: {
        subjectId: subjectId
      }
    })
  };

  // Get detailed grades
  const gradeEntries = await prisma.gradeEntry.findMany({
    where: whereClause,
    include: {
      gradeBook: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          academicYear: {
            select: {
              name: true
            }
          },
          term: {
            select: {
              name: true
            }
          }
        }
      },
      assessment: {
        select: {
          title: true,
          type: true,
          totalMarks: true,
          scheduledDate: true,
          dueDate: true
        }
      }
    },
    orderBy: [
      { gradeBook: { subject: { name: 'asc' } } },
      { gradedAt: 'desc' }
    ]
  });

  // Calculate subject-wise statistics
  const subjectStats = {};
  gradeEntries.forEach(entry => {
    const subjectId = entry.gradeBook.subject.id;
    if (!subjectStats[subjectId]) {
      subjectStats[subjectId] = {
        subject: entry.gradeBook.subject,
        grades: [],
        average: 0,
        highest: 0,
        lowest: 100,
        totalEntries: 0
      };
    }
    
    const stats = subjectStats[subjectId];
    if (entry.percentage !== null) {
      stats.grades.push(entry.percentage);
      stats.totalEntries++;
      stats.highest = Math.max(stats.highest, entry.percentage);
      stats.lowest = Math.min(stats.lowest, entry.percentage);
    }
  });

  // Calculate averages
  Object.keys(subjectStats).forEach(subjectId => {
    const stats = subjectStats[subjectId];
    if (stats.grades.length > 0) {
      stats.average = Math.round(
        (stats.grades.reduce((sum, grade) => sum + grade, 0) / stats.grades.length) * 100
      ) / 100;
    }
    // Remove individual grades array for response
    delete stats.grades;
  });

  // Update access tracking
  if (gradeAccess) {
    await prisma.parentGradeAccess.update({
      where: { id: gradeAccess.id },
      data: {
        lastAccessDate: new Date(),
        totalAccesses: { increment: 1 }
      }
    });
  }

  res.json({
    success: true,
    data: {
      student: {
        id: studentId,
        // Additional student info would be fetched here
      },
      grades: gradeEntries,
      subjectStatistics: Object.values(subjectStats),
      summary: {
        totalGrades: gradeEntries.length,
        gradedAssessments: gradeEntries.filter(g => g.gradedAt).length,
        averagePerformance: Object.values(subjectStats).length > 0 
          ? Math.round(
              Object.values(subjectStats).reduce((sum, stat) => sum + stat.average, 0) / 
              Object.values(subjectStats).length * 100
            ) / 100
          : 0
      }
    },
    message: 'Student grades retrieved successfully'
  });
});

// @desc    Get student progress tracking
// @route   GET /api/parent/students/:studentId/progress
// @access  Private/Parent
exports.getStudentProgress = asyncHandler(async (req, res) => {
  if (!req.school || req.user.role !== 'PARENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied or school not found'
    });
  }

  const { studentId } = req.params;
  const { academicYearId } = req.query;

  // Verify parent has access to this student
  const guardianStudent = await prisma.guardianStudent.findFirst({
    where: {
      guardian: {
        userId: req.user.id,
        schoolId: req.school.id
      },
      studentId: studentId
    },
    include: {
      guardian: {
        include: {
          parentGradeAccess: {
            where: {
              studentId: studentId
            }
          }
        }
      }
    }
  });

  if (!guardianStudent) {
    return res.status(404).json({
      success: false,
      message: 'Student not found or access denied'
    });
  }

  // Check progress access permissions
  const gradeAccess = guardianStudent.guardian.parentGradeAccess[0];
  if (gradeAccess && !gradeAccess.hasProgressAccess) {
    return res.status(403).json({
      success: false,
      message: 'Progress access has been restricted'
    });
  }

  // Get curriculum progress tracking
  const progressTrackers = await prisma.curriculumProgressTracker.findMany({
    where: {
      studentId: studentId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      curriculum: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true
        }
      },
      academicYear: {
        select: {
          name: true,
          isCurrent: true
        }
      },
      class: {
        select: {
          name: true,
          grade: true
        }
      }
    },
    orderBy: {
      academicYear: { name: 'desc' }
    }
  });

  // Get recent grade trends
  const gradeTrends = await prisma.gradeEntry.findMany({
    where: {
      studentId: studentId,
      gradedAt: { not: null },
      percentage: { not: null }
    },
    include: {
      gradeBook: {
        include: {
          subject: {
            select: {
              name: true,
              code: true
            }
          }
        }
      }
    },
    orderBy: {
      gradedAt: 'desc'
    },
    take: 50
  });

  // Calculate trend analysis
  const subjectTrends = {};
  gradeTrends.forEach(grade => {
    const subjectCode = grade.gradeBook.subject.code;
    if (!subjectTrends[subjectCode]) {
      subjectTrends[subjectCode] = {
        subject: grade.gradeBook.subject,
        grades: [],
        trend: 'STABLE'
      };
    }
    subjectTrends[subjectCode].grades.push({
      percentage: grade.percentage,
      date: grade.gradedAt
    });
  });

  // Analyze trends
  Object.keys(subjectTrends).forEach(subjectCode => {
    const trend = subjectTrends[subjectCode];
    if (trend.grades.length >= 3) {
      const recent = trend.grades.slice(0, 3);
      const older = trend.grades.slice(-3);
      
      const recentAvg = recent.reduce((sum, g) => sum + g.percentage, 0) / recent.length;
      const olderAvg = older.reduce((sum, g) => sum + g.percentage, 0) / older.length;
      
      const difference = recentAvg - olderAvg;
      if (difference > 5) {
        trend.trend = 'IMPROVING';
      } else if (difference < -5) {
        trend.trend = 'DECLINING';
      } else {
        trend.trend = 'STABLE';
      }
    }
  });

  res.json({
    success: true,
    data: {
      curriculumProgress: progressTrackers,
      gradeTrends: Object.values(subjectTrends),
      recommendations: generateParentRecommendations(progressTrackers, subjectTrends)
    },
    message: 'Student progress retrieved successfully'
  });
});

// @desc    Get student attendance for parent
// @route   GET /api/parent/students/:studentId/attendance
// @access  Private/Parent
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  if (!req.school || req.user.role !== 'PARENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied or school not found'
    });
  }

  const { studentId } = req.params;
  const { fromDate, toDate, period } = req.query;

  // Verify parent has access to this student
  const guardianStudent = await prisma.guardianStudent.findFirst({
    where: {
      guardian: {
        userId: req.user.id,
        schoolId: req.school.id
      },
      studentId: studentId
    }
  });

  if (!guardianStudent) {
    return res.status(404).json({
      success: false,
      message: 'Student not found or access denied'
    });
  }

  // Build date range (default to current month)
  const startDate = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = toDate ? new Date(toDate) : new Date();

  // Get attendance records
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: studentId,
      date: {
        gte: startDate,
        lte: endDate
      },
      ...(period && { period: period })
    },
    include: {
      markedBy: {
        select: {
          name: true,
          role: true
        }
      },
      class: {
        select: {
          name: true,
          grade: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Calculate statistics
  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'PRESENT').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
    excused: attendance.filter(a => a.status === 'EXCUSED').length,
    percentage: 0
  };

  if (stats.total > 0) {
    stats.percentage = Math.round((stats.present / stats.total) * 100);
  }

  res.json({
    success: true,
    data: {
      attendance: attendance,
      statistics: stats,
      dateRange: {
        from: startDate,
        to: endDate
      }
    },
    message: 'Student attendance retrieved successfully'
  });
});

// Helper function to generate parent recommendations
function generateParentRecommendations(progressTrackers, subjectTrends) {
  const recommendations = [];

  // Check for students behind in curriculum
  const behindTrackers = progressTrackers.filter(t => t.progressionStatus === 'BEHIND' || t.progressionStatus === 'AT_RISK');
  if (behindTrackers.length > 0) {
    recommendations.push({
      type: 'ACADEMIC_SUPPORT',
      priority: 'HIGH',
      title: 'Additional Academic Support Needed',
      description: `Your child is behind in ${behindTrackers.length} curriculum area(s). Consider arranging additional tutoring or speaking with teachers.`,
      actions: [
        'Schedule parent-teacher conference',
        'Arrange additional tutoring',
        'Create structured study schedule at home'
      ]
    });
  }

  // Check for declining grade trends
  const decliningSubjects = Object.values(subjectTrends).filter(t => t.trend === 'DECLINING');
  if (decliningSubjects.length > 0) {
    recommendations.push({
      type: 'GRADE_TREND',
      priority: 'MEDIUM',
      title: 'Declining Performance Detected',
      description: `Performance is declining in ${decliningSubjects.map(s => s.subject.name).join(', ')}. Early intervention is recommended.`,
      actions: [
        'Review homework completion patterns',
        'Speak with subject teachers',
        'Assess if additional resources are needed'
      ]
    });
  }

  // Check for improving trends
  const improvingSubjects = Object.values(subjectTrends).filter(t => t.trend === 'IMPROVING');
  if (improvingSubjects.length > 0) {
    recommendations.push({
      type: 'POSITIVE_PROGRESS',
      priority: 'LOW',
      title: 'Great Progress!',
      description: `Excellent improvement in ${improvingSubjects.map(s => s.subject.name).join(', ')}. Keep up the good work!`,
      actions: [
        'Acknowledge and celebrate progress',
        'Maintain current study habits',
        'Consider advanced opportunities'
      ]
    });
  }

  return recommendations;
}