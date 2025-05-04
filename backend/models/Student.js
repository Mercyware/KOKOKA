const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: [true, 'Please provide an admission number'],
    unique: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactInfo: {
    phone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  guardians: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    occupation: String,
    address: String
  }],
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present'
    },
    remark: String
  }],
  grades: [{
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
      required: true
    },
    answers: [{
      question: String,
      answer: String,
      score: Number
    }],
    date: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],
  healthInfo: {
    bloodGroup: String,
    allergies: [String],
    medicalConditions: [String],
    medications: [String]
  },
  extracurricular: [{
    activity: String,
    role: String,
    achievements: [String]
  }],
  behavior: [{
    date: {
      type: Date,
      default: Date.now
    },
    incident: String,
    action: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  academicHistory: [{
    year: String,
    class: String,
    school: String,
    performance: String
  }],
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  graduationDate: Date,
  status: {
    type: String,
    enum: ['active', 'graduated', 'transferred', 'suspended', 'expelled'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student's age
StudentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for student's attendance percentage
StudentSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance || this.attendance.length === 0) return 0;
  
  const totalDays = this.attendance.length;
  const presentDays = this.attendance.filter(
    day => day.status === 'present' || day.status === 'late'
  ).length;
  
  return (presentDays / totalDays) * 100;
});

// Virtual for student's average grade
StudentSchema.virtual('averageGrade').get(function() {
  if (!this.grades || this.grades.length === 0) return null;
  
  const totalScore = this.grades.reduce((sum, grade) => sum + grade.score, 0);
  return totalScore / this.grades.length;
});

module.exports = mongoose.model('Student', StudentSchema);
