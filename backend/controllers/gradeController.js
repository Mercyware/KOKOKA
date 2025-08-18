const Grade = require('../models/Grade');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const aiService = require('../services/aiService');
const asyncHandler = require('express-async-handler');

// @desc    Create or update grade
// @route   POST /api/grades
// @access  Private (Teacher/Admin)
exports.createOrUpdateGrade = asyncHandler(async (req, res) => {
  const {
    assessmentId,
    studentId,
    marksObtained,
    feedback,
    privateNotes,
    questionScores,
    rubricScores,
    attempt = 1
  } = req.body;

  // Validate required fields
  if (!assessmentId || !studentId || marksObtained === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Assessment ID, student ID, and marks obtained are required'
    });
  }

  // Verify assessment exists and belongs to school
  const assessment = await Assessment.findOne({
    _id: assessmentId,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Verify student exists and belongs to school
  const student = await Student.findOne({
    _id: studentId,
    school: req.school._id
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Check if user can grade this assessment
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade this assessment'
    });
  }

  // Validate marks
  if (marksObtained < 0 || marksObtained > assessment.totalMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks must be between 0 and ${assessment.totalMarks}`
    });
  }

  // Check if grade already exists
  let existingGrade = await Grade.findOne({
    assessment: assessmentId,
    student: studentId,
    school: req.school._id
  });

  const gradeData = {
    school: req.school._id,
    assessment: assessmentId,
    student: studentId,
    marksObtained,
    totalMarks: assessment.totalMarks,
    feedback,
    privateNotes,
    questionScores,
    rubricScores,
    attempt,
    status: 'graded',
    gradedBy: req.user.id,
    gradedAt: new Date()
  };

  let grade;

  if (existingGrade) {
    // Update existing grade
    grade = await Grade.findByIdAndUpdate(
      existingGrade._id,
      gradeData,
      { new: true, runValidators: true }
    )
      .populate('assessment', 'title type totalMarks subject class')
      .populate('student', 'firstName lastName admissionNumber')
      .populate('gradedBy', 'name email');
  } else {
    // Create new grade
    grade = await Grade.create(gradeData);
    await grade.populate([
      { path: 'assessment', select: 'title type totalMarks subject class' },
      { path: 'student', select: 'firstName lastName admissionNumber' },
      { path: 'gradedBy', select: 'name email' }
    ]);
  }

  res.status(existingGrade ? 200 : 201).json({
    success: true,
    data: grade,
    message: existingGrade ? 'Grade updated successfully' : 'Grade created successfully'
  });
});

// @desc    Bulk grade students for an assessment
// @route   POST /api/grades/bulk
// @access  Private (Teacher/Admin)
exports.bulkGradeStudents = asyncHandler(async (req, res) => {
  const { assessmentId, grades } = req.body;

  if (!assessmentId || !grades || !Array.isArray(grades)) {
    return res.status(400).json({
      success: false,
      message: 'Assessment ID and grades array are required'
    });
  }

  // Verify assessment
  const assessment = await Assessment.findOne({
    _id: assessmentId,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check authorization
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade this assessment'
    });
  }

  const results = [];
  const errors = [];

  for (const gradeData of grades) {
    try {
      const { studentId, marksObtained, feedback, questionScores, rubricScores } = gradeData;

      // Validate student exists
      const student = await Student.findOne({
        _id: studentId,
        school: req.school._id
      });

      if (!student) {
        errors.push({ studentId, error: 'Student not found' });
        continue;
      }

      // Check if grade exists
      let existingGrade = await Grade.findOne({
        assessment: assessmentId,
        student: studentId,
        school: req.school._id
      });

      const gradePayload = {
        school: req.school._id,
        assessment: assessmentId,
        student: studentId,
        marksObtained,
        totalMarks: assessment.totalMarks,
        feedback,
        questionScores,
        rubricScores,
        status: 'graded',
        gradedBy: req.user.id,
        gradedAt: new Date()
      };

      let grade;
      if (existingGrade) {
        grade = await Grade.findByIdAndUpdate(
          existingGrade._id,
          gradePayload,
          { new: true, runValidators: true }
        );
      } else {
        grade = await Grade.create(gradePayload);
      }

      results.push({
        studentId,
        gradeId: grade._id,
        action: existingGrade ? 'updated' : 'created'
      });

    } catch (error) {
      errors.push({ 
        studentId: gradeData.studentId, 
        error: error.message 
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      successful: results,
      errors,
      totalProcessed: grades.length,
      successCount: results.length,
      errorCount: errors.length
    },
    message: `Bulk grading completed. ${results.length} grades processed successfully.`
  });
});

// @desc    Get grades for an assessment
// @route   GET /api/grades/assessment/:assessmentId
// @access  Private (Teacher/Admin)
exports.getAssessmentGrades = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const { status } = req.query;

  // Verify assessment
  const assessment = await Assessment.findOne({
    _id: assessmentId,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  let query = {
    assessment: assessmentId,
    school: req.school._id
  };

  if (status) {
    query.status = status;
  }

  const grades = await Grade.find(query)
    .populate('student', 'firstName lastName admissionNumber photo')
    .populate('gradedBy', 'name email')
    .sort({ 'student.lastName': 1 });

  // Get class statistics
  const stats = await Grade.getClassStats(assessmentId, req.school._id);

  // Get grade distribution
  const distribution = await Grade.getGradeDistribution(assessmentId, req.school._id);

  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades,
    statistics: stats,
    distribution
  });
});

// @desc    Get grades for a student
// @route   GET /api/grades/student/:studentId
// @access  Private (Student/Parent/Teacher/Admin)
exports.getStudentGrades = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject, assessmentType, academicYear, startDate, endDate } = req.query;

  // Verify student
  const student = await Student.findOne({
    _id: studentId,
    school: req.school._id
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Build query
  let query = {
    student: studentId,
    school: req.school._id,
    status: 'graded'
  };

  // Date range filter
  if (startDate || endDate) {
    query.gradedAt = {};
    if (startDate) query.gradedAt.$gte = new Date(startDate);
    if (endDate) query.gradedAt.$lte = new Date(endDate);
  }

  const grades = await Grade.find(query)
    .populate({
      path: 'assessment',
      select: 'title type totalMarks subject scheduledDate',
      populate: {
        path: 'subject',
        select: 'name code'
      },
      match: {
        ...(subject && { subject }),
        ...(assessmentType && { type: assessmentType }),
        ...(academicYear && { academicYear })
      }
    })
    .populate('gradedBy', 'name')
    .sort({ gradedAt: -1 });

  // Filter out grades where assessment population failed
  const validGrades = grades.filter(grade => grade.assessment);

  // Calculate overall statistics
  const totalGrades = validGrades.length;
  const averagePercentage = totalGrades > 0 
    ? validGrades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades 
    : 0;
  const averageGPA = totalGrades > 0 
    ? validGrades.reduce((sum, grade) => sum + grade.gpa, 0) / totalGrades 
    : 0;

  // Get grade trends
  const trends = await Grade.getStudentTrends(studentId, req.school._id, subject, 6);

  res.status(200).json({
    success: true,
    count: validGrades.length,
    data: validGrades,
    statistics: {
      totalGrades,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      averageGPA: Math.round(averageGPA * 100) / 100,
      highestPercentage: totalGrades > 0 ? Math.max(...validGrades.map(g => g.percentage)) : 0,
      lowestPercentage: totalGrades > 0 ? Math.min(...validGrades.map(g => g.percentage)) : 0
    },
    trends
  });
});

// @desc    Grade essay using AI
// @route   POST /api/grades/ai-grade
// @access  Private (Teacher/Admin)
exports.gradeEssayWithAI = asyncHandler(async (req, res) => {
  const { assessmentId, studentId, essayText, rubric } = req.body;

  if (!assessmentId || !studentId || !essayText) {
    return res.status(400).json({
      success: false,
      message: 'Assessment ID, student ID, and essay text are required'
    });
  }

  // Verify assessment and student
  const assessment = await Assessment.findOne({
    _id: assessmentId,
    school: req.school._id
  }).populate('subject', 'name');

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  const student = await Student.findOne({
    _id: studentId,
    school: req.school._id
  }).populate('currentClass', 'name grade');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  try {
    // Use AI to grade the essay
    const aiGrading = await aiService.gradeEssay(
      essayText,
      rubric || assessment.rubric,
      assessment.subject.name,
      student.currentClass.grade
    );

    // Calculate marks based on AI score (assuming AI returns score out of 100)
    const marksObtained = Math.round((aiGrading.score / 100) * assessment.totalMarks);

    // Create or update grade with AI feedback
    const gradeData = {
      school: req.school._id,
      assessment: assessmentId,
      student: studentId,
      marksObtained,
      totalMarks: assessment.totalMarks,
      feedback: aiGrading.feedback,
      status: 'graded',
      gradedBy: req.user.id,
      gradedAt: new Date(),
      aiGraded: true,
      aiConfidence: 0.85, // Default confidence level
      flaggedForReview: aiGrading.score < 50 || aiGrading.score > 95 // Flag very low or very high scores
    };

    // Check if grade exists
    let existingGrade = await Grade.findOne({
      assessment: assessmentId,
      student: studentId,
      school: req.school._id
    });

    let grade;
    if (existingGrade) {
      grade = await Grade.findByIdAndUpdate(
        existingGrade._id,
        gradeData,
        { new: true, runValidators: true }
      );
    } else {
      grade = await Grade.create(gradeData);
    }

    await grade.populate([
      { path: 'assessment', select: 'title type' },
      { path: 'student', select: 'firstName lastName admissionNumber' }
    ]);

    res.status(200).json({
      success: true,
      data: grade,
      aiGrading: {
        score: aiGrading.score,
        feedback: aiGrading.feedback,
        strengths: aiGrading.strengths,
        weaknesses: aiGrading.weaknesses,
        confidence: 0.85,
        flaggedForReview: grade.flaggedForReview
      },
      message: 'Essay graded successfully using AI'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to grade essay with AI',
      error: error.message
    });
  }
});

// @desc    Get grade statistics
// @route   GET /api/grades/stats
// @access  Private (Admin/Principal)
exports.getGradeStats = asyncHandler(async (req, res) => {
  const { classId, subjectId, assessmentId, academicYear, startDate, endDate } = req.query;

  let matchStage = { school: req.school._id, status: 'graded' };

  if (classId || subjectId || assessmentId || academicYear) {
    // Need to lookup assessment for filtering
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessment',
          foreignField: '_id',
          as: 'assessmentInfo'
        }
      },
      { $unwind: '$assessmentInfo' }
    ];

    if (classId) {
      pipeline.push({ $match: { 'assessmentInfo.class': mongoose.Types.ObjectId(classId) } });
    }
    if (subjectId) {
      pipeline.push({ $match: { 'assessmentInfo.subject': mongoose.Types.ObjectId(subjectId) } });
    }
    if (assessmentId) {
      pipeline.push({ $match: { 'assessmentInfo._id': mongoose.Types.ObjectId(assessmentId) } });
    }
    if (academicYear) {
      pipeline.push({ $match: { 'assessmentInfo.academicYear': mongoose.Types.ObjectId(academicYear) } });
    }

    // Add date filter
    if (startDate || endDate) {
      let dateMatch = {};
      if (startDate) dateMatch.$gte = new Date(startDate);
      if (endDate) dateMatch.$lte = new Date(endDate);
      pipeline.push({ $match: { gradedAt: dateMatch } });
    }

    // Calculate statistics
    pipeline.push({
      $group: {
        _id: null,
        totalGrades: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        averageGPA: { $avg: '$gpa' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' },
        passedCount: { $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] } },
        failedCount: { $sum: { $cond: [{ $lt: ['$percentage', 50] }, 1, 0] } },
        gradeA: { $sum: { $cond: [{ $in: ['$letterGrade', ['A+', 'A', 'A-']] }, 1, 0] } },
        gradeB: { $sum: { $cond: [{ $in: ['$letterGrade', ['B+', 'B', 'B-']] }, 1, 0] } },
        gradeC: { $sum: { $cond: [{ $in: ['$letterGrade', ['C+', 'C', 'C-']] }, 1, 0] } },
        gradeD: { $sum: { $cond: [{ $in: ['$letterGrade', ['D+', 'D']] }, 1, 0] } },
        gradeF: { $sum: { $cond: [{ $eq: ['$letterGrade', 'F'] }, 1, 0] } }
      }
    });

    const stats = await Grade.aggregate(pipeline);
    const result = stats[0] || {};

    // Add calculated fields
    if (result.totalGrades) {
      result.passRate = (result.passedCount / result.totalGrades) * 100;
      result.failRate = (result.failedCount / result.totalGrades) * 100;
    } else {
      result.passRate = 0;
      result.failRate = 0;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    // Simple stats without assessment lookup
    if (startDate || endDate) {
      if (startDate) matchStage.gradedAt = { $gte: new Date(startDate) };
      if (endDate) matchStage.gradedAt = { ...matchStage.gradedAt, $lte: new Date(endDate) };
    }

    const stats = await Grade.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalGrades: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          averageGPA: { $avg: '$gpa' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || { totalGrades: 0, averagePercentage: 0, averageGPA: 0 }
    });
  }
});

module.exports = {
  createOrUpdateGrade: exports.createOrUpdateGrade,
  bulkGradeStudents: exports.bulkGradeStudents,
  getAssessmentGrades: exports.getAssessmentGrades,
  getStudentGrades: exports.getStudentGrades,
  gradeEssayWithAI: exports.gradeEssayWithAI,
  getGradeStats: exports.getGradeStats
};