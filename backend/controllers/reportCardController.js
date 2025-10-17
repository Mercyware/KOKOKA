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

    // Get schoolId from req.school or req.user (fallback)
    const schoolId = req.school?.id || req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School context not found. Please ensure you are logged in.'
      });
    }

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
    console.log('DEBUG generatePDF - req.user.schoolId:', req.user?.schoolId);
    console.log('DEBUG generatePDF - req.school:', req.school);
    const schoolId = req.user?.schoolId || req.school?.id;
    console.log('DEBUG generatePDF - resolved schoolId:', schoolId);

    if (!schoolId) {
      console.error('No schoolId available in req.user or req.school');
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

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

  // ============================================
  // HEADER SECTION WITH SCHOOL BRANDING
  // ============================================

  // Draw header background
  doc.rect(0, 0, doc.page.width, 120).fill('#1e3a8a');
  doc.fillColor('white');

  // School Name (Large, Bold, Centered)
  doc.fontSize(26).font('Helvetica-Bold').text(school.name.toUpperCase(), 0, 25, { align: 'center' });

  // School Address/Contact Info (Smaller, Below Name)
  const addressParts = [];
  if (school.streetAddress) addressParts.push(school.streetAddress);
  if (school.city) addressParts.push(school.city);
  if (school.state) addressParts.push(school.state);

  const addressLine = addressParts.join(', ');
  if (addressLine) {
    doc.fontSize(9).font('Helvetica').text(addressLine, 0, 55, { align: 'center' });
  }

  const contactParts = [];
  if (school.phone) contactParts.push(`Tel: ${school.phone}`);
  if (school.email) contactParts.push(`Email: ${school.email}`);
  if (school.website) contactParts.push(school.website);

  const contactLine = contactParts.join(' | ');
  if (contactLine) {
    doc.fontSize(8).font('Helvetica').text(contactLine, 0, 70, { align: 'center' });
  }

  // Report Card Title (Prominent)
  doc.fontSize(20).font('Helvetica-Bold').text('STUDENT REPORT CARD', 0, 90, { align: 'center' });

  // Reset color for body content
  doc.fillColor('black');
  doc.y = 140;

  doc.moveDown(0.5);

  // ============================================
  // ACADEMIC SESSION & STUDENT INFO SECTION
  // ============================================

  // Academic Session Banner
  doc.rect(50, doc.y, 495, 30).fillAndStroke('#f3f4f6', '#d1d5db');
  doc.fillColor('black').fontSize(11).font('Helvetica-Bold');
  doc.text(`Academic Year: ${term.academicYear.name}`, 60, doc.y - 20);
  doc.text(`Term: ${term.name}`, 320, doc.y - 20);

  doc.y += 15;
  doc.moveDown(1);

  // Student Information Box - Enhanced Design
  const infoBoxY = doc.y;
  doc.roundedRect(50, infoBoxY, 495, 110, 5).lineWidth(2).strokeColor('#1e3a8a').stroke();

  // Left Column
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3a8a');
  doc.text('STUDENT NAME:', 60, infoBoxY + 15);
  doc.fillColor('black').font('Helvetica').fontSize(11).text(student.user.name.toUpperCase(), 170, infoBoxY + 15);

  doc.font('Helvetica-Bold').fillColor('#1e3a8a').fontSize(10).text('ADMISSION NO:', 60, infoBoxY + 35);
  doc.fillColor('black').font('Helvetica').fontSize(11).text(student.admissionNumber, 170, infoBoxY + 35);

  doc.font('Helvetica-Bold').fillColor('#1e3a8a').fontSize(10).text('CLASS:', 60, infoBoxY + 55);
  doc.fillColor('black').font('Helvetica').fontSize(11).text(result.class?.name || 'N/A', 170, infoBoxY + 55);

  doc.font('Helvetica-Bold').fillColor('#1e3a8a').fontSize(10).text('CLASS TEACHER:', 60, infoBoxY + 75);
  doc.fillColor('black').font('Helvetica').fontSize(11).text('________________', 170, infoBoxY + 75);

  // Right Column - Performance Metrics
  doc.roundedRect(320, infoBoxY + 10, 215, 90, 3).fillAndStroke('#eff6ff', '#3b82f6');

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e40af').text('PERFORMANCE SUMMARY', 0, infoBoxY + 18, { align: 'center' });

  doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold').text('Position in Class:', 330, infoBoxY + 38);
  doc.fillColor('black').font('Helvetica-Bold').fontSize(14).text(
    result.position ? `${result.position}${getOrdinalSuffix(result.position)}` : 'N/A',
    470,
    infoBoxY + 35
  );

  doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold').text('Total Average:', 330, infoBoxY + 60);
  doc.fillColor('black').font('Helvetica-Bold').fontSize(14).text(
    `${result.averageScore.toFixed(1)}%`,
    470,
    infoBoxY + 57
  );

  doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold').text('Total Subjects:', 330, infoBoxY + 82);
  doc.fillColor('black').font('Helvetica-Bold').fontSize(14).text(
    `${result.totalSubjects}`,
    470,
    infoBoxY + 79
  );

  doc.y = infoBoxY + 120;
  doc.moveDown(1.5);

  // ============================================
  // SUBJECT PERFORMANCE TABLE
  // ============================================

  // Section Title
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a8a').text('ACADEMIC PERFORMANCE', 50, doc.y);
  doc.moveDown(0.5);

  if (subjectResults && subjectResults.length > 0) {
    const tableTop = doc.y;
    const colWidths = {
      sn: 30,
      subject: 135,
      ca1: 40,
      ca2: 40,
      ca3: 40,
      exam: 45,
      total: 50,
      grade: 40,
      remark: 75
    };

    let xPos = 50;

    // Table headers with gradient effect
    doc.rect(50, tableTop, 495, 28).fillAndStroke('#1e3a8a', '#1e3a8a');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('white');

    doc.text('S/N', xPos + 8, tableTop + 10);
    xPos += colWidths.sn;
    doc.text('SUBJECT', xPos + 5, tableTop + 10);
    xPos += colWidths.subject;
    doc.text('CA1', xPos + 8, tableTop + 6);
    doc.fontSize(7).text('(10)', xPos + 8, tableTop + 16);
    xPos += colWidths.ca1;
    doc.fontSize(9).text('CA2', xPos + 8, tableTop + 6);
    doc.fontSize(7).text('(10)', xPos + 8, tableTop + 16);
    xPos += colWidths.ca2;
    doc.fontSize(9).text('CA3', xPos + 8, tableTop + 6);
    doc.fontSize(7).text('(10)', xPos + 8, tableTop + 16);
    xPos += colWidths.ca3;
    doc.fontSize(9).text('EXAM', xPos + 5, tableTop + 6);
    doc.fontSize(7).text('(70)', xPos + 7, tableTop + 16);
    xPos += colWidths.exam;
    doc.fontSize(9).text('TOTAL', xPos + 5, tableTop + 6);
    doc.fontSize(7).text('(100)', xPos + 5, tableTop + 16);
    xPos += colWidths.total;
    doc.fontSize(9).text('GRADE', xPos + 5, tableTop + 10);
    xPos += colWidths.grade;
    doc.text('REMARK', xPos + 5, tableTop + 10);

    doc.fillColor('black');

    let yPos = tableTop + 28;

    // Subject rows with enhanced styling
    subjectResults.forEach((subject, index) => {
      xPos = 50;
      const rowHeight = 24;

      // Alternate row colors with borders
      if (index % 2 === 0) {
        doc.rect(50, yPos, 495, rowHeight).fillAndStroke('#f9fafb', '#e5e7eb');
      } else {
        doc.rect(50, yPos, 495, rowHeight).fillAndStroke('white', '#e5e7eb');
      }

      doc.fillColor('black').fontSize(9).font('Helvetica');

      // Serial Number
      doc.text(`${index + 1}`, xPos + 10, yPos + 8);
      xPos += colWidths.sn;

      // Subject Name
      doc.font('Helvetica-Bold').text(subject.subject.name, xPos + 5, yPos + 8, { width: colWidths.subject - 10 });
      xPos += colWidths.subject;

      // CA Scores
      doc.font('Helvetica').text(subject.firstCA !== null ? subject.firstCA.toFixed(1) : '-', xPos + 10, yPos + 8);
      xPos += colWidths.ca1;
      doc.text(subject.secondCA !== null ? subject.secondCA.toFixed(1) : '-', xPos + 10, yPos + 8);
      xPos += colWidths.ca2;
      doc.text(subject.thirdCA !== null ? subject.thirdCA.toFixed(1) : '-', xPos + 10, yPos + 8);
      xPos += colWidths.ca3;

      // Exam Score
      doc.font('Helvetica-Bold').text(subject.exam !== null ? subject.exam.toFixed(1) : '-', xPos + 8, yPos + 8);
      xPos += colWidths.exam;

      // Total Score - Highlighted
      const totalScore = subject.totalScore || 0;
      const scoreColor = totalScore >= 75 ? '#059669' : totalScore >= 50 ? '#f59e0b' : '#dc2626';
      doc.font('Helvetica-Bold').fillColor(scoreColor).text(
        subject.totalScore !== null ? subject.totalScore.toFixed(1) : '-',
        xPos + 10,
        yPos + 8
      );
      xPos += colWidths.total;

      // Grade - Bold and colored
      doc.fillColor(scoreColor).font('Helvetica-Bold').text(subject.grade || '-', xPos + 10, yPos + 8);
      xPos += colWidths.grade;

      // Remark
      doc.fillColor('black').font('Helvetica').fontSize(8).text(
        subject.remark || '-',
        xPos + 5,
        yPos + 8,
        { width: colWidths.remark - 10 }
      );

      yPos += rowHeight;
    });

    // Draw outer border for table
    doc.lineWidth(2).strokeColor('#1e3a8a').rect(50, tableTop, 495, yPos - tableTop).stroke();

    doc.y = yPos + 5;
  }

  doc.moveDown(1);

  // ============================================
  // GRADING SCALE & ATTENDANCE SECTION
  // ============================================

  const sectionY = doc.y;

  // Left side - Grading Scale
  doc.roundedRect(50, sectionY, 240, 90, 5).lineWidth(1.5).strokeColor('#1e3a8a').stroke();
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a').text('GRADING SCALE', 60, sectionY + 10);

  const gradeData = [
    { grade: 'A', range: '75-100', remark: 'Excellent' },
    { grade: 'B', range: '70-74', remark: 'Very Good' },
    { grade: 'C', range: '60-69', remark: 'Good' },
    { grade: 'D', range: '50-59', remark: 'Pass' },
    { grade: 'F', range: '0-49', remark: 'Fail' }
  ];

  let gradeY = sectionY + 28;
  doc.fontSize(8).font('Helvetica-Bold').fillColor('black');
  gradeData.forEach((item) => {
    doc.text(`${item.grade}`, 70, gradeY);
    doc.font('Helvetica').text(`${item.range}`, 95, gradeY);
    doc.text(`-`, 135, gradeY);
    doc.text(`${item.remark}`, 145, gradeY);
    gradeY += 11;
  });

  // Right side - Attendance & Conduct
  doc.roundedRect(305, sectionY, 240, 90, 5).lineWidth(1.5).strokeColor('#1e3a8a').stroke();
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a').text('ATTENDANCE & CONDUCT', 315, sectionY + 10);

  doc.fontSize(9).font('Helvetica').fillColor('black');
  let attY = sectionY + 30;

  if (result.daysPresent !== null || result.daysAbsent !== null) {
    const totalDays = (result.daysPresent || 0) + (result.daysAbsent || 0);
    const attendancePercentage = totalDays > 0 ? ((result.daysPresent || 0) / totalDays * 100).toFixed(1) : '0';

    doc.font('Helvetica-Bold').text('Days Present:', 315, attY);
    doc.font('Helvetica').text(`${result.daysPresent || 0} / ${totalDays} days`, 430, attY);
    attY += 15;

    doc.font('Helvetica-Bold').text('Days Absent:', 315, attY);
    doc.font('Helvetica').text(`${result.daysAbsent || 0} days`, 430, attY);
    attY += 15;

    doc.font('Helvetica-Bold').text('Attendance %:', 315, attY);
    doc.font('Helvetica').text(`${attendancePercentage}%`, 430, attY);
    attY += 15;
  }

  if (result.timesLate) {
    doc.font('Helvetica-Bold').text('Times Late:', 315, attY);
    doc.font('Helvetica').text(`${result.timesLate}`, 430, attY);
    attY += 15;
  }

  if (result.conductGrade) {
    doc.font('Helvetica-Bold').text('Conduct:', 315, attY);
    doc.font('Helvetica').text(`${result.conductGrade}`, 430, attY);
  }

  doc.y = sectionY + 100;
  doc.moveDown(1.5);

  // ============================================
  // COMMENTS SECTION
  // ============================================

  // Class Teacher's Comment
  doc.roundedRect(50, doc.y, 495, 60, 5).lineWidth(1.5).strokeColor('#1e3a8a').stroke();
  const teacherCommentY = doc.y;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3a8a').text('CLASS TEACHER\'S COMMENT', 60, teacherCommentY + 8);
  doc.fontSize(9).font('Helvetica').fillColor('black').text(
    result.teacherComment || '___________________________________________________________________________',
    60,
    teacherCommentY + 25,
    { width: 475, align: 'left' }
  );

  doc.y = teacherCommentY + 68;
  doc.moveDown(0.5);

  // Principal's Comment
  doc.roundedRect(50, doc.y, 495, 60, 5).lineWidth(1.5).strokeColor('#1e3a8a').stroke();
  const principalCommentY = doc.y;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3a8a').text('PRINCIPAL\'S COMMENT', 60, principalCommentY + 8);
  doc.fontSize(9).font('Helvetica').fillColor('black').text(
    result.principalComment || '___________________________________________________________________________',
    60,
    principalCommentY + 25,
    { width: 475, align: 'left' }
  );

  doc.y = principalCommentY + 68;
  doc.moveDown(2);

  // ============================================
  // SIGNATURES SECTION
  // ============================================

  const sigY = doc.y;

  // Signature boxes
  doc.fontSize(9).font('Helvetica-Bold').fillColor('black');

  // Class Teacher Signature
  doc.text('Class Teacher\'s Signature:', 50, sigY);
  doc.moveTo(50, sigY + 30).lineTo(180, sigY + 30).stroke();
  doc.fontSize(7).font('Helvetica').text('Date: _______________', 50, sigY + 35);

  // Principal's Signature
  doc.fontSize(9).font('Helvetica-Bold').text('Principal\'s Signature:', 215, sigY);
  doc.moveTo(215, sigY + 30).lineTo(345, sigY + 30).stroke();
  doc.fontSize(7).font('Helvetica').text('Date: _______________', 215, sigY + 35);

  // Parent's Signature
  doc.fontSize(9).font('Helvetica-Bold').text('Parent\'s/Guardian\'s Signature:', 380, sigY);
  doc.moveTo(380, sigY + 30).lineTo(545, sigY + 30).stroke();
  doc.fontSize(7).font('Helvetica').text('Date: _______________', 380, sigY + 35);

  // ============================================
  // FOOTER
  // ============================================

  // Draw footer line
  const footerY = doc.page.height - 60;
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#1e3a8a').lineWidth(2).stroke();

  // Footer text
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#4b5563').text(
    `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | ${school.name}`,
    0,
    footerY + 10,
    { align: 'center', width: doc.page.width }
  );

  doc.fontSize(7).font('Helvetica').fillColor('#6b7280').text(
    'This is an official academic document. Please keep for your records.',
    0,
    footerY + 25,
    { align: 'center', width: doc.page.width }
  );
}

// Helper function for ordinal suffix
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

module.exports = exports;
