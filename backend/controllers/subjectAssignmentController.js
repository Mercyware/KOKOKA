const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all subject assignments for a school
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSubjectAssignments = async (req, res) => {
  try {
    const { academicYearId, classId, staffId, subjectId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      schoolId,
      ...(academicYearId && { academicYearId }),
      ...(classId && { classId }),
      ...(staffId && { staffId }),
      ...(subjectId && { subjectId })
    };

    const assignments = await prisma.subjectAssignment.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        }
      },
      orderBy: [
        { academicYear: { isCurrent: 'desc' } },
        { class: { grade: 'asc' } },
        { class: { name: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments,
      message: 'Subject assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subject assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get subject assignment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubjectAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const assignment = await prisma.subjectAssignment.findFirst({
      where: {
        id,
        schoolId
      },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true,
            qualification: true,
            experience: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            credits: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            description: true
          }
        },
        section: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isCurrent: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Subject assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment,
      message: 'Subject assignment retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subject assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create new subject assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSubjectAssignment = async (req, res) => {
  try {

    const schoolId = req.school.id;
    const {
      staffId,
      subjectId,
      classId,
      academicYearId,
      sectionId = null,
      startDate,
      endDate,
      hoursPerWeek,
      term,
      semester,
      isMainTeacher = true,
      canGrade = true,
      canMarkAttendance = true,
      notes,
      description
    } = req.body;

    // Check if assignment already exists
    const existingAssignment = await prisma.subjectAssignment.findFirst({
      where: {
        staffId,
        subjectId,
        classId,
        sectionId,
        academicYearId,
        schoolId
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Subject assignment already exists for this teacher, subject, class, and section'
      });
    }

    // Verify that the staff, subject, class, and academic year belong to the school
    const [staff, subject, classEntity, academicYear] = await Promise.all([
      prisma.staff.findFirst({ where: { id: staffId, schoolId } }),
      prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
      prisma.class.findFirst({ where: { id: classId, schoolId } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, schoolId } })
    ]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (!classEntity) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // If section is provided, verify it belongs to the school
    if (sectionId) {
      const section = await prisma.section.findFirst({
        where: { id: sectionId, schoolId }
      });

      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
    }

    const assignment = await prisma.subjectAssignment.create({
      data: {
        staffId,
        subjectId,
        classId,
        academicYearId,
        schoolId,
        sectionId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        hoursPerWeek,
        term,
        semester,
        isMainTeacher,
        canGrade,
        canMarkAttendance,
        notes,
        description
      },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Subject assignment created successfully'
    });
  } catch (error) {
    console.error('Error creating subject assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update subject assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSubjectAssignment = async (req, res) => {
  try {

    const { id } = req.params;
    const schoolId = req.school.id;
    const {
      startDate,
      endDate,
      status,
      hoursPerWeek,
      term,
      semester,
      isMainTeacher,
      canGrade,
      canMarkAttendance,
      notes,
      description
    } = req.body;

    // Check if assignment exists
    const existingAssignment = await prisma.subjectAssignment.findFirst({
      where: { id, schoolId }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Subject assignment not found'
      });
    }

    const updatedAssignment = await prisma.subjectAssignment.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : existingAssignment.startDate,
        endDate: endDate ? new Date(endDate) : existingAssignment.endDate,
        status: status || existingAssignment.status,
        hoursPerWeek: hoursPerWeek !== undefined ? hoursPerWeek : existingAssignment.hoursPerWeek,
        term: term !== undefined ? term : existingAssignment.term,
        semester: semester !== undefined ? semester : existingAssignment.semester,
        isMainTeacher: isMainTeacher !== undefined ? isMainTeacher : existingAssignment.isMainTeacher,
        canGrade: canGrade !== undefined ? canGrade : existingAssignment.canGrade,
        canMarkAttendance: canMarkAttendance !== undefined ? canMarkAttendance : existingAssignment.canMarkAttendance,
        notes: notes !== undefined ? notes : existingAssignment.notes,
        description: description !== undefined ? description : existingAssignment.description
      },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAssignment,
      message: 'Subject assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete subject assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSubjectAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if assignment exists
    const existingAssignment = await prisma.subjectAssignment.findFirst({
      where: { id, schoolId }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Subject assignment not found'
      });
    }

    await prisma.subjectAssignment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subject assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get assignments for a specific teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTeacherAssignments = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    // Verify staff member exists and belongs to school
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, schoolId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const whereClause = {
      staffId,
      schoolId,
      ...(academicYearId && { academicYearId })
    };

    const assignments = await prisma.subjectAssignment.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        }
      },
      orderBy: [
        { academicYear: { isCurrent: 'desc' } },
        { class: { grade: 'asc' } },
        { class: { name: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments,
      message: 'Teacher assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get assignments for a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYearId, sectionId } = req.query;
    const schoolId = req.school.id;

    // Verify class exists and belongs to school
    const classEntity = await prisma.class.findFirst({
      where: { id: classId, schoolId }
    });

    if (!classEntity) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const whereClause = {
      classId,
      schoolId,
      ...(academicYearId && { academicYearId }),
      ...(sectionId && { sectionId })
    };

    const assignments = await prisma.subjectAssignment.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { section: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments,
      message: 'Class assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubjectAssignments,
  getSubjectAssignmentById,
  createSubjectAssignment,
  updateSubjectAssignment,
  deleteSubjectAssignment,
  getTeacherAssignments,
  getClassAssignments
};