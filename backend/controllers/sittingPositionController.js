const SittingPosition = require('../models/SittingPosition');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const Term = require('../models/Term');

// Get all sitting positions
exports.getAllSittingPositions = async (req, res) => {
  try {
    const sittingPositions = await SittingPosition.find({ school: req.user.school })
      .populate('student', 'firstName lastName admissionNumber')
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name')
      .populate('term', 'name')
      .sort({ assignedDate: -1 });
    
    res.json(sittingPositions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sitting position by ID
exports.getSittingPositionById = async (req, res) => {
  try {
    const sittingPosition = await SittingPosition.findById(req.params.id)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name')
      .populate('term', 'name');
    
    if (!sittingPosition) {
      return res.status(404).json({ message: 'Sitting position not found' });
    }
    
    res.json(sittingPosition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new sitting position
exports.createSittingPosition = async (req, res) => {
  try {
    // Add the current user as creator and school
    req.body.createdBy = req.user.id;
    req.body.school = req.user.school;
    
    // Verify that the student exists
    const student = await Student.findById(req.body.student);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify that the class exists
    const classObj = await Class.findById(req.body.class);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Verify that the class arm exists
    const classArm = await ClassArm.findById(req.body.classArm);
    if (!classArm) {
      return res.status(404).json({ message: 'Class arm not found' });
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
    
    // Check if this student already has a sitting position for this class, arm, academic year and term
    const existingSittingPosition = await SittingPosition.findOne({
      student: req.body.student,
      class: req.body.class,
      classArm: req.body.classArm,
      academicYear: req.body.academicYear,
      term: req.body.term,
      isActive: true
    });
    
    if (existingSittingPosition) {
      return res.status(400).json({ 
        message: 'This student already has an active sitting position for this class, arm, academic year and term' 
      });
    }
    
    // Check if this position (row and column) is already assigned for this class, arm, academic year and term
    const existingPosition = await SittingPosition.findOne({
      row: req.body.row,
      column: req.body.column,
      class: req.body.class,
      classArm: req.body.classArm,
      academicYear: req.body.academicYear,
      term: req.body.term,
      isActive: true
    });
    
    if (existingPosition) {
      return res.status(400).json({ 
        message: 'This position is already assigned to another student for this class, arm, academic year and term' 
      });
    }
    
    // Check if this position number is already assigned for this class, arm, academic year and term
    const existingPositionNumber = await SittingPosition.findOne({
      positionNumber: req.body.positionNumber,
      class: req.body.class,
      classArm: req.body.classArm,
      academicYear: req.body.academicYear,
      term: req.body.term,
      isActive: true
    });
    
    if (existingPositionNumber) {
      return res.status(400).json({ 
        message: 'This position number is already assigned to another student for this class, arm, academic year and term' 
      });
    }
    
    const sittingPosition = new SittingPosition(req.body);
    await sittingPosition.save();
    
    res.status(201).json(sittingPosition);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate assignment. This position may already be assigned for this class, arm, academic year and term.' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update sitting position
exports.updateSittingPosition = async (req, res) => {
  try {
    // If student is being updated, verify they exist
    if (req.body.student) {
      const student = await Student.findById(req.body.student);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check if this student already has a sitting position for this class, arm, academic year and term (excluding current assignment)
      if (req.body.class && req.body.classArm && req.body.academicYear && req.body.term) {
        const existingSittingPosition = await SittingPosition.findOne({
          _id: { $ne: req.params.id },
          student: req.body.student,
          class: req.body.class,
          classArm: req.body.classArm,
          academicYear: req.body.academicYear,
          term: req.body.term,
          isActive: true
        });
        
        if (existingSittingPosition) {
          return res.status(400).json({ 
            message: 'This student already has an active sitting position for this class, arm, academic year and term' 
          });
        }
      }
    }
    
    // If class is being updated, verify it exists
    if (req.body.class) {
      const classObj = await Class.findById(req.body.class);
      if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
      }
    }
    
    // If class arm is being updated, verify it exists
    if (req.body.classArm) {
      const classArm = await ClassArm.findById(req.body.classArm);
      if (!classArm) {
        return res.status(404).json({ message: 'Class arm not found' });
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
    
    // Check if this position (row and column) is already assigned for this class, arm, academic year and term (excluding current assignment)
    if (req.body.row && req.body.column && req.body.class && req.body.classArm && req.body.academicYear && req.body.term) {
      const existingPosition = await SittingPosition.findOne({
        _id: { $ne: req.params.id },
        row: req.body.row,
        column: req.body.column,
        class: req.body.class,
        classArm: req.body.classArm,
        academicYear: req.body.academicYear,
        term: req.body.term,
        isActive: true
      });
      
      if (existingPosition) {
        return res.status(400).json({ 
          message: 'This position is already assigned to another student for this class, arm, academic year and term' 
        });
      }
    }
    
    // Check if this position number is already assigned for this class, arm, academic year and term (excluding current assignment)
    if (req.body.positionNumber && req.body.class && req.body.classArm && req.body.academicYear && req.body.term) {
      const existingPositionNumber = await SittingPosition.findOne({
        _id: { $ne: req.params.id },
        positionNumber: req.body.positionNumber,
        class: req.body.class,
        classArm: req.body.classArm,
        academicYear: req.body.academicYear,
        term: req.body.term,
        isActive: true
      });
      
      if (existingPositionNumber) {
        return res.status(400).json({ 
          message: 'This position number is already assigned to another student for this class, arm, academic year and term' 
        });
      }
    }
    
    const sittingPosition = await SittingPosition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sittingPosition) {
      return res.status(404).json({ message: 'Sitting position not found' });
    }
    
    res.json(sittingPosition);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate assignment. This position may already be assigned for this class, arm, academic year and term.' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete sitting position
exports.deleteSittingPosition = async (req, res) => {
  try {
    const sittingPosition = await SittingPosition.findByIdAndDelete(req.params.id);
    
    if (!sittingPosition) {
      return res.status(404).json({ message: 'Sitting position not found' });
    }
    
    res.json({ message: 'Sitting position deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sitting positions by class and arm for current academic year and term
exports.getSittingPositionsByClassAndArm = async (req, res) => {
  try {
    // Find the current academic year
    const currentAcademicYear = await AcademicYear.findOne({ 
      school: req.user.school,
      isCurrent: true
    });
    
    if (!currentAcademicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    
    // Find the current term
    const currentTerm = await Term.findOne({
      academicYear: currentAcademicYear._id,
      isCurrent: true
    });
    
    if (!currentTerm) {
      return res.status(404).json({ message: 'Current term not found' });
    }
    
    const sittingPositions = await SittingPosition.find({
      class: req.params.classId,
      classArm: req.params.classArmId,
      academicYear: currentAcademicYear._id,
      term: currentTerm._id,
      isActive: true,
      school: req.user.school
    })
      .populate('student', 'firstName lastName admissionNumber')
      .sort({ row: 1, column: 1 });
    
    res.json(sittingPositions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sitting position by student for current academic year and term
exports.getSittingPositionByStudent = async (req, res) => {
  try {
    // Find the current academic year
    const currentAcademicYear = await AcademicYear.findOne({ 
      school: req.user.school,
      isCurrent: true
    });
    
    if (!currentAcademicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    
    // Find the current term
    const currentTerm = await Term.findOne({
      academicYear: currentAcademicYear._id,
      isCurrent: true
    });
    
    if (!currentTerm) {
      return res.status(404).json({ message: 'Current term not found' });
    }
    
    const sittingPosition = await SittingPosition.findOne({
      student: req.params.studentId,
      academicYear: currentAcademicYear._id,
      term: currentTerm._id,
      isActive: true,
      school: req.user.school
    })
      .populate('class', 'name level')
      .populate('classArm', 'name');
    
    if (!sittingPosition) {
      return res.status(404).json({ message: 'No sitting position found for this student in the current academic year and term' });
    }
    
    res.json(sittingPosition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sitting positions by academic year and term
exports.getSittingPositionsByAcademicYearAndTerm = async (req, res) => {
  try {
    const sittingPositions = await SittingPosition.find({ 
      academicYear: req.params.academicYearId,
      term: req.params.termId,
      school: req.user.school
    })
      .populate('student', 'firstName lastName admissionNumber')
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .sort({ 'class.level': 1, 'classArm.name': 1, row: 1, column: 1 });
    
    res.json(sittingPositions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get classroom layout for a specific class and arm
exports.getClassroomLayout = async (req, res) => {
  try {
    // Find the current academic year and term if not provided
    let academicYearId = req.query.academicYear;
    let termId = req.query.term;
    
    if (!academicYearId || !termId) {
      // Find the current academic year
      const currentAcademicYear = await AcademicYear.findOne({ 
        school: req.user.school,
        isCurrent: true
      });
      
      if (!currentAcademicYear) {
        return res.status(404).json({ message: 'Current academic year not found' });
      }
      
      academicYearId = currentAcademicYear._id;
      
      // Find the current term
      const currentTerm = await Term.findOne({
        academicYear: currentAcademicYear._id,
        isCurrent: true
      });
      
      if (!currentTerm) {
        return res.status(404).json({ message: 'Current term not found' });
      }
      
      termId = currentTerm._id;
    }
    
    const sittingPositions = await SittingPosition.find({
      class: req.params.classId,
      classArm: req.params.classArmId,
      academicYear: academicYearId,
      term: termId,
      isActive: true,
      school: req.user.school
    })
      .populate('student', 'firstName lastName admissionNumber')
      .sort({ row: 1, column: 1 });
    
    // Get the maximum row and column to determine the classroom dimensions
    let maxRow = 0;
    let maxColumn = 0;
    
    sittingPositions.forEach(position => {
      if (position.row > maxRow) maxRow = position.row;
      if (position.column > maxColumn) maxColumn = position.column;
    });
    
    // Create a 2D grid representing the classroom layout
    const layout = Array(maxRow).fill().map(() => Array(maxColumn).fill(null));
    
    // Fill in the grid with student information
    sittingPositions.forEach(position => {
      layout[position.row - 1][position.column - 1] = {
        id: position.student._id,
        name: `${position.student.firstName} ${position.student.lastName}`,
        admissionNumber: position.student.admissionNumber,
        positionNumber: position.positionNumber
      };
    });
    
    res.json({
      rows: maxRow,
      columns: maxColumn,
      layout: layout
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
