const mongoose = require('mongoose');

const SittingPositionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide student']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Please provide academic year']
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: [true, 'Please provide term']
  },
  // Position details
  row: {
    type: Number,
    required: [true, 'Please provide row number'],
    min: 1
  },
  column: {
    type: Number,
    required: [true, 'Please provide column number'],
    min: 1
  },
  positionNumber: {
    type: Number,
    required: [true, 'Please provide position number'],
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    trim: true
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

// Compound index to ensure a student has only one sitting position per class, academic year and term
SittingPositionSchema.index(
  { student: 1, class: 1, academicYear: 1, term: 1 },
  { unique: true }
);

// Compound index to ensure a position is assigned to only one student per class, academic year and term
SittingPositionSchema.index(
  { row: 1, column: 1, class: 1, academicYear: 1, term: 1 },
  { unique: true }
);

// Compound index to ensure a position number is assigned to only one student per class, academic year and term
SittingPositionSchema.index(
  { positionNumber: 1, class: 1, academicYear: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model('SittingPosition', SittingPositionSchema);
