const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');



// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getAllSubjects = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  
  // Extract search parameter
  const search = req.query.search || '';
  
  // Build where clause
  const whereClause = {
    schoolId: req.school.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  // Get total count for pagination
  const totalSubjects = await prisma.subject.count({
    where: whereClause
  });

  // Get paginated subjects
  const subjects = await prisma.subject.findMany({
    where: whereClause,
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    },
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalSubjects / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: subjects,
    message: `Retrieved ${subjects.length} subjects`,
    pagination: {
      page,
      limit,
      totalSubjects,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  });
});
// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubjectById = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  });
  
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }
  
  res.json({
    success: true,
    data: subject,
    message: 'Subject retrieved successfully'
  });
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, code, description, departmentId } = req.body;

  // Validate required fields
  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: 'Name and code are required'
    });
  }

  // Check for duplicate code in the same school
  const existingSubject = await prisma.subject.findFirst({
    where: {
      code: code,
      schoolId: req.school.id
    }
  });

  if (existingSubject) {
    return res.status(400).json({
      success: false,
      message: 'Subject with this code already exists'
    });
  }

  // Verify department exists if provided
  if (departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        schoolId: req.school.id
      }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      description: description || null,
      schoolId: req.school.id,
      departmentId: departmentId || null
    },
    include: {
      department: {
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
    data: subject,
    message: 'Subject created successfully'
  });
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, code, description, departmentId } = req.body;

  // Check if subject exists and belongs to school
  const existingSubject = await prisma.subject.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!existingSubject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Check for duplicate code if code is being updated
  if (code && code !== existingSubject.code) {
    const duplicateSubject = await prisma.subject.findFirst({
      where: {
        code: code,
        schoolId: req.school.id,
        id: { not: req.params.id }
      }
    });

    if (duplicateSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }
  }

  // Verify department exists if provided
  if (departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        schoolId: req.school.id
      }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
  }

  const subject = await prisma.subject.update({
    where: {
      id: req.params.id
    },
    data: {
      ...(name && { name }),
      ...(code && { code }),
      description: description !== undefined ? description : undefined,
      departmentId: departmentId !== undefined ? departmentId : undefined
    },
    include: {
      department: {
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
    data: subject,
    message: 'Subject updated successfully'
  });
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Check if subject exists and belongs to school
  const subject = await prisma.subject.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Check if subject is referenced by other entities
  const teacherSubjects = await prisma.teacherSubject.count({
    where: {
      subjectId: req.params.id
    }
  });

  const assessments = await prisma.assessment.count({
    where: {
      subjectId: req.params.id
    }
  });

  if (teacherSubjects > 0 || assessments > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete subject. It is referenced by teacher assignments or assessments.'
    });
  }

  await prisma.subject.delete({
    where: {
      id: req.params.id
    }
  });

  res.json({
    success: true,
    message: 'Subject deleted successfully'
  });
});

