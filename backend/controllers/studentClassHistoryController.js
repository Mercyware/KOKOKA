const { prisma } = require('../config/database');

// Get class history for a specific student
exports.getStudentClassHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const history = await prisma.studentClassHistory.findMany({
      where: { studentId },
      include: {
        class: {
          select: { name: true, level: true }
        },
        section: {
          select: { name: true }
        },
        academicYear: {
          select: { name: true, startDate: true, endDate: true }
        }
      },
      orderBy: {
        academicYear: {
          startDate: 'desc'
        }
      }
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add class history entry for a student
exports.addClassHistory = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const { 
        studentId, 
        classId, 
        sectionId, 
        academicYearId, 
        startDate, 
        remarks 
      } = req.body;
      
      // Check if student exists
      const student = await tx.student.findUnique({
        where: { id: studentId }
      });
      if (!student) {
        throw new Error('Student not found');
      }
      
      // Check if class exists
      const classObj = await tx.class.findUnique({
        where: { id: classId }
      });
      if (!classObj) {
        throw new Error('Class not found');
      }
      
      // Check if academic year exists
      const academicYear = await tx.academicYear.findUnique({
        where: { id: academicYearId }
      });
      if (!academicYear) {
        throw new Error('Academic year not found');
      }
      
      // Check if student already has an active class for this academic year
      const existingActiveHistory = await tx.studentClassHistory.findFirst({
        where: {
          studentId,
          academicYearId,
          status: 'ACTIVE'
        }
      });
      
      if (existingActiveHistory) {
        // Mark the existing active history as completed
        await tx.studentClassHistory.update({
          where: { id: existingActiveHistory.id },
          data: {
            status: 'COMPLETED',
            endDate: new Date()
          }
        });
      }
      
      // Create new class history entry
      const classHistory = await tx.studentClassHistory.create({
        data: {
          studentId,
          classId,
          sectionId,
          academicYearId,
          schoolId: student.schoolId,
          startDate: startDate ? new Date(startDate) : new Date(),
          status: 'ACTIVE',
          remarks
        }
      });
      
      // Update student's current class and academic year
      await tx.student.update({
        where: { id: studentId },
        data: {
          classId,
          sectionId,
          academicYearId
        }
      });
      
      return classHistory;
    });
    
    // Return the new history entry with populated references
    const resultWithIncludes = await prisma.studentClassHistory.findUnique({
      where: { id: result.id },
      include: {
        class: {
          select: { name: true, level: true }
        },
        section: {
          select: { name: true }
        },
        academicYear: {
          select: { name: true, startDate: true, endDate: true }
        }
      }
    });
    
    res.status(201).json(resultWithIncludes);
  } catch (error) {
    if (error.message.includes('Unique constraint')) {
      return res.status(400).json({ 
        message: 'Duplicate entry error', 
        error: 'Student already has an active class for this academic year' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update class history entry
exports.updateClassHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { status, endDate, remarks } = req.body;
    
    const history = await prisma.studentClassHistory.findUnique({
      where: { id: historyId }
    });
    if (!history) {
      return res.status(404).json({ message: 'Class history entry not found' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (endDate) updateData.endDate = new Date(endDate);
    if (remarks !== undefined) updateData.remarks = remarks;
    
    const updatedHistory = await prisma.studentClassHistory.update({
      where: { id: historyId },
      data: updateData
    });
    
    // If status is changed to 'ACTIVE', update student's current class if needed
    if (status === 'ACTIVE') {
      await prisma.student.update({
        where: { id: history.studentId },
        data: {
          classId: history.classId,
          sectionId: history.sectionId,
          academicYearId: history.academicYearId
        }
      });
    }
    
    // Return updated history with populated references
    const result = await prisma.studentClassHistory.findUnique({
      where: { id: historyId },
      include: {
        class: {
          select: { name: true, level: true }
        },
        section: {
          select: { name: true }
        },
        academicYear: {
          select: { name: true, startDate: true, endDate: true }
        }
      }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete class history entry
exports.deleteClassHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    
    const history = await prisma.studentClassHistory.findUnique({
      where: { id: historyId }
    });
    if (!history) {
      return res.status(404).json({ message: 'Class history entry not found' });
    }
    
    await prisma.studentClassHistory.delete({
      where: { id: historyId }
    });
    
    res.json({ message: 'Class history entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Promote students to next class
exports.promoteStudents = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
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
        throw new Error('Missing required fields: fromClassId, toClassId, fromAcademicYearId, and toAcademicYearId are required');
      }
      
      // Check if classes and academic years exist
      const [fromClass, toClass, fromAcademicYear, toAcademicYear] = await Promise.all([
        tx.class.findUnique({ where: { id: fromClassId } }),
        tx.class.findUnique({ where: { id: toClassId } }),
        tx.academicYear.findUnique({ where: { id: fromAcademicYearId } }),
        tx.academicYear.findUnique({ where: { id: toAcademicYearId } })
      ]);
      
      if (!fromClass || !toClass || !fromAcademicYear || !toAcademicYear) {
        throw new Error('One or more required resources not found');
      }
      
      // Get students to promote
      let studentsQuery = { 
        classId: fromClassId, 
        academicYearId: fromAcademicYearId 
      };
      
      // If specific student IDs are provided, filter by them
      if (studentIds && studentIds.length > 0) {
        studentsQuery.id = { in: studentIds };
      }
      
      const students = await tx.student.findMany({
        where: studentsQuery
      });
      
      if (students.length === 0) {
        throw new Error('No students found to promote');
      }
      
      const promotedStudents = [];
      
      // Process each student
      for (const student of students) {
        // Mark current class history as completed
        const currentHistory = await tx.studentClassHistory.findFirst({
          where: {
            studentId: student.id,
            academicYearId: fromAcademicYearId,
            status: 'ACTIVE'
          }
        });
        
        if (currentHistory) {
          await tx.studentClassHistory.update({
            where: { id: currentHistory.id },
            data: {
              status: 'COMPLETED',
              endDate: new Date()
            }
          });
        }
        
        // Create new class history entry
        await tx.studentClassHistory.create({
          data: {
            studentId: student.id,
            classId: toClassId,
            academicYearId: toAcademicYearId,
            schoolId: student.schoolId,
            startDate: new Date(),
            status: 'ACTIVE',
            remarks: remarks || `Promoted from ${fromClass.name} to ${toClass.name}`
          }
        });
        
        // Update student's current class and academic year
        await tx.student.update({
          where: { id: student.id },
          data: {
            classId: toClassId,
            academicYearId: toAcademicYearId
          }
        });
        
        promotedStudents.push(student.id);
      }
      
      return promotedStudents;
    });
    
    res.json({ 
      message: `Successfully promoted ${result.length} students`,
      promotedStudents: result
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search students by class and academic year (including historical data)
exports.searchStudentsByClassAndYear = async (req, res) => {
  try {
    const { 
      class: classId, 
      academicYear: academicYearId, 
      section: sectionId,
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
      academicYearId
    };

    // Add class filter if provided
    if (classId) {
      historyQuery.classId = classId;
    }

    // Add section filter if provided
    if (sectionId) {
      historyQuery.sectionId = sectionId;
    }
    
    // Filter by status if provided
    if (status) {
      historyQuery.status = status.toUpperCase();
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find student IDs from history
    const studentHistories = await prisma.studentClassHistory.findMany({
      where: historyQuery,
      select: { studentId: true }
    });
    
    const studentIds = studentHistories.map(history => history.studentId);
    
    if (studentIds.length === 0) {
      return res.json({
        results: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        }
      });
    }
    
    // Build query for Students
    let studentQuery = { 
      id: { in: studentIds }
    };
    
    // Add search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      studentQuery.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { admissionNumber: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    // Get students with pagination
    const students = await prisma.student.findMany({
      where: studentQuery,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      skip,
      take: parseInt(limit),
      include: {
        class: {
          select: { name: true }
        },
        academicYear: {
          select: { name: true }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.student.count({
      where: studentQuery
    });
    
    // For each student, get their class history for the specified academic year
    const studentsWithHistory = await Promise.all(students.map(async (student) => {
      const history = await prisma.studentClassHistory.findFirst({
        where: {
          studentId: student.id,
          academicYearId,
          ...(classId && { classId })
        },
        include: {
          class: {
            select: { name: true, level: true }
          },
          section: {
            select: { name: true }
          },
          academicYear: {
            select: { name: true, startDate: true, endDate: true }
          }
        }
      });
      
      return {
        ...student,
        classHistory: history
      };
    }));
    
    res.json({
      results: studentsWithHistory.map(student => ({
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber
        },
        class: student.classHistory?.class || { id: classId, name: student.class?.name || 'N/A' },
        section: student.classHistory?.section,
        academicYear: student.classHistory?.academicYear || { id: academicYearId, name: student.academicYear?.name || 'N/A' },
        status: student.classHistory?.status || 'ACTIVE'
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
