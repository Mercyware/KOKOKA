const Exam = require('../models/Exam');
const Student = require('../models/Student');
const gradingService = require('../services/gradingService');

// Get all exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('subject')
      .populate('class');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject')
      .populate('class');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new exam
exports.createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    
    const populatedExam = await Exam.findById(exam._id)
      .populate('subject')
      .populate('class');
    
    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('subject')
      .populate('class');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get exams by class
exports.getExamsByClass = async (req, res) => {
  try {
    const exams = await Exam.find({ class: req.params.classId })
      .populate('subject')
      .populate('class');
    
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit exam results
exports.submitExamResults = async (req, res) => {
  try {
    const { examId, results } = req.body;
    
    // Validate exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Process each student's result
    for (const result of results) {
      const { studentId, score, answers } = result;
      
      // Find student
      const student = await Student.findById(studentId);
      if (!student) {
        continue; // Skip if student not found
      }
      
      // Calculate grade using grading service
      const grade = gradingService.calculateGrade(score, exam.totalMarks);
      
      // Add exam result to student's grades
      student.grades.push({
        exam: examId,
        score,
        grade,
        answers,
        date: new Date()
      });
      
      await student.save();
    }
    
    res.json({ message: 'Exam results submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate exam report
exports.generateExamReport = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Validate exam exists
    const exam = await Exam.findById(examId)
      .populate('subject')
      .populate('class');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Get all students in the class
    const students = await Student.find({ class: exam.class })
      .select('name grades');
    
    // Filter grades for this exam
    const examResults = [];
    
    for (const student of students) {
      const result = student.grades.find(
        grade => grade.exam.toString() === examId
      );
      
      if (result) {
        examResults.push({
          student: student.name,
          score: result.score,
          grade: result.grade
        });
      }
    }
    
    // Calculate statistics
    const totalStudents = examResults.length;
    const totalScore = examResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;
    
    // Count grades
    const gradeDistribution = {
      A: 0, B: 0, C: 0, D: 0, F: 0
    };
    
    examResults.forEach(result => {
      gradeDistribution[result.grade]++;
    });
    
    res.json({
      exam: {
        title: exam.title,
        subject: exam.subject.name,
        class: exam.class.name,
        date: exam.date,
        totalMarks: exam.totalMarks
      },
      statistics: {
        totalStudents,
        averageScore,
        gradeDistribution
      },
      results: examResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
