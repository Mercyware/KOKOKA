const mongoose = require('mongoose');

const HouseSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please provide house name'],
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  houseHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
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

// Compound index to ensure unique house names within a school
HouseSchema.index({ name: 1, school: 1 }, { unique: true });

// Virtual for students in this house
HouseSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'house',
  justOne: false
});

// Virtual for student count
HouseSchema.virtual('studentCount').get(async function() {
  const Student = mongoose.model('Student');
  return await Student.countDocuments({ house: this._id });
});

module.exports = mongoose.model('House', HouseSchema);
