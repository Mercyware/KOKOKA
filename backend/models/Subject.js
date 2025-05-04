const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique subject codes within an academic year
SubjectSchema.index({ code: 1, academicYear: 1 }, { unique: true });

// Virtual for teachers assigned to this subject
SubjectSchema.virtual('teachers', {
  ref: 'TeacherSubjectAssignment',
  localField: '_id',
  foreignField: 'subject',
  justOne: false
});

module.exports = mongoose.model('Subject', SubjectSchema);
