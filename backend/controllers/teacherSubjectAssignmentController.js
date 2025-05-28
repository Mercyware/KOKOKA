const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const Staff = require('../models/Staff');
const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');
const Term = require('../models/Term');
const Class = require('../models/Class');
const ClassArm = require('../models/ClassArm');

// Get all teacher subject assignments
exports.getAllAssignments = async function(req, res) {
  try {
    // Defensive: ensure req.query is always an object
    const query = (req && typeof req === 'object' && req.query && typeof req.query === 'object') ? req.query : {};
    const filter = {};
    
    // Apply filters if provided
    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }
    if (query.class) {
      filter.classes = { $elemMatch: { class: query.class } };
    }
    if (query.subject) {
      filter.subject = query.subject;
    }
    if (query.teacher) {
      filter.teacher = query.teacher;
    }
    if (typeof query.isActive !== 'undefined') {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const assignments = await TeacherSubjectAssignment.find(filter)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({ path: 'classes.class', select: 'name level' })
      .populate({ path: 'classes.classArms', select: 'name' })
      .sort({ assignedDate: -1 });

    res.json(Array.isArray(assignments) ? assignments : []);
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await TeacherSubjectAssignment.findById(req.params.id)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
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

    // Verify that the term exists if provided
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
    const filter = { teacher: req.params.teacherId };

    // Apply academic year filter if provided
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const assignments = await TeacherSubjectAssignment.find(filter)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
      })
      .sort({ assignedDate: -1 });

    // Note: We don't need to populate teacher here since we're filtering by teacher ID
    // and not including teacher details in the response

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by subject
exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const filter = { subject: req.params.subjectId };

    // Apply academic year filter if provided
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const assignments = await TeacherSubjectAssignment.find(filter)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
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
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
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
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
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
    const filter = {
      classes: {
        $elemMatch: { class: req.params.classId }
      }
    };

    // Apply academic year filter if provided
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const assignments = await TeacherSubjectAssignment.find(filter)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
      })
      .sort({ assignedDate: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by class arm
exports.getAssignmentsByClassArm = async (req, res) => {
  try {
    const filter = {
      classes: {
        $elemMatch: { classArms: req.params.classArmId }
      }
    };

    // Apply academic year filter if provided
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const assignments = await TeacherSubjectAssignment.find(filter)
      .populate({ 
        path: 'teacher', 
        select: 'user employeeId',
        populate: { path: 'user', select: 'name' }, // Include staff name
        options: { virtuals: false } // Disable virtuals for teacher to avoid filter property issue
      })
      .populate('subject', 'name code')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .populate({
        path: 'classes.class',
        select: 'name level'
      })
      .populate({
        path: 'classes.classArms',
        select: 'name'
      })
      .sort({ assignedDate: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
