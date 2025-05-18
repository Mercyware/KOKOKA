const mongoose = require('mongoose');

const StudentClassHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  classArm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassArm'
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'transferred', 'withdrawn'],
    default: 'active'
  },
  remarks: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a student has only one active class per academic year
StudentClassHistorySchema.index(
  { student: 1, academicYear: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

// Index for faster lookups
StudentClassHistorySchema.index({ student: 1 });
StudentClassHistorySchema.index({ class: 1 });
StudentClassHistorySchema.index({ academicYear: 1 });
StudentClassHistorySchema.index({ school: 1 });

module.exports = mongoose.model('StudentClassHistory', StudentClassHistorySchema);
