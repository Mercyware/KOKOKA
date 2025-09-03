const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all global curriculum templates
// @route   GET /api/global-curricula
// @access  Public (but filtered based on licensing)
exports.getGlobalCurricula = asyncHandler(async (req, res) => {
  // Extract pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Extract filters
  const search = req.query.search || '';
  const type = req.query.type || '';
  const country = req.query.country || '';
  const provider = req.query.provider || '';
  const difficulty = req.query.difficulty || '';
  const minGrade = req.query.minGrade ? parseInt(req.query.minGrade) : null;
  const maxGrade = req.query.maxGrade ? parseInt(req.query.maxGrade) : null;

  // Build where clause
  const whereClause = {
    status: 'ACTIVE',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }),
    ...(type && { type: type }),
    ...(country && { country: { contains: country, mode: 'insensitive' } }),
    ...(provider && { provider: { contains: provider, mode: 'insensitive' } }),
    ...(difficulty && { difficulty: difficulty }),
    ...(minGrade && { minGrade: { gte: minGrade } }),
    ...(maxGrade && { maxGrade: { lte: maxGrade } })
  };

  // Get total count
  const totalCurricula = await prisma.globalCurriculum.count({ where: whereClause });

  // Get curricula with subjects
  const globalCurricula = await prisma.globalCurriculum.findMany({
    where: whereClause,
    include: {
      globalSubjects: {
        select: {
          id: true,
          name: true,
          code: true,
          gradeLevel: true,
          category: true,
          isCore: true,
          displayOrder: true
        },
        orderBy: [
          { gradeLevel: 'asc' },
          { displayOrder: 'asc' }
        ]
      },
      _count: {
        select: {
          schoolCurricula: true,
          globalSubjects: true
        }
      }
    },
    orderBy: [
      { isOfficial: 'desc' },
      { adoptionCount: 'desc' },
      { name: 'asc' }
    ],
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalCurricula / limit);

  res.json({
    success: true,
    data: globalCurricula,
    message: `Retrieved ${globalCurricula.length} global curricula`,
    pagination: {
      page,
      limit,
      total: totalCurricula,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get single global curriculum by ID
// @route   GET /api/global-curricula/:id
// @access  Public
exports.getGlobalCurriculumById = asyncHandler(async (req, res) => {
  const globalCurriculum = await prisma.globalCurriculum.findUnique({
    where: { id: req.params.id },
    include: {
      globalSubjects: {
        include: {
          _count: true
        },
        orderBy: [
          { gradeLevel: 'asc' },
          { displayOrder: 'asc' }
        ]
      },
      _count: {
        select: {
          schoolCurricula: true
        }
      }
    }
  });

  if (!globalCurriculum) {
    return res.status(404).json({
      success: false,
      message: 'Global curriculum not found'
    });
  }

  res.json({
    success: true,
    data: globalCurriculum,
    message: 'Global curriculum retrieved successfully'
  });
});

// @desc    Create global curriculum template
// @route   POST /api/global-curricula
// @access  Private/Super Admin
exports.createGlobalCurriculum = asyncHandler(async (req, res) => {
  // Only super admins can create global curricula
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin role required.'
    });
  }

  const {
    name,
    description,
    version,
    type,
    provider,
    country,
    language,
    minGrade,
    maxGrade,
    framework,
    standards,
    assessmentTypes,
    isOfficial,
    licenseType,
    tags,
    difficulty,
    subjects
  } = req.body;

  // Validate required fields
  if (!name || !provider) {
    return res.status(400).json({
      success: false,
      message: 'Name and provider are required'
    });
  }

  // Check for duplicate name
  const existingCurriculum = await prisma.globalCurriculum.findUnique({
    where: { name }
  });

  if (existingCurriculum) {
    return res.status(400).json({
      success: false,
      message: 'A global curriculum with this name already exists'
    });
  }

  // Create global curriculum with subjects in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create the global curriculum
    const globalCurriculum = await prisma.globalCurriculum.create({
      data: {
        name,
        description,
        version,
        type: type || 'STANDARD',
        provider,
        country,
        language: language || 'en',
        minGrade: minGrade || 1,
        maxGrade: maxGrade || 12,
        framework,
        standards,
        assessmentTypes,
        isOfficial: isOfficial || false,
        licenseType: licenseType || 'FREE',
        tags: tags || [],
        difficulty: difficulty || 'STANDARD'
      }
    });

    // Create subjects if provided
    if (subjects && Array.isArray(subjects)) {
      const subjectsData = subjects.map(subject => ({
        globalCurriculumId: globalCurriculum.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        gradeLevel: subject.gradeLevel,
        term: subject.term,
        recommendedHours: subject.recommendedHours,
        isCore: subject.isCore !== undefined ? subject.isCore : true,
        isOptional: subject.isOptional !== undefined ? subject.isOptional : false,
        category: subject.category,
        learningOutcomes: subject.learningOutcomes,
        keyTopics: subject.keyTopics,
        skillsFramework: subject.skillsFramework,
        prerequisites: subject.prerequisites || [],
        followUpSubjects: subject.followUpSubjects || [],
        assessmentWeights: subject.assessmentWeights,
        gradingScale: subject.gradingScale,
        displayOrder: subject.displayOrder || 0
      }));

      await prisma.globalCurriculumSubject.createMany({
        data: subjectsData
      });
    }

    return globalCurriculum;
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Global curriculum created successfully'
  });
});

