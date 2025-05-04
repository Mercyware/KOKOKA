const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const Staff = require('../models/Staff');
const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');
const Term = require('../models/Term');
const Class = require('../models/Class');
const ClassArm = require('../models/ClassArm');

// Get all teacher subject assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find()
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      })
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await TeacherSubjectAssignment.findById(req.params.id)
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new assignment
exports.createAssignment = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the teacher exists
    const teacher = await Staff.findById(req.body.teacher);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Verify that the staff is a teacher
    if (teacher.staffType !== 'teacher') {
      return res.status(400).json({ message: 'Staff member must be a teacher to be assigned subjects' });
    }
    
    // Verify that the subject exists
    const subject = await Subject.findById(req.body.subject);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Verify that the academic year exists
    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    // Verify that the term exists
    const term = await Term.findById(req.body.term);
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }
    
    // Verify that the classes exist if provided
    if (req.body.classes && req.body.classes.length > 0) {
      for (const classItem of req.body.classes) {
        // Verify class exists
        const classObj = await Class.findById(classItem.class);
        if (!classObj) {
          return res.status(404).json({ message: `Class with ID ${classItem.class} not found` });
        }
        
        // Verify class arms exist if provided
        if (classItem.classArms && classItem.classArms.length > 0) {
          const armCount = await ClassArm.countDocuments({
            _id: { $in: classItem.classArms },
            class: classItem.class
          });
          
          if (armCount !== classItem.classArms.length) {
            return res.status(404).json({ message: 'One or more class arms not found or do not belong to the specified class' });
          }
        }
      }
    }
    
    const assignment = new TeacherSubjectAssignment(req.body);
    await assignment.save();
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    // If teacher is being updated, verify they exist
    if (req.body.teacher) {
      const teacher = await Staff.findById(req.body.teacher);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // Verify that the staff is a teacher
      if (teacher.staffType !== 'teacher') {
        return res.status(400).json({ message: 'Staff member must be a teacher to be assigned subjects' });
      }
    }
    
    // If subject is being updated, verify it exists
    if (req.body.subject) {
      const subject = await Subject.findById(req.body.subject);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
    }
    
    // If academic year is being updated, verify it exists
    if (req.body.academicYear) {
      const academicYear = await AcademicYear.findById(req.body.academicYear);
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
    }
    
    // If term is being updated, verify it exists
    if (req.body.term) {
      const term = await Term.findById(req.body.term);
      if (!term) {
        return res.status(404).json({ message: 'Term not found' });
      }
    }
    
    // Verify that the classes exist if provided
    if (req.body.classes && req.body.classes.length > 0) {
      for (const classItem of req.body.classes) {
        // Verify class exists
        const classObj = await Class.findById(classItem.class);
        if (!classObj) {
          return res.status(404).json({ message: `Class with ID ${classItem.class} not found` });
        }
        
        // Verify class arms exist if provided
        if (classItem.classArms && classItem.classArms.length > 0) {
          const armCount = await ClassArm.countDocuments({
            _id: { $in: classItem.classArms },
            class: classItem.class
          });
          
          if (armCount !== classItem.classArms.length) {
            return res.status(404).json({ message: 'One or more class arms not found or do not belong to the specified class' });
          }
        }
      }
    }
    
    const assignment = await TeacherSubjectAssignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await TeacherSubjectAssignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by teacher
exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({ teacher: req.params.teacherId })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      })
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by subject
exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({ subject: req.params.subjectId })
      .populate('teacher', 'user employeeId')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      })
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by academic year
exports.getAssignmentsByAcademicYear = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({ academicYear: req.params.academicYearId })
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('term', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      })
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by term
exports.getAssignmentsByTerm = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({ term: req.params.termId })
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate({
        path: 'classes',
        populate: [
          { path: 'class', select: 'name level' },
          { path: 'classArms', select: 'name' }
        ]
      })
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by class
exports.getAssignmentsByClass = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({
      'classes.class': req.params.classId
    })
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by class arm
exports.getAssignmentsByClassArm = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({
      'classes.classArms': req.params.classArmId
    })
      .populate('teacher', 'user employeeId')
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .sort({ assignedDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
