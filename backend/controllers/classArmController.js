const ClassArm = require('../models/ClassArm');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const Staff = require('../models/Staff');

// Get all class arms
exports.getAllClassArms = async (req, res) => {
  try {
    const classArms = await ClassArm.find()
      .sort({ name: 1 });
    
    res.json({ data: classArms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class arm by ID
exports.getClassArmById = async (req, res) => {
  try {
    const classArm = await ClassArm.findById(req.params.id);
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    res.json({ data: classArm });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new class arm
exports.createClassArm = async (req, res) => {
  try {
    // Extract only name and description from request body
    const { name, description } = req.body;
    
    // Create new class arm with only name, description, and required school field
    const classArm = new ClassArm({
      name,
      description,
      school: req.user.school // Get school from authenticated user
    });
    
    await classArm.save();
    
    res.status(201).json({ data: classArm });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update class arm
exports.updateClassArm = async (req, res) => {
  try {
    // Extract only name and description from request body
    const { name, description } = req.body;
    
    // Create update object with only allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const classArm = await ClassArm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    res.json({ data: classArm });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete class arm
exports.deleteClassArm = async (req, res) => {
  try {
    const classArm = await ClassArm.findByIdAndDelete(req.params.id);
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    res.json({ message: 'Class arm deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get students in class arm
exports.getClassArmStudents = async (req, res) => {
  try {
    const classArm = await ClassArm.findById(req.params.id);
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    // Use the virtual to get students
    await classArm.populate('students');
    
    res.json({ data: classArm.students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
