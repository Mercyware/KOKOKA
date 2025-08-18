const Assessment = require('../models/Assessment');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const AcademicYear = require('../models/AcademicYear');
const aiService = require('../services/aiService');
const asyncHandler = require('express-async-handler');

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private (Teacher/Admin)
exports.createAssessment = asyncHandler(async (req, res) => {
  const assessmentData = {
    ...req.body,
    school: req.school._id,
    teacher: req.user.id,
    createdBy: req.user.id
  };

  // Get current academic year if not provided
  if (!assessmentData.academicYear) {
    const currentAcademicYear = await AcademicYear.findOne({
      school: req.school._id,
      isCurrent: true
    });

    if (currentAcademicYear) {
      assessmentData.academicYear = currentAcademicYear._id;
    }
  }

  const assessment = await Assessment.create(assessmentData);

  await assessment.populate([
    { path: 'subject', select: 'name code' },
    { path: 'class', select: 'name grade section' },
    { path: 'teacher', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    data: assessment,
    message: 'Assessment created successfully'
  });
});

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private (Teacher/Admin)
exports.getAssessments = asyncHandler(async (req, res) => {
  const { 
    class: classId, 
    subject, 
    type, 
    status, 
    teacher, 
    academicYear,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  let query = { school: req.school._id };

  if (classId) query.class = classId;
  if (subject) query.subject = subject;
  if (type) query.type = type;
  if (status) query.status = status;
  if (teacher) query.teacher = teacher;
  if (academicYear) query.academicYear = academicYear;

  // Date range filter
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  // If user is a teacher, only show their assessments unless they're admin
  if (req.user.role === 'teacher') {
    query.teacher = req.user.id;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const assessments = await Assessment.find(query)
    .populate('subject', 'name code')
    .populate('class', 'name grade section')
    .populate('teacher', 'name email')
    .populate('academicYear', 'name startDate endDate')
    .populate('term', 'name')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Assessment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: assessments.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    data: assessments
  });
});

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private (Teacher/Admin/Student)
exports.getAssessment = asyncHandler(async (req, res) => {
  let assessment = await Assessment.findOne({
    _id: req.params.id,
    school: req.school._id
  })
    .populate('subject', 'name code')
    .populate('class', 'name grade section')
    .populate('teacher', 'name email')
    .populate('academicYear', 'name startDate endDate')
    .populate('term', 'name');

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // If user is a student, hide questions and correct answers unless assessment is completed
  if (req.user.role === 'student') {
    if (assessment.status !== 'completed') {
      assessment = assessment.toObject();
      assessment.questions = assessment.questions.map(q => ({
        ...q,
        correctAnswer: undefined,
        explanation: undefined
      }));
    }
  }

  res.status(200).json({
    success: true,
    data: assessment
  });
});

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Teacher/Admin)
exports.updateAssessment = asyncHandler(async (req, res) => {
  let assessment = await Assessment.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check if user owns the assessment or is admin
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assessment'
    });
  }

  // Don't allow updates to published assessments with grades unless admin
  if (assessment.status === 'completed' && req.user.role !== 'admin') {
    const hasGrades = await Grade.findOne({ assessment: assessment._id });
    if (hasGrades) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update assessment that has been graded'
      });
    }
  }

  assessment = await Assessment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('subject', 'name code')
    .populate('class', 'name grade section')
    .populate('teacher', 'name email');

  res.status(200).json({
    success: true,
    data: assessment,
    message: 'Assessment updated successfully'
  });
});

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Teacher/Admin)
exports.deleteAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check if user owns the assessment or is admin
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assessment'
    });
  }

  // Check if assessment has grades
  const hasGrades = await Grade.findOne({ assessment: assessment._id });
  if (hasGrades && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete assessment that has grades. Contact admin.'
    });
  }

  // Delete associated grades if admin
  if (req.user.role === 'admin') {
    await Grade.deleteMany({ assessment: assessment._id });
  }

  await assessment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Assessment deleted successfully'
  });
});

// @desc    Publish assessment
// @route   PUT /api/assessments/:id/publish
// @access  Private (Teacher/Admin)
exports.publishAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check if user owns the assessment or is admin
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to publish this assessment'
    });
  }

  // Validate assessment has required fields
  if (!assessment.questions || assessment.questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Assessment must have at least one question to publish'
    });
  }

  assessment.status = 'published';
  await assessment.save();

  res.status(200).json({
    success: true,
    data: assessment,
    message: 'Assessment published successfully'
  });
});

