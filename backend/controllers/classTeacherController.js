const { prisma } = require('../config/database');

// Get all teacher-class assignments for a school
exports.getClassTeacherAssignments = async (req, res) => {
  try {
    const { academicYearId, teacherId, classId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      schoolId,
      ...(academicYearId && { academicYearId }),
      ...(teacherId && { teacherId }),
      ...(classId && { classId })
    };

    const assignments = await prisma.classTeacher.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
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
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { class: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching class teacher assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher-class assignments',
      error: error.message
    });
  }
};

// Create a new teacher-class assignment
exports.createClassTeacherAssignment = async (req, res) => {
  try {
    const {
      teacherId,
      classId,
      academicYearId,
      isClassTeacher = true,
      isSubjectTeacher = false,
      subjects = [],
      startDate,
      endDate,
      canMarkAttendance = true,
      canGradeAssignments = true,
      canManageClassroom = false,
      notes
    } = req.body;
    
    const schoolId = req.school.id;

    // Validate that teacher, class, and academic year exist and belong to the school
    const [teacher, classRecord, academicYear] = await Promise.all([
      prisma.teacher.findFirst({
        where: { id: teacherId, schoolId }
      }),
      prisma.class.findFirst({
        where: { id: classId, schoolId }
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, schoolId }
      })
    ]);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (!classRecord) {
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

    // Check if assignment already exists
    const existingAssignment = await prisma.classTeacher.findFirst({
      where: {
        teacherId,
        classId,
        academicYearId,
        schoolId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already assigned to this class for the selected academic year'
      });
    }

    // If assigning as class teacher, check if class already has a class teacher
    if (isClassTeacher && canManageClassroom) {
      const existingClassTeacher = await prisma.classTeacher.findFirst({
        where: {
          classId,
          academicYearId,
          schoolId,
          isClassTeacher: true,
          canManageClassroom: true,
          status: 'ACTIVE'
        }
      });

      if (existingClassTeacher) {
        return res.status(400).json({
          success: false,
          message: 'This class already has a class teacher for the selected academic year'
        });
      }
    }

    const assignment = await prisma.classTeacher.create({
      data: {
        teacherId,
        classId,
        academicYearId,
        schoolId,
        isClassTeacher,
        isSubjectTeacher,
        subjects: subjects || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        canMarkAttendance,
        canGradeAssignments,
        canManageClassroom: isClassTeacher ? canManageClassroom : false,
        notes,
        status: 'ACTIVE'
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
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

    res.status(201).json({
      success: true,
      message: 'Teacher assigned to class successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating class teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher-class assignment',
      error: error.message
    });
  }
};

// Update a teacher-class assignment
exports.updateClassTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isClassTeacher,
      isSubjectTeacher,
      subjects,
      startDate,
      endDate,
      status,
      canMarkAttendance,
      canGradeAssignments,
      canManageClassroom,
      notes
    } = req.body;
    
    const schoolId = req.school.id;

    // Check if assignment exists and belongs to the school
    const existingAssignment = await prisma.classTeacher.findFirst({
      where: { id, schoolId }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If updating to class teacher with classroom management, check for conflicts
    if (isClassTeacher && canManageClassroom) {
      const conflictingAssignment = await prisma.classTeacher.findFirst({
        where: {
          classId: existingAssignment.classId,
          academicYearId: existingAssignment.academicYearId,
          schoolId,
          isClassTeacher: true,
          canManageClassroom: true,
          status: 'ACTIVE',
          id: { not: id }
        }
      });

      if (conflictingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This class already has a class teacher for the selected academic year'
        });
      }
    }

    const updateData = {};
    if (isClassTeacher !== undefined) updateData.isClassTeacher = isClassTeacher;
    if (isSubjectTeacher !== undefined) updateData.isSubjectTeacher = isSubjectTeacher;
    if (subjects !== undefined) updateData.subjects = subjects;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (canMarkAttendance !== undefined) updateData.canMarkAttendance = canMarkAttendance;
    if (canGradeAssignments !== undefined) updateData.canGradeAssignments = canGradeAssignments;
    if (canManageClassroom !== undefined) updateData.canManageClassroom = isClassTeacher ? canManageClassroom : false;
    if (notes !== undefined) updateData.notes = notes;

    const assignment = await prisma.classTeacher.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
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

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating class teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

// Delete a teacher-class assignment
exports.deleteClassTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const assignment = await prisma.classTeacher.findFirst({
      where: { id, schoolId }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await prisma.classTeacher.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

// Get assignment by ID
exports.getClassTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const assignment = await prisma.classTeacher.findFirst({
      where: { id, schoolId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
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
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching class teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

// Get assignments by teacher ID
exports.getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      teacherId,
      schoolId,
      ...(academicYearId && { academicYearId })
    };

    const assignments = await prisma.classTeacher.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true
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
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { class: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher assignments',
      error: error.message
    });
  }
};

// Get assignments by class ID
exports.getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      classId,
      schoolId,
      ...(academicYearId && { academicYearId })
    };

    const assignments = await prisma.classTeacher.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            user: {
              select: {
                email: true
              }
            }
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
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { teacher: { firstName: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class assignments',
      error: error.message
    });
  }
};

// Get available teachers for assignment (not already assigned to the class in the academic year)
exports.getAvailableTeachers = async (req, res) => {
  try {
    const { classId, academicYearId } = req.query;
    const schoolId = req.school.id;

    if (!classId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and Academic Year ID are required'
      });
    }

    // Get teachers already assigned to this class in this academic year
    const assignedTeachers = await prisma.classTeacher.findMany({
      where: {
        classId,
        academicYearId,
        schoolId,
        status: 'ACTIVE'
      },
      select: {
        teacherId: true
      }
    });

    const assignedTeacherIds = assignedTeachers.map(assignment => assignment.teacherId);

    // Get all active teachers not assigned to this class
    const availableTeachers = await prisma.teacher.findMany({
      where: {
        schoolId,
        status: 'ACTIVE',
        id: {
          notIn: assignedTeacherIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    res.json({
      success: true,
      data: availableTeachers
    });
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers',
      error: error.message
    });
  }
};

// Get all classes and academic years for dropdowns
exports.getFormData = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const [classes, academicYears, teachers] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          grade: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.academicYear.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isCurrent: true
        },
        orderBy: {
          startDate: 'desc'
        }
      }),
      prisma.teacher.findMany({
        where: {
          schoolId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true
        },
        orderBy: {
          firstName: 'asc'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        classes,
        academicYears,
        teachers
      }
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form data',
      error: error.message
    });
  }
};