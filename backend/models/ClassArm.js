const mongoose = require('mongoose');

const ClassArmSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide arm name'],
    trim: true
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
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  capacity: {
    type: Number,
    default: 40
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    building: String,
    floor: String,
    roomNumber: String
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

// Compound index to ensure unique arm names within a class, academic year and school
ClassArmSchema.index({ name: 1, class: 1, academicYear: 1, school: 1 }, { unique: true });

// Virtual for students in this class arm
ClassArmSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'classArm',
  justOne: false
});

// Virtual for current student count
ClassArmSchema.virtual('studentCount').get(async function() {
  const Student = mongoose.model('Student');
  return await Student.countDocuments({ classArm: this._id });
});

module.exports = mongoose.model('ClassArm', ClassArmSchema);