// @desc    Generate AI questions for assessment
// @route   POST /api/assessments/:id/generate-questions
// @access  Private (Teacher/Admin)
exports.generateAIQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, count, questionTypes } = req.body;

  const assessment = await Assessment.findOne({
    _id: req.params.id,
    school: req.school._id
  }).populate('subject', 'name');

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check if user owns the assessment or is admin
  if (req.user.role === 'teacher' && assessment.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify this assessment'
    });
  }

  if (assessment.status === 'published' || assessment.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify published or completed assessments'
    });
  }

  try {
    // Generate questions using AI service
    const generatedQuestions = await aiService.generateQuizQuestions(
      assessment.subject.name,
      topic,
      difficulty || 'medium',
      count || 5
    );

    // Convert AI questions to assessment format
    const assessmentQuestions = generatedQuestions.map((q, index) => ({
      questionNumber: assessment.questions.length + index + 1,
      questionText: q.question,
      questionType: 'multiple-choice',
      options: q.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.id === q.correctAnswer
      })),
      correctAnswer: q.correctAnswer,
      points: Math.ceil(assessment.totalMarks / (count || 5)),
      difficultyLevel: q.difficulty || difficulty || 'medium',
      tags: [topic]
    }));

    // Add questions to assessment
    assessment.questions.push(...assessmentQuestions);
    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment,
      generatedCount: assessmentQuestions.length,
      message: 'AI questions generated and added successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI questions',
      error: error.message
    });
  }
});

// @desc    Get assessment statistics
// @route   GET /api/assessments/stats
// @access  Private (Admin/Principal)
exports.getAssessmentStats = asyncHandler(async (req, res) => {
  const { classId, subjectId, teacherId, academicYear } = req.query;

  let filters = {};
  if (classId) filters.class = classId;
  if (subjectId) filters.subject = subjectId;
  if (teacherId) filters.teacher = teacherId;
  if (academicYear) filters.academicYear = academicYear;

  const stats = await Assessment.getAssessmentStats(req.school._id, filters);

  // Get upcoming assessments
  const upcomingAssessments = await Assessment.getUpcomingAssessments(req.school._id, 7);

  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      upcoming: upcomingAssessments
    }
  });
});

// @desc    Get student assessments
// @route   GET /api/assessments/student/:studentId
// @access  Private (Student/Parent/Teacher/Admin)
exports.getStudentAssessments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { status, subject, type, academicYear } = req.query;

  // Verify student exists and user has permission
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

  // Build query for assessments in student's class
  let query = {
    school: req.school._id,
    class: student.currentClass,
    status: { $in: ['published', 'in-progress', 'completed'] }
  };

  if (status) query.status = status;
  if (subject) query.subject = subject;
  if (type) query.type = type;
  if (academicYear) query.academicYear = academicYear;

  const assessments = await Assessment.find(query)
    .populate('subject', 'name code')
    .populate('teacher', 'name')
    .sort({ scheduledDate: -1 });

  // Get grades for each assessment
  const assessmentIds = assessments.map(a => a._id);
  const grades = await Grade.find({
    assessment: { $in: assessmentIds },
    student: studentId,
    school: req.school._id
  });

  // Map grades to assessments
  const assessmentsWithGrades = assessments.map(assessment => {
    const grade = grades.find(g => g.assessment.toString() === assessment._id.toString());
    return {
      ...assessment.toObject(),
      grade: grade || null
    };
  });

  res.status(200).json({
    success: true,
    count: assessmentsWithGrades.length,
    data: assessmentsWithGrades
  });
});

module.exports = {
  createAssessment: exports.createAssessment,
  getAssessments: exports.getAssessments,
  getAssessment: exports.getAssessment,
  updateAssessment: exports.updateAssessment,
  deleteAssessment: exports.deleteAssessment,
  publishAssessment: exports.publishAssessment,
  generateAIQuestions: exports.generateAIQuestions,
  getAssessmentStats: exports.getAssessmentStats,
  getStudentAssessments: exports.getStudentAssessments
};