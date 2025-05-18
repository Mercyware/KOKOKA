const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide class name'],
    trim: true
  },
  level: {
    type: Number,
    required: [true, 'Please provide class level'],
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
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

// Compound index to ensure unique class names within a school
ClassSchema.index({ name: 1, school: 1 }, { unique: true });


// Virtual for students in this class (across all arms)
ClassSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

module.exports = mongoose.model('Class', ClassSchema);
