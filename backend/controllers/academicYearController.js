const AcademicYear = require('../models/AcademicYear');
const AppError = require('../utils/appError');

// Get all academic years
exports.getAllAcademicYears = async (req, res) => {
  try {
    // Use school context from middleware - TEMPORARILY USING HARDCODED ID FOR TESTING
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    
    // TEMPORARILY DISABLED FOR TESTING
    // if (!schoolId) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: 'School context required' 
    //   });
    // }

    const academicYears = await AcademicYear.findBySchoolId(schoolId);
      
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
    const academicYear = await AcademicYear.findById(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    // Check if academic year belongs to current school context
    if (req.school?.id && academicYear.schoolId !== req.school.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
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

// Check if academic year name already exists
exports.checkAcademicYearName = async (req, res) => {
  try {
    const { name } = req.query;
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School context required',
      });
    }

    const academicYears = await AcademicYear.findBySchoolId(schoolId);
    const existingAcademicYear = academicYears.find(year => year.name === name);

    if (existingAcademicYear) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: 'Academic year name already exists for this school',
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      message: 'Academic year name is available',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new academic year
exports.createAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING
    const { name, startDate, endDate, isCurrent } = req.body;

    // Basic validation
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, start date, and end date are required'
      });
    }

    // TEMPORARILY DISABLED FOR TESTING
    // if (!schoolId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'School context required'
    //   });
    // }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Check if academic year duration is reasonable (should be between 6 months and 2 years)
    const durationInMonths = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (durationInMonths < 6 || durationInMonths > 24) {
      return res.status(400).json({
        success: false,
        message: 'Academic year duration should be between 6 months and 2 years'
      });
    }

    // Check for duplicate name within the same school
    const existingYears = await AcademicYear.findBySchoolId(schoolId);
    const duplicateName = existingYears.find(year => year.name === name);
    if (duplicateName) {
      return res.status(400).json({
        success: false,
        message: 'Academic year name already exists for this school'
      });
    }

    // Check for overlapping academic years in the same school
    const overlappingYear = existingYears.find(year => {
      const yearStart = new Date(year.startDate);
      const yearEnd = new Date(year.endDate);
      
      return (
        // New year starts within existing year
        (start >= yearStart && start <= yearEnd) ||
        // New year ends within existing year
        (end >= yearStart && end <= yearEnd) ||
        // Existing year is completely within new year
        (yearStart >= start && yearEnd <= end)
      );
    });

    if (overlappingYear) {
      return res.status(400).json({
        success: false,
        message: `Academic year dates overlap with existing year: ${overlappingYear.name}`
      });
    }

    // Create the academic year
    const academicYear = await AcademicYear.create({
      name: name.trim(),
      startDate,
      endDate,
      isCurrent: isCurrent || false,
      schoolId
    });
    
    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      data: academicYear
    });
  } catch (error) {
    console.error('Error creating academic year:', error);
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
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING
    const { id } = req.params;

    // Check if academic year exists
    const existingYear = await AcademicYear.findById(id);
    if (!existingYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    // Check school context
    if (schoolId && existingYear.schoolId !== schoolId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    // Check for duplicate name if name is being updated
    if (req.body.name && req.body.name !== existingYear.name) {
      const schoolYears = await AcademicYear.findBySchoolId(existingYear.schoolId);
      const duplicateName = schoolYears.find(year => year.name === req.body.name && year.id !== id);
      
      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: 'An academic year with this name already exists for the school'
        });
      }
    }

    const academicYear = await AcademicYear.updateById(id, req.body);
    
    res.json({
      success: true,
      message: 'Academic year updated successfully',
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

// Delete academic year
exports.deleteAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING
    const { id } = req.params;

    // Check if academic year exists
    const existingYear = await AcademicYear.findById(id);
    if (!existingYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    // Check school context
    if (schoolId && existingYear.schoolId !== schoolId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    await AcademicYear.deleteById(id);
    
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

// Get current academic year
exports.getCurrentAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING
    const currentDate = new Date();
    
    // TEMPORARILY DISABLED FOR TESTING
    // if (!schoolId) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: 'School context required' 
    //   });
    // }
    
    const academicYears = await AcademicYear.findBySchoolId(schoolId);
    const currentYear = academicYears.find(year => {
      const startDate = new Date(year.startDate);
      const endDate = new Date(year.endDate);
      return currentDate >= startDate && currentDate <= endDate;
    });
    
    if (!currentYear) {
      return res.status(404).json({ 
        success: false,
        message: 'No current academic year found' 
      });
    }
    
    res.json({
      success: true,
      data: currentYear
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Set active academic year
exports.setActiveAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING
    const { id } = req.params;

    // Check if the academic year exists
    const targetAcademicYear = await AcademicYear.findById(id);
    
    if (!targetAcademicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }

    // Check school context
    if (schoolId && targetAcademicYear.schoolId !== schoolId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    // Set the specified academic year to current (this will automatically deactivate others)
    const academicYear = await AcademicYear.updateById(id, { isCurrent: true });
    
    res.json({
      success: true,
      message: 'Academic year set as current successfully',
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

// Get active academic year
exports.getActiveAcademicYear = async (req, res) => {
  try {
    const schoolId = req.school?.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TEMPORARILY USING HARDCODED UUID FOR TESTING

    // TEMPORARILY DISABLED FOR TESTING
    // if (!schoolId) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: 'School context required' 
    //   });
    // }

    const academicYear = await AcademicYear.findCurrentBySchoolId(schoolId);
    
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
