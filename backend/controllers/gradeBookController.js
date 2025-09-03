const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all grade books for a teacher
// @route   GET /api/gradebooks
// @access  Private/Teacher
exports.getGradeBooks = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Extract query parameters
  const academicYearId = req.query.academicYearId;
  const termId = req.query.termId;
  const classId = req.query.classId;
  const subjectId = req.query.subjectId;

  // Build where clause
  const whereClause = {
    schoolId: req.school.id,
    ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id }),
    ...(academicYearId && { academicYearId }),
    ...(termId && { termId }),
    ...(classId && { classId }),
    ...(subjectId && { subjectId })
  };

  const gradeBooks = await prisma.gradeBook.findMany({
    where: whereClause,
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: true
        }
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      academicYear: {
        select: {
          id: true,
          name: true,
          isCurrent: true
        }
      },
      term: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          gradeEntries: true
        }
      }
    },
    orderBy: [
      { academicYear: { name: 'desc' } },
      { term: { name: 'asc' } },
      { class: { name: 'asc' } },
      { subject: { name: 'asc' } }
    ]
  });

  res.json({
    success: true,
    data: gradeBooks,
    message: `Retrieved ${gradeBooks.length} grade books`
  });
});

// @desc    Get specific grade book with entries
// @route   GET /api/gradebooks/:id
// @access  Private/Teacher
exports.getGradeBook = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const whereClause = {
    id: req.params.id,
    schoolId: req.school.id,
    ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
  };

  const gradeBook = await prisma.gradeBook.findFirst({
    where: whereClause,
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: true,
          students: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true,
              status: true
            },
            where: {
              status: 'ACTIVE'
            },
            orderBy: [
              { lastName: 'asc' },
              { firstName: 'asc' }
            ]
          }
        }
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      academicYear: {
        select: {
          id: true,
          name: true,
          isCurrent: true
        }
      },
      term: {
        select: {
          id: true,
          name: true
        }
      },
      gradeEntries: {
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true
            }
          },
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              totalMarks: true
            }
          }
        },
        orderBy: [
          { student: { lastName: 'asc' } },
          { student: { firstName: 'asc' } },
          { createdAt: 'desc' }
        ]
      }
    }
  });

  if (!gradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  res.json({
    success: true,
    data: gradeBook,
    message: 'Grade book retrieved successfully'
  });
});

// @desc    Create new grade book
// @route   POST /api/gradebooks
// @access  Private/Teacher/Admin
exports.createGradeBook = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const {
    name,
    teacherId,
    classId,
    subjectId,
    academicYearId,
    termId,
    gradingScale,
    weightingScheme
  } = req.body;

  // Validate required fields
  if (!name || !teacherId || !classId || !subjectId || !academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Name, teacher, class, subject, and academic year are required'
    });
  }

  // Check for duplicate grade book
  const existingGradeBook = await prisma.gradeBook.findFirst({
    where: {
      schoolId: req.school.id,
      teacherId,
      classId,
      subjectId,
      academicYearId,
      termId: termId || null
    }
  });

  if (existingGradeBook) {
    return res.status(400).json({
      success: false,
      message: 'A grade book already exists for this combination'
    });
  }

  // Get student count for the class
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      _count: {
        select: {
          students: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });

  // Default grading scale if not provided
  const defaultGradingScale = {
    type: 'PERCENTAGE',
    scale: {
      A: { min: 90, max: 100, gpa: 4.0 },
      B: { min: 80, max: 89, gpa: 3.0 },
      C: { min: 70, max: 79, gpa: 2.0 },
      D: { min: 60, max: 69, gpa: 1.0 },
      F: { min: 0, max: 59, gpa: 0.0 }
    }
  };

  const gradeBook = await prisma.gradeBook.create({
    data: {
      name,
      schoolId: req.school.id,
      teacherId,
      classId,
      subjectId,
      academicYearId,
      termId,
      gradingScale: gradingScale || defaultGradingScale,
      weightingScheme,
      totalStudents: classData?._count?.students || 0
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: true
        }
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      academicYear: {
        select: {
          id: true,
          name: true
        }
      },
      term: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: gradeBook,
    message: 'Grade book created successfully'
  });
});

// @desc    Update grade book
// @route   PUT /api/gradebooks/:id
// @access  Private/Teacher/Admin
exports.updateGradeBook = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const updateData = req.body;

  // Check if grade book exists and user has access
  const whereClause = {
    id,
    schoolId: req.school.id,
    ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
  };

  const existingGradeBook = await prisma.gradeBook.findFirst({
    where: whereClause
  });

  if (!existingGradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  // Check if grade book is locked
  if (existingGradeBook.isLocked && updateData.gradingScale) {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify grading scale of a locked grade book'
    });
  }

  const gradeBook = await prisma.gradeBook.update({
    where: { id },
    data: updateData,
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: true
        }
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: gradeBook,
    message: 'Grade book updated successfully'
  });
});

