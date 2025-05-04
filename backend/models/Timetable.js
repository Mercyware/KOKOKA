const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
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
  effectiveFrom: {
    type: Date,
    required: true
  },
  effectiveTo: {
    type: Date
  },
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    periods: [{
      periodNumber: {
        type: Number,
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
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
      },
      location: {
        type: String,
        default: 'Regular Classroom'
      },
      notes: String
    }]
  }],
  breaks: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    name: {
      type: String,
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
  specialEvents: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
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
    description: String,
    location: String,
    participants: [{
      type: String,
      enum: ['students', 'teachers', 'parents', 'staff', 'guests']
    }]
  }],
  holidays: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
TimetableSchema.index({ class: 1, academicYear: 1, term: 1 }, { unique: true });

// Method to check for scheduling conflicts
TimetableSchema.methods.hasConflicts = function() {
  const conflicts = [];
  
  // Check for teacher conflicts (same teacher scheduled at the same time)
  const teacherSchedule = {};
  
  this.schedule.forEach(daySchedule => {
    const day = daySchedule.day;
    
    daySchedule.periods.forEach(period => {
      const teacherId = period.teacher.toString();
      const timeSlot = `${day}-${period.startTime}-${period.endTime}`;
      
      if (!teacherSchedule[teacherId]) {
        teacherSchedule[teacherId] = [];
      }
      
      if (teacherSchedule[teacherId].includes(timeSlot)) {
        conflicts.push({
          type: 'teacher',
          teacherId,
          day,
          time: `${period.startTime}-${period.endTime}`,
          message: 'Teacher is scheduled for multiple classes at the same time'
        });
      } else {
        teacherSchedule[teacherId].push(timeSlot);
      }
    });
  });
  
  return conflicts;
};

// Virtual for total hours per week
TimetableSchema.virtual('totalHoursPerWeek').get(function() {
  let totalMinutes = 0;
  
  this.schedule.forEach(daySchedule => {
    daySchedule.periods.forEach(period => {
      const startParts = period.startTime.split(':');
      const endParts = period.endTime.split(':');
      
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      totalMinutes += (endMinutes - startMinutes);
    });
  });
  
  return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
});

module.exports = mongoose.model('Timetable', TimetableSchema);
