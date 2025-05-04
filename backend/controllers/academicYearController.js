const AcademicYear = require('../models/AcademicYear');

// Get all academic years
exports.getAllAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ startDate: -1 });
    res.json(academicYears);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get academic year by ID
exports.getAcademicYearById = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new academic year
exports.createAcademicYear = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    const academicYear = new AcademicYear(req.body);
    await academicYear.save();
    
    res.status(201).json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update academic year
exports.updateAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete academic year
exports.deleteAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByIdAndDelete(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    res.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      return res.status(404).json({ message: 'No current academic year found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active academic year
exports.getActiveAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findOne({ isActive: true });
    
    if (!academicYear) {
      return res.status(404).json({ message: 'No active academic year found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
