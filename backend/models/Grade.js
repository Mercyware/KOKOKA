const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: [true, 'Assessment is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: [0, 'Marks obtained cannot be negative']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    uppercase: true
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot exceed 4.0']
  },
  points: {
    type: Number,
    min: [0, 'Points cannot be negative']
  },
  status: {
    type: String,
    enum: ['graded', 'pending', 'submitted', 'late', 'missing', 'excused'],
    default: 'pending'
  },
  rubricScores: [{
    criterion: String,
    pointsEarned: Number,
    maxPoints: Number,
    feedback: String
  }],
  questionScores: [{
    questionNumber: Number,
    pointsEarned: Number,
    maxPoints: Number,
    isCorrect: Boolean,
    studentAnswer: String,
    feedback: String
  }],
  feedback: {
    type: String,
    trim: true
  },
  privateNotes: {
    type: String,
    trim: true
  },
  attempt: {
    type: Number,
    default: 1,
    min: [1, 'Attempt number must be at least 1']
  },
  submittedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  daysLate: {
    type: Number,
    default: 0,
    min: [0, 'Days late cannot be negative']
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiGraded: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: [0, 'AI confidence cannot be negative'],
    max: [1, 'AI confidence cannot exceed 1']
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewReason: {
    type: String,
    trim: true
  },
  parentViewed: {
    type: Boolean,
    default: false
  },
  parentViewedAt: {
    type: Date
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

// Compound indexes for performance
GradeSchema.index({ school: 1, student: 1, assessment: 1 }, { unique: true });
GradeSchema.index({ school: 1, assessment: 1 });
GradeSchema.index({ school: 1, student: 1 });
GradeSchema.index({ school: 1, status: 1 });
GradeSchema.index({ student: 1, gradedAt: -1 });

// Virtual for grade classification
GradeSchema.virtual('classification').get(function() {
  const percentage = this.percentage;
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Very Good';
  if (percentage >= 70) return 'Good';
  if (percentage >= 60) return 'Satisfactory';
  if (percentage >= 50) return 'Pass';
  return 'Fail';
});

// Virtual for pass/fail status
GradeSchema.virtual('isPassed').get(function() {
  // Get the assessment to check passing marks
  if (this.assessment && this.assessment.passingMarks) {
    return this.marksObtained >= this.assessment.passingMarks;
  }
  // Default to 50% if no specific passing marks
  return this.percentage >= 50;
});

// Pre-save middleware to calculate derived fields
GradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.totalMarks) * 100 * 100) / 100; // Round to 2 decimal places
  }
  
  // Calculate letter grade based on percentage
  if (this.percentage >= 97) this.letterGrade = 'A+';
  else if (this.percentage >= 93) this.letterGrade = 'A';
  else if (this.percentage >= 90) this.letterGrade = 'A-';
  else if (this.percentage >= 87) this.letterGrade = 'B+';
  else if (this.percentage >= 83) this.letterGrade = 'B';
  else if (this.percentage >= 80) this.letterGrade = 'B-';
  else if (this.percentage >= 77) this.letterGrade = 'C+';
  else if (this.percentage >= 73) this.letterGrade = 'C';
  else if (this.percentage >= 70) this.letterGrade = 'C-';
  else if (this.percentage >= 67) this.letterGrade = 'D+';
  else if (this.percentage >= 60) this.letterGrade = 'D';
  else this.letterGrade = 'F';
  
  // Calculate GPA based on letter grade
  const gpaMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  this.gpa = gpaMap[this.letterGrade] || 0.0;
  
  // Check if submission is late
  if (this.submittedAt && this.assessment && this.assessment.dueDate) {
    this.isLate = this.submittedAt > this.assessment.dueDate;
    if (this.isLate) {
      const diffTime = Math.abs(this.submittedAt - this.assessment.dueDate);
      this.daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }
  
  next();
});

// Static method to calculate class statistics for an assessment
GradeSchema.statics.getClassStats = async function(assessmentId, schoolId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        assessment: mongoose.Types.ObjectId(assessmentId),
        school: mongoose.Types.ObjectId(schoolId),
        status: 'graded'
      } 
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        averageMarks: { $avg: '$marksObtained' },
        averagePercentage: { $avg: '$percentage' },
        highestMarks: { $max: '$marksObtained' },
        lowestMarks: { $min: '$marksObtained' },
        passed: { 
          $sum: { 
            $cond: [{ $gte: ['$percentage', 50] }, 1, 0] 
          } 
        },
        failed: { 
          $sum: { 
            $cond: [{ $lt: ['$percentage', 50] }, 1, 0] 
          } 
        }
      }
    },
    {
      $addFields: {
        passRate: {
          $multiply: [
            { $divide: ['$passed', '$totalStudents'] },
            100
          ]
        },
        failRate: {
          $multiply: [
            { $divide: ['$failed', '$totalStudents'] },
            100
          ]
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalStudents: 0,
    averageMarks: 0,
    averagePercentage: 0,
    highestMarks: 0,
    lowestMarks: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    failRate: 0
  };
};

// Static method to get student grade trends
GradeSchema.statics.getStudentTrends = async function(studentId, schoolId, subjectId = null, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  let matchStage = {
    student: mongoose.Types.ObjectId(studentId),
    school: mongoose.Types.ObjectId(schoolId),
    status: 'graded',
    gradedAt: { $gte: startDate }
  };
  
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
  
  if (subjectId) {
    pipeline.push({
      $match: {
        'assessmentInfo.subject': mongoose.Types.ObjectId(subjectId)
      }
    });
  }
  
  pipeline.push(
    {
      $group: {
        _id: {
          year: { $year: '$gradedAt' },
          month: { $month: '$gradedAt' },
          subject: '$assessmentInfo.subject'
        },
        averagePercentage: { $avg: '$percentage' },
        averageGPA: { $avg: '$gpa' },
        assessmentCount: { $sum: 1 },
        month: { $first: '$gradedAt' }
      }
    },
    { $sort: { month: 1 } }
  );
  
  return await this.aggregate(pipeline);
};

// Static method to get grade distribution
GradeSchema.statics.getGradeDistribution = async function(assessmentId, schoolId) {
  return await this.aggregate([
    { 
      $match: { 
        assessment: mongoose.Types.ObjectId(assessmentId),
        school: mongoose.Types.ObjectId(schoolId),
        status: 'graded'
      } 
    },
    {
      $group: {
        _id: '$letterGrade',
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('Grade', GradeSchema);