const { prisma } = require('../config/database');

// Create or update result for a student
const createOrUpdateResult = async (req, res) => {
  try {
    const { studentId, termId, classId, subjectScores, attendance, conduct } = req.body;
    const schoolId = req.school.id;

    // Get grade scale for the school
    const gradeScale = await prisma.gradeScale.findFirst({
      where: { schoolId, isActive: true },
      include: { gradeRanges: true }
    });

    if (!gradeScale) {
      return res.status(400).json({
        success: false,
        message: 'No active grade scale found for this school. Please create a grade scale first.'
      });
    }

    // Calculate subject results and total scores
    let totalScore = 0;
    let totalSubjects = 0;
    const processedSubjects = [];

    for (const subjectScore of subjectScores) {
      const { subjectId, firstCA, secondCA, thirdCA, exam } = subjectScore;
      
      // Calculate totals
      const totalCA = (firstCA || 0) + (secondCA || 0) + (thirdCA || 0);
      const subjectTotal = totalCA + (exam || 0);
      
      // Find grade for this score
      const gradeRange = gradeScale.gradeRanges.find(range => 
        subjectTotal >= range.minScore && subjectTotal <= range.maxScore
      );

      processedSubjects.push({
        subjectId,
        firstCA: firstCA || null,
        secondCA: secondCA || null,
        thirdCA: thirdCA || null,
        exam: exam || null,
        totalCA,
        totalScore: subjectTotal,
        grade: gradeRange?.grade || 'F',
        gradePoint: gradeRange?.gradePoint || 0,
        remark: gradeRange?.remark || 'Poor'
      });

      if (subjectTotal > 0) {
        totalScore += subjectTotal;
        totalSubjects++;
      }
    }

    const averageScore = totalSubjects > 0 ? totalScore / totalSubjects : 0;

    // Create or update result
    const result = await prisma.result.upsert({
      where: {
        studentId_termId: {
          studentId,
          termId
        }
      },
      update: {
        totalScore,
        totalSubjects,
        averageScore,
        daysPresent: attendance?.daysPresent || 0,
        daysAbsent: attendance?.daysAbsent || 0,
        timesLate: attendance?.timesLate || 0,
        conductGrade: conduct?.grade,
        teacherComment: conduct?.teacherComment,
        updatedAt: new Date()
      },
      create: {
        studentId,
        termId,
        classId,
        schoolId,
        gradeScaleId: gradeScale.id,
        totalScore,
        totalSubjects,
        averageScore,
        daysPresent: attendance?.daysPresent || 0,
        daysAbsent: attendance?.daysAbsent || 0,
        timesLate: attendance?.timesLate || 0,
        conductGrade: conduct?.grade,
        teacherComment: conduct?.teacherComment
      }
    });

    // Delete existing subject results and create new ones
    await prisma.subjectResult.deleteMany({
      where: { resultId: result.id }
    });

    if (processedSubjects.length > 0) {
      await prisma.subjectResult.createMany({
        data: processedSubjects.map(subject => ({
          resultId: result.id,
          ...subject
        }))
      });
    }

    // Calculate positions
    await calculatePositions(termId, classId, schoolId);

    res.json({
      success: true,
      data: result,
      message: 'Result saved successfully'
    });

  } catch (error) {
    console.error('Error creating/updating result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save result'
    });
  }
};

// Calculate positions for all students in a class for a term
const calculatePositions = async (termId, classId, schoolId) => {
  try {
    const results = await prisma.result.findMany({
      where: { termId, classId, schoolId },
      orderBy: { averageScore: 'desc' }
    });

    for (let i = 0; i < results.length; i++) {
      await prisma.result.update({
        where: { id: results[i].id },
        data: { position: i + 1 }
      });
    }

    // Calculate subject positions
    const subjects = await prisma.subject.findMany({
      where: { schoolId }
    });

    for (const subject of subjects) {
      const subjectResults = await prisma.subjectResult.findMany({
        where: {
          result: { termId, classId, schoolId },
          subjectId: subject.id,
          totalScore: { gt: 0 } // Only consider subjects with scores
        },
        orderBy: { totalScore: 'desc' }
      });

      for (let i = 0; i < subjectResults.length; i++) {
        await prisma.subjectResult.update({
          where: { id: subjectResults[i].id },
          data: { position: i + 1 }
        });
      }
    }

  } catch (error) {
    console.error('Error calculating positions:', error);
  }
};

// Get student result for a term
const getStudentResult = async (req, res) => {
  try {
    const { studentId, termId } = req.params;
    const schoolId = req.school.id;

    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: {
          studentId,
          termId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            photo: true
          }
        },
        term: true,
        class: true,
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
        message: 'Result not found'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching student result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result'
    });
  }
};

