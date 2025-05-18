const StudentClassHistory = require('../models/StudentClassHistory');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const mongoose = require('mongoose');

// Get class history for a specific student
exports.getStudentClassHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const history = await StudentClassHistory.find({ student: studentId })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate')
      .sort({ 'academicYear.startDate': -1 }) // Sort by academic year (newest first)
      .lean();
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add class history entry for a student
exports.addClassHistory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      studentId, 
      classId, 
      classArmId, 
      academicYearId, 
      startDate, 
      remarks 
    } = req.body;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if academic year exists
    const academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    
    // Check if student already has an active class for this academic year
    const existingActiveHistory = await StudentClassHistory.findOne({
      student: studentId,
      academicYear: academicYearId,
      status: 'active'
    });
    
    if (existingActiveHistory) {
      // Mark the existing active history as completed
      existingActiveHistory.status = 'completed';
      existingActiveHistory.endDate = new Date();
      await existingActiveHistory.save({ session });
    }
    
    // Create new class history entry
    const classHistory = new StudentClassHistory({
      student: studentId,
      class: classId,
      classArm: classArmId,
      academicYear: academicYearId,
      school: student.school, // Use student's school
      startDate: startDate || new Date(),
      status: 'active',
      remarks
    });
    
    await classHistory.save({ session });
    
    // Update student's current class and academic year
    student.class = classId;
    student.classArm = classArmId;
    student.academicYear = academicYearId;
    await student.save({ session });
    
    await session.commitTransaction();
    
    // Return the new history entry with populated references
    const result = await StudentClassHistory.findById(classHistory._id)
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate');
    
    res.status(201).json(result);
  } catch (error) {
    await session.abortTransaction();
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry error', 
        error: 'Student already has an active class for this academic year' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Update class history entry
exports.updateClassHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { status, endDate, remarks } = req.body;
    
    const history = await StudentClassHistory.findById(historyId);
    if (!history) {
      return res.status(404).json({ message: 'Class history entry not found' });
    }
    
    // Update fields
    if (status) history.status = status;
    if (endDate) history.endDate = endDate;
    if (remarks !== undefined) history.remarks = remarks;
    
    await history.save();
    
    // If status is changed from 'active', update student's current class if needed
    if (history.status !== 'active' && status === 'active') {
      const student = await Student.findById(history.student);
      if (student) {
        student.class = history.class;
        student.classArm = history.classArm;
        student.academicYear = history.academicYear;
        await student.save();
      }
    }
    
    // Return updated history with populated references
    const result = await StudentClassHistory.findById(historyId)
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate');
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete class history entry
exports.deleteClassHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    
    const history = await StudentClassHistory.findById(historyId);
    if (!history) {
      return res.status(404).json({ message: 'Class history entry not found' });
    }
    
    await StudentClassHistory.findByIdAndDelete(historyId);
    
    res.json({ message: 'Class history entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Promote students to next class
exports.promoteStudents = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      fromClassId, 
      toClassId, 
      fromAcademicYearId, 
      toAcademicYearId,
      studentIds, // Optional: specific students to promote
      remarks
    } = req.body;
    
    // Validate input
    if (!fromClassId || !toClassId || !fromAcademicYearId || !toAcademicYearId) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        error: 'Please provide fromClassId, toClassId, fromAcademicYearId, and toAcademicYearId' 
      });
    }
    
    // Check if classes and academic years exist
    const fromClass = await Class.findById(fromClassId);
    const toClass = await Class.findById(toClassId);
    const fromAcademicYear = await AcademicYear.findById(fromAcademicYearId);
    const toAcademicYear = await AcademicYear.findById(toAcademicYearId);
    
    if (!fromClass || !toClass || !fromAcademicYear || !toAcademicYear) {
      return res.status(404).json({ message: 'One or more required resources not found' });
    }
    
    // Get students to promote
    let studentsQuery = { class: fromClassId, academicYear: fromAcademicYearId };
    
    // If specific student IDs are provided, filter by them
    if (studentIds && studentIds.length > 0) {
      studentsQuery._id = { $in: studentIds };
    }
    
    const students = await Student.find(studentsQuery);
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found to promote' });
    }
    
    const promotedStudents = [];
    
    // Process each student
    for (const student of students) {
      // Mark current class history as completed
      const currentHistory = await StudentClassHistory.findOne({
        student: student._id,
        academicYear: fromAcademicYearId,
        status: 'active'
      });
      
      if (currentHistory) {
        currentHistory.status = 'completed';
        currentHistory.endDate = new Date();
        await currentHistory.save({ session });
      }
      
      // Create new class history entry
      const newHistory = new StudentClassHistory({
        student: student._id,
        class: toClassId,
        academicYear: toAcademicYearId,
        school: student.school,
        startDate: new Date(),
        status: 'active',
        remarks: remarks || `Promoted from ${fromClass.name} to ${toClass.name}`
      });
      
      await newHistory.save({ session });
      
      // Update student's current class and academic year
      student.class = toClassId;
      student.academicYear = toAcademicYearId;
      await student.save({ session });
      
      promotedStudents.push(student._id);
    }
    
    await session.commitTransaction();
    
    res.json({ 
      message: `Successfully promoted ${promotedStudents.length} students`,
      promotedStudents
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Search students by class and academic year (including historical data)
exports.searchStudentsByClassAndYear = async (req, res) => {
  try {
    const { 
      class: classId, 
      academicYear: academicYearId, 
      classArm: classArmId,
      page = 1, 
      limit = 10,
      status,
      search
    } = req.query;
    
    if (!academicYearId) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        error: 'Please provide academicYear parameter' 
      });
    }
    
    // Build query for StudentClassHistory
    const historyQuery = {
      academicYear: academicYearId
    };

    // Add class filter if provided
    if (classId) {
      historyQuery.class = classId;
    }

    // Add classArm filter if provided
    if (classArmId) {
      historyQuery.classArm = classArmId;
    }
    
    // Filter by status if provided
    if (status) {
      historyQuery.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find student IDs from history
    const studentHistories = await StudentClassHistory.find(historyQuery)
      .select('student')
      .lean();
    
    const studentIds = studentHistories.map(history => history.student);
    
    // Build query for Students
    let studentQuery = { _id: { $in: studentIds } };
    
    // Add search filter if provided
    if (search) {
      studentQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get students with pagination
    const students = await Student.find(studentQuery)
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('class', 'name')
      .populate('academicYear', 'name')
      .lean();
    
    // Get total count for pagination
    const total = await Student.countDocuments(studentQuery);
    
    // For each student, get their class history for the specified academic year
    const studentsWithHistory = await Promise.all(students.map(async (student) => {
      const history = await StudentClassHistory.findOne({
        student: student._id,
        academicYear: academicYearId,
        class: classId
      })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate')
      .lean();
      
      return {
        ...student,
        classHistory: history
      };
    }));
    
    res.json({
      results: studentsWithHistory.map(student => ({
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber
        },
        class: student.classHistory?.class || { id: classId, name: student.class?.name || 'N/A' },
        classArm: student.classHistory?.classArm,
        academicYear: student.classHistory?.academicYear || { id: academicYearId, name: student.academicYear?.name || 'N/A' },
        status: student.classHistory?.status || 'active'
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
