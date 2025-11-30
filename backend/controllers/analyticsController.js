const AttendancePatternService = require('../services/ai/AttendancePatternService');
const PerformancePredictionService = require('../services/ai/PerformancePredictionService');
const RiskAssessmentService = require('../services/ai/RiskAssessmentService');

/**
 * @desc    Analyze student attendance patterns
 * @route   GET /api/analytics/attendance/student/:id
 * @access  Private
 */
exports.analyzeStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;
    const windowDays = parseInt(req.query.windowDays) || 30;

    const analysis = await AttendancePatternService.analyzeStudent(studentId, windowDays);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Analyze attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze attendance',
      error: error.message,
    });
  }
};

/**
 * @desc    Analyze class attendance
 * @route   GET /api/analytics/attendance/class/:id
 * @access  Private
 */
exports.analyzeClassAttendance = async (req, res) => {
  try {
    const classId = req.params.id;
    const windowDays = parseInt(req.query.windowDays) || 30;

    const analysis = await AttendancePatternService.analyzeClass(classId, windowDays);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Analyze class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze class attendance',
      error: error.message,
    });
  }
};

/**
 * @desc    Get at-risk students (attendance)
 * @route   GET /api/analytics/attendance/at-risk
 * @access  Private (Admin/Teacher)
 */
exports.getAtRiskStudents = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const classId = req.query.classId || null;
    const threshold = parseInt(req.query.threshold) || 85;

    const students = await AttendancePatternService.getAtRiskStudents(schoolId, classId, threshold);

    res.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    console.error('Get at-risk students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get at-risk students',
      error: error.message,
    });
  }
};

/**
 * @desc    Resolve attendance pattern
 * @route   PUT /api/analytics/attendance/patterns/:id/resolve
 * @access  Private (Admin/Teacher)
 */
exports.resolveAttendancePattern = async (req, res) => {
  try {
    const patternId = req.params.id;
    const { notes } = req.body;

    await AttendancePatternService.resolvePattern(patternId, notes);

    res.json({
      success: true,
      message: 'Pattern marked as resolved',
    });
  } catch (error) {
    console.error('Resolve pattern error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve pattern',
      error: error.message,
    });
  }
};

/**
 * @desc    Predict student grade
 * @route   GET /api/analytics/predictions/student/:id/grade
 * @access  Private
 */
exports.predictStudentGrade = async (req, res) => {
  try {
    const studentId = req.params.id;
    const subjectId = req.query.subjectId || null;
    const timeframe = req.query.timeframe || 'end_of_year';

    const prediction = await PerformancePredictionService.predictGrade(studentId, subjectId, timeframe);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('Predict grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict grade',
      error: error.message,
    });
  }
};

/**
 * @desc    Assess student risk
 * @route   GET /api/analytics/risk/student/:id
 * @access  Private
 */
exports.assessStudentRisk = async (req, res) => {
  try {
    const studentId = req.params.id;

    const assessment = await RiskAssessmentService.assessStudent(studentId);

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Assess risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assess risk',
      error: error.message,
    });
  }
};

/**
 * @desc    Get high-risk students
 * @route   GET /api/analytics/risk/high-risk
 * @access  Private (Admin/Teacher)
 */
exports.getHighRiskStudents = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const riskLevel = req.query.riskLevel || 'HIGH';
    const limit = parseInt(req.query.limit) || 50;

    const students = await RiskAssessmentService.getAtRiskStudents(schoolId, riskLevel, limit);

    res.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    console.error('Get high-risk students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get high-risk students',
      error: error.message,
    });
  }
};

/**
 * @desc    Resolve risk assessment
 * @route   PUT /api/analytics/risk/:id/resolve
 * @access  Private (Admin/Teacher)
 */
exports.resolveRiskAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const { notes } = req.body;

    await RiskAssessmentService.resolveAssessment(assessmentId, notes);

    res.json({
      success: true,
      message: 'Risk assessment resolved',
    });
  } catch (error) {
    console.error('Resolve assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve assessment',
      error: error.message,
    });
  }
};

/**
 * @desc    Get comprehensive student analytics
 * @route   GET /api/analytics/student/:id/comprehensive
 * @access  Private
 */
exports.getComprehensiveAnalytics = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Run all analyses in parallel
    const [attendance, predictions, risk] = await Promise.all([
      AttendancePatternService.analyzeStudent(studentId, 30),
      PerformancePredictionService.predictGrade(studentId, null, 'end_of_year'),
      RiskAssessmentService.assessStudent(studentId),
    ]);

    res.json({
      success: true,
      data: {
        studentId,
        attendance,
        predictions,
        risk,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Get comprehensive analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comprehensive analytics',
      error: error.message,
    });
  }
};
