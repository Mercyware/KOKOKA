const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all class-subject assignments for a school with filtering
const getClassSubjectHistory = async (req, res) => {
  try {
    // Check if school context is available
    if (!req.school) {
      console.log('Missing school context in class-subject history request');
      return res.status(404).json({
        success: false,
        message: 'School not found or inactive',
        debug: {
          hasSchool: !!req.school,
          headers: req.headers['x-school-subdomain'],
          host: req.headers.host
        }
      });
    }
    
    const schoolId = req.school.id;
    const {
      page = 1,
      limit = 10,
      classId,
      subjectId,
      academicYearId,
      teacherId,
      status,
      isCore,
      term,
      semester
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      schoolId,
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(academicYearId && { academicYearId }),
      ...(teacherId && { teacherId }),
      ...(status && { status }),
      ...(isCore !== undefined && { isCore: isCore === 'true' }),
      ...(term && { term: parseInt(term) }),
      ...(semester && { semester: parseInt(semester) })
    };

    // Get total count
    const total = await prisma.classSubjectHistory.count({ where });

    // Get paginated results
    const history = await prisma.classSubjectHistory.findMany({
      where,
      include: {
        class: true,
        subject: true,
        academicYear: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { class: { name: 'asc' } },
        { subject: { name: 'asc' } }
      ],
      skip,
      take: limitNum
    });

    res.json({
      success: true,
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching class-subject history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get class-subject assignment by ID
const getClassSubjectHistoryById = async (req, res) => {
  try {
    // Check if school context is available
    if (!req.school) {
      console.log('Missing school context in get class-subject history by ID request');
      return res.status(404).json({
        success: false,
        message: 'School not found or inactive'
      });
    }
    
    const schoolId = req.school.id;
    const { id } = req.params;

    const history = await prisma.classSubjectHistory.findFirst({
      where: {
        id,
        schoolId
      },
      include: {
        class: true,
        subject: true,
        academicYear: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Class-subject assignment not found'
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching class-subject history by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new class-subject assignment
const createClassSubjectHistory = async (req, res) => {
  try {
    // Check if school context is available
    if (!req.school) {
      console.log('Missing school context in create class-subject history request');
      return res.status(404).json({
        success: false,
        message: 'School not found or inactive'
      });
    }
    
    const schoolId = req.school.id;
    const {
      classId,
      subjectId,
      academicYearId,
      isCore = true,
      isOptional = false,
      credits,
      hoursPerWeek,
      term,
      semester,
      teacherId,
      status = 'ACTIVE',
      startDate,
      endDate,
      maxStudents,
      prerequisites = [],
      description,
      gradingScale,
      passingGrade
    } = req.body;

    // Validate required fields
    if (!classId || !subjectId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID, Subject ID, and Academic Year ID are required'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.classSubjectHistory.findFirst({
      where: {
        schoolId,
        classId,
        subjectId,
        academicYearId,
        term: term || null
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This subject is already assigned to this class for the specified academic year and term'
      });
    }

    // Verify that class, subject, and academic year exist and belong to the school
    const [classExists, subjectExists, academicYearExists] = await Promise.all([
      prisma.class.findFirst({ where: { id: classId, schoolId } }),
      prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, schoolId } })
    ]);

    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (!subjectExists) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (!academicYearExists) {
      return res.status(400).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // Verify teacher if provided
    if (teacherId) {
      const teacherExists = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId }
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: 'Teacher not found'
        });
      }
    }

    // Create the assignment
    const history = await prisma.classSubjectHistory.create({
      data: {
        schoolId,
        classId,
        subjectId,
        academicYearId,
        isCore,
        isOptional,
        credits: credits || null,
        hoursPerWeek: hoursPerWeek || null,
        term: term || null,
        semester: semester || null,
        teacherId: teacherId || null,
        status,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        maxStudents: maxStudents || null,
        prerequisites,
        description: description || null,
        gradingScale: gradingScale || null,
        passingGrade: passingGrade || null
      },
      include: {
        class: true,
        subject: true,
        academicYear: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Class-subject assignment created successfully',
      data: history
    });
  } catch (error) {
    console.error('Error creating class-subject history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update class-subject assignment
const updateClassSubjectHistory = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { id } = req.params;
    const {
      isCore,
      isOptional,
      credits,
      hoursPerWeek,
      term,
      semester,
      teacherId,
      status,
      startDate,
      endDate,
      maxStudents,
      prerequisites,
      description,
      gradingScale,
      passingGrade
    } = req.body;

    // Check if assignment exists
    const existingHistory = await prisma.classSubjectHistory.findFirst({
      where: { id, schoolId }
    });

    if (!existingHistory) {
      return res.status(404).json({
        success: false,
        message: 'Class-subject assignment not found'
      });
    }

    // Verify teacher if provided
    if (teacherId && teacherId !== existingHistory.teacherId) {
      const teacherExists = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId }
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: 'Teacher not found'
        });
      }
    }

    // Update the assignment
    const history = await prisma.classSubjectHistory.update({
      where: { id },
      data: {
        ...(isCore !== undefined && { isCore }),
        ...(isOptional !== undefined && { isOptional }),
        ...(credits !== undefined && { credits }),
        ...(hoursPerWeek !== undefined && { hoursPerWeek }),
        ...(term !== undefined && { term }),
        ...(semester !== undefined && { semester }),
        ...(teacherId !== undefined && { teacherId }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(maxStudents !== undefined && { maxStudents }),
        ...(prerequisites && { prerequisites }),
        ...(description !== undefined && { description }),
        ...(gradingScale !== undefined && { gradingScale }),
        ...(passingGrade !== undefined && { passingGrade })
      },
      include: {
        class: true,
        subject: true,
        academicYear: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Class-subject assignment updated successfully',
      data: history
    });
  } catch (error) {
    console.error('Error updating class-subject history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete class-subject assignment
const deleteClassSubjectHistory = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { id } = req.params;

    // Check if assignment exists
    const existingHistory = await prisma.classSubjectHistory.findFirst({
      where: { id, schoolId }
    });

    if (!existingHistory) {
      return res.status(404).json({
        success: false,
        message: 'Class-subject assignment not found'
      });
    }

    // Delete the assignment
    await prisma.classSubjectHistory.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Class-subject assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class-subject history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get subjects for a specific class and academic year
const getSubjectsForClass = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { classId, academicYearId } = req.query;

    if (!classId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and Academic Year ID are required'
      });
    }

    const subjects = await prisma.classSubjectHistory.findMany({
      where: {
        schoolId,
        classId,
        academicYearId,
        status: 'ACTIVE'
      },
      include: {
        subject: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: [
        { isCore: 'desc' },
        { subject: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects for class:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get classes for a specific subject and academic year
const getClassesForSubject = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { subjectId, academicYearId } = req.query;

    if (!subjectId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID and Academic Year ID are required'
      });
    }

    const classes = await prisma.classSubjectHistory.findMany({
      where: {
        schoolId,
        subjectId,
        academicYearId,
        status: 'ACTIVE'
      },
      include: {
        class: true,
        assignedTeacher: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: [
        { class: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes for subject:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Bulk assign subjects to multiple classes
const bulkAssignSubjects = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignments array is required and must not be empty'
      });
    }

    // Validate all assignments before creating
    const validationPromises = assignments.map(async (assignment) => {
      const { classId, subjectId, academicYearId, term } = assignment;
      
      if (!classId || !subjectId || !academicYearId) {
        throw new Error('Each assignment must have classId, subjectId, and academicYearId');
      }

      // Check for existing assignment
      const existing = await prisma.classSubjectHistory.findFirst({
        where: {
          schoolId,
          classId,
          subjectId,
          academicYearId,
          term: term || null
        }
      });

      if (existing) {
        throw new Error(`Assignment already exists for class ${classId}, subject ${subjectId}`);
      }

      return assignment;
    });

    await Promise.all(validationPromises);

    // Create all assignments
    const createdAssignments = await Promise.all(
      assignments.map(assignment => 
        prisma.classSubjectHistory.create({
          data: {
            schoolId,
            classId: assignment.classId,
            subjectId: assignment.subjectId,
            academicYearId: assignment.academicYearId,
            isCore: assignment.isCore ?? true,
            isOptional: assignment.isOptional ?? false,
            credits: assignment.credits || null,
            hoursPerWeek: assignment.hoursPerWeek || null,
            term: assignment.term || null,
            semester: assignment.semester || null,
            teacherId: assignment.teacherId || null,
            status: assignment.status || 'ACTIVE',
            startDate: assignment.startDate ? new Date(assignment.startDate) : new Date(),
            endDate: assignment.endDate ? new Date(assignment.endDate) : null,
            maxStudents: assignment.maxStudents || null,
            prerequisites: assignment.prerequisites || [],
            description: assignment.description || null,
            gradingScale: assignment.gradingScale || null,
            passingGrade: assignment.passingGrade || null
          },
          include: {
            class: true,
            subject: true,
            academicYear: true,
            assignedTeacher: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${createdAssignments.length} class-subject assignments created successfully`,
      data: createdAssignments
    });
  } catch (error) {
    console.error('Error bulk assigning subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Copy assignments from one academic year to another
const copyAssignments = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { fromAcademicYearId, toAcademicYearId, classIds = [] } = req.body;

    if (!fromAcademicYearId || !toAcademicYearId) {
      return res.status(400).json({
        success: false,
        message: 'From and To Academic Year IDs are required'
      });
    }

    if (fromAcademicYearId === toAcademicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot copy assignments to the same academic year'
      });
    }

    // Build where clause
    const where = {
      schoolId,
      academicYearId: fromAcademicYearId,
      ...(classIds.length > 0 && { classId: { in: classIds } })
    };

    // Get assignments to copy
    const assignmentsToCopy = await prisma.classSubjectHistory.findMany({
      where
    });

    if (assignmentsToCopy.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No assignments found to copy'
      });
    }

    // Check for existing assignments in target academic year
    const existingAssignments = await prisma.classSubjectHistory.findMany({
      where: {
        schoolId,
        academicYearId: toAcademicYearId,
        ...(classIds.length > 0 && { classId: { in: classIds } })
      }
    });

    // Filter out assignments that already exist
    const newAssignments = assignmentsToCopy.filter(assignment => 
      !existingAssignments.some(existing => 
        existing.classId === assignment.classId &&
        existing.subjectId === assignment.subjectId &&
        (existing.term || null) === (assignment.term || null)
      )
    );

    if (newAssignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All assignments already exist in the target academic year'
      });
    }

    // Create new assignments
    const createdAssignments = await Promise.all(
      newAssignments.map(assignment => 
        prisma.classSubjectHistory.create({
          data: {
            schoolId,
            classId: assignment.classId,
            subjectId: assignment.subjectId,
            academicYearId: toAcademicYearId,
            isCore: assignment.isCore,
            isOptional: assignment.isOptional,
            credits: assignment.credits,
            hoursPerWeek: assignment.hoursPerWeek,
            term: assignment.term,
            semester: assignment.semester,
            teacherId: assignment.teacherId,
            status: 'ACTIVE',
            maxStudents: assignment.maxStudents,
            prerequisites: assignment.prerequisites,
            description: assignment.description,
            gradingScale: assignment.gradingScale,
            passingGrade: assignment.passingGrade
          },
          include: {
            class: true,
            subject: true,
            academicYear: true,
            assignedTeacher: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${createdAssignments.length} assignments copied successfully`,
      data: {
        copied: createdAssignments.length,
        skipped: assignmentsToCopy.length - newAssignments.length,
        assignments: createdAssignments
      }
    });
  } catch (error) {
    console.error('Error copying assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Debug endpoint to check school context
const debugSchoolContext = async (req, res) => {
  try {
    const debugInfo = {
      hasSchool: !!req.school,
      schoolId: req.school?.id,
      schoolName: req.school?.name,
      schoolSubdomain: req.school?.subdomain,
      schoolStatus: req.school?.status,
      headers: {
        'x-school-subdomain': req.headers['x-school-subdomain'],
        'host': req.headers.host,
        'origin': req.headers.origin
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Debug school context:', JSON.stringify(debugInfo, null, 2));
    
    res.json({
      success: true,
      debug: debugInfo
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
};

module.exports = {
  getClassSubjectHistory,
  getClassSubjectHistoryById,
  createClassSubjectHistory,
  updateClassSubjectHistory,
  deleteClassSubjectHistory,
  getSubjectsForClass,
  getClassesForSubject,
  bulkAssignSubjects,
  copyAssignments,
  debugSchoolContext
};