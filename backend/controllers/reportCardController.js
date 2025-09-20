const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

// ================================
// REPORT CARD TEMPLATES
// ================================

// Get all templates for a school
exports.getTemplates = async (req, res) => {
  try {
    const { schoolId } = req.user;
    
    const templates = await prisma.reportCardTemplate.findMany({
      where: { schoolId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { reportCards: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { schoolId } = req.user;

    const template = await prisma.reportCardTemplate.findFirst({
      where: {
        id: templateId,
        schoolId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { schoolId, id: userId } = req.user;
    const {
      name,
      description,
      type,
      layout,
      subjectOrder = [],
      includeAttendance = true,
      includeConduct = true,
      includeCreditHours = false,
      includeClassRank = false,
      includeGPA = true,
      includePercentile = false,
      includeComments = true,
      includeSignatures = true,
      gradingScale,
      passingGrade = 'D',
      showLetterGrades = true,
      showPercentages = true,
      showGPA = true,
      headerText,
      footerText,
      logoUrl,
      colors,
      fonts,
      pageSize = 'A4',
      orientation = 'portrait',
      isDefault = false
    } = req.body;

    // If this is set as default, update other templates
    if (isDefault) {
      await prisma.reportCardTemplate.updateMany({
        where: { schoolId },
        data: { isDefault: false }
      });
    }

    const template = await prisma.reportCardTemplate.create({
      data: {
        name,
        description,
        type,
        layout,
        subjectOrder,
        includeAttendance,
        includeConduct,
        includeCreditHours,
        includeClassRank,
        includeGPA,
        includePercentile,
        includeComments,
        includeSignatures,
        gradingScale,
        passingGrade,
        showLetterGrades,
        showPercentages,
        showGPA,
        headerText,
        footerText,
        logoUrl,
        colors,
        fonts,
        pageSize,
        orientation,
        isDefault,
        schoolId,
        createdById: userId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { schoolId } = req.user;
    const updateData = req.body;

    // Check if template exists and belongs to school
    const existingTemplate = await prisma.reportCardTemplate.findFirst({
      where: {
        id: templateId,
        schoolId,
        isSystem: false // Don't allow editing system templates
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or cannot be edited'
      });
    }

    // If setting as default, update other templates
    if (updateData.isDefault) {
      await prisma.reportCardTemplate.updateMany({
        where: { 
          schoolId,
          id: { not: templateId }
        },
        data: { isDefault: false }
      });
    }

    const template = await prisma.reportCardTemplate.update({
      where: { id: templateId },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { schoolId } = req.user;

    // Check if template exists and can be deleted
    const template = await prisma.reportCardTemplate.findFirst({
      where: {
        id: templateId,
        schoolId,
        isSystem: false // Don't allow deleting system templates
      },
      include: {
        _count: {
          select: { reportCards: true }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or cannot be deleted'
      });
    }

    // Check if template is being used
    if (template._count.reportCards > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete template that has been used to generate report cards'
      });
    }

    await prisma.reportCardTemplate.delete({
      where: { id: templateId }
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
};

// ================================
// REPORT CARD GENERATION
// ================================

// Generate report card for individual student
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      templateId, 
      academicYearId, 
      termId, 
      reportType, 
      reportPeriod 
    } = req.body;
    const { schoolId, id: userId } = req.user;

    // Fetch student data
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        user: true,
        currentClass: true,
        gradeEntries: {
          where: {
            gradeBook: {
              academicYearId,
              ...(termId && { termId })
            }
          },
          include: {
            gradeBook: {
              include: {
                subject: true,
                staff: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch template
    const template = await prisma.reportCardTemplate.findFirst({
      where: { id: templateId, schoolId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Generate report data
    const reportData = await generateReportData(student, template, academicYearId, termId);

    // Check if report already exists
    const existingReport = await prisma.reportCard.findFirst({
      where: {
        studentId,
        templateId,
        academicYearId,
        reportType,
        reportPeriod,
        ...(termId && { termId })
      }
    });

    let reportCard;
    if (existingReport) {
      // Update existing report
      reportCard = await prisma.reportCard.update({
        where: { id: existingReport.id },
        data: {
          generatedData: reportData,
          subjectGrades: reportData.subjectGrades,
          overallSummary: reportData.overallSummary,
          overallGrade: reportData.overallGrade,
          overallPercentage: reportData.overallPercentage,
          overallGPA: reportData.overallGPA,
          classRank: reportData.classRank,
          classSize: reportData.classSize,
          attendanceData: reportData.attendanceData,
          conductGrade: reportData.conductGrade,
          teacherComments: reportData.teacherComments,
          generatedBy: userId,
          status: 'DRAFT'
        }
      });
    } else {
      // Create new report
      reportCard = await prisma.reportCard.create({
        data: {
          studentId,
          academicYearId,
          termId,
          classId: student.currentClassId,
          templateId,
          reportType,
          reportPeriod,
          generatedData: reportData,
          subjectGrades: reportData.subjectGrades,
          overallSummary: reportData.overallSummary,
          overallGrade: reportData.overallGrade,
          overallPercentage: reportData.overallPercentage,
          overallGPA: reportData.overallGPA,
          classRank: reportData.classRank,
          classSize: reportData.classSize,
          attendanceData: reportData.attendanceData,
          conductGrade: reportData.conductGrade,
          teacherComments: reportData.teacherComments,
          generatedBy: userId,
          status: 'DRAFT'
        }
      });
    }

    res.json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    console.error('Generate student report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report card',
      error: error.message
    });
  }
};

// Generate report cards for entire class
exports.generateClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const {
      templateId,
      academicYearId,
      termId,
      reportType,
      reportPeriod,
      studentIds = [] // Optional: generate for specific students only
    } = req.body;
    const { schoolId, id: userId } = req.user;

    // Create batch record
    const batchName = `${reportType} - Class Report - ${new Date().toLocaleDateString()}`;
    const batch = await prisma.reportBatch.create({
      data: {
        name: batchName,
        description: `Bulk report generation for class`,
        academicYearId,
        termId,
        classIds: [classId],
        studentIds: studentIds.length > 0 ? studentIds : undefined,
        templateId,
        reportType,
        reportPeriod,
        status: 'PENDING',
        totalStudents: 0, // Will be updated
        schoolId,
        createdById: userId
      }
    });

    // Start background processing
    processClassReports(batch.id, classId, studentIds, schoolId);

    res.json({
      success: true,
      data: {
        batchId: batch.id,
        message: 'Report generation started. Check batch status for progress.'
      }
    });
  } catch (error) {
    console.error('Generate class reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start report generation',
      error: error.message
    });
  }
};

// Get all batches for a school
exports.getAllBatches = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const batches = await prisma.reportBatch.findMany({
      where: { schoolId },
      include: {
        template: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
};

// Get batch status
exports.getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { schoolId } = req.user;

    const batch = await prisma.reportBatch.findFirst({
      where: { id: batchId, schoolId },
      include: {
        template: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true }
        }
      }
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch status',
      error: error.message
    });
  }
};

// Get report cards for a student
exports.getStudentReports = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId, termId } = req.query;
    const { schoolId } = req.user;

    const reports = await prisma.reportCard.findMany({
      where: {
        studentId,
        student: { schoolId },
        ...(academicYearId && { academicYearId }),
        ...(termId && { termId })
      },
      include: {
        template: {
          select: { name: true, type: true }
        },
        academicYear: {
          select: { name: true }
        },
        term: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student reports',
      error: error.message
    });
  }
};

// Get report cards for a class
exports.getClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYearId, termId, templateId } = req.query;
    const { schoolId } = req.user;

    const reports = await prisma.reportCard.findMany({
      where: {
        classId,
        class: { schoolId },
        ...(academicYearId && { academicYearId }),
        ...(termId && { termId }),
        ...(templateId && { templateId })
      },
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            user: {
              select: { name: true }
            }
          }
        },
        template: {
          select: { name: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get class reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class reports',
      error: error.message
    });
  }
};

// Approve report card
exports.approveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { schoolId, id: userId } = req.user;

    const report = await prisma.reportCard.findFirst({
      where: {
        id: reportId,
        student: { schoolId }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    const updatedReport = await prisma.reportCard.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedReport
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve report card',
      error: error.message
    });
  }
};

// Publish report card
exports.publishReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { schoolId } = req.user;

    const report = await prisma.reportCard.findFirst({
      where: {
        id: reportId,
        student: { schoolId },
        status: 'APPROVED'
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found or not approved'
      });
    }

    const updatedReport = await prisma.reportCard.update({
      where: { id: reportId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedReport
    });
  } catch (error) {
    console.error('Publish report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish report card',
      error: error.message
    });
  }
};

// Generate PDF for report card
exports.generatePDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { schoolId } = req.user;

    const report = await prisma.reportCard.findFirst({
      where: {
        id: reportId,
        student: { schoolId }
      },
      include: {
        student: {
          include: {
            user: true,
            currentClass: true
          }
        },
        template: true,
        academicYear: true,
        term: true
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateReportCardPDF(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.student.user.name}_report_card.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Generate report data from student grades
async function generateReportData(student, template, academicYearId, termId) {
  const gradeEntries = student.gradeEntries || [];
  
  // Group grades by subject
  const subjectGrades = {};
  let totalPoints = 0;
  let totalCredits = 0;

  gradeEntries.forEach(entry => {
    const subject = entry.gradeBook.subject;
    const subjectId = subject.id;

    if (!subjectGrades[subjectId]) {
      subjectGrades[subjectId] = {
        subject: subject,
        grades: [],
        totalMarks: 0,
        obtainedMarks: 0,
        average: 0,
        letterGrade: null,
        gpa: 0
      };
    }

    subjectGrades[subjectId].grades.push(entry);
    subjectGrades[subjectId].totalMarks += entry.maxScore || 0;
    subjectGrades[subjectId].obtainedMarks += entry.rawScore || 0;
  });

  // Calculate averages and grades
  Object.keys(subjectGrades).forEach(subjectId => {
    const subjectData = subjectGrades[subjectId];
    const totalMarks = subjectData.totalMarks;
    const obtainedMarks = subjectData.obtainedMarks;
    
    if (totalMarks > 0) {
      const percentage = (obtainedMarks / totalMarks) * 100;
      subjectData.average = percentage;
      subjectData.letterGrade = calculateLetterGrade(percentage, template.gradingScale);
      subjectData.gpa = calculateGPA(subjectData.letterGrade, template.gradingScale);
      
      totalPoints += subjectData.gpa;
      totalCredits += 1; // Assuming each subject has 1 credit
    }
  });

  // Calculate overall performance
  const overallPercentage = totalCredits > 0 ? 
    Object.values(subjectGrades)
      .filter(s => s.average > 0)
      .reduce((sum, s) => sum + s.average, 0) / 
    Object.values(subjectGrades).filter(s => s.average > 0).length : 0;

  const overallGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const overallGrade = calculateLetterGrade(overallPercentage, template.gradingScale);

  // Get class rank (if required)
  let classRank = null;
  let classSize = null;

  if (template.includeClassRank && student.currentClass) {
    // This would require calculating ranks for all students in the class
    // Simplified implementation here
    classSize = await prisma.student.count({
      where: { 
        currentClassId: student.currentClassId,
        status: 'ACTIVE'
      }
    });
  }

  return {
    subjectGrades: Object.values(subjectGrades),
    overallSummary: {
      totalSubjects: Object.keys(subjectGrades).length,
      averagePercentage: overallPercentage,
      totalCredits
    },
    overallGrade,
    overallPercentage,
    overallGPA,
    classRank,
    classSize,
    attendanceData: template.includeAttendance ? await calculateAttendance(student.id, academicYearId, termId) : null,
    conductGrade: template.includeConduct ? await getConductGrade(student.id, academicYearId, termId) : null,
    teacherComments: template.includeComments ? await getTeacherComments(student.id, academicYearId, termId) : null
  };
}

// Background processing for class reports
async function processClassReports(batchId, classId, studentIds, schoolId) {
  try {
    // Update batch status
    await prisma.reportBatch.update({
      where: { id: batchId },
      data: { 
        status: 'PROCESSING',
        startedAt: new Date()
      }
    });

    // Get students in class
    const students = await prisma.student.findMany({
      where: {
        currentClassId: classId,
        schoolId,
        status: 'ACTIVE',
        ...(studentIds.length > 0 && { id: { in: studentIds } })
      },
      include: {
        user: true,
        gradeEntries: {
          include: {
            gradeBook: {
              include: {
                subject: true,
                staff: true
              }
            }
          }
        }
      }
    });

    // Update total count
    await prisma.reportBatch.update({
      where: { id: batchId },
      data: { totalStudents: students.length }
    });

    const batch = await prisma.reportBatch.findUnique({
      where: { id: batchId },
      include: { template: true }
    });

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Process each student
    for (const student of students) {
      try {
        const reportData = await generateReportData(
          student, 
          batch.template, 
          batch.academicYearId, 
          batch.termId
        );

        // Create or update report card
        await prisma.reportCard.upsert({
          where: {
            studentId_reportType_reportPeriod_academicYearId_termId: {
              studentId: student.id,
              reportType: batch.reportType,
              reportPeriod: batch.reportPeriod,
              academicYearId: batch.academicYearId,
              termId: batch.termId
            }
          },
          create: {
            studentId: student.id,
            academicYearId: batch.academicYearId,
            termId: batch.termId,
            classId: student.currentClassId,
            templateId: batch.templateId,
            reportType: batch.reportType,
            reportPeriod: batch.reportPeriod,
            generatedData: reportData,
            subjectGrades: reportData.subjectGrades,
            overallSummary: reportData.overallSummary,
            overallGrade: reportData.overallGrade,
            overallPercentage: reportData.overallPercentage,
            overallGPA: reportData.overallGPA,
            classRank: reportData.classRank,
            classSize: reportData.classSize,
            attendanceData: reportData.attendanceData,
            conductGrade: reportData.conductGrade,
            teacherComments: reportData.teacherComments,
            generatedBy: batch.createdById,
            status: 'DRAFT'
          },
          update: {
            generatedData: reportData,
            subjectGrades: reportData.subjectGrades,
            overallSummary: reportData.overallSummary,
            overallGrade: reportData.overallGrade,
            overallPercentage: reportData.overallPercentage,
            overallGPA: reportData.overallGPA,
            classRank: reportData.classRank,
            classSize: reportData.classSize,
            attendanceData: reportData.attendanceData,
            conductGrade: reportData.conductGrade,
            teacherComments: reportData.teacherComments,
            generatedBy: batch.createdById,
            status: 'DRAFT'
          }
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to generate report for student ${student.id}:`, error);
        failureCount++;
        errors.push({
          studentId: student.id,
          studentName: student.user.name,
          error: error.message
        });
      }

      // Update progress
      await prisma.reportBatch.update({
        where: { id: batchId },
        data: {
          processedStudents: successCount + failureCount,
          successfulReports: successCount,
          failedReports: failureCount
        }
      });
    }

    // Mark batch as completed
    await prisma.reportBatch.update({
      where: { id: batchId },
      data: {
        status: failureCount === 0 ? 'COMPLETED' : 'PARTIAL',
        completedAt: new Date(),
        errorLog: errors.length > 0 ? { errors } : null
      }
    });

  } catch (error) {
    console.error(`Batch processing failed for ${batchId}:`, error);
    await prisma.reportBatch.update({
      where: { id: batchId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorLog: { error: error.message }
      }
    });
  }
}

// Helper functions for calculations
function calculateLetterGrade(percentage, gradingScale) {
  if (!gradingScale?.scale) return 'F';
  
  for (const [grade, range] of Object.entries(gradingScale.scale)) {
    if (percentage >= range.min && percentage <= range.max) {
      return grade;
    }
  }
  return 'F';
}

function calculateGPA(letterGrade, gradingScale) {
  if (!gradingScale?.scale || !letterGrade) return 0;
  return gradingScale.scale[letterGrade]?.gpa || 0;
}

async function calculateAttendance(studentId, academicYearId, termId) {
  // Simplified attendance calculation
  // This would integrate with your attendance system
  return {
    totalDays: 100,
    presentDays: 95,
    percentage: 95.0
  };
}

async function getConductGrade(studentId, academicYearId, termId) {
  // Simplified conduct grade
  // This would integrate with your conduct/behavior tracking system
  return 'A';
}

async function getTeacherComments(studentId, academicYearId, termId) {
  // Get teacher comments from grade entries or separate comment system
  const comments = await prisma.gradeEntry.findMany({
    where: {
      studentId,
      gradeBook: {
        academicYearId,
        ...(termId && { termId })
      },
      feedback: { not: null }
    },
    include: {
      gradeBook: {
        include: {
          subject: true,
          staff: true
        }
      }
    }
  });

  return comments.map(comment => ({
    subject: comment.gradeBook.subject.name,
    teacher: comment.gradeBook.staff.firstName + ' ' + comment.gradeBook.staff.lastName,
    comment: comment.feedback
  }));
}

// Generate PDF for report card
async function generateReportCardPDF(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: report.template.pageSize || 'A4',
        layout: report.template.orientation || 'portrait'
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Add content to PDF
      generatePDFContent(doc, report);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generatePDFContent(doc, report) {
  const { student, template, academicYear, term, generatedData } = report;
  
  // Header
  doc.fontSize(20).text(`${template.headerText || 'Report Card'}`, { align: 'center' });
  doc.fontSize(14).text(`Academic Year: ${academicYear.name}`, { align: 'center' });
  if (term) {
    doc.text(`Term: ${term.name}`, { align: 'center' });
  }
  
  doc.moveDown(2);
  
  // Student Information
  doc.fontSize(12);
  doc.text(`Student Name: ${student.user.name}`, 50, doc.y);
  doc.text(`Admission Number: ${student.admissionNumber}`, 50, doc.y);
  doc.text(`Class: ${student.currentClass?.name || 'N/A'}`, 50, doc.y);
  
  doc.moveDown(2);
  
  // Subject Grades Table
  if (generatedData.subjectGrades && generatedData.subjectGrades.length > 0) {
    doc.text('Subject Performance:', 50, doc.y);
    doc.moveDown();
    
    // Table headers
    const startY = doc.y;
    doc.text('Subject', 50, startY);
    doc.text('Grade', 200, startY);
    doc.text('Percentage', 300, startY);
    if (template.showGPA) {
      doc.text('GPA', 400, startY);
    }
    
    doc.moveDown();
    
    // Subject rows
    generatedData.subjectGrades.forEach(subject => {
      const y = doc.y;
      doc.text(subject.subject.name, 50, y);
      doc.text(subject.letterGrade || 'N/A', 200, y);
      doc.text(`${subject.average.toFixed(1)}%`, 300, y);
      if (template.showGPA) {
        doc.text(subject.gpa.toFixed(2), 400, y);
      }
      doc.moveDown();
    });
  }
  
  doc.moveDown(2);
  
  // Overall Summary
  doc.text('Overall Performance:', 50, doc.y);
  doc.text(`Overall Grade: ${report.overallGrade || 'N/A'}`, 50, doc.y);
  doc.text(`Overall Percentage: ${report.overallPercentage ? report.overallPercentage.toFixed(1) + '%' : 'N/A'}`, 50, doc.y);
  if (template.showGPA) {
    doc.text(`Overall GPA: ${report.overallGPA ? report.overallGPA.toFixed(2) : 'N/A'}`, 50, doc.y);
  }
  
  // Class Rank
  if (template.includeClassRank && report.classRank) {
    doc.text(`Class Rank: ${report.classRank} of ${report.classSize}`, 50, doc.y);
  }
  
  doc.moveDown(2);
  
  // Attendance
  if (template.includeAttendance && generatedData.attendanceData) {
    doc.text('Attendance:', 50, doc.y);
    doc.text(`Present: ${generatedData.attendanceData.presentDays} out of ${generatedData.attendanceData.totalDays} days`, 50, doc.y);
    doc.text(`Attendance Percentage: ${generatedData.attendanceData.percentage}%`, 50, doc.y);
    doc.moveDown();
  }
  
  // Conduct
  if (template.includeConduct && generatedData.conductGrade) {
    doc.text(`Conduct Grade: ${generatedData.conductGrade}`, 50, doc.y);
    doc.moveDown();
  }
  
  // Teacher Comments
  if (template.includeComments && generatedData.teacherComments && generatedData.teacherComments.length > 0) {
    doc.text('Teacher Comments:', 50, doc.y);
    doc.moveDown();
    
    generatedData.teacherComments.forEach(comment => {
      doc.text(`${comment.subject} (${comment.teacher}): ${comment.comment}`, 50, doc.y, { 
        width: 500,
        continued: false
      });
      doc.moveDown();
    });
  }
  
  // Footer
  if (template.footerText) {
    doc.text(template.footerText, { align: 'center' });
  }
  
  // Signatures (if included)
  if (template.includeSignatures) {
    doc.moveDown(3);
    doc.text('_____________________', 50, doc.y);
    doc.text('Class Teacher', 50, doc.y);
    
    doc.text('_____________________', 300, doc.y - 30);
    doc.text('Principal', 300, doc.y - 15);
  }
}
