const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide subject code'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Please provide academic year']
  },
  department: {
    type: String,
    trim: true
  },
  creditHours: {
    type: Number,
    default: 1
  },
  isElective: {
    type: Boolean,
    default: false
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  numberOfTests: {
    type: Number,
    default: 2,
    min: [0, 'Number of tests cannot be negative'],
    max: [10, 'Number of tests cannot exceed 10']
  },
  testPercentage: {
    type: Number,
    default: 30,
    min: [0, 'Test percentage cannot be negative'],
    max: [100, 'Test percentage cannot exceed 100']
  },
  examPercentage: {
    type: Number,
    default: 70,
    min: [0, 'Exam percentage cannot be negative'],
    max: [100, 'Exam percentage cannot exceed 100']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique subject codes within an academic year and school
SubjectSchema.index({ code: 1, academicYear: 1, school: 1 }, { unique: true });

// Virtual for teachers assigned to this subject
SubjectSchema.virtual('teachers', {
  ref: 'TeacherSubjectAssignment',
  localField: '_id',
  foreignField: 'subject',
  justOne: false
});

module.exports = mongoose.model('Subject', SubjectSchema);
