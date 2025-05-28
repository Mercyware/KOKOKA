const ClassTeacher = require('../models/ClassTeacher');
const Staff = require('../models/Staff');
const Class = require('../models/Class');
const ClassArm = require('../models/ClassArm');
const AcademicYear = require('../models/AcademicYear');

// Get all class teacher assignments
exports.getAllClassTeachers = async (req, res) => {
  try {
    const classTeachers = await ClassTeacher.find({ school: req.user.school })
      .populate({
        path: 'teacher',
        select: 'user employeeId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name')
      .sort({ assignedDate: -1 });
    
    res.json(classTeachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class teacher assignment by ID
exports.getClassTeacherById = async (req, res) => {
  try {
    const classTeacher = await ClassTeacher.findById(req.params.id)
      .populate({
        path: 'teacher',
        select: 'user employeeId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name');
    
    if (!classTeacher) {
      return res.status(404).json({ message: 'Class teacher assignment not found' });
    }
    
    res.json(classTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new class teacher assignment
exports.createClassTeacher = async (req, res) => {
  try {
    // Add the current user as creator and school
    req.body.createdBy = req.user.id;
    req.body.school = req.user.school;
    
    // Verify that the teacher exists
    const teacher = await Staff.findById(req.body.teacher);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Verify that the staff is a teacher
    if (teacher.staffType !== 'teacher') {
      return res.status(400).json({ message: 'Staff member must be a teacher to be assigned as class teacher' });
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
    
    // Check if this class and arm already has a class teacher for this academic year
    const existingClassTeacher = await ClassTeacher.findOne({
      class: req.body.class,
      classArm: req.body.classArm,
      academicYear: req.body.academicYear,
      isActive: true
    });
    
    if (existingClassTeacher) {
      return res.status(400).json({ 
        message: 'This class and arm already has an active class teacher for this academic year' 
      });
    }
    
    // Check if this teacher is already assigned as a class teacher for this academic year
    const existingTeacherAssignment = await ClassTeacher.findOne({
      teacher: req.body.teacher,
      academicYear: req.body.academicYear,
      isActive: true
    });
    
    if (existingTeacherAssignment) {
      return res.status(400).json({ 
        message: 'This teacher is already assigned as a class teacher for another class in this academic year' 
      });
    }
    
    const classTeacher = new ClassTeacher(req.body);
    await classTeacher.save();
    
    res.status(201).json(classTeacher);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate assignment. This class or teacher may already be assigned for this academic year.' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update class teacher assignment
exports.updateClassTeacher = async (req, res) => {
  try {
    // If teacher is being updated, verify they exist
    if (req.body.teacher) {
      const teacher = await Staff.findById(req.body.teacher);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // Verify that the staff is a teacher
      if (teacher.staffType !== 'teacher') {
        return res.status(400).json({ message: 'Staff member must be a teacher to be assigned as class teacher' });
      }
      
      // Check if this teacher is already assigned as a class teacher for this academic year (excluding current assignment)
      if (req.body.academicYear) {
        const existingTeacherAssignment = await ClassTeacher.findOne({
          _id: { $ne: req.params.id },
          teacher: req.body.teacher,
          academicYear: req.body.academicYear,
          isActive: true
        });
        
        if (existingTeacherAssignment) {
          return res.status(400).json({ 
            message: 'This teacher is already assigned as a class teacher for another class in this academic year' 
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
    
    // Check if this class and arm already has a class teacher for this academic year (excluding current assignment)
    if (req.body.class && req.body.classArm && req.body.academicYear) {
      const existingClassTeacher = await ClassTeacher.findOne({
        _id: { $ne: req.params.id },
        class: req.body.class,
        classArm: req.body.classArm,
        academicYear: req.body.academicYear,
        isActive: true
      });
      
      if (existingClassTeacher) {
        return res.status(400).json({ 
          message: 'This class and arm already has an active class teacher for this academic year' 
        });
      }
    }
    
    const classTeacher = await ClassTeacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classTeacher) {
      return res.status(404).json({ message: 'Class teacher assignment not found' });
    }
    
    res.json(classTeacher);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate assignment. This class or teacher may already be assigned for this academic year.' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete class teacher assignment
exports.deleteClassTeacher = async (req, res) => {
  try {
    const classTeacher = await ClassTeacher.findByIdAndDelete(req.params.id);
    
    if (!classTeacher) {
      return res.status(404).json({ message: 'Class teacher assignment not found' });
    }
    
    res.json({ message: 'Class teacher assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class teachers by academic year
exports.getClassTeachersByAcademicYear = async (req, res) => {
  try {
    const classTeachers = await ClassTeacher.find({ 
      academicYear: req.params.academicYearId,
      school: req.user.school
    })
      .populate({
        path: 'teacher',
        select: 'user employeeId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .sort({ 'class.level': 1 });
    
    res.json(classTeachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class teacher by class and arm for current academic year
exports.getClassTeacherByClassAndArm = async (req, res) => {
  try {
    // Find the current academic year
    const currentAcademicYear = await AcademicYear.findOne({ 
      school: req.user.school,
      isCurrent: true
    });
    
    if (!currentAcademicYear) {
      return res.status(404).json({ message: 'Current academic year not found' });
    }
    
    const classTeacher = await ClassTeacher.findOne({
      class: req.params.classId,
      classArm: req.params.classArmId,
      academicYear: currentAcademicYear._id,
      isActive: true,
      school: req.user.school
    })
      .populate({
        path: 'teacher',
        select: 'user employeeId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('class', 'name level')
      .populate('classArm', 'name');
    
    if (!classTeacher) {
      return res.status(404).json({ message: 'No class teacher assigned for this class and arm in the current academic year' });
    }
    
    res.json(classTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get classes assigned to a teacher as class teacher
exports.getClassesByTeacher = async (req, res) => {
  try {
    const classTeachers = await ClassTeacher.find({ 
      teacher: req.params.teacherId,
      school: req.user.school
    })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate isCurrent');
    
    res.json(classTeachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if a class teacher exists for a class, arm, and academic year
exports.checkClassTeacherExists = async (req, res) => {
  try {
    const { class: classId, classArm: classArmId, academicYear: academicYearId } = req.query;
    
    // Validate required parameters
    if (!classId || !classArmId || !academicYearId) {
      return res.status(400).json({ 
        message: 'Class ID, Class Arm ID, and Academic Year ID are required' 
      });
    }
    
    // Check if a class teacher exists
    const existingClassTeacher = await ClassTeacher.findOne({
      class: classId,
      classArm: classArmId,
      academicYear: academicYearId,
      isActive: true,
      school: req.user.school
    });
    
    res.json({ exists: !!existingClassTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
