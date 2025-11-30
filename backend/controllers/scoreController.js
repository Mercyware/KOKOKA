const { prisma } = require('../config/database');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/csv');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `scores_${Date.now()}.csv`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Get all assessments for dropdown
exports.getAssessments = async (req, res) => {
  try {
    const { classId, subjectId, academicYearId, termId, status } = req.query;
    const schoolId = req.school?.id;
    const userRole = req.user?.role;

    const whereClause = {
      schoolId
    };

    // Only filter by PUBLISHED status for students
    // Teachers and admins can see all assessments
    if (userRole === 'student') {
      whereClause.status = 'PUBLISHED';
    } else if (status) {
      // Allow filtering by status for teachers/admins
      whereClause.status = status.toUpperCase();
    }

    if (classId) whereClause.classId = classId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (academicYearId) whereClause.academicYearId = academicYearId;
    if (termId) whereClause.termId = termId;

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
        },
        academicYear: {
          select: { id: true, name: true }
        },
        term: {
          select: { id: true, name: true }
        },
        staff: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: [
        { scheduledDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Map assessments to include both nested and flat IDs for frontend compatibility
    const mappedAssessments = assessments.map(assessment => ({
      ...assessment,
      // Add flat ID fields for easier access
      classId: assessment.classId,
      subjectId: assessment.subjectId,
      academicYearId: assessment.academicYearId,
      termId: assessment.termId,
      // Add teacher alias for staff
      teacher: assessment.staff
    }));

    res.json({
      success: true,
      data: mappedAssessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
};

// Get students in a class for score entry
exports.getStudentsInClass = async (req, res) => {
  try {
    const { classId, academicYearId } = req.query;
    const schoolId = req.school?.id;

    if (!classId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and Academic Year ID are required'
      });
    }

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        studentClassHistory: {
          some: {
            classId,
            academicYearId,
            status: 'active'
          }
        }
      },
      select: {
        id: true,
        admissionNumber: true,
        user: {
          select: { name: true, email: true }
        },
        studentClassHistory: {
          where: {
            classId,
            academicYearId,
            status: 'active'
          },
          include: {
            class: {
              select: { id: true, name: true, grade: true }
            },
            academicYear: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// Get students for an assessment (for score entry)
exports.getStudentsForAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const schoolId = req.school?.id;

    // First get the assessment details
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        schoolId
      },
      include: {
        class: {
          select: { id: true, name: true, grade: true }
        },
        academicYear: {
          select: { id: true, name: true }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get students in the assessment's class for the academic year
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        studentClassHistory: {
          some: {
            classId: assessment.classId,
            academicYearId: assessment.academicYearId,
            status: 'active'
          }
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        studentClassHistory: {
          where: {
            classId: assessment.classId,
            academicYearId: assessment.academicYearId,
            status: 'active'
          },
          include: {
            class: {
              select: { id: true, name: true, grade: true }
            },
            academicYear: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } }
      ]
    });

    // Get existing scores for these students
    const existingScores = await prisma.grade.findMany({
      where: {
        assessmentId,
        schoolId,
        studentId: {
          in: students.map(s => s.id)
        }
      }
    });

    // Create a map of existing scores by student ID
    const scoresMap = existingScores.reduce((acc, score) => {
      acc[score.studentId] = score;
      return acc;
    }, {});

    // Add existing scores to student data
    const studentsWithScores = students.map(student => ({
      ...student,
      existingScore: scoresMap[student.id] || null
    }));

    res.json({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          title: assessment.title,
          type: assessment.type,
          totalMarks: assessment.totalMarks,
          passingMarks: assessment.passingMarks,
          class: assessment.class,
          academicYear: assessment.academicYear
        },
        students: studentsWithScores
      }
    });
  } catch (error) {
    console.error('Error fetching students for assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students for assessment',
      error: error.message
    });
  }
};