// @desc    Delete grade book
// @route   DELETE /api/gradebooks/:id
// @access  Private/Teacher/Admin
exports.deleteGradeBook = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;

  // Check if grade book exists and user has access
  const whereClause = {
    id,
    schoolId: req.school.id,
    ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
  };

  const existingGradeBook = await prisma.gradeBook.findFirst({
    where: whereClause,
    include: {
      _count: {
        select: {
          gradeEntries: true
        }
      }
    }
  });

  if (!existingGradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  // Check if grade book has entries
  if (existingGradeBook._count.gradeEntries > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete grade book with existing grade entries'
    });
  }

  await prisma.gradeBook.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Grade book deleted successfully'
  });
});

// @desc    Add grade entry
// @route   POST /api/gradebooks/:id/grades
// @access  Private/Teacher
exports.addGradeEntry = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const {
    studentId,
    assessmentId,
    rawScore,
    maxScore,
    category,
    weight,
    feedback,
    teacherNotes,
    isExcused
  } = req.body;

  // Validate required fields
  if (!studentId || (!rawScore && !isExcused)) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and raw score are required (unless excused)'
    });
  }

  // Get grade book and verify access
  const gradeBook = await prisma.gradeBook.findFirst({
    where: {
      id,
      schoolId: req.school.id,
      ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
    },
    include: {
      gradingScale: true
    }
  });

  if (!gradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  // Check if grade book is locked
  if (gradeBook.isLocked) {
    return res.status(400).json({
      success: false,
      message: 'Cannot add grades to a locked grade book'
    });
  }

  // Calculate derived values
  const percentage = rawScore && maxScore ? (rawScore / maxScore) * 100 : null;
  const letterGrade = percentage ? calculateLetterGrade(percentage, gradeBook.gradingScale) : null;
  const gradePoint = letterGrade ? getGradePoint(letterGrade, gradeBook.gradingScale) : null;
  const weightedScore = rawScore && weight ? rawScore * weight : rawScore;

  // Check for existing entry
  const existingEntry = await prisma.gradeEntry.findFirst({
    where: {
      gradeBookId: id,
      studentId,
      assessmentId: assessmentId || null
    }
  });

  if (existingEntry) {
    return res.status(400).json({
      success: false,
      message: 'Grade entry already exists for this student and assessment'
    });
  }

  const gradeEntry = await prisma.gradeEntry.create({
    data: {
      gradeBookId: id,
      studentId,
      assessmentId,
      rawScore: isExcused ? null : rawScore,
      maxScore,
      percentage,
      letterGrade,
      gradePoint,
      weightedScore,
      category,
      weight: weight || 1.0,
      isExcused,
      feedback,
      teacherNotes,
      gradedAt: new Date()
    },
    include: {
      student: {
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true
        }
      },
      assessment: {
        select: {
          id: true,
          title: true,
          type: true,
          totalMarks: true
        }
      }
    }
  });

  // Update grade book statistics
  await updateGradeBookStatistics(id);

  res.status(201).json({
    success: true,
    data: gradeEntry,
    message: 'Grade entry added successfully'
  });
});

