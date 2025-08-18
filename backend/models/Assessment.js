const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['quiz', 'test', 'exam', 'assignment', 'project', 'homework', 'practical', 'oral', 'continuous-assessment'],
    required: [true, 'Assessment type is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    validate: {
      validator: function(value) {
        return value <= this.totalMarks;
      },
      message: 'Passing marks cannot exceed total marks'
    }
  },
  weight: {
    type: Number,
    default: 1,
    min: [0.1, 'Weight must be at least 0.1'],
    max: [10, 'Weight cannot exceed 10']
  },
  duration: {
    type: Number, // Duration in minutes
    min: [1, 'Duration must be at least 1 minute']
  },
  scheduledDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  instructions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  gradingMethod: {
    type: String,
    enum: ['percentage', 'letter-grade', 'gpa', 'points', 'rubric'],
    default: 'percentage'
  },
  rubric: [{
    criterion: {
      type: String,
      required: true
    },
    description: String,
    maxPoints: {
      type: Number,
      required: true,
      min: 1
    },
    levels: [{
      name: String,
      description: String,
      points: Number
    }]
  }],
  questions: [{
    questionNumber: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'long-answer', 'fill-blank', 'matching', 'essay'],
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    points: {
      type: Number,
      required: true,
      min: 0
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [String],
    explanation: String,
    attachments: [{
      fileName: String,
      filePath: String,
      fileSize: Number,
      mimeType: String
    }]
  }],
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    allowMultipleAttempts: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1
    },
    showResultsImmediately: {
      type: Boolean,
      default: false
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    timeLimit: {
      type: Boolean,
      default: false
    },
    plagiarismCheck: {
      type: Boolean,
      default: false
    },
    proctoring: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
AssessmentSchema.index({ school: 1, subject: 1, class: 1 });
AssessmentSchema.index({ school: 1, teacher: 1 });
AssessmentSchema.index({ school: 1, status: 1 });
AssessmentSchema.index({ school: 1, scheduledDate: 1 });
AssessmentSchema.index({ school: 1, academicYear: 1, term: 1 });

// Virtual for total questions
AssessmentSchema.virtual('totalQuestions').get(function() {
  return this.questions.length;
});

// Virtual for total possible points
AssessmentSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for average difficulty
AssessmentSchema.virtual('averageDifficulty').get(function() {
  if (this.questions.length === 0) return 'medium';
  
  const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
  const totalDifficulty = this.questions.reduce((total, question) => {
    return total + difficultyMap[question.difficultyLevel];
  }, 0);
  
  const averageValue = totalDifficulty / this.questions.length;
  
  if (averageValue <= 1.5) return 'easy';
  if (averageValue <= 2.5) return 'medium';
  return 'hard';
});

// Pre-save middleware
AssessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Validate that scheduled date is not in the past for new assessments
  if (this.isNew && this.scheduledDate && this.scheduledDate < new Date()) {
    return next(new Error('Scheduled date cannot be in the past'));
  }
  
  // Validate that due date is after scheduled date
  if (this.scheduledDate && this.dueDate && this.dueDate < this.scheduledDate) {
    return next(new Error('Due date cannot be before scheduled date'));
  }
  
  next();
});

// Static method to get assessment statistics
AssessmentSchema.statics.getAssessmentStats = async function(schoolId, filters = {}) {
  const matchStage = { school: mongoose.Types.ObjectId(schoolId), ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: 1 },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        averageTotalMarks: { $avg: '$totalMarks' },
        totalQuestions: { $sum: { $size: '$questions' } }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalAssessments: 0,
    draft: 0,
    published: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    averageTotalMarks: 0,
    totalQuestions: 0
  };
};

// Static method to get upcoming assessments
AssessmentSchema.statics.getUpcomingAssessments = async function(schoolId, daysAhead = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  
  return await this.find({
    school: schoolId,
    status: 'published',
    scheduledDate: {
      $gte: new Date(),
      $lte: endDate
    }
  })
  .populate('subject', 'name code')
  .populate('class', 'name grade section')
  .populate('teacher', 'name email')
  .sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('Assessment', AssessmentSchema);