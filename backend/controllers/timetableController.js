const Timetable = require('../models/Timetable');
const timetableService = require('../services/timetableService');

// Get all timetables
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('class')
      .populate('teacher');
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('class')
      .populate('teacher');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new timetable
exports.createTimetable = async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    
    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('class')
      .populate('teacher');
    
    res.status(201).json(populatedTimetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update timetable
exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('class')
      .populate('teacher');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get timetable by class
exports.getTimetableByClass = async (req, res) => {
  try {
    const timetable = await Timetable.find({ class: req.params.classId })
      .populate('class')
      .populate('teacher');
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate optimized timetable
exports.generateTimetable = async (req, res) => {
  try {
    const { classId, constraints } = req.body;
    
    const generatedTimetable = await timetableService.generateOptimizedTimetable(
      classId,
      constraints
    );
    
    res.json(generatedTimetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
