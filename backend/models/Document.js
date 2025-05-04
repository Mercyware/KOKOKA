const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide document title']
  },
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
      'other'
    ]
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL']
  },
  fileName: {
    type: String,
    required: [true, 'Please provide file name']
  },
  fileType: {
    type: String,
    required: [true, 'Please provide file type']
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide file size']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending_verification'],
    default: 'pending_verification'
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster lookups
DocumentSchema.index({ student: 1, type: 1 });
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
