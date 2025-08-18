const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused', 'partial'],
    required: [true, 'Attendance status is required'],
    default: 'present'
  },
  period: {
    type: String,
    enum: ['morning', 'afternoon', 'full-day', 'period-1', 'period-2', 'period-3', 'period-4', 'period-5', 'period-6', 'period-7', 'period-8'],
    default: 'full-day'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by is required']
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  method: {
    type: String,
    enum: ['manual', 'qr-code', 'biometric', 'geofencing', 'bulk'],
    default: 'manual'
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: {
    type: String,
    trim: true
  },
  parentNotified: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  isModified: {
    type: Boolean,
    default: false
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  modificationReason: {
    type: String,
    trim: true
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

// Compound indexes for faster lookups
AttendanceSchema.index({ school: 1, student: 1, date: 1, period: 1 }, { unique: true });
AttendanceSchema.index({ school: 1, class: 1, date: 1 });
AttendanceSchema.index({ school: 1, date: 1, status: 1 });
AttendanceSchema.index({ student: 1, academicYear: 1 });

// Virtual for attendance duration
AttendanceSchema.virtual('duration').get(function() {
  if (this.checkInTime && this.checkOutTime) {
    return Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // Duration in minutes
  }
  return null;
});

// Virtual for attendance percentage calculation
AttendanceSchema.virtual('attendanceRate').get(function() {
  // This would typically be calculated at the query level
  return this.status === 'present' ? 100 : this.status === 'partial' ? 50 : 0;
});

// Pre-save middleware to update timestamps
AttendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get attendance statistics
AttendanceSchema.statics.getAttendanceStats = async function(schoolId, filters = {}) {
  const matchStage = { school: mongoose.Types.ObjectId(schoolId), ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        present: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0] 
          } 
        },
        absent: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] 
          } 
        },
        late: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0] 
          } 
        },
        excused: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] 
          } 
        },
        partial: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] 
          } 
        }
      }
    },
    {
      $addFields: {
        attendanceRate: {
          $multiply: [
            { $divide: ['$present', '$totalRecords'] },
            100
          ]
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalRecords: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    partial: 0,
    attendanceRate: 0
  };
};

// Static method to get student attendance trends
AttendanceSchema.statics.getStudentTrends = async function(studentId, schoolId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        school: mongoose.Types.ObjectId(schoolId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        status: { $first: '$status' },
        date: { $first: '$date' }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

module.exports = mongoose.model('Attendance', AttendanceSchema);