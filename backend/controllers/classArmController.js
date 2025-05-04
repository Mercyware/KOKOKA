const ClassArm = require('../models/ClassArm');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const Staff = require('../models/Staff');

// Get all class arms
exports.getAllClassArms = async (req, res) => {
  try {
    const classArms = await ClassArm.find()
      .populate('class', 'name level')
      .populate('academicYear', 'name')
      .populate('classTeacher', 'user employeeId')
      .sort({ 'class.level': 1, 'class.name': 1, name: 1 });
    
    res.json(classArms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class arm by ID
exports.getClassArmById = async (req, res) => {
  try {
    const classArm = await ClassArm.findById(req.params.id)
      .populate('class', 'name level')
      .populate('academicYear', 'name')
      .populate('classTeacher', 'user employeeId');
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    res.json(classArm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new class arm
exports.createClassArm = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the class exists
    const classObj = await Class.findById(req.body.class);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Verify that the academic year exists
    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    // Verify that the class teacher exists if provided
    if (req.body.classTeacher) {
      const teacher = await Staff.findById(req.body.classTeacher);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // Verify that the staff is a teacher
      if (teacher.staffType !== 'teacher') {
        return res.status(400).json({ message: 'Staff member must be a teacher to be assigned as class teacher' });
      }
    }
    
    const classArm = new ClassArm(req.body);
    await classArm.save();
    
    res.status(201).json(classArm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update class arm
exports.updateClassArm = async (req, res) => {
  try {
    // If class is being updated, verify it exists
    if (req.body.class) {
      const classObj = await Class.findById(req.body.class);
      if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
      }
    }
    
    // If academic year is being updated, verify it exists
    if (req.body.academicYear) {
      const academicYear = await AcademicYear.findById(req.body.academicYear);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
    }
    
    // If class teacher is being updated, verify they exist
    if (req.body.classTeacher) {
      const teacher = await Staff.findById(req.body.classTeacher);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // Verify that the staff is a teacher
      if (teacher.staffType !== 'teacher') {
        return res.status(400).json({ message: 'Staff member must be a teacher to be assigned as class teacher' });
      }
    }
    
    const classArm = await ClassArm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    res.json(classArm);
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

// Get class arms by class
exports.getClassArmsByClass = async (req, res) => {
  try {
    const classArms = await ClassArm.find({ class: req.params.classId })
      .populate('classTeacher', 'user employeeId')
      .sort({ name: 1 });
    
    res.json(classArms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class arms by academic year
exports.getClassArmsByAcademicYear = async (req, res) => {
  try {
    const classArms = await ClassArm.find({ academicYear: req.params.academicYearId })
      .populate('class', 'name level')
      .populate('classTeacher', 'user employeeId')
      .sort({ 'class.level': 1, 'class.name': 1, name: 1 });
    
    res.json(classArms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign class teacher
exports.assignClassTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    
    // Verify that the teacher exists
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Verify that the staff is a teacher
    if (teacher.staffType !== 'teacher') {
      return res.status(400).json({ message: 'Staff member must be a teacher to be assigned as class teacher' });
    }
    
    const classArm = await ClassArm.findById(req.params.id);
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
    }
    
    // Assign teacher to class arm
    classArm.classTeacher = teacherId;
    await classArm.save();
    
    res.json(classArm);
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
    
    res.json(classArm.students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
