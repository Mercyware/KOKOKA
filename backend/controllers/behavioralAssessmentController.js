const { prisma } = require('../config/database');

/**
 * Get all behavioral assessments with filters
 */
exports.getBehavioralAssessments = async (req, res) => {
  try {
    const { classId, subjectId, academicYearId, termId, type } = req.query;
    const schoolId = req.school?.id;

    const whereClause = {
      schoolId,
      type: {
        in: ['AFFECTIVE', 'PSYCHOMOTOR']
      }
    };

    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (academicYearId) whereClause.academicYearId = academicYearId;
    if (termId) whereClause.termId = termId;
    if (type) whereClause.type = type;

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        class: true,
        subject: true,
        academicYear: true,
        term: true,
        staff: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        },
        _count: {
          select: {
            grades: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching behavioral assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch behavioral assessments',
      error: error.message
    });
  }
};

/**
 * Get a single behavioral assessment by ID
 */
exports.getBehavioralAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        schoolId,
        type: {
          in: ['AFFECTIVE', 'PSYCHOMOTOR']
        }
      },
      include: {
        class: true,
        subject: true,
        academicYear: true,
        term: true,
        staff: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Behavioral assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching behavioral assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch behavioral assessment',
      error: error.message
    });
  }
};

/**
 * Create a new behavioral assessment
 */
exports.createBehavioralAssessment = async (req, res) => {
  try {
    const schoolId = req.school?.id;
    const userId = req.user?.id;

    const {
      title,
      description,
      type,
      totalMarks,
      passingMarks,
      weight,
      scheduledDate,
      dueDate,
      instructions,
      subjectId,
      classId,
      academicYearId,
      termId,
      status,
      criteria
    } = req.body;

    // Validate type
    if (!['AFFECTIVE', 'PSYCHOMOTOR'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either AFFECTIVE or PSYCHOMOTOR'
      });
    }

    // Get staff ID for the current user (optional - allow all authenticated users for now)
    const staff = await prisma.staff.findFirst({
      where: {
        userId,
        schoolId
      }
    });

    // Create the behavioral assessment
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type,
        totalMarks: parseInt(totalMarks),
        passingMarks: passingMarks ? parseInt(passingMarks) : Math.floor(parseInt(totalMarks) * 0.4),
        weight: parseFloat(weight) || 1.0,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        instructions,
        status: status || 'DRAFT',
        rubric: criteria || null,
        schoolId,
        subjectId,
        classId,
        academicYearId,
        termId: termId || null,
        staffId: staff?.id || null,
        createdById: userId
      },
      include: {
        class: true,
        subject: true,
        academicYear: true,
        term: true,
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Behavioral assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error creating behavioral assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create behavioral assessment',
      error: error.message
    });
  }
};

/**
 * Update a behavioral assessment
 */
exports.updateBehavioralAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;

    const {
      title,
      description,
      type,
      totalMarks,
      passingMarks,
      weight,
      scheduledDate,
      dueDate,
      instructions,
      status,
      criteria
    } = req.body;

    // Validate type
    if (type && !['AFFECTIVE', 'PSYCHOMOTOR'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either AFFECTIVE or PSYCHOMOTOR'
      });
    }

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        schoolId,
        type: {
          in: ['AFFECTIVE', 'PSYCHOMOTOR']
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Behavioral assessment not found'
      });
    }

    // Update the assessment
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (totalMarks) updateData.totalMarks = parseInt(totalMarks);
    if (passingMarks) updateData.passingMarks = parseInt(passingMarks);
    if (weight) updateData.weight = parseFloat(weight);
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (status) updateData.status = status;
    if (criteria !== undefined) updateData.rubric = criteria;

    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        subject: true,
        academicYear: true,
        term: true,
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Behavioral assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating behavioral assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update behavioral assessment',
      error: error.message
    });
  }
};

/**
 * Delete a behavioral assessment
 */
exports.deleteBehavioralAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        schoolId,
        type: {
          in: ['AFFECTIVE', 'PSYCHOMOTOR']
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Behavioral assessment not found'
      });
    }

    // Delete the assessment
    await prisma.assessment.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Behavioral assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting behavioral assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete behavioral assessment',
      error: error.message
    });
  }
};

/**
 * Submit grades for behavioral assessment
 */
