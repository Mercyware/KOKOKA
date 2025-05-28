const mongoose = require('mongoose');

const ClassTeacherSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Please provide teacher']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class']
  },
  classArm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassArm',
    required: [true, 'Please provide class arm/section']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Please provide academic year']
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

// Compound index to ensure a class and arm has only one class teacher per academic year
ClassTeacherSchema.index(
  { class: 1, classArm: 1, academicYear: 1 },
  { unique: true }
);

// Compound index to ensure a teacher is assigned as class teacher only once per academic year
ClassTeacherSchema.index(
  { teacher: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('ClassTeacher', ClassTeacherSchema);
