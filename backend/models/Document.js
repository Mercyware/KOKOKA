const mongoose = require('mongoose');
const path = require('path');

const DocumentSchema = new mongoose.Schema({
  // Enhanced multi-entity support (backward compatible)
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // File information
  title: {
    type: String,
    required: [true, 'Please provide document title']
  },
  fileName: {
    type: String,
    required: [true, 'Please provide file name']
  },
  originalName: {
    type: String,
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'Please provide file path']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL']
  },
  fileType: {
    type: String,
    required: [true, 'Please provide file type']
  },
  mimeType: {
    type: String,
    trim: true
  },
  fileExtension: {
    type: String,
    uppercase: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide file size']
  },
  
  // Enhanced categorization
  type: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: [
      'birth_certificate', 
      'medical_record', 
      'immunization_record',
      'previous_school_record',
      'transfer_certificate',
      'report_card',
      'id_card',
      'passport',
      'visa',
      'residence_permit',
      'guardian_id',
      'fee_receipt',
      'scholarship_document',
      'special_needs_assessment',
      'photo',
      'assignment',
      'lesson_plan',
      'curriculum',
      'policy',
      'form',
      'certificate',
      'announcement',
      'media',
      'assessment',
      'grade_sheet',
      'attendance_record',
      'other'
    ]
  },
  category: {
    type: String,
    enum: [
      'student-documents',
      'teacher-documents',
      'staff-documents',
      'academic-materials',
      'assessments',
      'assignments',
      'reports',
      'certificates',
      'forms',
      'policies',
      'announcements',
      'media',
      'other'
    ],
    default: 'other'
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  
  // Access control and permissions
  isPublic: {
    type: Boolean,
    default: false
  },
  accessPermissions: {
    roles: [{
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent', 'staff', 'principal']
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    classes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }],
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }]
  },
  
  // Related entities
  relatedTo: {
    modelType: {
      type: String,
      enum: ['Student', 'Teacher', 'Staff', 'Class', 'Subject', 'Assessment', 'Assignment', 'Announcement']
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Upload and verification
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  
  // Verification and status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending_verification', 'archived', 'deleted'],
    default: 'pending_verification'
  },
  
  // Document metadata
  expiryDate: {
    type: Date
  },
  issuedBy: {
    type: String
  },
  issueDate: {
    type: Date
  },
  documentNumber: {
    type: String
  },
  
  // Enhanced metadata
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number,
    pages: Number,
    thumbnail: String
  },
  
  // Organization and search
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  notes: {
    type: String
  },
  
  // Version control
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Security
  checksum: {
    type: String,
    trim: true
  },
  virusScan: {
    status: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'failed'],
      default: 'pending'
    },
    scannedAt: Date,
    scanResult: String
  },
  
  // Expiration
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Enhanced indexes for performance
DocumentSchema.index({ school: 1, category: 1 });
DocumentSchema.index({ school: 1, uploadedBy: 1 });
DocumentSchema.index({ school: 1, status: 1 });
DocumentSchema.index({ school: 1, tags: 1 });
DocumentSchema.index({ student: 1, type: 1 }); // Backward compatibility
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ fileName: 'text', title: 'text', description: 'text' });
DocumentSchema.index({ 'relatedTo.modelType': 1, 'relatedTo.modelId': 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual properties
DocumentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

DocumentSchema.virtual('secureDownloadUrl').get(function() {
  return `/api/documents/${this._id}/download`;
});

DocumentSchema.virtual('thumbnailUrl').get(function() {
  if (this.metadata.thumbnail) {
    const baseUrl = process.env.FILE_BASE_URL || '/uploads';
    return `${baseUrl}/${this.metadata.thumbnail}`;
  }
  return null;
});

// Pre-save middleware
DocumentSchema.pre('save', function(next) {
  // Extract file extension from fileName if not provided
  if (this.fileName && !this.fileExtension) {
    this.fileExtension = path.extname(this.fileName).substring(1).toUpperCase();
  }
  
  // Set originalName from fileName if not provided
  if (!this.originalName && this.fileName) {
    this.originalName = this.fileName;
  }
  
  // Auto-categorize based on type for backward compatibility
  if (!this.category && this.type) {
    const categoryMapping = {
      'birth_certificate': 'student-documents',
      'medical_record': 'student-documents', 
      'report_card': 'reports',
      'assignment': 'assignments',
      'lesson_plan': 'academic-materials',
      'assessment': 'assessments',
      'announcement': 'announcements',
      'photo': 'media',
      'certificate': 'certificates',
      'policy': 'policies',
      'form': 'forms'
    };
    this.category = categoryMapping[this.type] || 'other';
  }
  
  next();
});

// Instance methods
DocumentSchema.methods.hasAccess = function(userId, userRole) {
  // Admin always has access
  if (userRole === 'admin' || userRole === 'principal') {
    return true;
  }

  // Owner has access
  if (this.uploadedBy.toString() === userId.toString()) {
    return true;
  }

  // Public documents
  if (this.isPublic) {
    return true;
  }

  // Role-based access
  if (this.accessPermissions.roles.includes(userRole)) {
    return true;
  }

  // User-specific access
  if (this.accessPermissions.users.some(user => user.toString() === userId.toString())) {
    return true;
  }

  return false;
};

DocumentSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

// Static methods
DocumentSchema.statics.getStorageStats = async function(schoolId, category = null) {
  let matchStage = { 
    school: mongoose.Types.ObjectId(schoolId),
    status: 'active'
  };
  
  if (category) {
    matchStage.category = category;
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        totalDownloads: { $sum: '$downloadCount' },
        averageFileSize: { $avg: '$fileSize' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalFiles: 0,
    totalSize: 0,
    totalDownloads: 0,
    averageFileSize: 0
  };
};

module.exports = mongoose.model('Document', DocumentSchema);