// Get scores for an assessment
exports.getScores = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const schoolId = req.school?.id;

    const scores = await prisma.grade.findMany({
      where: {
        assessmentId,
        schoolId
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            totalMarks: true,
            passingMarks: true
          }
        },
        gradedBy: {
          select: { name: true }
        }
      },
      orderBy: {
        student: {
          user: {
            name: 'asc'
          }
        }
      }
    });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scores',
      error: error.message
    });
  }
};

// Create or update a single score
exports.createOrUpdateScore = async (req, res) => {
  try {
    const {
      assessmentId,
      studentId,
      marksObtained,
      totalMarks,
      feedback,
      privateNotes
    } = req.body;
    const schoolId = req.school?.id;
    const gradedById = req.user?.id;

    // Validate gradedById - only use if it's a valid UUID format
    const isValidUUID = gradedById && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradedById);
    const validGradedById = isValidUUID ? gradedById : null;

    // Validate input
    if (!assessmentId || !studentId || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID, Student ID, and marks obtained are required'
      });
    }

    // Check if assessment exists and belongs to the school
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        schoolId
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Calculate percentage and letter grade
    const percentage = (marksObtained / (totalMarks || assessment.totalMarks)) * 100;
    const letterGrade = calculateLetterGrade(percentage);

    // Check if score already exists
    const existingScore = await prisma.grade.findUnique({
      where: {
        assessmentId_studentId_attempt: {
          assessmentId,
          studentId,
          attempt: 1
        }
      }
    });

    let score;
    if (existingScore) {
      // Update existing score
      score = await prisma.grade.update({
        where: {
          id: existingScore.id
        },
        data: {
          marksObtained,
          totalMarks: totalMarks || assessment.totalMarks,
          percentage,
          letterGrade,
          feedback,
          privateNotes,
          gradedById: validGradedById,
          gradedAt: validGradedById ? new Date() : null,
          status: 'GRADED'
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              totalMarks: true
            }
          }
        }
      });
    } else {
      // Create new score
      score = await prisma.grade.create({
        data: {
          assessmentId,
          studentId,
          marksObtained,
          totalMarks: totalMarks || assessment.totalMarks,
          percentage,
          letterGrade,
          feedback,
          privateNotes,
          schoolId,
          gradedById: validGradedById,
          gradedAt: validGradedById ? new Date() : null,
          status: 'GRADED'
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              totalMarks: true
            }
          }
        }
      });
    }

    res.json({
      success: true,
      message: existingScore ? 'Score updated successfully' : 'Score created successfully',
      data: score
    });
  } catch (error) {
    console.error('Error creating/updating score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save score',
      error: error.message
    });
  }
};

