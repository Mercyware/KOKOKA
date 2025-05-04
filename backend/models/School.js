const mongoose = require('mongoose');
const slugify = require('slugify');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a school name'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  subdomain: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: 'default-school-logo.png'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactInfo: {
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: String,
    website: String
  },
  description: {
    type: String,
    trim: true
  },
  established: {
    type: Date
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'college', 'university', 'vocational', 'other'],
    default: 'secondary'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'inactive'],
    default: 'pending'
  },
  settings: {
    theme: {
      primaryColor: {
        type: String,
        default: '#007bff'
      },
      secondaryColor: {
        type: String,
        default: '#6c757d'
      },
      accentColor: {
        type: String,
        default: '#28a745'
      },
      logo: String
    },
    grading: {
      system: {
        type: String,
        enum: ['percentage', 'letter', 'gpa', 'custom'],
        default: 'percentage'
      },
      passMark: {
        type: Number,
        default: 50
      },
      scale: [{
        grade: String,
        minScore: Number,
        maxScore: Number,
        gpa: Number,
        description: String
      }]
    },
    academicYear: {
      startMonth: {
        type: Number,
        default: 1 // January
      },
      endMonth: {
        type: Number,
        default: 12 // December
      },
      terms: {
        type: Number,
        default: 3
      }
    },
    features: {
      sms: {
        type: Boolean,
        default: false
      },
      email: {
        type: Boolean,
        default: true
      },
      library: {
        type: Boolean,
        default: false
      },
      transport: {
        type: Boolean,
        default: false
      },
      hostel: {
        type: Boolean,
        default: false
      },
      ai: {
        type: Boolean,
        default: false
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled'],
      default: 'trial'
    },
    paymentMethod: String,
    paymentId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug and subdomain from school name before saving
SchoolSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
    
    // Generate subdomain from name if not provided
    if (!this.subdomain) {
      // Remove special characters and spaces, convert to lowercase
      this.subdomain = this.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .substring(0, 63); // Max subdomain length
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for subscription status
SchoolSchema.virtual('isSubscriptionActive').get(function() {
  if (!this.subscription.endDate) return false;
  return this.subscription.status === 'active' && 
         this.subscription.endDate > Date.now();
});

// Virtual for full address
SchoolSchema.virtual('fullAddress').get(function() {
  const address = this.address;
  if (!address) return '';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
});

// Indexes for faster lookups
SchoolSchema.index({ name: 1 });
SchoolSchema.index({ slug: 1 });
SchoolSchema.index({ subdomain: 1 });
SchoolSchema.index({ 'subscription.status': 1 });
SchoolSchema.index({ status: 1 });

module.exports = mongoose.model('School', SchoolSchema);
