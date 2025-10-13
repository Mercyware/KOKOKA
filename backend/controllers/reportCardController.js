const { prisma } = require('../config/database');
const PDFDocument = require('pdfkit');

// ================================
// REPORT CARD GENERATION (Uses Result Model)
// ================================

// Generate/Get report card for a student for a term
exports.generateReportCard = async (req, res) => {
  try {
    const { studentId, termId } = req.params;
    const schoolId = req.school.id;

    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: { studentId, termId }
      },
      include: {
        student: {
          include: {
            user: true,
            currentClass: true
          }
        },
        term: {
          include: {
            academicYear: true
          }
        },
        class: true,
        school: true,
        gradeScale: {
          include: { gradeRanges: true }
        },
        subjectResults: {
          include: {
            subject: true
          },
          orderBy: {
            subject: { name: 'asc' }
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student and term'
      });
    }

    // Get class statistics
    const classStats = await prisma.result.aggregate({
      where: { classId: result.classId, termId, schoolId },
      _avg: { averageScore: true },
      _max: { averageScore: true },
      _min: { averageScore: true },
      _count: true
    });

    const reportData = {
      ...result,
      classStatistics: {
        classAverage: classStats._avg.averageScore || 0,
        highest: classStats._max.averageScore || 0,
        lowest: classStats._min.averageScore || 0,
        totalStudents: classStats._count || 0
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Generate report card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report card',
      error: error.message
    });
  }
};