// Bulk create/update scores
exports.bulkCreateOrUpdateScores = async (req, res) => {
  try {
    const { scores } = req.body;
    const schoolId = req.school?.id;
    const gradedById = req.user?.id;

    // Validate gradedById - only use if it's a valid UUID format
    const isValidUUID = gradedById && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradedById);
    const validGradedById = isValidUUID ? gradedById : null;

    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Scores array is required and cannot be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const scoreData of scores) {
      try {
        const {
          assessmentId,
          studentId,
          marksObtained,
          totalMarks,
          feedback,
          privateNotes
        } = scoreData;

        // Validate input
        if (!assessmentId || !studentId || marksObtained === undefined) {
          errors.push({
            studentId,
            error: 'Assessment ID, Student ID, and marks obtained are required'
          });
          continue;
        }

        // Get assessment for total marks
        const assessment = await prisma.assessment.findFirst({
          where: {
            id: assessmentId,
            schoolId
          }
        });

        if (!assessment) {
          errors.push({
            studentId,
            error: 'Assessment not found'
          });
          continue;
        }

        // Calculate percentage and letter grade
        const percentage = (marksObtained / (totalMarks || assessment.totalMarks)) * 100;
        const letterGrade = calculateLetterGrade(percentage);

        // Upsert score
        const score = await prisma.grade.upsert({
          where: {
            assessmentId_studentId_attempt: {
              assessmentId,
              studentId,
              attempt: 1
            }
          },
          create: {
            assessmentId,
            studentId,
            marksObtained,
            totalMarks: totalMarks || assessment.totalMarks,
            percentage,
            letterGrade,
            feedback,
            privateNotes,
            schoolId,
            gradedById: validGradedById,
            gradedAt: validGradedById ? new Date() : null,
            status: 'GRADED'
          },
          update: {
            marksObtained,
            totalMarks: totalMarks || assessment.totalMarks,
            percentage,
            letterGrade,
            feedback,
            privateNotes,
            gradedById: validGradedById,
            gradedAt: validGradedById ? new Date() : null,
            status: 'GRADED'
          }
        });

        results.push(score);
      } catch (error) {
        errors.push({
          studentId: scoreData.studentId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} scores successfully`,
      data: {
        successful: results.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error bulk creating/updating scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk save scores',
      error: error.message
    });
  }
};

// CSV upload endpoint
exports.uploadScoresCSV = [
  upload.single('csvFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
      }

      const { assessmentId } = req.body;
      const schoolId = req.school?.id;
      const gradedById = req.user?.id;

      // Validate gradedById - only use if it's a valid UUID format
      const isValidUUID = gradedById && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradedById);
      const validGradedById = isValidUUID ? gradedById : null;

      if (!assessmentId) {
        return res.status(400).json({
          success: false,
          message: 'Assessment ID is required'
        });
      }

      // Check if assessment exists
      const assessment = await prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          schoolId
        }
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      const scores = [];
      const errors = [];

      // Parse CSV file
      const parsePromise = new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => {
            // Expected CSV format: studentId, studentName (optional), marksObtained, feedback (optional), privateNotes (optional)
            if (row.studentId && row.marksObtained !== undefined) {
              scores.push({
                assessmentId,
                studentId: row.studentId.trim(),
                marksObtained: parseFloat(row.marksObtained),
                feedback: row.feedback?.trim() || null,
                privateNotes: row.privateNotes?.trim() || null
              });
            } else {
              errors.push({
                row: row,
                error: 'Missing required fields: studentId, marksObtained'
              });
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      await parsePromise;

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (scores.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid scores found in CSV file',
          errors
        });
      }

      // Process scores using bulk create function
      const results = [];
      for (const scoreData of scores) {
        try {
          const percentage = (scoreData.marksObtained / assessment.totalMarks) * 100;
          const letterGrade = calculateLetterGrade(percentage);

          const score = await prisma.grade.upsert({
            where: {
              assessmentId_studentId_attempt: {
                assessmentId: scoreData.assessmentId,
                studentId: scoreData.studentId,
                attempt: 1
              }
            },
            create: {
              ...scoreData,
              totalMarks: assessment.totalMarks,
              percentage,
              letterGrade,
              schoolId,
              gradedById: validGradedById,
              gradedAt: validGradedById ? new Date() : null,
              status: 'GRADED'
            },
            update: {
              marksObtained: scoreData.marksObtained,
              totalMarks: assessment.totalMarks,
              percentage,
              letterGrade,
              feedback: scoreData.feedback,
              privateNotes: scoreData.privateNotes,
              gradedById: validGradedById,
              gradedAt: validGradedById ? new Date() : null,
              status: 'GRADED'
            }
          });

          results.push(score);
        } catch (error) {
          errors.push({
            studentId: scoreData.studentId,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `CSV processed successfully. ${results.length} scores saved.`,
        data: {
          successful: results.length,
          errors: errors.length,
          errorDetails: errors
        }
      });
    } catch (error) {
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Error uploading CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process CSV file',
        error: error.message
      });
    }
  }
];

// Delete a score
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;

    const score = await prisma.grade.findFirst({
      where: {
        id,
        schoolId
      }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }

    await prisma.grade.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Score deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete score',
      error: error.message
    });
  }
};

// Get form data (classes, subjects, academic years, terms)
exports.getFormData = async (req, res) => {
  try {
    const schoolId = req.school?.id;

    const [classes, subjects, academicYears, terms] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
      }),
      prisma.subject.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
      }),
      prisma.academicYear.findMany({
        where: { schoolId },
        orderBy: { startDate: 'desc' }
      }),
      prisma.term.findMany({
        where: { schoolId },
        orderBy: [
          { academicYearId: 'desc' },
          { startDate: 'asc' }
        ]
      })
    ]);

    res.json({
      success: true,
      data: {
        classes,
        subjects,
        academicYears,
        terms
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

// Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      totalMarks,
      passingMarks,
      weight,
      duration,
      scheduledDate,
      dueDate,
      instructions,
      subjectId,
      classId,
      academicYearId,
      termId,
      status
    } = req.body;

    // Validation
    if (!title || !type || !totalMarks || !subjectId || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, type, totalMarks, subjectId, classId'
      });
    }

    // Ensure academicYearId is provided (required by schema)
    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Academic Year is required for creating assessments'
      });
    }

    // Get school from middleware
    const schoolId = req.school.id;

    // Use current user ID for createdBy, but need a valid staffId
    const userId = req.user.id;

    // Find any staff member in the school to use as staffId (required by schema)
    const staff = await prisma.staff.findFirst({
      where: { schoolId }
    });

    if (!staff) {
      return res.status(500).json({
        success: false,
        message: 'No staff members found in the school'
      });
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type: type.toUpperCase(),
        totalMarks: parseInt(totalMarks),
        passingMarks: passingMarks ? parseInt(passingMarks) : Math.floor(parseInt(totalMarks) * 0.4),
        weight: weight ? parseFloat(weight) : 1.0,
        duration: duration ? parseInt(duration) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        instructions,
        status: status ? status.toUpperCase() : 'DRAFT',
        schoolId,
        subjectId,
        classId,
        academicYearId: academicYearId,
        termId: (termId && termId.trim() !== '' && termId !== '1') ? termId : null,
        staffId: staff.id,
        createdById: userId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
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

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: error.message
    });
  }
};

// Get assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school?.id;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        schoolId
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
        },
        academicYear: {
          select: { id: true, name: true }
        },
        term: {
          select: { id: true, name: true }
        },
        staff: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Map to include flat IDs for frontend compatibility
    const mappedAssessment = {
      ...assessment,
      classId: assessment.classId,
      subjectId: assessment.subjectId,
      academicYearId: assessment.academicYearId,
      termId: assessment.termId,
      teacher: assessment.staff
    };

    res.json({
      success: true,
      data: mappedAssessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment',
      error: error.message
    });
  }
};

// Update assessment
exports.updateAssessment = async (req, res) => {
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
      duration,
      scheduledDate,
      dueDate,
      instructions,
      subjectId,
      classId,
      academicYearId,
      termId,
      status
    } = req.body;

    // Check if assessment exists and belongs to this school
    const existingAssessment = await prisma.assessment.findFirst({
      where: { id, schoolId }
    });

    if (!existingAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        title,
        description,
        type: type ? type.toUpperCase() : undefined,
        totalMarks: totalMarks ? parseInt(totalMarks) : undefined,
        passingMarks: passingMarks ? parseInt(passingMarks) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        duration: duration ? parseInt(duration) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        instructions,
        status: status ? status.toUpperCase() : undefined,
        subjectId,
        classId,
        academicYearId,
        termId: (termId && termId.trim() !== '' && termId !== '1') ? termId : null
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
        },
        academicYear: {
          select: { id: true, name: true }
        },
        term: {
          select: { id: true, name: true }
        },
        staff: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // Map to include flat IDs for frontend compatibility
    const mappedAssessment = {
      ...assessment,
      classId: assessment.classId,
      subjectId: assessment.subjectId,
      academicYearId: assessment.academicYearId,
      termId: assessment.termId,
      teacher: assessment.staff
    };

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: mappedAssessment
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment',
      error: error.message
    });
  }
};

// Utility function to calculate letter grade
function calculateLetterGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
}

module.exports = exports;
