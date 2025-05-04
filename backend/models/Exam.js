const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an exam title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'mid-term', 'final', 'assignment', 'project', 'practical'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'fill-in-blank', 'matching'],
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    marks: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    topic: String,
    explanation: String
  }],
  instructions: {
    type: String,
    default: 'Read all questions carefully. Answer all questions.'
  },
  syllabus: [{
    topic: String,
    weightage: Number // percentage
  }],
  venue: {
    type: String,
    default: 'Regular Classroom'
  },
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  resultPublished: {
    type: Boolean,
    default: false
  },
  resultPublishDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  gradeDistribution: {
    A: { min: { type: Number, default: 90 }, max: { type: Number, default: 100 } },
    B: { min: { type: Number, default: 80 }, max: { type: Number, default: 89 } },
    C: { min: { type: Number, default: 70 }, max: { type: Number, default: 79 } },
    D: { min: { type: Number, default: 60 }, max: { type: Number, default: 69 } },
    F: { min: { type: Number, default: 0 }, max: { type: Number, default: 59 } }
  },
  statistics: {
    totalStudents: { type: Number, default: 0 },
    appeared: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    highestMarks: { type: Number, default: 0 },
    lowestMarks: { type: Number, default: 0 },
    averageMarks: { type: Number, default: 0 },
    gradeCount: {
      A: { type: Number, default: 0 },
      B: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      D: { type: Number, default: 0 },
      F: { type: Number, default: 0 }
    }
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Virtual for exam duration in hours
ExamSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Method to calculate grade based on marks
ExamSchema.methods.calculateGrade = function(marks) {
  const percentage = (marks / this.totalMarks) * 100;
  
  if (percentage >= this.gradeDistribution.A.min) return 'A';
  if (percentage >= this.gradeDistribution.B.min) return 'B';
  if (percentage >= this.gradeDistribution.C.min) return 'C';
  if (percentage >= this.gradeDistribution.D.min) return 'D';
  return 'F';
};

// Method to update exam statistics
ExamSchema.methods.updateStatistics = async function(results) {
  if (!results || results.length === 0) return;
  
  const totalStudents = results.length;
  const marks = results.map(result => result.score);
  
  const highestMarks = Math.max(...marks);
  const lowestMarks = Math.min(...marks);
  const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
  const averageMarks = totalMarks / totalStudents;
  
  const passed = results.filter(result => result.score >= this.passingMarks).length;
  const failed = totalStudents - passed;
  
  // Count grades
  const gradeCount = {
    A: 0, B: 0, C: 0, D: 0, F: 0
  };
  
  results.forEach(result => {
    const grade = this.calculateGrade(result.score);
    gradeCount[grade]++;
  });
  
  this.statistics = {
    totalStudents,
    appeared: totalStudents,
    passed,
    failed,
    highestMarks,
    lowestMarks,
    averageMarks,
    gradeCount
  };
  
  await this.save();
};

module.exports = mongoose.model('Exam', ExamSchema);
