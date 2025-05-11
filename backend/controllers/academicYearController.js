const AcademicYear = require('../models/AcademicYear');

// Get all academic years
exports.getAllAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ startDate: -1 });
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
exports.checkAcademicYearName = async (req, res, next) => {
  const { name, school } = req.query;

  if (!name || !school) {
    return res.status(400).json({
      success: false,
      message: 'Name and school are required',
    });
  }

  const existingAcademicYear = await AcademicYear.findOne({ name, school });

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
};

// Create new academic year
exports.createAcademicYear = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    const { name, school } = req.body;

  // Validate if the name already exists for the school
  const existingAcademicYear = await AcademicYear.findOne({ name, school });

  if (existingAcademicYear) {
    return next(new AppError('Academic year name already exists for this school', 400));
  }

    const academicYear = new AcademicYear(req.body);
    await academicYear.save();
    
    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
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
    // Check for duplicate name
    const existingAcademicYear = await AcademicYear.findOne({
      name: req.body.name,
      school: req.body.school,
      _id: { $ne: req.params.id } // Exclude the current academic year
    });

    if (existingAcademicYear) {
      return res.status(400).json({
        success: false,
        message: 'An academic year with this name already exists for the school'
      });
    }

    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }
    
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
    const academicYear = await AcademicYear.findByIdAndDelete(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }
    
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
    const currentDate = new Date();
    
    const academicYear = await AcademicYear.findOne({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
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

// Set active academic year
exports.setActiveAcademicYear = async (req, res) => {
  try {
    // First, set all academic years to inactive
    await AcademicYear.updateMany({}, { isActive: false });
    
    // Then set the specified academic year to active
    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Academic year set as active successfully',
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
    const academicYear = await AcademicYear.findOne({ isActive: true });
    
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'No active academic year found' 
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
