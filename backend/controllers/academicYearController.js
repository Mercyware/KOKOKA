const { prisma } = require('../config/database');

// Helper function to validate academic year date conflicts
const validateAcademicYearDates = async (schoolId, startDate, endDate, excludeId = null) => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Validate date range
  if (startDateObj >= endDateObj) {
    return {
      isValid: false,
      message: 'End date must be after start date'
    };
  }

  // Check for overlapping academic years
  const whereClause = {
    schoolId,
    OR: [
      // New year starts within existing year
      {
        AND: [
          { startDate: { lte: startDateObj } },
          { endDate: { gte: startDateObj } }
        ]
      },
      // New year ends within existing year  
      {
        AND: [
          { startDate: { lte: endDateObj } },
          { endDate: { gte: endDateObj } }
        ]
      },
      // New year completely contains existing year
      {
        AND: [
          { startDate: { gte: startDateObj } },
          { endDate: { lte: endDateObj } }
        ]
      },
      // Existing year completely contains new year
      {
        AND: [
          { startDate: { lte: startDateObj } },
          { endDate: { gte: endDateObj } }
        ]
      }
    ]
  };

  // Exclude specific ID if provided (for updates)
  if (excludeId) {
    whereClause.id = { not: excludeId };
  }

  const conflictingYear = await prisma.academicYear.findFirst({
    where: whereClause
  });

  if (conflictingYear) {
    return {
      isValid: false,
      message: `Academic year dates conflict with existing year "${conflictingYear.name}" (${conflictingYear.startDate.toISOString().split('T')[0]} to ${conflictingYear.endDate.toISOString().split('T')[0]})`
    };
  }

  return { isValid: true };
};

// Get all academic years
exports.getAllAcademicYears = async (req, res) => {
  try {
    // Use school context from middleware
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School context required'
      });
    }

    // Extract pagination and sorting parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'startDate';
    const order = req.query.order || 'desc';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build orderBy object
    const orderBy = {};
    orderBy[sort] = order;

    // Get total count for pagination
    const total = await prisma.academicYear.count({
      where: { schoolId }
    });

    // Get paginated academic years
    const academicYears = await prisma.academicYear.findMany({
      where: { schoolId },
      orderBy,
      skip,
      take: limit
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        academicYears,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get academic year by ID
exports.getAcademicYearById = async (req, res) => {
  try {
    const academicYear = await prisma.academicYear.findFirst({
      where: { 
        id: req.params.id,
        schoolId: req.school?.id 
      }
    });
    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create academic year
exports.createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate, isCurrent = false } = req.body;
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    // Check if academic year with same name exists
    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        name,
        schoolId 
      }
    });

    if (existingYear) {
      return res.status(400).json({ 
        success: false,
        message: 'Academic year with this name already exists' 
      });
    }

    // Validate academic year dates
    const dateValidation = await validateAcademicYearDates(schoolId, startDate, endDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: dateValidation.message 
      });
    }

    // Check if there's already a current academic year if trying to set as current
    if (isCurrent) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { 
          schoolId,
          isCurrent: true 
        }
      });

      if (currentYear) {
        return res.status(400).json({ 
          success: false,
          message: 'There is already a current academic year. Please set the existing current year as inactive first.' 
        });
      }
    }

    // If this is the first academic year for the school, make it current
    const existingYears = await prisma.academicYear.count({
      where: { schoolId }
    });

    const shouldBeCurrentByDefault = existingYears === 0;

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        schoolId,
        isCurrent: isCurrent || shouldBeCurrentByDefault
      }
    });

    res.status(201).json({
      success: true,
      data: academicYear,
      message: academicYear.isCurrent ? 'Academic year created and set as current' : 'Academic year created successfully'
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false,
        message: 'There is already a current academic year for this school. Only one academic year can be current at a time.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update academic year
exports.updateAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    // Check if academic year exists
    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        id: req.params.id,
        schoolId 
      }
    });

    if (!existingYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    // Check if another academic year with same name exists
    if (name && name !== existingYear.name) {
      const duplicateName = await prisma.academicYear.findFirst({
        where: { 
          name,
          schoolId,
          id: { not: req.params.id }
        }
      });

      if (duplicateName) {
        return res.status(400).json({ 
          success: false,
          message: 'Academic year with this name already exists' 
        });
      }
    }

    // Check for date conflicts if dates are being updated
    if (startDate || endDate) {
      const startDateToCheck = startDate || existingYear.startDate.toISOString();
      const endDateToCheck = endDate || existingYear.endDate.toISOString();

      const dateValidation = await validateAcademicYearDates(
        schoolId, 
        startDateToCheck, 
        endDateToCheck, 
        req.params.id
      );
      
      if (!dateValidation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: dateValidation.message 
        });
      }
    }

    const updatedYear = await prisma.academicYear.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      }
    });

    res.json({
      success: true,
      data: updatedYear
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete academic year
exports.deleteAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        id: req.params.id,
        schoolId 
      }
    });

    if (!existingYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    await prisma.academicYear.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Academic year deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Set current academic year
exports.setCurrentAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id;
    const academicYearId = req.params.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    // Verify the academic year exists and belongs to this school
    const targetYear = await prisma.academicYear.findFirst({
      where: { 
        id: academicYearId,
        schoolId 
      }
    });

    if (!targetYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found or does not belong to this school' 
      });
    }

    // If already current, no need to change
    if (targetYear.isCurrent) {
      return res.json({
        success: true,
        data: targetYear,
        message: 'Academic year is already set as current'
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // First, set all academic years for this school to not current
      await tx.academicYear.updateMany({
        where: {
          schoolId,
          isCurrent: true
        },
        data: { isCurrent: false }
      });

      // Then set the target academic year as current
      return await tx.academicYear.update({
        where: { id: academicYearId },
        data: { isCurrent: true }
      });
    });

    res.json({
      success: true,
      data: result,
      message: 'Current academic year updated successfully'
    });
  } catch (error) {
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get current academic year
exports.getCurrentAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { 
        schoolId,
        isCurrent: true
      }
    });

    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'No current academic year found' 
      });
    }

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Check academic year name (for validation)
exports.checkAcademicYearName = async (req, res) => {
  try {
    const { name } = req.query;
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        name,
        schoolId 
      }
    });

    res.json({
      success: true,
      exists: !!existingYear
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get active academic year (alias for getCurrentAcademicYear)
exports.getActiveAcademicYear = exports.getCurrentAcademicYear;

// Set active academic year (alias for setCurrentAcademicYear)
exports.setActiveAcademicYear = exports.setCurrentAcademicYear;

// Get terms for an academic year
exports.getTermsForAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const schoolId = req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    // Verify the academic year exists and belongs to the school
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        id: academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    const terms = await prisma.term.findMany({
      where: {
        academicYearId,
        schoolId
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Get terms for academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms',
      error: error.message
    });
  }
};
