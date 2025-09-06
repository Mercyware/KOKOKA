const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Debug school context for curricula
// @route   GET /api/curricula/debug
// @access  Private
exports.debugSchoolContext = asyncHandler(async (req, res) => {
  const debugInfo = {
    hasSchool: !!req.school,
    schoolId: req.school?.id,
    schoolName: req.school?.name,
    schoolSubdomain: req.school?.subdomain,
    schoolStatus: req.school?.status,
    headers: {
      'x-school-subdomain': req.headers['x-school-subdomain'],
      'host': req.headers.host,
      'origin': req.headers.origin,
      'user-agent': req.headers['user-agent']
    },
    query: req.query,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  
  console.log('Curriculum Debug school context:', JSON.stringify(debugInfo, null, 2));
  
  res.json({
    success: true,
    debug: debugInfo
  });
});

// @desc    Get all curricula
// @route   GET /api/curricula
// @access  Private
exports.getAllCurricula = asyncHandler(async (req, res) => {
  // Check if req.school exists with enhanced debugging
  if (!req.school) {
    console.log('Missing school context in curriculum request');
    console.log('Headers:', JSON.stringify({
      'x-school-subdomain': req.headers['x-school-subdomain'],
      'host': req.headers.host,
      'origin': req.headers.origin
    }, null, 2));
    
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive',
      debug: {
        hasSchool: !!req.school,
        headers: req.headers['x-school-subdomain'],
        host: req.headers.host,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  
  // Extract search and filter parameters
  const search = req.query.search || '';
  const type = req.query.type || '';
  const status = req.query.status || '';
  
  // Build where clause
  const whereClause = {
    schoolId: req.school.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { version: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(type && { type: type }),
    ...(status && { status: status })
  };

  // Get total count for pagination
  const totalCurricula = await prisma.curriculum.count({
    where: whereClause
  });

  // Get paginated curricula
  const curricula = await prisma.curriculum.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      _count: {
        select: {
          curriculumSubjects: true,
          classCurricula: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalCurricula / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: curricula,
    message: `Retrieved ${curricula.length} curricula`,
    pagination: {
      page,
      limit,
      totalCurricula,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  });
});

// @desc    Get curriculum by ID
// @route   GET /api/curricula/:id
// @access  Private
exports.getCurriculumById = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          },
          learningObjectives: true,
          contentModules: {
            orderBy: {
              displayOrder: 'asc'
            }
          }
        },
        orderBy: [
          { gradeLevel: 'asc' },
          { displayOrder: 'asc' }
        ]
      },
      classCurricula: {
        include: {
          class: {
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
  });
  
  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }
  
  res.json({
    success: true,
    data: curriculum,
    message: 'Curriculum retrieved successfully'
  });
});

