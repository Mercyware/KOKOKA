const mongoose = require('mongoose');

const GuardianSchema = new mongoose.Schema({
  // Enhanced with school context
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Enhanced student relationships
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    relationship: {
      type: String,
      required: [true, 'Please specify relationship to student'],
      enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'legal guardian', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    emergencyContact: {
      type: Boolean,
      default: false
    },
    authorizedPickup: {
      type: Boolean,
      default: false
    },
    financialResponsibility: {
      type: Boolean,
      default: false
    },
    academicReportsAccess: {
      type: Boolean,
      default: true
    },
    disciplinaryReportsAccess: {
      type: Boolean,
      default: true
    },
    medicalInfoAccess: {
      type: Boolean,
      default: false
    }
  }],
  
  // Personal Information (backward compatible)
  firstName: {
    type: String,
    required: [true, 'Please provide first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name']
  },
  middleName: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Hon.'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Enhanced contact information
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  secondaryEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  alternativePhone: {
    type: String
  },
  workPhone: {
    type: String
  },
  
  // Professional information
  occupation: {
    type: String
  },
  employer: {
    type: String
  },
  workAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Address (enhanced)
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Portal access and preferences
  portalAccess: {
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    preferredLanguage: {
      type: String,
      default: 'english'
    }
  },
  
  // Communication preferences
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['email', 'sms', 'phone', 'app-notification'],
      default: 'email'
    },
    notificationSettings: {
      academicReports: {
        type: Boolean,
        default: true
      },
      attendanceAlerts: {
        type: Boolean,
        default: true
      },
      disciplinaryNotices: {
        type: Boolean,
        default: true
      },
      feeReminders: {
        type: Boolean,
        default: true
      },
      eventAnnouncements: {
        type: Boolean,
        default: true
      },
      emergencyAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Authorization and permissions (backward compatible)
  isEmergencyContact: {
    type: Boolean,
    default: false
  },
  isAuthorizedPickup: {
    type: Boolean,
    default: false
  },
  
  // Enhanced identification
  identificationDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'drivers_license', 'voter_id', 'other'],
      required: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  nationalId: {
    type: String // Backward compatibility
  },
  passportNumber: {
    type: String // Backward compatibility
  },
  
  // Additional information
  photo: {
    type: String
  },
  notes: {
    type: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_verification', 'suspended'],
    default: 'active'
  },
  verificationStatus: {
    identity: {
      type: Boolean,
      default: false
    },
    contact: {
      type: Boolean,
      default: false
    },
    relationship: {
      type: Boolean,
      default: false
    }
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Enhanced indexes for performance
GuardianSchema.index({ school: 1, email: 1 });
GuardianSchema.index({ school: 1, 'students.student': 1 });
GuardianSchema.index({ school: 1, status: 1 });
GuardianSchema.index({ user: 1 }, { unique: true, sparse: true });
GuardianSchema.index({ firstName: 1, lastName: 1 }); // Backward compatibility
GuardianSchema.index({ email: 1 }); // Backward compatibility
GuardianSchema.index({ phone: 1 }); // Backward compatibility

// Virtual for guardian's full name (enhanced)
GuardianSchema.virtual('fullName').get(function() {
  const parts = [];
  if (this.title) parts.push(this.title);
  if (this.firstName) parts.push(this.firstName);
  if (this.middleName) parts.push(this.middleName);
  if (this.lastName) parts.push(this.lastName);
  return parts.join(' ');
});

// Virtual for primary student
GuardianSchema.virtual('primaryStudent').get(function() {
  return this.students.find(s => s.isPrimary) || this.students[0];
});

// Virtual for emergency contact status
GuardianSchema.virtual('isEmergencyContactForAny').get(function() {
  return this.students.some(s => s.emergencyContact) || this.isEmergencyContact;
});

// Pre-save middleware
GuardianSchema.pre('save', function(next) {
  // Ensure only one primary relationship per student
  const studentPrimaryMap = new Map();
  
  this.students.forEach((studentRel, index) => {
    const studentId = studentRel.student.toString();
    
    if (studentRel.isPrimary) {
      if (studentPrimaryMap.has(studentId)) {
        // If we already have a primary for this student, make this one non-primary
        this.students[index].isPrimary = false;
      } else {
        studentPrimaryMap.set(studentId, index);
      }
    }
  });
  
  next();
});

// Instance methods
GuardianSchema.methods.addStudent = function(studentId, relationship, options = {}) {
  const existingIndex = this.students.findIndex(s => s.student.toString() === studentId.toString());
  
  if (existingIndex >= 0) {
    // Update existing relationship
    this.students[existingIndex] = {
      ...this.students[existingIndex].toObject(),
      relationship,
      ...options
    };
  } else {
    // Add new relationship
    this.students.push({
      student: studentId,
      relationship,
      ...options
    });
  }
  
  return this.save();
};

GuardianSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(s => s.student.toString() !== studentId.toString());
  return this.save();
};

