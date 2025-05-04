const mongoose = require('mongoose');

const TeacherSubjectAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Please provide teacher']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Please provide subject']
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
  classes: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    classArms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassArm'
    }]
  }],
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

// Compound index to ensure a teacher is assigned to a subject only once per term
TeacherSubjectAssignmentSchema.index(
  { teacher: 1, subject: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model('TeacherSubjectAssignment', TeacherSubjectAssignmentSchema);
