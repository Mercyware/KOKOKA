const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Private
exports.getHouses = asyncHandler(async (req, res) => {
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
  const totalHouses = await prisma.house.count({
    where: whereClause
  });

  // Get paginated houses
  const houses = await prisma.house.findMany({
    where: whereClause,
    orderBy: {
      name: 'asc'
    },
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalHouses / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    count: houses.length,
    total: totalHouses,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    data: houses
  });
});

// @desc    Get single house
// @route   GET /api/houses/:id
// @access  Private
exports.getHouse = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const house = await prisma.house.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  // Get students in this house
  const students = await prisma.student.findMany({
    where: {
      houseId: house.id,
      schoolId: req.school.id
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      admissionNumber: true,
      currentClass: {
        select: {
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      ...house,
      students
    }
  });
});

// @desc    Create new house
// @route   POST /api/houses
// @access  Private
exports.createHouse = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, code, color, description } = req.body;

  // Check if house with this code already exists in this school
  const existingHouse = await prisma.house.findFirst({
    where: {
      code: code,
      schoolId: req.school.id
    }
  });

  if (existingHouse) {
    res.status(400);
    throw new Error('A house with this code already exists');
  }

  const house = await prisma.house.create({
    data: {
      name,
      code,
      color,
      description,
      schoolId: req.school.id
    }
  });

  res.status(201).json({
    success: true,
    data: house
  });
});

// @desc    Update house
// @route   PUT /api/houses/:id
// @access  Private
exports.updateHouse = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const house = await prisma.house.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  // Check if another house with the same code exists (excluding this one)
  if (req.body.code) {
    const existingHouse = await prisma.house.findFirst({
      where: {
        code: req.body.code,
        schoolId: req.school.id,
        id: { not: req.params.id }
      }
    });

    if (existingHouse) {
      res.status(400);
      throw new Error('A house with this code already exists');
    }
  }

  const updatedHouse = await prisma.house.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.code && { code: req.body.code }),
      ...(req.body.color !== undefined && { color: req.body.color }),
      ...(req.body.description !== undefined && { description: req.body.description })
    }
  });

  res.status(200).json({
    success: true,
    data: updatedHouse
  });
});

// @desc    Delete house
// @route   DELETE /api/houses/:id
// @access  Private
exports.deleteHouse = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const house = await prisma.house.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  // Check if there are students in this house
  const studentCount = await prisma.student.count({ 
    where: { houseId: house.id } 
  });
  
  if (studentCount > 0) {
    res.status(400);
    throw new Error('Cannot delete house with students. Please reassign students first.');
  }

  await prisma.house.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
