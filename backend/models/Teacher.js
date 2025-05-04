const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: [true, 'Please provide an employee ID']
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
    phone: {
      type: String,
      required: [true, 'Please provide a phone number']
    },
    alternatePhone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    specialization: String,
    documents: [String] // URLs to documents
  }],
  subjects: [{
    type: String,
    required: true
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    }
  }],
  experience: [{
    institution: String,
    position: String,
    startDate: Date,
    endDate: Date,
    responsibilities: [String]
  }],
  specializations: [String],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialID: String,
    documentUrl: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave'],
      default: 'present'
    },
    remark: String
  }],
  salary: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'bi-weekly', 'weekly'],
      default: 'monthly'
    }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
    ifscCode: String
  },
  documents: {
    resume: String,
    idProof: String,
    addressProof: String,
    offerLetter: String,
    contract: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'on leave', 'terminated', 'retired'],
    default: 'active'
  },
  remarks: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for teacher's age
TeacherSchema.virtual('age').get(function() {
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

// Virtual for teacher's attendance percentage
TeacherSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance || this.attendance.length === 0) return 0;
  
  const totalDays = this.attendance.length;
  const presentDays = this.attendance.filter(
    day => day.status === 'present' || day.status === 'late'
  ).length;
  
  return (presentDays / totalDays) * 100;
});

// Virtual for years of experience at current school
TeacherSchema.virtual('yearsOfService').get(function() {
  if (!this.joinDate) return 0;
  
  const today = new Date();
  const joinDate = new Date(this.joinDate);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
    years--;
  }
  
  return years;
});

// Compound index to ensure unique employee IDs within a school
TeacherSchema.index({ employeeId: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
