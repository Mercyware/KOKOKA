const Term = require('../models/Term');
const AcademicYear = require('../models/AcademicYear');

// Get all terms
exports.getAllTerms = async (req, res) => {
  try {
    const terms = await Term.find()
      .populate('academicYear', 'name')
      .sort({ startDate: -1 });
    
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get term by ID
exports.getTermById = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id)
      .populate('academicYear', 'name');
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    
    res.json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new term
exports.createTerm = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the academic year exists
    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    const term = new Term(req.body);
    await term.save();
    
    res.status(201).json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update term
exports.updateTerm = async (req, res) => {
  try {
    // If academic year is being updated, verify it exists
    if (req.body.academicYear) {
      const academicYear = await AcademicYear.findById(req.body.academicYear);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
    }
    
    const term = await Term.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    
    res.json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete term
exports.deleteTerm = async (req, res) => {
  try {
    const term = await Term.findByIdAndDelete(req.params.id);
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    
    res.json({ message: 'Term deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get terms by academic year
exports.getTermsByAcademicYear = async (req, res) => {
  try {
    const terms = await Term.find({ academicYear: req.params.academicYearId })
      .sort({ startDate: 1 });
    
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current term
exports.getCurrentTerm = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const term = await Term.findOne({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).populate('academicYear', 'name');
    
    if (!term) {
      return res.status(404).json({ message: 'No current term found' });
    }
    
    res.json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set active term
exports.setActiveTerm = async (req, res) => {
  try {
    // First, set all terms to inactive
    await Term.updateMany({}, { isActive: false });
    
    // Then set the specified term to active
    const term = await Term.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    
    res.json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active term
exports.getActiveTerm = async (req, res) => {
  try {
    const term = await Term.findOne({ isActive: true })
      .populate('academicYear', 'name');
    
    if (!term) {
      return res.status(404).json({ message: 'No active term found' });
    }
    
    res.json(term);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
