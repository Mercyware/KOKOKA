const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');
const Class = require('../models/Class');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('academicYear', 'name')
      .populate('classes', 'name level')
      .sort({ name: 1 });
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('academicYear', 'name')
      .populate('classes', 'name level');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new subject
exports.createSubject = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the academic year exists
    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    // Verify that the classes exist if provided
    if (req.body.classes && req.body.classes.length > 0) {
      const classCount = await Class.countDocuments({
        _id: { $in: req.body.classes }
      });
      
      if (classCount !== req.body.classes.length) {
        return res.status(404).json({ message: 'One or more classes not found' });
      }
    }
    
    const subject = new Subject(req.body);
    await subject.save();
    
    // Add subject to classes
    if (req.body.classes && req.body.classes.length > 0) {
      await Class.updateMany(
        { _id: { $in: req.body.classes } },
        { $addToSet: { subjects: subject._id } }
      );
    }
    
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    // If academic year is being updated, verify it exists
    if (req.body.academicYear) {
      const academicYear = await AcademicYear.findById(req.body.academicYear);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
    }
    
    // Get the current subject to compare classes
    const currentSubject = await Subject.findById(req.params.id);
    if (!currentSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Verify that the classes exist if provided
    if (req.body.classes && req.body.classes.length > 0) {
      const classCount = await Class.countDocuments({
        _id: { $in: req.body.classes }
      });
      
      if (classCount !== req.body.classes.length) {
        return res.status(404).json({ message: 'One or more classes not found' });
      }
    }
    
    // Update the subject
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Update class-subject relationships if classes have changed
    if (req.body.classes) {
      // Get classes to remove subject from
      const classesToRemove = currentSubject.classes.filter(
        cls => !req.body.classes.includes(cls.toString())
      );
      
      // Get classes to add subject to
      const classesToAdd = req.body.classes.filter(
        cls => !currentSubject.classes.includes(cls)
      );
      
      // Remove subject from classes that no longer have it
      if (classesToRemove.length > 0) {
        await Class.updateMany(
          { _id: { $in: classesToRemove } },
          { $pull: { subjects: subject._id } }
        );
      }
      
      // Add subject to new classes
      if (classesToAdd.length > 0) {
        await Class.updateMany(
          { _id: { $in: classesToAdd } },
          { $addToSet: { subjects: subject._id } }
        );
      }
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Remove subject from all classes
    await Class.updateMany(
      { subjects: subject._id },
      { $pull: { subjects: subject._id } }
    );
    
    // Delete the subject
    await Subject.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get subjects by academic year
exports.getSubjectsByAcademicYear = async (req, res) => {
  try {
    const subjects = await Subject.find({ academicYear: req.params.academicYearId })
      .populate('classes', 'name level')
      .sort({ name: 1 });
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get subjects by class
exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ classes: req.params.classId })
      .populate('academicYear', 'name')
      .sort({ name: 1 });
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add class to subject
exports.addClassToSubject = async (req, res) => {
  try {
    const { classId } = req.body;
    
    // Verify that the class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if class is already added to the subject
    if (subject.classes.includes(classId)) {
      return res.status(400).json({ message: 'Class already added to this subject' });
    }
    
    // Add class to subject
    subject.classes.push(classId);
    await subject.save();
    
    // Add subject to class
    if (!classObj.subjects.includes(subject._id)) {
      classObj.subjects.push(subject._id);
      await classObj.save();
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove class from subject
exports.removeClassFromSubject = async (req, res) => {
  try {
    const { classId } = req.body;
    
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if class is in the subject
    if (!subject.classes.includes(classId)) {
      return res.status(400).json({ message: 'Class not in this subject' });
    }
    
    // Remove class from subject
    subject.classes = subject.classes.filter(
      cls => cls.toString() !== classId
    );
    await subject.save();
    
    // Remove subject from class
    const classObj = await Class.findById(classId);
    if (classObj) {
      classObj.subjects = classObj.subjects.filter(
        sub => sub.toString() !== subject._id.toString()
      );
      await classObj.save();
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get teachers assigned to subject
exports.getSubjectTeachers = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Use the virtual to get teachers
    await subject.populate({
      path: 'teachers',
      populate: {
        path: 'teacher',
        select: 'user employeeId'
      }
    });
    
    res.json(subject.teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
