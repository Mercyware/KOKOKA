const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Holiday date is required']
  },
  description: {
    type: String,
    trim: true
  }
});

const AcademicCalendarSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
  },
  term: {
    type: String,
    enum: ['First', 'Second', 'Third'],
    required: [true, 'Term is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  holidays: [HolidaySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique academic calendar for a school, academic year, and term
AcademicCalendarSchema.index({ school: 1, academicYear: 1, term: 1 }, { unique: true });

// Virtual to check if a date falls within the academic calendar period
AcademicCalendarSchema.methods.isDateWithinPeriod = function(date) {
  return date >= this.startDate && date <= this.endDate;
};

// Virtual to check if a date is a holiday
AcademicCalendarSchema.methods.isHoliday = function(date) {
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  return this.holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === dateToCheck.getTime();
  });
};

// Virtual to get all working days (excluding holidays)
AcademicCalendarSchema.methods.getWorkingDays = function() {
  const workingDays = [];
  const currentDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  while (currentDate <= endDate) {
    if (!this.isHoliday(currentDate)) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

module.exports = mongoose.model('AcademicCalendar', AcademicCalendarSchema);