exports.submitBehavioralGrades = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;
    const userId = req.user?.id;
    const { grades } = req.body;

    // Check if assessment exists
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        schoolId,
        type: {
          in: ['AFFECTIVE', 'PSYCHOMOTOR']
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Behavioral assessment not found'
      });
    }

    // Process grades
    const gradePromises = grades.map(async (gradeData) => {
      const { studentId, marksObtained, feedback, rubricScores } = gradeData;

      const percentage = (marksObtained / assessment.totalMarks) * 100;
      const letterGrade = getLetterGrade(percentage);

      return prisma.grade.upsert({
        where: {
          assessmentId_studentId_attempt: {
            assessmentId: id,
            studentId,
            attempt: 1
          }
        },
        update: {
          marksObtained,
          totalMarks: assessment.totalMarks,
          percentage,
          letterGrade,
          feedback,
          rubricScores,
          gradedById: userId,
          gradedAt: new Date(),
          status: 'GRADED'
        },
        create: {
          marksObtained,
          totalMarks: assessment.totalMarks,
          percentage,
          letterGrade,
          feedback,
          rubricScores,
          assessmentId: id,
          studentId,
          schoolId,
          gradedById: userId,
          gradedAt: new Date(),
          status: 'GRADED'
        }
      });
    });

    await Promise.all(gradePromises);

    res.status(200).json({
      success: true,
      message: 'Behavioral grades submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting behavioral grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit behavioral grades',
      error: error.message
    });
  }
};

/**
 * Record behavioral scores directly (like attendance)
 * Creates assessment and submits grades in one go
 */
exports.recordBehavioralScores = async (req, res) => {
  try {
    const schoolId = req.school?.id;
    const userId = req.user?.id;
    const { assessment, grades } = req.body;

    // Get staff ID for the current user (optional - allow all authenticated users for now)
    const staff = await prisma.staff.findFirst({
      where: {
        userId,
        schoolId
      }
    });

    // Destructure criteria and map to rubric field
    const { criteria, ...assessmentData } = assessment;

    // Ensure we have a staff record, create one if needed
    let staffRecord = staff;
    if (!staffRecord) {
      // For now, find any staff in the school or create a placeholder
      staffRecord = await prisma.staff.findFirst({
        where: { schoolId }
      });

      if (!staffRecord) {
        return res.status(400).json({
          success: false,
          message: 'No staff found for this school. Please create a staff record first.'
        });
      }
    }

    // Create the behavioral assessment
    const createdAssessment = await prisma.assessment.create({
      data: {
        title: assessmentData.title,
        description: assessmentData.description,
        type: assessmentData.type,
        totalMarks: assessmentData.totalMarks,
        passingMarks: assessmentData.passingMarks,
        weight: assessmentData.weight,
        scheduledDate: assessmentData.scheduledDate ? new Date(assessmentData.scheduledDate) : null,
        dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate) : null,
        instructions: assessmentData.instructions || null,
        status: assessmentData.status || 'PUBLISHED',
        rubric: criteria || null,
        subjectId: assessmentData.subjectId,
        classId: assessmentData.classId,
        academicYearId: assessmentData.academicYearId,
        termId: assessmentData.termId || null,
        schoolId,
        staffId: staffRecord.id,
        createdById: userId
      }
    });

    // Process and save grades
    const gradePromises = grades.map(async (gradeData) => {
      const { studentId, marksObtained, feedback, rubricScores } = gradeData;

      const percentage = (marksObtained / createdAssessment.totalMarks) * 100;
      const letterGrade = getLetterGrade(percentage);

      return prisma.grade.create({
        data: {
          marksObtained,
          totalMarks: createdAssessment.totalMarks,
          percentage,
          letterGrade,
          feedback,
          rubricScores,
          assessmentId: createdAssessment.id,
          studentId,
          schoolId,
          gradedById: userId,
          gradedAt: new Date(),
          status: 'GRADED'
        }
      });
    });

    await Promise.all(gradePromises);

    res.status(201).json({
      success: true,
      message: `Behavioral scores recorded for ${grades.length} student(s)`,
      data: createdAssessment
    });
  } catch (error) {
    console.error('Error recording behavioral scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record behavioral scores',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate letter grade
 */
function getLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  if (percentage >= 50) return 'E';
  return 'F';
}
