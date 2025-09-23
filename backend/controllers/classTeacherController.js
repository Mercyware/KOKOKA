const { prisma } = require('../config/database');

// Get all staff-class assignments for a school
exports.getClassTeacherAssignments = async (req, res) => {
  try {
    const { academicYearId, staffId, classId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      schoolId,
      ...(academicYearId && { academicYearId }),
      ...(staffId && { staffId }),
      ...(classId && { classId })
    };

    const assignments = await prisma.classTeacher.findMany({
      where: whereClause,
      include: {
        staff: {
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
      staffId,
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

    // Validate that staff, class, and academic year exist and belong to the school
    const [staff, classRecord, academicYear] = await Promise.all([
      prisma.staff.findFirst({
        where: { id: staffId, schoolId }
      }),
      prisma.class.findFirst({
        where: { id: classId, schoolId }
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, schoolId }
      })
    ]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
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
        staffId,
        classId,
        academicYearId,
        schoolId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Staff member is already assigned to this class for the selected academic year'
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
        staffId,
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
        staff: {
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
        staff: {
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
        staff: {
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
    const { staffId } = req.params;
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      staffId,
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
        staff: {
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
        { staff: { firstName: 'asc' } }
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
        staffId: true
      }
    });

    const assignedStaffIds = assignedTeachers.map(assignment => assignment.staffId);

    // Get all active staff not assigned to this class
    const availableStaff = await prisma.staff.findMany({
      where: {
        schoolId,
        status: 'ACTIVE',
        id: {
          notIn: assignedStaffIds
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
      data: availableStaff
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

    const [classes, sections, academicYears, staff, subjects] = await Promise.all([
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
      prisma.section.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          capacity: true,
          description: true
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
      prisma.staff.findMany({
        where: {
          schoolId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          position: true
        },
        orderBy: {
          firstName: 'asc'
        }
      }),
      prisma.subject.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          code: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        classes,
        sections,
        academicYears,
        staff,
        subjects
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

// Bulk create assignments for multiple teachers/classes
exports.bulkCreateAssignments = async (req, res) => {
  try {
    const { assignments, academicYearId } = req.body;
    const schoolId = req.school.id;

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignments array is required and cannot be empty'
      });
    }

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Academic year ID is required'
      });
    }

    // Validate academic year exists
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, schoolId }
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // Process each assignment
    for (const assignment of assignments) {
      try {
        const {
          staffId,
          classId,
          isClassTeacher = true,
          isSubjectTeacher = false,
          subjects = [],
          canMarkAttendance = true,
          canGradeAssignments = true,
          canManageClassroom = false,
          notes
        } = assignment;

        // Validate required fields
        if (!staffId || !classId) {
          results.failed.push({
            assignment,
            error: 'Staff ID and Class ID are required'
          });
          continue;
        }

        // Check if assignment already exists
        const existingAssignment = await prisma.classTeacher.findFirst({
          where: {
            staffId,
            classId,
            academicYearId,
            schoolId
          }
        });

        if (existingAssignment) {
          results.skipped.push({
            assignment,
            reason: 'Assignment already exists'
          });
          continue;
        }

        // If assigning as class teacher with classroom management, check for conflicts
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
            results.failed.push({
              assignment,
              error: 'Class already has a class teacher'
            });
            continue;
          }
        }

        // Create the assignment
        const createdAssignment = await prisma.classTeacher.create({
          data: {
            staffId,
            classId,
            academicYearId,
            schoolId,
            isClassTeacher,
            isSubjectTeacher,
            subjects: subjects || [],
            canMarkAttendance,
            canGradeAssignments,
            canManageClassroom: isClassTeacher ? canManageClassroom : false,
            notes,
            status: 'ACTIVE'
          },
          include: {
            staff: {
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
            }
          }
        });

        results.successful.push(createdAssignment);

      } catch (error) {
        results.failed.push({
          assignment,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk assignment completed. ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped.`,
      data: results
    });

  } catch (error) {
    console.error('Error in bulk create assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk assignments',
      error: error.message
    });
  }
};

// Copy assignments from one academic year to another
exports.copyAssignments = async (req, res) => {
  try {
    const { fromAcademicYearId, toAcademicYearId, classIds = [] } = req.body;
    const schoolId = req.school.id;

    if (!fromAcademicYearId || !toAcademicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Both source and target academic year IDs are required'
      });
    }

    // Validate academic years exist
    const [fromYear, toYear] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { id: fromAcademicYearId, schoolId }
      }),
      prisma.academicYear.findFirst({
        where: { id: toAcademicYearId, schoolId }
      })
    ]);

    if (!fromYear || !toYear) {
      return res.status(404).json({
        success: false,
        message: 'One or both academic years not found'
      });
    }

    // Build where clause for source assignments
    const whereClause = {
      academicYearId: fromAcademicYearId,
      schoolId,
      status: 'ACTIVE'
    };

    if (classIds.length > 0) {
      whereClause.classId = { in: classIds };
    }

    // Get assignments from source academic year
    const sourceAssignments = await prisma.classTeacher.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        }
      }
    });

    if (sourceAssignments.length === 0) {
      return res.json({
        success: true,
        message: 'No assignments found to copy',
        data: { copied: 0, skipped: 0, failed: 0 }
      });
    }

    const results = {
      copied: [],
      skipped: [],
      failed: []
    };

    // Copy each assignment
    for (const assignment of sourceAssignments) {
      try {
        // Check if staff is still active
        if (assignment.staff.status !== 'ACTIVE') {
          results.skipped.push({
            assignment: assignment,
            reason: 'Staff member is no longer active'
          });
          continue;
        }

        // Check if assignment already exists in target year
        const existingAssignment = await prisma.classTeacher.findFirst({
          where: {
            staffId: assignment.staffId,
            classId: assignment.classId,
            academicYearId: toAcademicYearId,
            schoolId
          }
        });

        if (existingAssignment) {
          results.skipped.push({
            assignment: assignment,
            reason: 'Assignment already exists in target academic year'
          });
          continue;
        }

        // Create new assignment
        const newAssignment = await prisma.classTeacher.create({
          data: {
            staffId: assignment.staffId,
            classId: assignment.classId,
            academicYearId: toAcademicYearId,
            schoolId,
            isClassTeacher: assignment.isClassTeacher,
            isSubjectTeacher: assignment.isSubjectTeacher,
            subjects: assignment.subjects,
            canMarkAttendance: assignment.canMarkAttendance,
            canGradeAssignments: assignment.canGradeAssignments,
            canManageClassroom: assignment.canManageClassroom,
            notes: assignment.notes,
            status: 'ACTIVE'
          },
          include: {
            staff: {
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
            }
          }
        });

        results.copied.push(newAssignment);

      } catch (error) {
        results.failed.push({
          assignment: assignment,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Assignment copy completed. ${results.copied.length} copied, ${results.skipped.length} skipped, ${results.failed.length} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Error copying assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to copy assignments',
      error: error.message
    });
  }
};

// Get assignment summary for an academic year
exports.getAssignmentSummary = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Academic year ID is required'
      });
    }

    const [
      totalAssignments,
      classTeacherAssignments,
      subjectTeacherAssignments,
      classesWithoutTeachers,
      staffWithoutAssignments
    ] = await Promise.all([
      // Total assignments
      prisma.classTeacher.count({
        where: {
          academicYearId,
          schoolId,
          status: 'ACTIVE'
        }
      }),

      // Class teacher assignments
      prisma.classTeacher.count({
        where: {
          academicYearId,
          schoolId,
          status: 'ACTIVE',
          isClassTeacher: true
        }
      }),

      // Subject teacher assignments
      prisma.classTeacher.count({
        where: {
          academicYearId,
          schoolId,
          status: 'ACTIVE',
          isSubjectTeacher: true
        }
      }),

      // Classes without teachers
      prisma.class.findMany({
        where: {
          schoolId,
          NOT: {
            classTeachers: {
              some: {
                academicYearId,
                status: 'ACTIVE'
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          grade: true
        }
      }),

      // Staff without assignments
      prisma.staff.findMany({
        where: {
          schoolId,
          status: 'ACTIVE',
          NOT: {
            classTeachers: {
              some: {
                academicYearId,
                status: 'ACTIVE'
              }
            }
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          position: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAssignments,
          classTeacherAssignments,
          subjectTeacherAssignments,
          unassignedClasses: classesWithoutTeachers.length,
          unassignedStaff: staffWithoutAssignments.length
        },
        details: {
          classesWithoutTeachers,
          staffWithoutAssignments
        }
      }
    });

  } catch (error) {
    console.error('Error fetching assignment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment summary',
      error: error.message
    });
  }
};