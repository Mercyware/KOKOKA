const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin
exports.getAllDepartments = asyncHandler(async (req, res) => {
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
  const totalDepartments = await prisma.department.count({
    where: whereClause
  });

  // Get paginated departments
  const departments = await prisma.department.findMany({
    where: whereClause,
    orderBy: {
      name: 'asc'
    },
    skip,
    take: limit
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalDepartments / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    count: departments.length,
    total: totalDepartments,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    data: departments
  });
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private/Admin
exports.getDepartmentById = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const department = await prisma.department.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  res.status(200).json({
    success: true,
    data: department
  });
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { name, code, description, headOfDept } = req.body;
  
  // Check if department with this code already exists in this school
  const existingDepartment = await prisma.department.findFirst({
    where: {
      code: code,
      schoolId: req.school.id
    }
  });

  if (existingDepartment) {
    res.status(400);
    throw new Error('A department with this code already exists');
  }
  
  const department = await prisma.department.create({
    data: {
      name,
      code,
      description,
      headOfDept,
      schoolId: req.school.id
    }
  });
  
  res.status(201).json({
    success: true,
    data: department
  });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const department = await prisma.department.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  // Check if another department with the same code exists (excluding this one)
  if (req.body.code) {
    const existingDepartment = await prisma.department.findFirst({
      where: {
        code: req.body.code,
        schoolId: req.school.id,
        id: { not: req.params.id }
      }
    });

    if (existingDepartment) {
      res.status(400);
      throw new Error('A department with this code already exists');
    }
  }
  
  const updatedDepartment = await prisma.department.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.code && { code: req.body.code }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.headOfDept !== undefined && { headOfDept: req.body.headOfDept })
    }
  });
  
  res.status(200).json({
    success: true,
    data: updatedDepartment
  });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const department = await prisma.department.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  // Check if any staff or teachers are assigned to this department
  const [staffCount, teacherCount, subjectCount] = await Promise.all([
    prisma.staff.count({ where: { departmentId: department.id } }),
    prisma.teacher.count({ where: { departmentId: department.id } }),
    prisma.subject.count({ where: { departmentId: department.id } })
  ]);
  
  if (staffCount > 0 || teacherCount > 0) {
    res.status(400);
    throw new Error('Cannot delete department with assigned staff or teachers. Please reassign them first.');
  }
  
  if (subjectCount > 0) {
    res.status(400);
    throw new Error('Cannot delete department with assigned subjects. Please reassign them first.');
  }
  
  await prisma.department.delete({
    where: { id: req.params.id }
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff by department
// @route   GET /api/departments/:id/staff
// @access  Private/Admin
exports.getStaffByDepartment = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const department = await prisma.department.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });
  
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  const [staff, teachers] = await Promise.all([
    prisma.staff.findMany({ 
      where: { 
        departmentId: department.id,
        schoolId: req.school.id 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    }),
    prisma.teacher.findMany({ 
      where: { 
        departmentId: department.id,
        schoolId: req.school.id 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      staff,
      teachers,
      totalCount: staff.length + teachers.length
    }
  });
});

// @desc    Assign head to department
// @route   PUT /api/departments/:id/head
// @access  Private/Admin
exports.assignDepartmentHead = asyncHandler(async (req, res) => {
  // Check if req.school exists
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  const { headOfDept } = req.body;
  
  if (!headOfDept) {
    res.status(400);
    throw new Error('Head of department name is required');
  }
  
  const department = await prisma.department.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  
  const updatedDepartment = await prisma.department.update({
    where: { id: req.params.id },
    data: { headOfDept }
  });
  
  res.status(200).json({
    success: true,
    data: updatedDepartment
  });
});
