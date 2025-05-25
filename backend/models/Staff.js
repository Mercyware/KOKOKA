const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
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
  staffType: {
    type: String,
    enum: ['teacher', 'admin', 'cashier', 'librarian', 'counselor', 'nurse', 'security', 'maintenance', 'other'],
    required: [true, 'Please specify the staff type']
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
  nationalId: {
    type: String,
    required: [true, 'Please provide national ID number']
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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please specify the department']
  },
  position: {
    type: String,
    required: [true, 'Please specify the position']
  },
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
    contract: String,
    otherDocuments: [String]
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'on leave', 'terminated', 'retired', 'suspended'],
    default: 'active'
  },
  accessPermissions: {
    canViewStudentRecords: {
      type: Boolean,
      default: false
    },
    canEditStudentRecords: {
      type: Boolean,
      default: false
    },
    canViewFinancialRecords: {
      type: Boolean,
      default: false
    },
    canEditFinancialRecords: {
      type: Boolean,
      default: false
    },
    canViewStaffRecords: {
      type: Boolean,
      default: false
    },
    canEditStaffRecords: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageSystem: {
      type: Boolean,
      default: false
    }
  },
  performanceReviews: [{
    reviewDate: Date,
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    ratings: {
      jobKnowledge: {
        type: Number,
        min: 1,
        max: 5
      },
      workQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      attendance: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      teamwork: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    comments: String,
    goals: [String],
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  leaves: [{
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'maternity', 'paternity', 'study', 'unpaid', 'other'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    documents: [String] // URLs to supporting documents
  }],
  remarks: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for staff's age
StaffSchema.virtual('age').get(function() {
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

// Virtual for staff's attendance percentage
StaffSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance || this.attendance.length === 0) return 0;
  
  const totalDays = this.attendance.length;
  const presentDays = this.attendance.filter(
    day => day.status === 'present' || day.status === 'late'
  ).length;
  
  return (presentDays / totalDays) * 100;
});

// Virtual for years of service
StaffSchema.virtual('yearsOfService').get(function() {
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

// Virtual for remaining leave days
StaffSchema.virtual('remainingLeaves').get(function() {
  const currentYear = new Date().getFullYear();
  const approvedLeaves = this.leaves.filter(
    leave => 
      leave.status === 'approved' && 
      new Date(leave.startDate).getFullYear() === currentYear
  );
  
  const leaveDays = approvedLeaves.reduce((total, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return total + diffDays;
  }, 0);
  
  // Assuming a standard allocation of 30 leave days per year
  return Math.max(0, 30 - leaveDays);
});

// Compound index to ensure unique employee IDs within a school
StaffSchema.index({ employeeId: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('Staff', StaffSchema);