// @desc    Update global curriculum
// @route   PUT /api/global-curricula/:id
// @access  Private/Super Admin
exports.updateGlobalCurriculum = asyncHandler(async (req, res) => {
  // Only super admins can update global curricula
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin role required.'
    });
  }

  const { id } = req.params;
  const updateData = req.body;

  // Check if curriculum exists
  const existingCurriculum = await prisma.globalCurriculum.findUnique({
    where: { id }
  });

  if (!existingCurriculum) {
    return res.status(404).json({
      success: false,
      message: 'Global curriculum not found'
    });
  }

  // Update the curriculum
  const updatedCurriculum = await prisma.globalCurriculum.update({
    where: { id },
    data: {
      ...updateData,
      // Ensure certain fields are properly typed
      ...(updateData.tags && { tags: updateData.tags }),
      ...(updateData.framework && { framework: updateData.framework }),
      ...(updateData.standards && { standards: updateData.standards }),
      ...(updateData.assessmentTypes && { assessmentTypes: updateData.assessmentTypes })
    },
    include: {
      globalSubjects: true,
      _count: {
        select: {
          schoolCurricula: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: updatedCurriculum,
    message: 'Global curriculum updated successfully'
  });
});

// @desc    Delete global curriculum
// @route   DELETE /api/global-curricula/:id
// @access  Private/Super Admin
exports.deleteGlobalCurriculum = asyncHandler(async (req, res) => {
  // Only super admins can delete global curricula
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin role required.'
    });
  }

  const { id } = req.params;

  // Check if curriculum exists
  const existingCurriculum = await prisma.globalCurriculum.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          schoolCurricula: true
        }
      }
    }
  });

  if (!existingCurriculum) {
    return res.status(404).json({
      success: false,
      message: 'Global curriculum not found'
    });
  }

  // Check if any schools are using this curriculum
  if (existingCurriculum._count.schoolCurricula > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete curriculum. It is currently adopted by ${existingCurriculum._count.schoolCurricula} school(s).`
    });
  }

  // Delete the curriculum (subjects will be deleted by cascade)
  await prisma.globalCurriculum.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Global curriculum deleted successfully'
  });
});

// @desc    Adopt global curriculum template for a school
// @route   POST /api/global-curricula/:id/adopt
// @access  Private/Admin
exports.adoptGlobalCurriculum = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { id } = req.params;
  const { customizations, name, description } = req.body;

  // Get global curriculum with subjects
  const globalCurriculum = await prisma.globalCurriculum.findUnique({
    where: { id },
    include: {
      globalSubjects: true
    }
  });

  if (!globalCurriculum) {
    return res.status(404).json({
      success: false,
      message: 'Global curriculum template not found'
    });
  }

  // Create school curriculum based on template
  const result = await prisma.$transaction(async (prisma) => {
    // Create school curriculum
    const schoolCurriculum = await prisma.curriculum.create({
      data: {
        name: name || `${globalCurriculum.name} - ${req.school.name}`,
        description: description || `Adopted from ${globalCurriculum.name}`,
        version: globalCurriculum.version,
        type: globalCurriculum.type,
        status: 'DRAFT',
        schoolId: req.school.id,
        globalCurriculumId: globalCurriculum.id,
        customizationLevel: customizations ? 'MODERATE' : 'MINIMAL',
        originalTemplate: globalCurriculum,
        createdBy: req.user.id
      }
    });

    // Get or create school subjects and map to curriculum subjects
    for (const globalSubject of globalCurriculum.globalSubjects) {
      // Try to find existing subject by code
      let schoolSubject = await prisma.subject.findFirst({
        where: {
          schoolId: req.school.id,
          code: globalSubject.code
        }
      });

      // Create subject if it doesn't exist
      if (!schoolSubject) {
        schoolSubject = await prisma.subject.create({
          data: {
            name: globalSubject.name,
            code: globalSubject.code,
            description: globalSubject.description,
            schoolId: req.school.id
          }
        });
      }

      // Create curriculum subject mapping
      await prisma.curriculumSubject.create({
        data: {
          curriculumId: schoolCurriculum.id,
          subjectId: schoolSubject.id,
          gradeLevel: globalSubject.gradeLevel,
          term: globalSubject.term,
          hoursPerWeek: globalSubject.recommendedHours,
          isCore: globalSubject.isCore,
          isOptional: globalSubject.isOptional,
          prerequisites: globalSubject.prerequisites || [],
          displayOrder: globalSubject.displayOrder
        }
      });
    }

    // Increment adoption count
    await prisma.globalCurriculum.update({
      where: { id },
      data: {
        adoptionCount: {
          increment: 1
        }
      }
    });

    return schoolCurriculum;
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Global curriculum adopted successfully'
  });
});

// @desc    Get curriculum adoption statistics
// @route   GET /api/global-curricula/stats
// @access  Public
exports.getGlobalCurriculumStats = asyncHandler(async (req, res) => {
  const stats = await prisma.globalCurriculum.aggregate({
    _count: {
      id: true
    },
    _sum: {
      adoptionCount: true
    }
  });

  const typeStats = await prisma.globalCurriculum.groupBy({
    by: ['type'],
    _count: {
      id: true
    },
    _sum: {
      adoptionCount: true
    }
  });

  const providerStats = await prisma.globalCurriculum.groupBy({
    by: ['provider'],
    _count: {
      id: true
    },
    _sum: {
      adoptionCount: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  });

  res.json({
    success: true,
    data: {
      totalCurricula: stats._count.id || 0,
      totalAdoptions: stats._sum.adoptionCount || 0,
      byType: typeStats,
      topProviders: providerStats
    },
    message: 'Global curriculum statistics retrieved successfully'
  });
});

// @desc    Search global curriculum subjects
// @route   GET /api/global-curricula/:id/subjects
// @access  Public
exports.getGlobalCurriculumSubjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { gradeLevel, category } = req.query;

  const whereClause = {
    globalCurriculumId: id,
    ...(gradeLevel && { gradeLevel: parseInt(gradeLevel) }),
    ...(category && { category: { contains: category, mode: 'insensitive' } })
  };

  const subjects = await prisma.globalCurriculumSubject.findMany({
    where: whereClause,
    orderBy: [
      { gradeLevel: 'asc' },
      { displayOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: subjects,
    message: `Retrieved ${subjects.length} subjects`
  });
});