GuardianSchema.methods.hasAccessToStudent = function(studentId) {
  return this.students.some(s => s.student.toString() === studentId.toString());
};

GuardianSchema.methods.getAccessLevel = function(studentId) {
  const relation = this.students.find(s => s.student.toString() === studentId.toString());
  if (!relation) return null;
  
  return {
    academic: relation.academicReportsAccess,
    disciplinary: relation.disciplinaryReportsAccess,
    medical: relation.medicalInfoAccess,
    financial: relation.financialResponsibility,
    emergency: relation.emergencyContact,
    authorizedPickup: relation.authorizedPickup,
    isPrimary: relation.isPrimary,
    relationship: relation.relationship
  };
};

GuardianSchema.methods.updatePortalAccess = function(options = {}) {
  if (options.lastLogin !== undefined) {
    this.portalAccess.lastLogin = options.lastLogin;
    this.portalAccess.loginCount += 1;
  }
  
  if (options.isActive !== undefined) {
    this.portalAccess.isActive = options.isActive;
  }
  
  if (options.preferredLanguage !== undefined) {
    this.portalAccess.preferredLanguage = options.preferredLanguage;
  }
  
  return this.save();
};

// Static methods
GuardianSchema.statics.findByStudent = async function(studentId, schoolId) {
  return await this.find({
    school: schoolId,
    'students.student': studentId,
    status: 'active'
  }).populate('user', 'name email role');
};

GuardianSchema.statics.findPrimaryGuardian = async function(studentId, schoolId) {
  const result = await this.findOne({
    school: schoolId,
    'students.student': studentId,
    'students.isPrimary': true,
    status: 'active'
  }).populate('user', 'name email role');
  
  if (result) return result;
  
  // If no primary guardian, return first active guardian
  return await this.findOne({
    school: schoolId,
    'students.student': studentId,
    status: 'active'
  }).populate('user', 'name email role');
};

GuardianSchema.statics.getGuardianStats = async function(schoolId) {
  const stats = await this.aggregate([
    { $match: { school: mongoose.Types.ObjectId(schoolId) } },
    {
      $group: {
        _id: null,
        totalGuardians: { $sum: 1 },
        activeGuardians: { 
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
        },
        pendingVerification: { 
          $sum: { $cond: [{ $eq: ['$status', 'pending_verification'] }, 1, 0] } 
        },
        withPortalAccess: { 
          $sum: { $cond: ['$portalAccess.isActive', 1, 0] } 
        },
        withEmail: {
          $sum: { $cond: [{ $ne: ['$email', null] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalGuardians: 0,
    activeGuardians: 0,
    pendingVerification: 0,
    withPortalAccess: 0,
    withEmail: 0
  };
};

GuardianSchema.statics.findByEmail = async function(email, schoolId) {
  return await this.findOne({
    school: schoolId,
    $or: [
      { email: email.toLowerCase() },
      { secondaryEmail: email.toLowerCase() }
    ]
  });
};

module.exports = mongoose.model('Guardian', GuardianSchema);
