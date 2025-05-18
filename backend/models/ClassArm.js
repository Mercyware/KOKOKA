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
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique arm names within a school
ClassArmSchema.index({ name: 1, school: 1 }, { unique: true });

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