// @desc    Update grade entry
// @route   PUT /api/gradebooks/:gradeBookId/grades/:gradeEntryId
// @access  Private/Teacher
exports.updateGradeEntry = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { gradeBookId, gradeEntryId } = req.params;
  const updateData = req.body;

  // Get grade book and verify access
  const gradeBook = await prisma.gradeBook.findFirst({
    where: {
      id: gradeBookId,
      schoolId: req.school.id,
      ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
    }
  });

  if (!gradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  // Check if grade book is locked
  if (gradeBook.isLocked) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update grades in a locked grade book'
    });
  }

  // Get existing grade entry
  const existingEntry = await prisma.gradeEntry.findUnique({
    where: { id: gradeEntryId }
  });

  if (!existingEntry || existingEntry.gradeBookId !== gradeBookId) {
    return res.status(404).json({
      success: false,
      message: 'Grade entry not found'
    });
  }

  // Recalculate derived values if raw score or max score changed
  let calculatedFields = {};
  if (updateData.rawScore !== undefined || updateData.maxScore !== undefined) {
    const newRawScore = updateData.rawScore !== undefined ? updateData.rawScore : existingEntry.rawScore;
    const newMaxScore = updateData.maxScore !== undefined ? updateData.maxScore : existingEntry.maxScore;
    
    if (newRawScore && newMaxScore) {
      const percentage = (newRawScore / newMaxScore) * 100;
      const letterGrade = calculateLetterGrade(percentage, gradeBook.gradingScale);
      const gradePoint = getGradePoint(letterGrade, gradeBook.gradingScale);
      
      calculatedFields = {
        percentage,
        letterGrade,
        gradePoint,
        weightedScore: newRawScore * (updateData.weight || existingEntry.weight)
      };
    }
  }

  const gradeEntry = await prisma.gradeEntry.update({
    where: { id: gradeEntryId },
    data: {
      ...updateData,
      ...calculatedFields,
      lastModified: new Date()
    },
    include: {
      student: {
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true
        }
      },
      assessment: {
        select: {
          id: true,
          title: true,
          type: true
        }
      }
    }
  });

  // Update grade book statistics
  await updateGradeBookStatistics(gradeBookId);

  res.json({
    success: true,
    data: gradeEntry,
    message: 'Grade entry updated successfully'
  });
});

// @desc    Get grade book analytics
// @route   GET /api/gradebooks/:id/analytics
// @access  Private/Teacher
exports.getGradeBookAnalytics = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;

  // Verify grade book access
  const gradeBook = await prisma.gradeBook.findFirst({
    where: {
      id,
      schoolId: req.school.id,
      ...(req.user.role === 'TEACHER' && { teacherId: req.user.teacher?.id })
    }
  });

  if (!gradeBook) {
    return res.status(404).json({
      success: false,
      message: 'Grade book not found'
    });
  }

  // Get detailed analytics
  const gradeEntries = await prisma.gradeEntry.findMany({
    where: {
      gradeBookId: id,
      isExcused: false,
      percentage: { not: null }
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Calculate analytics
  const analytics = calculateGradeAnalytics(gradeEntries);

  res.json({
    success: true,
    data: analytics,
    message: 'Grade book analytics retrieved successfully'
  });
});

// Helper functions
function calculateLetterGrade(percentage, gradingScale) {
  if (!gradingScale?.scale) return null;
  
  for (const [grade, range] of Object.entries(gradingScale.scale)) {
    if (percentage >= range.min && percentage <= range.max) {
      return grade;
    }
  }
  return 'F';
}

function getGradePoint(letterGrade, gradingScale) {
  if (!gradingScale?.scale || !letterGrade) return null;
  return gradingScale.scale[letterGrade]?.gpa || 0.0;
}

async function updateGradeBookStatistics(gradeBookId) {
  const gradeEntries = await prisma.gradeEntry.findMany({
    where: {
      gradeBookId,
      isExcused: false,
      percentage: { not: null }
    }
  });

  if (gradeEntries.length === 0) return;

  const totalPercentage = gradeEntries.reduce((sum, entry) => sum + (entry.percentage || 0), 0);
  const averageGrade = totalPercentage / gradeEntries.length;

  await prisma.gradeBook.update({
    where: { id: gradeBookId },
    data: {
      averageGrade,
      progressSummary: {
        totalGraded: gradeEntries.length,
        averagePercentage: averageGrade,
        lastUpdated: new Date()
      }
    }
  });
}

function calculateGradeAnalytics(gradeEntries) {
  if (gradeEntries.length === 0) {
    return {
      totalEntries: 0,
      averageGrade: 0,
      distribution: {},
      topPerformers: [],
      strugglingStudents: []
    };
  }

  const percentages = gradeEntries.map(entry => entry.percentage).filter(p => p !== null);
  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
  const averageGrade = totalPercentage / percentages.length;

  // Grade distribution
  const distribution = {};
  gradeEntries.forEach(entry => {
    if (entry.letterGrade) {
      distribution[entry.letterGrade] = (distribution[entry.letterGrade] || 0) + 1;
    }
  });

  // Sort students by performance
  const sortedEntries = [...gradeEntries].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  
  return {
    totalEntries: gradeEntries.length,
    averageGrade: Math.round(averageGrade * 100) / 100,
    distribution,
    topPerformers: sortedEntries.slice(0, 5).map(entry => ({
      student: entry.student,
      percentage: entry.percentage,
      letterGrade: entry.letterGrade
    })),
    strugglingStudents: sortedEntries.slice(-5).reverse().map(entry => ({
      student: entry.student,
      percentage: entry.percentage,
      letterGrade: entry.letterGrade
    }))
  };
}