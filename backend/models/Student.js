const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  
  // Academic Information
  admissionNumber: {
    type: String,
    required: [true, 'Please provide an admission number'],
    unique: true,
    trim: true
  },
  admissionDate: {
    type: Date,
    required: [true, 'Please provide admission date'],
    default: Date.now
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  classArm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassArm'
  },
  section: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  house: {
    type: String,
    trim: true
  },
  
  // Physical Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  height: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    },
    lastMeasured: {
      type: Date
    }
  },
  weight: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    },
    lastMeasured: {
      type: Date
    }
  },
  
  // Contact Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactInfo: {
    phone: String,
    alternativePhone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  
  // Guardian Information
  guardians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian'
  }],
  primaryGuardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian'
  },
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
  // Health Information
  healthInfo: {
    bloodGroup: String,
    height: Number,
    weight: Number,
    allergies: [String],
    medicalConditions: [String],
    medications: [String],
    vaccinationStatus: [{
      name: String,
      date: Date,
      dueDate: Date,
      status: {
        type: String,
        enum: ['completed', 'pending', 'exempted'],
        default: 'pending'
      }
    }],
    disabilities: [String],
    dietaryRestrictions: [String],
    visionStatus: String,
    hearingStatus: String,
    lastCheckup: Date,
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date
    }
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
  // Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Enrollment Information
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  previousSchool: {
    name: String,
    address: String,
    contactInfo: String,
    attendedFrom: Date,
    attendedTo: Date,
    reasonForLeaving: String
  },
  graduationDate: Date,
  status: {
    type: String,
    enum: ['active', 'graduated', 'transferred', 'suspended', 'expelled'],
    default: 'active'
  },
  // Additional Information
  nationality: String,
  religion: String,
  caste: String,
  motherTongue: String,
  languages: [String],
  transportRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute'
  },
  hostelRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelRoom'
  },
  scholarshipInfo: [{
    name: String,
    amount: Number,
    startDate: Date,
    endDate: Date,
    provider: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'pending', 'rejected'],
      default: 'pending'
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    category: String,
    awardedBy: String
  }],
  notes: String,
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student's full name
StudentSchema.virtual('fullName').get(function() {
  if (this.middleName) {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
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

// Indexes for faster lookups
StudentSchema.index({ firstName: 1, lastName: 1 });
StudentSchema.index({ admissionNumber: 1 });
StudentSchema.index({ class: 1 });
StudentSchema.index({ 'guardians': 1 });
StudentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', StudentSchema);
