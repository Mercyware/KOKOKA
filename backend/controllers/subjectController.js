const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');
const Class = require('../models/Class');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Define a schema for the schoolmanager subjects collection
const SchoolManagerSubjectSchema = new mongoose.Schema({
  name: String,
  code: String,
  created_at: Date,
  updated_at: Date,
  created_by: String
});

// Create a model for the schoolmanager subjects collection
let SchoolManagerSubject;
try {
  // Try to get the model if it already exists
  SchoolManagerSubject = mongoose.model('SchoolManagerSubject');
} catch (error) {
  // Create the model if it doesn't exist
  SchoolManagerSubject = mongoose.model('SchoolManagerSubject', SchoolManagerSubjectSchema, 'subjects');
}

// Connect to the schoolmanager database
const connectToSchoolManager = async () => {
  try {
    // Create a new connection to the schoolmanager database
    const conn = await mongoose.createConnection('mongodb://localhost:27017/schoolmanager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Define the model on this connection
    const SchoolManagerSubject = conn.model('Subject', SchoolManagerSubjectSchema, 'subjects');
    
    return { conn, SchoolManagerSubject };
  } catch (error) {
    logger.error(`Error connecting to schoolmanager database: ${error.message}`);
    throw error;
  }
};

// Get all subjects
exports.getSchoolManagerSubjects = async (req, res) => {
  let connection;
  try {
    // Connect to the schoolmanager database
    const { conn, SchoolManagerSubject } = await connectToSchoolManager();
    connection = conn;
    
    // Fetch subjects from the schoolmanager database
    const schoolManagerSubjects = await SchoolManagerSubject.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: schoolManagerSubjects,
      message: `Retrieved ${schoolManagerSubjects.length} subjects from schoolmanager`
    });
  } catch (error) {
    logger.error(`Error fetching subjects: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  } finally {
    // Close the connection to the schoolmanager database
    if (connection) {
      await connection.close();
    }
  }
};


// Get all subjects
exports.getAllSubjects = async (req, res) => {
  let connection;
  try {
   
    // Also fetch subjects from the local database
    const subjects = await Subject.find()
      .populate('academicYear', 'name')
      .populate('classes', 'name level')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: subjects,
      message: `Retrieved ${subjects.length} subjects`
    });
  } catch (error) {
    logger.error(`Error fetching subjects: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  } finally {
    // Close the connection to the schoolmanager database
    if (connection) {
      await connection.close();
    }
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

    // Prevent duplicate subject for the same school and academic year
    const existingSubject = await Subject.findOne({
      name: req.body.name,
      school: req.user.school,
      academicYear: req.body.academicYear
    });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists for this school in the selected academic year'
      });
    }

    const subject = new Subject(req.body);
    await subject.save();

    // Add subject to classes
    // if (req.body.classes && req.body.classes.length > 0) {
    //   await Class.updateMany(
    //     { _id: { $in: req.body.classes } },
    //     { $addToSet: { subjects: subject._id } }
    //   );
    // }

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
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

// Import subject from school manager
exports.importSubjectFromSchoolManager = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Get the current active academic year
    const activeAcademicYear = await AcademicYear.findOne({ isActive: true });
    if (!activeAcademicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'No active academic year found. Please create an academic year first.' 
      });
    }
    
    // Set the academic year to the active academic year
    req.body.academicYear = activeAcademicYear._id;
    
    // Set the school to the current user's school
    req.body.school = req.user.school;
    
    // Remove the source field and id field as we're creating a new subject
    delete req.body.source;
    delete req.body.id;
    
    // Create the subject
    const subject = new Subject(req.body);
    await subject.save();
    
    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject imported successfully'
    });
  } catch (error) {
    logger.error(`Error importing subject: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};
