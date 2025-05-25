const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    trim: true,
    maxlength: [100, 'Department name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for staff in this department
DepartmentSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'department',
  justOne: false
});

// Compound index to ensure unique department names within a school
DepartmentSchema.index({ name: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
