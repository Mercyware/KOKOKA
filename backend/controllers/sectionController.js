const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all sections
// @route   GET /api/sections
// @access  Private
exports.getSections = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Extract search parameter
  const search = req.query.search || '';
  
  // Build where clause
  const whereClause = {
    schoolId: req.school.id,
    ...(search && {
      name: { contains: search, mode: 'insensitive' }
    })
  };

  // Get total count for pagination
  const totalSections = await prisma.section.count({
    where: whereClause
  });

  // Get paginated sections
  const sections = await prisma.section.findMany({
    where: whereClause,
    orderBy: {
      name: 'asc'
    },
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalSections / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    count: sections.length,
    total: totalSections,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    data: sections
  });
});

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Private
exports.getSection = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const section = await prisma.section.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Create new section
// @route   POST /api/sections
// @access  Private
exports.createSection = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Check if section with same name already exists in this school
  const existingSection = await prisma.section.findFirst({
    where: {
      name: req.body.name,
      schoolId: req.school.id
    }
  });

  if (existingSection) {
    res.status(400);
    throw new Error('A section with this name already exists');
  }

  const section = await prisma.section.create({
    data: {
      name: req.body.name,
      capacity: req.body.capacity,
      description: req.body.description,
      schoolId: req.school.id
    }
  });

  res.status(201).json({
    success: true,
    data: section
  });
});

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private
exports.updateSection = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const section = await prisma.section.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  // Check if another section with the same name exists (excluding this one)
  if (req.body.name) {
    const existingSection = await prisma.section.findFirst({
      where: {
        name: req.body.name,
        schoolId: req.school.id,
        id: { not: req.params.id }
      }
    });

    if (existingSection) {
      res.status(400);
      throw new Error('A section with this name already exists');
    }
  }

  const updatedSection = await prisma.section.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.capacity && { capacity: req.body.capacity }),
      ...(req.body.description !== undefined && { description: req.body.description })
    }
  });

  res.status(200).json({
    success: true,
    data: updatedSection
  });
});

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private
exports.deleteSection = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const section = await prisma.section.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  await prisma.section.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
