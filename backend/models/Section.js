const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide section name'],
    trim: true
  },
  description: {
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

// Compound index to ensure unique section names within a school
SectionSchema.index({ name: 1, school: 1 }, { unique: true });

// Virtual for students in this section
SectionSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'section',
  justOne: false
});

// Virtual for student count
SectionSchema.virtual('studentCount').get(async function() {
  const Student = mongoose.model('Student');
  return await Student.countDocuments({ section: this._id });
});

module.exports = mongoose.model('Section', SectionSchema);