// @desc    Create new curriculum
// @route   POST /api/curricula
// @access  Private/Admin
exports.createCurriculum = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, description, version, type, status, startYear, endYear, subjects } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Curriculum name is required'
    });
  }

  // Check for duplicate curriculum name and version
  const existingCurriculum = await prisma.curriculum.findFirst({
    where: {
      name: name,
      version: version || '',
      schoolId: req.school.id
    }
  });

  if (existingCurriculum) {
    return res.status(400).json({
      success: false,
      message: 'Curriculum with this name and version already exists'
    });
  }

  const curriculum = await prisma.curriculum.create({
    data: {
      name,
      description: description || null,
      version: version || null,
      type: type || 'STANDARD',
      status: status || 'DRAFT',
      startYear,
      endYear,
      schoolId: req.school.id,
      createdBy: req.user.id,
      implementationStatus: 'PLANNED',
      customizationLevel: 'FULL'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      globalCurriculum: {
        select: {
          id: true,
          name: true,
          provider: true,
          type: true
        }
      },
      _count: {
        select: {
          curriculumSubjects: true,
          classCurricula: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: curriculum,
    message: 'Curriculum created successfully'
  });
});

// @desc    Update curriculum
// @route   PUT /api/curricula/:id
// @access  Private/Admin
exports.updateCurriculum = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, description, version, type, status, startYear, endYear } = req.body;

  // Check if curriculum exists and belongs to school
  const existingCurriculum = await prisma.curriculum.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!existingCurriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  // Check for duplicate name and version if being updated
  if (name && version !== undefined && (name !== existingCurriculum.name || version !== existingCurriculum.version)) {
    const duplicateCurriculum = await prisma.curriculum.findFirst({
      where: {
        name: name,
        version: version || '',
        schoolId: req.school.id,
        id: { not: req.params.id }
      }
    });

    if (duplicateCurriculum) {
      return res.status(400).json({
        success: false,
        message: 'Curriculum with this name and version already exists'
      });
    }
  }

  const curriculum = await prisma.curriculum.update({
    where: {
      id: req.params.id
    },
    data: {
      ...(name && { name }),
      description: description !== undefined ? description : undefined,
      version: version !== undefined ? version : undefined,
      ...(type && { type }),
      ...(status && { status }),
      startYear: startYear !== undefined ? startYear : undefined,
      endYear: endYear !== undefined ? endYear : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      _count: {
        select: {
          curriculumSubjects: true,
          classCurricula: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: curriculum,
    message: 'Curriculum updated successfully'
  });
});

// @desc    Delete curriculum
// @route   DELETE /api/curricula/:id
// @access  Private/Admin
exports.deleteCurriculum = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Check if curriculum exists and belongs to school
  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  // Check if curriculum is referenced by classes
  const classCurricula = await prisma.classCurriculum.count({
    where: {
      curriculumId: req.params.id
    }
  });

  if (classCurricula > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete curriculum. It is currently assigned to classes.'
    });
  }

  await prisma.curriculum.delete({
    where: {
      id: req.params.id
    }
  });

  res.json({
    success: true,
    message: 'Curriculum deleted successfully'
  });
});

// @desc    Add subject to curriculum
// @route   POST /api/curricula/:id/subjects
// @access  Private/Admin
exports.addSubjectToCurriculum = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { subjectId, gradeLevel, term, hoursPerWeek, isCore, isOptional, prerequisites } = req.body;

  // Validate required fields
  if (!subjectId || !gradeLevel) {
    return res.status(400).json({
      success: false,
      message: 'Subject ID and grade level are required'
    });
  }

  // Verify curriculum exists
  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  // Verify subject exists
  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
      schoolId: req.school.id
    }
  });

  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Check for duplicate
  const existingCurriculumSubject = await prisma.curriculumSubject.findFirst({
    where: {
      curriculumId: req.params.id,
      subjectId: subjectId,
      gradeLevel: gradeLevel
    }
  });

  if (existingCurriculumSubject) {
    return res.status(400).json({
      success: false,
      message: 'Subject is already added to this curriculum for this grade level'
    });
  }

  const curriculumSubject = await prisma.curriculumSubject.create({
    data: {
      curriculumId: req.params.id,
      subjectId,
      gradeLevel,
      term,
      hoursPerWeek,
      isCore: isCore !== undefined ? isCore : true,
      isOptional: isOptional !== undefined ? isOptional : false,
      prerequisites: prerequisites || []
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: curriculumSubject,
    message: 'Subject added to curriculum successfully'
  });
});

// @desc    Get curriculum templates
// @route   GET /api/curricula/templates
// @access  Private
exports.getCurriculumTemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'cambridge-primary',
      name: 'Cambridge Primary',
      type: 'CAMBRIDGE',
      description: 'Cambridge Primary curriculum framework for ages 5-11',
      gradeRange: { start: 1, end: 6 }
    },
    {
      id: 'cambridge-secondary',
      name: 'Cambridge Secondary',
      type: 'CAMBRIDGE',
      description: 'Cambridge Secondary curriculum framework for ages 11-16',
      gradeRange: { start: 7, end: 11 }
    },
    {
      id: 'ib-primary',
      name: 'IB Primary Years Programme (PYP)',
      type: 'IB',
      description: 'International Baccalaureate Primary Years Programme',
      gradeRange: { start: 1, end: 5 }
    },
    {
      id: 'national-standard',
      name: 'National Standard Curriculum',
      type: 'NATIONAL',
      description: 'Standard national curriculum framework',
      gradeRange: { start: 1, end: 12 }
    },
    {
      id: 'stem-focused',
      name: 'STEM-Focused Curriculum',
      type: 'STEM',
      description: 'Science, Technology, Engineering, and Mathematics focused curriculum',
      gradeRange: { start: 6, end: 12 }
    }
  ];

  res.json({
    success: true,
    data: templates,
    message: 'Curriculum templates retrieved successfully'
  });
});

