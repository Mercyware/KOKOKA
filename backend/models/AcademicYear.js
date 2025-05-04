const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide academic year name'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  isActive: {
    type: Boolean,
    default: false
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

// Virtual for terms in this academic year
AcademicYearSchema.virtual('terms', {
  ref: 'Term',
  localField: '_id',
  foreignField: 'academicYear',
  justOne: false
});

// Virtual to check if academic year is current
AcademicYearSchema.virtual('isCurrent').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Compound index to ensure unique academic year names within a school
AcademicYearSchema.index({ name: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);
