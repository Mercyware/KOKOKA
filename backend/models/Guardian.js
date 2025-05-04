const mongoose = require('mongoose');

const GuardianSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name']
  },
  relationship: {
    type: String,
    required: [true, 'Please specify relationship to student'],
    enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'legal guardian', 'other']
  },
  email: {
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
  occupation: {
    type: String
  },
  employer: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmergencyContact: {
    type: Boolean,
    default: false
  },
  isAuthorizedPickup: {
    type: Boolean,
    default: false
  },
  nationalId: {
    type: String
  },
  passportNumber: {
    type: String
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Virtual for guardian's full name
GuardianSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster lookups
GuardianSchema.index({ firstName: 1, lastName: 1 });
GuardianSchema.index({ email: 1 });
GuardianSchema.index({ phone: 1 });

module.exports = mongoose.model('Guardian', GuardianSchema);