// Get report cards for a class
exports.getClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId } = req.query;
    const schoolId = req.school.id;

    if (!termId) {
      return res.status(400).json({
        success: false,
        message: 'Term ID is required'
      });
    }

    const results = await prisma.result.findMany({
      where: { classId, termId, schoolId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        subjectResults: {
          include: {
            subject: {
              select: { name: true, code: true }
            }
          }
        }
      },
      orderBy: { position: 'asc' }
    });

    res.json({
      success: true,
      data: results
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

// Get student reports (all terms)
exports.getStudentReports = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      studentId,
      schoolId
    };

    if (academicYearId) {
      whereClause.term = {
        academicYearId
      };
    }

    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        term: {
          include: {
            academicYear: {
              select: { name: true }
            }
          }
        },
        class: {
          select: { name: true, grade: true }
        }
      },
      orderBy: [
        { term: { academicYear: { startDate: 'desc' } } },
        { term: { startDate: 'desc' } }
      ]
    });

    res.json({
      success: true,
      data: results
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

// Generate PDF for report card
exports.generatePDF = async (req, res) => {
  try {
    const { studentId, termId } = req.params;
    const schoolId = req.school.id;

    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: { studentId, termId }
      },
      include: {
        student: {
          include: {
            user: true,
            currentClass: true
          }
        },
        term: {
          include: {
            academicYear: true
          }
        },
        class: true,
        school: true,
        gradeScale: {
          include: { gradeRanges: true }
        },
        subjectResults: {
          include: {
            subject: true
          },
          orderBy: {
            subject: { name: 'asc' }
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateReportCardPDF(result);

    const fileName = `${result.student.user.name.replace(/\s+/g, '_')}_${result.term.name.replace(/\s+/g, '_')}_Report.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
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

// Publish report cards for a term
exports.publishReports = async (req, res) => {
  try {
    const { classId, termId } = req.body;
    const schoolId = req.school.id;

    await prisma.result.updateMany({
      where: { classId, termId, schoolId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Results published successfully'
    });

  } catch (error) {
    console.error('Publish reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish reports',
      error: error.message
    });
  }
};

// Get published results summary
exports.getPublishedResults = async (req, res) => {
  try {
    const { termId } = req.query;
    const schoolId = req.school.id;

    const whereClause = {
      schoolId,
      isPublished: true
    };

    if (termId) {
      whereClause.termId = termId;
    }

    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        term: {
          include: {
            academicYear: {
              select: { name: true }
            }
          }
        },
        class: {
          select: { name: true, grade: true }
        }
      },
      orderBy: [
        { term: { startDate: 'desc' } },
        { class: { name: 'asc' } },
        { position: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Get published results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published results',
      error: error.message
    });
  }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Generate PDF for report card
async function generateReportCardPDF(result) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Add content to PDF
      generatePDFContent(doc, result);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generatePDFContent(doc, result) {
  const { student, term, school, subjectResults } = result;

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text(school.name, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(school.address || '', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(18).font('Helvetica-Bold').text('STUDENT REPORT CARD', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`${term.academicYear.name} - ${term.name}`, { align: 'center' });

  doc.moveDown(2);

  // Student Information Box
  const infoBoxY = doc.y;
  doc.rect(50, infoBoxY, 495, 80).stroke();

  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Student Name:', 60, infoBoxY + 15);
  doc.font('Helvetica').text(student.user.name, 180, infoBoxY + 15);

  doc.font('Helvetica-Bold').text('Admission Number:', 60, infoBoxY + 35);
  doc.font('Helvetica').text(student.admissionNumber, 180, infoBoxY + 35);

  doc.font('Helvetica-Bold').text('Class:', 60, infoBoxY + 55);
  doc.font('Helvetica').text(result.class?.name || 'N/A', 180, infoBoxY + 55);

  doc.font('Helvetica-Bold').text('Position:', 320, infoBoxY + 15);
  doc.font('Helvetica').text(result.position ? `${result.position}` : 'N/A', 420, infoBoxY + 15);

  doc.font('Helvetica-Bold').text('Average Score:', 320, infoBoxY + 35);
  doc.font('Helvetica').text(`${result.averageScore.toFixed(2)}%`, 420, infoBoxY + 35);

  doc.moveDown(6);

  // Subject Grades Table
  if (subjectResults && subjectResults.length > 0) {
    const tableTop = doc.y;
    const colWidths = {
      subject: 150,
      ca1: 50,
      ca2: 50,
      ca3: 50,
      exam: 50,
      total: 55,
      grade: 45,
      remark: 90
    };

    let xPos = 50;

    // Table headers
    doc.fontSize(10).font('Helvetica-Bold');
    doc.rect(50, tableTop, 495, 25).fill('#4472C4').stroke();
    doc.fillColor('white');

    doc.text('SUBJECT', xPos + 5, tableTop + 8);
    xPos += colWidths.subject;
    doc.text('CA1', xPos + 5, tableTop + 8);
    xPos += colWidths.ca1;
    doc.text('CA2', xPos + 5, tableTop + 8);
    xPos += colWidths.ca2;
    doc.text('CA3', xPos + 5, tableTop + 8);
    xPos += colWidths.ca3;
    doc.text('EXAM', xPos + 5, tableTop + 8);
    xPos += colWidths.exam;
    doc.text('TOTAL', xPos + 5, tableTop + 8);
    xPos += colWidths.total;
    doc.text('GRADE', xPos + 5, tableTop + 8);
    xPos += colWidths.grade;
    doc.text('REMARK', xPos + 5, tableTop + 8);

    doc.fillColor('black');

    let yPos = tableTop + 25;

    // Subject rows
    subjectResults.forEach((subject, index) => {
      xPos = 50;
      const rowHeight = 22;

      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(50, yPos, 495, rowHeight).fillAndStroke('#F0F0F0', '#CCCCCC');
      } else {
        doc.rect(50, yPos, 495, rowHeight).stroke('#CCCCCC');
      }

      doc.fontSize(9).font('Helvetica');
      doc.text(subject.subject.name, xPos + 5, yPos + 6, { width: colWidths.subject - 10 });
      xPos += colWidths.subject;
      doc.text(subject.firstCA?.toFixed(1) || '-', xPos + 5, yPos + 6);
      xPos += colWidths.ca1;
      doc.text(subject.secondCA?.toFixed(1) || '-', xPos + 5, yPos + 6);
      xPos += colWidths.ca2;
      doc.text(subject.thirdCA?.toFixed(1) || '-', xPos + 5, yPos + 6);
      xPos += colWidths.ca3;
      doc.text(subject.exam?.toFixed(1) || '-', xPos + 5, yPos + 6);
      xPos += colWidths.exam;
      doc.font('Helvetica-Bold').text(subject.totalScore?.toFixed(1) || '-', xPos + 5, yPos + 6);
      xPos += colWidths.total;
      doc.text(subject.grade || '-', xPos + 5, yPos + 6);
      xPos += colWidths.grade;
      doc.font('Helvetica').text(subject.remark || '-', xPos + 5, yPos + 6, { width: colWidths.remark - 10 });

      yPos += rowHeight;
    });

    doc.y = yPos + 10;
  }

  doc.moveDown(2);

  // Summary Section
  doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY', 50, doc.y);
  doc.moveDown(0.5);

  const summaryY = doc.y;
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Subjects: ${result.totalSubjects}`, 50, summaryY);
  doc.text(`Total Score: ${result.totalScore.toFixed(2)}`, 50, summaryY + 20);
  doc.text(`Average Score: ${result.averageScore.toFixed(2)}%`, 50, summaryY + 40);

  // Attendance
  if (result.daysPresent || result.daysAbsent) {
    const totalDays = result.daysPresent + result.daysAbsent;
    const attendancePercentage = totalDays > 0 ? (result.daysPresent / totalDays * 100).toFixed(1) : 0;
    doc.text(`Attendance: ${result.daysPresent}/${totalDays} days (${attendancePercentage}%)`, 300, summaryY);
  }

  if (result.timesLate) {
    doc.text(`Times Late: ${result.timesLate}`, 300, summaryY + 20);
  }

  if (result.conductGrade) {
    doc.text(`Conduct Grade: ${result.conductGrade}`, 300, summaryY + 40);
  }

  doc.moveDown(4);

  // Comments
  if (result.teacherComment) {
    doc.fontSize(11).font('Helvetica-Bold').text('Teacher\'s Comment:', 50, doc.y);
    doc.fontSize(10).font('Helvetica').text(result.teacherComment, 50, doc.y + 5, { width: 495 });
    doc.moveDown(1);
  }

  if (result.principalComment) {
    doc.fontSize(11).font('Helvetica-Bold').text('Principal\'s Comment:', 50, doc.y);
    doc.fontSize(10).font('Helvetica').text(result.principalComment, 50, doc.y + 5, { width: 495 });
    doc.moveDown(1);
  }

  // Signatures
  doc.moveDown(3);
  const sigY = doc.y;

  doc.fontSize(10).font('Helvetica');
  doc.text('_________________________', 50, sigY);
  doc.text('Class Teacher', 50, sigY + 20);

  doc.text('_________________________', 220, sigY);
  doc.text('Principal', 220, sigY + 20);

  doc.text('_________________________', 390, sigY);
  doc.text('Parent/Guardian', 390, sigY + 20);

  // Footer
  doc.fontSize(8).font('Helvetica').text(
    `Generated on ${new Date().toLocaleDateString()}`,
    50,
    doc.page.height - 30,
    { align: 'center' }
  );
}

module.exports = exports;
