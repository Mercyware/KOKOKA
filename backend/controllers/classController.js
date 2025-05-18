const Class = require('../models/Class');
const Subject = require('../models/Subject');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('subjects', 'name code')
      .sort({ level: 1, name: 1 });
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('subjects', 'name code');
    
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    res.json({
      success: true,
      data: classObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the subjects exist if provided
    if (req.body.subjects && req.body.subjects.length > 0) {
      const subjectCount = await Subject.countDocuments({
        _id: { $in: req.body.subjects }
      });
      
      if (subjectCount !== req.body.subjects.length) {
        return res.status(404).json({ 
          success: false,
          message: 'One or more subjects not found' 
        });
      }
    }
    
    const classObj = new Class(req.body);
    await classObj.save();
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    
    // Verify that the subjects exist if provided
    if (req.body.subjects && req.body.subjects.length > 0) {
      const subjectCount = await Subject.countDocuments({
        _id: { $in: req.body.subjects }
      });
      
      if (subjectCount !== req.body.subjects.length) {
        return res.status(404).json({ 
          success: false,
          message: 'One or more subjects not found' 
        });
      }
    }
    
    const classObj = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findByIdAndDelete(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Class deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};


// Add subject to class
exports.addSubjectToClass = async (req, res) => {
  try {
    const { subjectId } = req.body;
    
    // Verify that the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: 'Subject not found' 
      });
    }
    
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    // Check if subject is already added to the class
    if (classObj.subjects.includes(subjectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Subject already added to this class' 
      });
    }
    
    // Add subject to class
    classObj.subjects.push(subjectId);
    await classObj.save();
    
    // Add class to subject's classes array
    if (!subject.classes.includes(classObj._id)) {
      subject.classes.push(classObj._id);
      await subject.save();
    }
    
    res.json({
      success: true,
      message: 'Subject added to class successfully',
      data: classObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Remove subject from class
exports.removeSubjectFromClass = async (req, res) => {
  try {
    const { subjectId } = req.body;
    
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    // Check if subject is in the class
    if (!classObj.subjects.includes(subjectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Subject not in this class' 
      });
    }
    
    // Remove subject from class
    classObj.subjects = classObj.subjects.filter(
      subject => subject.toString() !== subjectId
    );
    await classObj.save();
    
    // Remove class from subject's classes array
    const subject = await Subject.findById(subjectId);
    if (subject) {
      subject.classes = subject.classes.filter(
        cls => cls.toString() !== classObj._id.toString()
      );
      await subject.save();
    }
    
    res.json({
      success: true,
      message: 'Subject removed from class successfully',
      data: classObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get class arms
exports.getClassArms = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Class not found' 
      });
    }
    
    // Use the virtual to get class arms
    await classObj.populate('classArms');
    
    res.json({
      success: true,
      data: classObj.classArms
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};