// Get class results for a term
const getClassResults = async (req, res) => {
  try {
    const { classId, termId } = req.params;
    const schoolId = req.school.id;

    const results = await prisma.result.findMany({
      where: { classId, termId, schoolId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        subjectResults: {
          include: {
            subject: {
              select: { id: true, name: true, code: true }
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
    console.error('Error fetching class results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class results'
    });
  }
};

// Publish results for a term and class
const publishResults = async (req, res) => {
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
    console.error('Error publishing results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish results'
    });
  }
};

// Generate report card
const generateReportCard = async (req, res) => {
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
        message: 'Result not found'
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
    console.error('Error generating report card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report card'
    });
  }
};

// Get result summary for a class and term
const getResultSummary = async (req, res) => {
  try {
    const { classId, termId } = req.params;
    const schoolId = req.school.id;

    // Get basic stats
    const stats = await prisma.result.aggregate({
      where: { classId, termId, schoolId },
      _avg: { averageScore: true },
      _max: { averageScore: true },
      _min: { averageScore: true },
      _count: true
    });

    // Get grade distribution
    const results = await prisma.result.findMany({
      where: { classId, termId, schoolId },
      include: {
        subjectResults: true
      }
    });

    // Calculate grade distribution
    const gradeDistribution = {};
    const subjectPerformance = {};

    results.forEach(result => {
      result.subjectResults.forEach(subjectResult => {
        const grade = subjectResult.grade || 'F';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

        if (!subjectPerformance[subjectResult.subjectId]) {
          subjectPerformance[subjectResult.subjectId] = {
            totalScore: 0,
            count: 0,
            grades: {}
          };
        }

        subjectPerformance[subjectResult.subjectId].totalScore += subjectResult.totalScore || 0;
        subjectPerformance[subjectResult.subjectId].count += 1;
        subjectPerformance[subjectResult.subjectId].grades[grade] =
          (subjectPerformance[subjectResult.subjectId].grades[grade] || 0) + 1;
      });
    });

    // Calculate subject averages
    Object.keys(subjectPerformance).forEach(subjectId => {
      const perf = subjectPerformance[subjectId];
      perf.average = perf.count > 0 ? perf.totalScore / perf.count : 0;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: stats._count,
          averageScore: stats._avg.averageScore,
          highestScore: stats._max.averageScore,
          lowestScore: stats._min.averageScore
        },
        gradeDistribution,
        subjectPerformance
      }
    });

  } catch (error) {
    console.error('Error fetching result summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result summary'
    });
  }
};

// Get terminal report for a student
const getTerminalReport = async (req, res) => {
  try {
    const { studentId, termId } = req.params;
    const schoolId = req.school.id;

    // Get result with all related data
    const result = await prisma.result.findUnique({
      where: {
        studentId_termId: {
          studentId,
          termId
        }
      },
      include: {
        student: {
          include: {
            profilePicture: {
              select: {
                fileUrl: true
              }
            }
          }
        },
        term: {
          include: {
            academicYear: true
          }
        },
        class: true,
        gradeScale: {
          include: { gradeRanges: true }
        },
        subjectResults: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
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

    // Get school information
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        logo: true,
        streetAddress: true,
        city: true,
        state: true,
        phone: true,
        email: true
      }
    });

    // Get total students in class for ranking
    const classSize = await prisma.result.count({
      where: {
        classId: result.classId,
        termId,
        schoolId
      }
    });

    // Get next term start date (if exists)
    const nextTerm = await prisma.term.findFirst({
      where: {
        schoolId,
        startDate: { gt: result.term.endDate }
      },
      orderBy: { startDate: 'asc' }
    });

    // Format subject grades for the terminal report
    const subjectGrades = result.subjectResults.map(sr => ({
      subjectName: sr.subject.name,
      subjectCode: sr.subject.code,
      ca1: sr.firstCA,
      ca2: sr.secondCA,
      fat: sr.thirdCA, // Using thirdCA as FAT (Formative Assessment Test)
      sat: sr.exam, // Using exam as SAT (Summative Assessment Test)
      total: sr.totalScore || 0,
      maxScore: 100, // Standard max score
      grade: sr.grade || 'F',
      remark: sr.remark || 'N/A',
      position: sr.position
    }));

    // Build school address
    let schoolAddress = school.streetAddress || '';
    if (school.city) schoolAddress += (schoolAddress ? ', ' : '') + school.city;
    if (school.state) schoolAddress += (schoolAddress ? ', ' : '') + school.state;

    const reportData = {
      student: {
        id: result.student.id,
        firstName: result.student.firstName,
        lastName: result.student.lastName,
        middleName: result.student.middleName,
        registrationNumber: result.student.admissionNumber,
        profilePictureUrl: result.student.profilePicture?.fileUrl,
        dateOfBirth: result.student.dateOfBirth,
        gender: result.student.gender
      },
      class: {
        id: result.class.id,
        name: result.class.name,
        level: result.class.level
      },
      term: {
        id: result.term.id,
        name: result.term.name
      },
      academicYear: {
        id: result.term.academicYear.id,
        name: result.term.academicYear.name
      },
      school: {
        id: school.id,
        name: school.name,
        logo: school.logo,
        address: schoolAddress,
        phone: school.phone,
        email: school.email
      },
      subjectGrades,
      totalScore: result.totalScore,
      averageScore: result.averageScore,
      position: result.position,
      classSize,
      daysPresent: result.daysPresent,
      daysAbsent: result.daysAbsent,
      timesLate: result.timesLate,
      conductGrade: result.conductGrade,
      teacherComment: result.teacherComment,
      principalComment: result.principalComment,
      nextTermBegins: nextTerm?.startDate
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error fetching terminal report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terminal report'
    });
  }
};

module.exports = {
  createOrUpdateResult,
  getStudentResult,
  getClassResults,
  publishResults,
  generateReportCard,
  getResultSummary,
  getTerminalReport
};