// @desc    Get curriculum progress tracking data
// @route   GET /api/curricula/:id/progress
// @access  Private
exports.getCurriculumProgress = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const { classId, academicYearId } = req.query;

  // Get curriculum with progress data
  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id,
      schoolId: req.school.id
    },
    include: {
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          learningObjectives: true,
          contentModules: true
        }
      },
      classCurricula: {
        where: {
          ...(classId && { classId }),
          ...(academicYearId && { academicYearId })
        },
        include: {
          class: {
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
      },
      progressTrackers: {
        where: {
          ...(classId && { classId }),
          ...(academicYearId && { academicYearId })
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
          class: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  // Calculate progress statistics
  const progressStats = {
    totalSubjects: curriculum.curriculumSubjects.length,
    totalObjectives: curriculum.curriculumSubjects.reduce(
      (sum, cs) => sum + cs.learningObjectives.length, 0
    ),
    totalModules: curriculum.curriculumSubjects.reduce(
      (sum, cs) => sum + cs.contentModules.length, 0
    ),
    classesImplementing: curriculum.classCurricula.length,
    studentsTracked: curriculum.progressTrackers.length
  };

  // Calculate average progress by class
  const progressByClass = {};
  curriculum.progressTrackers.forEach(tracker => {
    const classKey = tracker.class.id;
    if (!progressByClass[classKey]) {
      progressByClass[classKey] = {
        class: tracker.class,
        students: [],
        averageProgress: 0
      };
    }
    progressByClass[classKey].students.push({
      student: tracker.student,
      progress: tracker.overallProgress,
      status: tracker.progressionStatus
    });
  });

  // Calculate averages
  Object.keys(progressByClass).forEach(classKey => {
    const classData = progressByClass[classKey];
    classData.averageProgress = classData.students.reduce(
      (sum, s) => sum + s.progress, 0
    ) / classData.students.length;
  });

  res.json({
    success: true,
    data: {
      curriculum,
      statistics: progressStats,
      progressByClass: Object.values(progressByClass)
    },
    message: 'Curriculum progress retrieved successfully'
  });
});

// @desc    Update curriculum implementation status
// @route   PATCH /api/curricula/:id/implementation
// @access  Private/Admin
exports.updateImplementationStatus = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const { implementationStatus, adoptionDate, milestones } = req.body;

  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id,
      schoolId: req.school.id
    }
  });

  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  const updateData = {
    ...(implementationStatus && { implementationStatus }),
    ...(adoptionDate && { adoptionDate: new Date(adoptionDate) }),
  };

  // Update class curricula milestones if provided
  if (milestones) {
    await prisma.classCurriculum.updateMany({
      where: {
        curriculumId: id
      },
      data: {
        milestones
      }
    });
  }

  const updatedCurriculum = await prisma.curriculum.update({
    where: { id },
    data: updateData,
    include: {
      classCurricula: {
        include: {
          class: {
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
  });

  res.json({
    success: true,
    data: updatedCurriculum,
    message: 'Implementation status updated successfully'
  });
});

// @desc    Get curriculum analytics
// @route   GET /api/curricula/:id/analytics
// @access  Private
exports.getCurriculumAnalytics = asyncHandler(async (req, res) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const { academicYearId } = req.query;

  // Get curriculum with comprehensive data
  const curriculum = await prisma.curriculum.findFirst({
    where: {
      id,
      schoolId: req.school.id
    },
    include: {
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      classCurricula: {
        where: {
          ...(academicYearId && { academicYearId })
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              _count: {
                select: {
                  students: {
                    where: { status: 'ACTIVE' }
                  }
                }
              }
            }
          }
        }
      },
      progressTrackers: {
        where: {
          ...(academicYearId && { academicYearId })
        }
      }
    }
  });

  if (!curriculum) {
    return res.status(404).json({
      success: false,
      message: 'Curriculum not found'
    });
  }

  // Calculate analytics
  const totalStudents = curriculum.classCurricula.reduce(
    (sum, cc) => sum + cc.class._count.students, 0
  );

  const progressData = curriculum.progressTrackers;
  const averageProgress = progressData.length > 0 
    ? progressData.reduce((sum, p) => sum + p.overallProgress, 0) / progressData.length 
    : 0;

  // Progression status distribution
  const progressionStatusDistribution = {};
  progressData.forEach(tracker => {
    const status = tracker.progressionStatus;
    progressionStatusDistribution[status] = (progressionStatusDistribution[status] || 0) + 1;
  });

  // Subject-wise progress analysis
  const subjectProgress = {};
  progressData.forEach(tracker => {
    if (tracker.subjectProgress) {
      Object.entries(tracker.subjectProgress).forEach(([subjectId, progress]) => {
        if (!subjectProgress[subjectId]) {
          subjectProgress[subjectId] = {
            totalProgress: 0,
            studentCount: 0,
            subject: curriculum.curriculumSubjects.find(cs => cs.subjectId === subjectId)?.subject
          };
        }
        subjectProgress[subjectId].totalProgress += progress;
        subjectProgress[subjectId].studentCount += 1;
      });
    }
  });

  // Calculate averages for subject progress
  Object.keys(subjectProgress).forEach(subjectId => {
    const data = subjectProgress[subjectId];
    data.averageProgress = data.totalProgress / data.studentCount;
  });

  // Implementation timeline analysis
  const implementationMilestones = curriculum.classCurricula.map(cc => ({
    class: cc.class,
    status: cc.status,
    startDate: cc.startDate,
    endDate: cc.endDate,
    completionPercentage: cc.completionPercentage,
    milestones: cc.milestones
  }));

  const analytics = {
    overview: {
      totalSubjects: curriculum.curriculumSubjects.length,
      totalClasses: curriculum.classCurricula.length,
      totalStudents,
      studentsTracked: progressData.length,
      averageProgress: Math.round(averageProgress * 100) / 100,
      implementationStatus: curriculum.implementationStatus
    },
    progressDistribution: progressionStatusDistribution,
    subjectAnalysis: Object.values(subjectProgress),
    implementationTimeline: implementationMilestones,
    recommendations: generateRecommendations(progressData, averageProgress)
  };

  res.json({
    success: true,
    data: analytics,
    message: 'Curriculum analytics retrieved successfully'
  });
});

