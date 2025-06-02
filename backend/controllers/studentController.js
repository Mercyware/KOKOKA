const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const Document = require('../models/Document');
const StudentClassHistory = require('../models/StudentClassHistory');
const AcademicYear = require('../models/AcademicYear');
const mongoose = require('mongoose');

// Get all students with pagination, filtering, and sorting via class history and academic year
exports.getAllStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'firstName', 
      order = 'asc',
      status,
      class: classId,
      search,
      admissionDateFrom,
      admissionDateTo,
      gender,
      academicYear
    } = req.query;

    // Determine academic year to use
    let academicYearId = academicYear;
    if (!academicYearId) {
      // Get active academic year for the school
      const activeYear = await AcademicYear.findOne({ school: req.school, isActive: true });
      if (!activeYear) {
        return res.status(400).json({ message: 'No active academic year found for this school.' });
      }
      academicYearId = activeYear._id;
    }

    // Get student IDs from StudentClassHistory for this school and academic year
    const classHistoryRecords = await StudentClassHistory.find({
      school: req.school,
      academicYear: academicYearId
    }).select('student');

    const studentIds = classHistoryRecords.map(r => r.student);

    // Build query for Student
    const query = { _id: { $in: studentIds } };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by class if provided (match class in class history)
    if (classId) {
      // Only include students whose class history for this year matches the classId
      const filteredIds = [];
      for (const record of classHistoryRecords) {
        if (record.class && record.class.toString() === classId) {
          filteredIds.push(record.student);
        }
      }
      query._id = { $in: filteredIds };
    }

    // Filter by gender if provided
    if (gender) {
      query.gender = gender;
    }

    // Filter by admission date range if provided
    if (admissionDateFrom || admissionDateTo) {
      query.admissionDate = {};
      if (admissionDateFrom) {
        query.admissionDate.$gte = new Date(admissionDateFrom);
      }
      if (admissionDateTo) {
        query.admissionDate.$lte = new Date(admissionDateTo);
      }
    }

    // Search by name or admission number
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const students = await Student.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('class', 'name')
      .populate('academicYear', 'name')
      .populate('primaryGuardian', 'firstName lastName phone email')
      .lean();

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    res.json({
      students,
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

// Get student by ID with detailed information
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name grade')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate')
      .populate('guardians', 'firstName lastName relationship phone email isEmergencyContact')
      .populate('primaryGuardian', 'firstName lastName relationship phone email')
      .populate('documents', 'title type fileUrl uploadedAt status')
      .populate({
        path: 'grades.exam',
        select: 'title subject totalMarks date'
      });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new student with optional guardian information
exports.createStudent = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      middleName,
      email,
      admissionNumber,
      admissionDate,
      academicYear,
      class: classId,
      classArm,
      rollNumber,
      house,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      address,
      contactInfo,
      guardians: guardiansData,
      healthInfo,
      previousSchool,
      nationality,
      religion,
      languages,
      notes,
      status,
      photo
    } = req.body;
    
    // Process photo if provided as base64
    let photoUrl = photo;
    if (photo && photo.startsWith('data:image')) {
      // Extract file extension and create a unique filename
      const fileExtension = photo.split(';')[0].split('/')[1];
      const fileName = `student_${Date.now()}.${fileExtension}`;
      
      // In a real implementation, you would save this file to a storage service
      // For now, we'll just use the base64 data directly
      photoUrl = photo;
      
      // Example code for saving to disk (commented out)
      /*
      const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = path.join(__dirname, '../uploads/students', fileName);
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      // Write file
      fs.writeFileSync(filePath, buffer);
      photoUrl = `/uploads/students/${fileName}`;
      */
    }
    
    // Create student
    const studentData = {
      firstName,
      lastName,
      middleName,
      email,
      admissionNumber,
      admissionDate: admissionDate || new Date(),
      academicYear,
      class: classId,
      classArm,
      rollNumber,
      house,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      address,
      contactInfo,
      healthInfo,
      previousSchool,
      nationality,
      religion,
      languages,
      notes,
      status: status || 'active',
      photo: photoUrl,
      school: req.school // From middleware
    };
    
    // Create and save student first to get a valid _id
    const student = new Student(studentData);
    await student.save();
    
    // Process guardians if provided
    if (guardiansData && guardiansData.length > 0) {
      const guardianIds = [];
      let primaryGuardianId = null;
      
      // Process each guardian
      for (const guardianData of guardiansData) {
        // Check if guardian already exists by email or phone
        let guardian;
        
        if (guardianData.email) {
          guardian = await Guardian.findOne({ email: guardianData.email });
        }
        
        if (!guardian && guardianData.phone) {
          guardian = await Guardian.findOne({ phone: guardianData.phone });
        }
        
        // If guardian doesn't exist, create new one
        if (!guardian) {
          guardian = new Guardian(guardianData);
          await guardian.save();
        }
        
        // Add student to guardian's students array if not already there
        if (!guardian.students.includes(student._id)) {
          guardian.students.push(student._id);
          await guardian.save();
        }
        
        guardianIds.push(guardian._id);
        
        // Set as primary guardian if specified or if it's the first guardian
        if (guardianData.isPrimary || !primaryGuardianId) {
          primaryGuardianId = guardian._id;
        }
      }
      
      // Update student with guardian information in a separate operation
      await Student.findByIdAndUpdate(student._id, {
        guardians: guardianIds,
        primaryGuardian: primaryGuardianId
      });
    }
    
    // Create initial class history entry
    if (classId && academicYear) {
      const classHistory = new StudentClassHistory({
        student: student._id,
        class: classId,
        classArm: classArm || null,
        academicYear: academicYear,
        school: student.school,
        startDate: admissionDate || new Date(),
        status: 'active',
        remarks: 'Initial class assignment',
        photo: photo
      });
      
      await classHistory.save();
    }
    
    // Return student with populated references
    const result = await Student.findById(student._id)
      .populate('class', 'name')
      .populate('academicYear', 'name')
      .populate('primaryGuardian', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: result
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'A student with this admission number already exists', 
        error: 'Duplicate key error' 
      });
    }
    
    res.status(500).json({ success:false, message: 'Server error', error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Extract guardian data if provided
    const { guardians: guardiansData, ...studentData } = req.body;
    
    // Process photo if provided as base64
    if (studentData.photo && studentData.photo.startsWith('data:image')) {
      // Extract file extension and create a unique filename
      const fileExtension = studentData.photo.split(';')[0].split('/')[1];
      const fileName = `student_${Date.now()}.${fileExtension}`;
      
      // In a real implementation, you would save this file to a storage service
      // For now, we'll just use the base64 data directly
      // photoUrl = studentData.photo;
      
      // Example code for saving to disk (commented out)
      /*
      const base64Data = studentData.photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = path.join(__dirname, '../uploads/students', fileName);
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      // Write file
      fs.writeFileSync(filePath, buffer);
      studentData.photo = `/uploads/students/${fileName}`;
      */
    }
    
    // Check if class or academic year is being updated
    const classChanged = studentData.class && 
      studentData.class.toString() !== existingStudent.class.toString();
    
    const academicYearChanged = studentData.academicYear && 
      studentData.academicYear.toString() !== existingStudent.academicYear.toString();
    
    // Update student data
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      studentData,
      { new: true, runValidators: true }
    );
    
    // Process guardians if provided
    if (guardiansData && guardiansData.length > 0) {
      const guardianIds = [];
      let primaryGuardianId = updatedStudent.primaryGuardian;
      
      // Process each guardian
      for (const guardianData of guardiansData) {
        let guardian;
        
        // If guardian has ID, update existing guardian
        if (guardianData._id) {
          guardian = await Guardian.findByIdAndUpdate(
            guardianData._id,
            guardianData,
            { new: true }
          );
        } else {
          // Check if guardian already exists by email or phone
          if (guardianData.email) {
            guardian = await Guardian.findOne({ email: guardianData.email });
          }
          
          if (!guardian && guardianData.phone) {
            guardian = await Guardian.findOne({ phone: guardianData.phone });
          }
          
          // If guardian doesn't exist, create new one
          if (!guardian) {
            guardian = new Guardian(guardianData);
            await guardian.save();
          }
        }
        
        // Add student to guardian's students array if not already there
        if (!guardian.students.includes(studentId)) {
          guardian.students.push(studentId);
          await guardian.save();
        }
        
        guardianIds.push(guardian._id);
        
        // Set as primary guardian if specified
        if (guardianData.isPrimary) {
          primaryGuardianId = guardian._id;
        }
      }
      
      // Update student with guardian information
      updatedStudent.guardians = guardianIds;
      if (primaryGuardianId) {
        updatedStudent.primaryGuardian = primaryGuardianId;
      }
      
      await updatedStudent.save();
    }
    
    // Update class history if class or academic year changed
    if (classChanged || academicYearChanged) {
      // Find current active class history
      const currentHistory = await StudentClassHistory.findOne({
        student: studentId,
        status: 'active'
      });
      
      // If found, mark as completed
      if (currentHistory) {
        currentHistory.status = 'completed';
        currentHistory.endDate = new Date();
        await currentHistory.save();
      }
      
      // Create new class history entry
      const newHistory = new StudentClassHistory({
        student: studentId,
        class: updatedStudent.class,
        classArm: updatedStudent.classArm,
        academicYear: updatedStudent.academicYear,
        school: updatedStudent.school,
        startDate: new Date(),
        status: 'active',
        remarks: 'Class/Academic year updated',
        photo: updatedStudent.photo
      });
      
      await newHistory.save();
    }
    
    // Return updated student with populated data
    const result = await Student.findById(studentId)
      .populate('guardians', 'firstName lastName relationship phone email')
      .populate('primaryGuardian', 'firstName lastName relationship phone email')
      .populate('class', 'name level')
      .populate('academicYear', 'name startDate endDate');
    
    res.json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error', 
        error: 'A student with this admission number already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Find student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Remove student from guardians' students arrays
    if (student.guardians && student.guardians.length > 0) {
      await Guardian.updateMany(
        { _id: { $in: student.guardians } },
        { $pull: { students: studentId } }
      );
    }
    
    // Delete associated documents
    if (student.documents && student.documents.length > 0) {
      await Document.deleteMany(
        { _id: { $in: student.documents } }
      );
    }
    
    // Delete associated class history records
    await StudentClassHistory.deleteMany(
      { student: studentId }
    );
    
    // Delete student
    await Student.findByIdAndDelete(studentId);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('attendance');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student.attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student grades
exports.getStudentGrades = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select('grades')
      .populate('grades.exam');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student.grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add or update student guardian
exports.manageGuardian = async (req, res) => {
  try {
    const studentId = req.params.id;
    const guardianData = req.body;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    let guardian;
    
    // If guardian has ID, update existing guardian
    if (guardianData._id) {
      guardian = await Guardian.findByIdAndUpdate(
        guardianData._id,
        guardianData,
        { new: true }
      );
      
      if (!guardian) {
        return res.status(404).json({ message: 'Guardian not found' });
      }
    } else {
      // Check if guardian already exists by email or phone
      if (guardianData.email) {
        guardian = await Guardian.findOne({ email: guardianData.email });
      }
      
      if (!guardian && guardianData.phone) {
        guardian = await Guardian.findOne({ phone: guardianData.phone });
      }
      
      // If guardian doesn't exist, create new one
      if (!guardian) {
        guardian = new Guardian(guardianData);
        await guardian.save();
      }
    }
    
    // Add student to guardian's students array if not already there
    if (!guardian.students.includes(studentId)) {
      guardian.students.push(studentId);
      await guardian.save();
    }
    
    // Add guardian to student's guardians array if not already there
    if (!student.guardians.includes(guardian._id)) {
      student.guardians.push(guardian._id);
    }
    
    // Set as primary guardian if specified
    if (guardianData.isPrimary) {
      student.primaryGuardian = guardian._id;
    }
    
    await student.save();
    
    res.json(guardian);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove guardian from student
exports.removeGuardian = async (req, res) => {
  try {
    const { id: studentId, guardianId } = req.params;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if guardian exists
    const guardian = await Guardian.findById(guardianId);
    if (!guardian) {
      return res.status(404).json({ message: 'Guardian not found' });
    }
    
    // Remove guardian from student's guardians array
    student.guardians = student.guardians.filter(
      g => g.toString() !== guardianId
    );
    
    // If removed guardian was primary, set a new primary guardian if available
    if (student.primaryGuardian && student.primaryGuardian.toString() === guardianId) {
      student.primaryGuardian = student.guardians.length > 0 ? student.guardians[0] : null;
    }
    
    await student.save();
    
    // Remove student from guardian's students array
    guardian.students = guardian.students.filter(
      s => s.toString() !== studentId
    );
    
    await guardian.save();
    
    res.json({ message: 'Guardian removed from student successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload document for student
exports.uploadDocument = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { title, type, description, fileUrl, fileName, fileType, fileSize } = req.body;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Create new document
    const document = new Document({
      student: studentId,
      title,
      type,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      uploadedBy: req.user.id // Assuming req.user is set by auth middleware
    });
    
    await document.save();
    
    // Add document to student's documents array
    if (!student.documents) {
      student.documents = [];
    }
    
    student.documents.push(document._id);
    await student.save();
    
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student documents
exports.getStudentDocuments = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get documents
    const documents = await Document.find({ student: studentId })
      .populate('uploadedBy', 'name')
      .populate('verifiedBy', 'name');
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id: studentId, documentId } = req.params;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if document belongs to student
    if (document.student.toString() !== studentId) {
      return res.status(403).json({ message: 'Document does not belong to this student' });
    }
    
    // Delete document
    await Document.findByIdAndDelete(documentId);
    
    // Remove document from student's documents array
    student.documents = student.documents.filter(
      d => d.toString() !== documentId
    );
    
    await student.save();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { id: studentId, documentId } = req.params;
    
    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if document belongs to student
    if (document.student.toString() !== studentId) {
      return res.status(403).json({ message: 'Document does not belong to this student' });
    }
    
    // Update document
    document.isVerified = true;
    document.verifiedBy = req.user.id; // Assuming req.user is set by auth middleware
    document.verificationDate = new Date();
    document.status = 'active';
    
    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student class history
exports.getStudentClassHistory = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get class history
    const history = await StudentClassHistory.find({ student: studentId })
      .populate('class', 'name level')
      .populate('classArm', 'name')
      .populate('academicYear', 'name startDate endDate')
      .sort({ startDate: -1 }) // Sort by start date (newest first)
      .lean();
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
