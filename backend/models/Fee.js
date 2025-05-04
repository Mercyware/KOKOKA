const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    enum: ['tuition', 'exam', 'transport', 'hostel', 'library', 'sports', 'technology', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: function() {
      return this.totalAmount;
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
    default: 'pending'
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank transfer', 'credit card', 'debit card', 'mobile money', 'check', 'other'],
      required: true
    },
    transactionId: String,
    date: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    notes: String
  }],
  discounts: [{
    type: {
      type: String,
      enum: ['scholarship', 'financial aid', 'sibling', 'staff', 'merit', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    percentage: Number,
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: {
      type: Date,
      default: Date.now
    }
  }],
  invoiceNumber: {
    type: String,
    unique: true
  },
  receiptNumbers: [String],
  remindersSent: [{
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'letter', 'phone call'],
      required: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to update balance and status
FeeSchema.pre('save', function(next) {
  // Calculate balance
  this.balance = this.totalAmount - this.amountPaid;
  
  // Update status based on payment
  if (this.balance <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else if (this.dueDate < new Date() && this.status !== 'paid') {
    this.status = 'overdue';
  }
  
  next();
});

// Generate invoice number
FeeSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const currentYear = new Date().getFullYear().toString().substr(-2);
    const count = await mongoose.model('Fee').countDocuments();
    this.invoiceNumber = `INV-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for payment status percentage
FeeSchema.virtual('paymentPercentage').get(function() {
  return (this.amountPaid / this.totalAmount) * 100;
});

// Method to add a payment
FeeSchema.methods.addPayment = async function(paymentData) {
  this.payments.push(paymentData);
  this.amountPaid += paymentData.amount;
  this.balance = this.totalAmount - this.amountPaid;
  
  // Update status
  if (this.balance <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  }
  
  // Generate receipt number
  const currentYear = new Date().getFullYear().toString().substr(-2);
  const receiptCount = this.receiptNumbers.length + 1;
  const receiptNumber = `RCP-${currentYear}-${receiptCount.toString().padStart(4, '0')}`;
  this.receiptNumbers.push(receiptNumber);
  
  await this.save();
  return receiptNumber;
};

// Method to add a discount
FeeSchema.methods.addDiscount = async function(discountData) {
  this.discounts.push(discountData);
  
  // Recalculate total amount after discount
  const discountAmount = discountData.amount;
  this.totalAmount -= discountAmount;
  this.balance = this.totalAmount - this.amountPaid;
  
  // Update status
  if (this.balance <= 0) {
    this.status = 'paid';
  }
  
  await this.save();
};

// Method to send payment reminder
FeeSchema.methods.sendReminder = async function(reminderData) {
  this.remindersSent.push(reminderData);
  await this.save();
};

module.exports = mongoose.model('Fee', FeeSchema);