// Helper function to generate recommendations
function generateRecommendations(progressData, averageProgress) {
  const recommendations = [];

  if (averageProgress < 50) {
    recommendations.push({
      type: 'IMPROVEMENT_NEEDED',
      title: 'Below Average Progress',
      description: 'Overall curriculum progress is below 50%. Consider additional support or curriculum adjustments.',
      priority: 'HIGH'
    });
  }

  const strugglingStudents = progressData.filter(p => p.progressionStatus === 'BEHIND' || p.progressionStatus === 'AT_RISK');
  if (strugglingStudents.length > progressData.length * 0.2) {
    recommendations.push({
      type: 'INTERVENTION_REQUIRED',
      title: 'High Number of Struggling Students',
      description: `${strugglingStudents.length} students are behind or at risk. Consider targeted interventions.`,
      priority: 'HIGH'
    });
  }

  const advancedStudents = progressData.filter(p => p.progressionStatus === 'AHEAD');
  if (advancedStudents.length > progressData.length * 0.3) {
    recommendations.push({
      type: 'ENRICHMENT_OPPORTUNITY',
      title: 'Many Advanced Students',
      description: `${advancedStudents.length} students are ahead of schedule. Consider enrichment activities.`,
      priority: 'MEDIUM'
    });
  }

  return recommendations;
}
