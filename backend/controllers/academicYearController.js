const { prisma } = require('../config/database');

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

    const academicYears = await prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' }
    });
      
    res.json({
      success: true,
      data: academicYears
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
    const { name, startDate, endDate } = req.body;
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

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        schoolId
      }
    });

    res.status(201).json({
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

    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School context required' 
      });
    }

    // First, set all academic years for this school to not current
    await prisma.academicYear.updateMany({
      where: { schoolId },
      data: { isCurrent: false }
    });

    // Then set the target academic year as current
    const targetYear = await prisma.academicYear.update({
      where: { id: req.params.id },
      data: { isCurrent: true }
    });

    res.json({
      success: true,
      data: targetYear,
      message: 'Current academic year updated successfully'
    });
  } catch (error) {
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
