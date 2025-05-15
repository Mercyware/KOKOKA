const AcademicCalendar = require('../models/AcademicCalendar');
const AcademicYear = require('../models/AcademicYear');

// Get all academic calendars
exports.getAllAcademicCalendars = async (req, res) => {
  try {
    const academicCalendars = await AcademicCalendar.find()
      .populate('academicYear', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: academicCalendars
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get academic calendar by ID
exports.getAcademicCalendarById = async (req, res) => {
  try {
    const academicCalendar = await AcademicCalendar.findById(req.params.id)
      .populate('academicYear', 'name');
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    res.json({
      success: true,
      data: academicCalendar
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new academic calendar
exports.createAcademicCalendar = async (req, res) => {
  try {
    // Add the current user as creator
    req.body.createdBy = req.user.id;
    
    // Verify that the academic year exists
    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic year not found' 
      });
    }
    
    // Check if calendar already exists for this school, academic year, and term
    const existingCalendar = await AcademicCalendar.findOne({
      school: req.body.school,
      academicYear: req.body.academicYear,
      term: req.body.term
    });
    
    if (existingCalendar) {
      return res.status(400).json({
        success: false,
        message: 'Academic calendar already exists for this school, academic year, and term'
      });
    }
    
    // Validate dates
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
    
    // Validate that dates are within academic year
    if (startDate < academicYear.startDate || endDate > academicYear.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Calendar dates must be within the academic year period'
      });
    }
    
    // Validate holidays
    if (req.body.holidays) {
      for (const holiday of req.body.holidays) {
        const holidayDate = new Date(holiday.date);
        if (holidayDate < startDate || holidayDate > endDate) {
          return res.status(400).json({
            success: false,
            message: `Holiday "${holiday.name}" date is outside the calendar period`
          });
        }
      }
    }
    
    const academicCalendar = new AcademicCalendar(req.body);
    await academicCalendar.save();
    
    res.status(201).json({
      success: true,
      message: 'Academic calendar created successfully',
      data: academicCalendar
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update academic calendar
exports.updateAcademicCalendar = async (req, res) => {
  try {
    // If academic year is being updated, verify it exists
    if (req.body.academicYear) {
      const academicYear = await AcademicYear.findById(req.body.academicYear);
      if (!academicYear) {
        return res.status(404).json({ 
          success: false,
          message: 'Academic year not found' 
        });
      }
      
      // Validate that dates are within academic year
      if (req.body.startDate || req.body.endDate) {
        const startDate = new Date(req.body.startDate || (await AcademicCalendar.findById(req.params.id)).startDate);
        const endDate = new Date(req.body.endDate || (await AcademicCalendar.findById(req.params.id)).endDate);
        
        if (startDate < academicYear.startDate || endDate > academicYear.endDate) {
          return res.status(400).json({
            success: false,
            message: 'Calendar dates must be within the academic year period'
          });
        }
      }
    }
    
    // Validate dates if both are provided
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be after end date'
        });
      }
    }
    
    // Check for duplicate calendar
    if (req.body.school || req.body.academicYear || req.body.term) {
      const currentCalendar = await AcademicCalendar.findById(req.params.id);
      
      const existingCalendar = await AcademicCalendar.findOne({
        school: req.body.school || currentCalendar.school,
        academicYear: req.body.academicYear || currentCalendar.academicYear,
        term: req.body.term || currentCalendar.term,
        _id: { $ne: req.params.id } // Exclude the current calendar
      });
      
      if (existingCalendar) {
        return res.status(400).json({
          success: false,
          message: 'Academic calendar already exists for this school, academic year, and term'
        });
      }
    }
    
    // Validate holidays if provided
    if (req.body.holidays) {
      const calendar = await AcademicCalendar.findById(req.params.id);
      const startDate = new Date(req.body.startDate || calendar.startDate);
      const endDate = new Date(req.body.endDate || calendar.endDate);
      
      for (const holiday of req.body.holidays) {
        const holidayDate = new Date(holiday.date);
        if (holidayDate < startDate || holidayDate > endDate) {
          return res.status(400).json({
            success: false,
            message: `Holiday "${holiday.name}" date is outside the calendar period`
          });
        }
      }
    }
    
    const academicCalendar = await AcademicCalendar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('academicYear', 'name');
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Academic calendar updated successfully',
      data: academicCalendar
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete academic calendar
exports.deleteAcademicCalendar = async (req, res) => {
  try {
    const academicCalendar = await AcademicCalendar.findByIdAndDelete(req.params.id);
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Academic calendar deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get academic calendars by academic year
exports.getAcademicCalendarsByAcademicYear = async (req, res) => {
  try {
    const academicCalendars = await AcademicCalendar.find({ 
      academicYear: req.params.academicYearId 
    }).populate('academicYear', 'name');
    
    res.json({
      success: true,
      data: academicCalendars
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Add holiday to academic calendar
exports.addHoliday = async (req, res) => {
  try {
    const { name, date, description } = req.body;
    
    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Holiday name and date are required'
      });
    }
    
    const academicCalendar = await AcademicCalendar.findById(req.params.id);
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    // Validate holiday date is within calendar period
    const holidayDate = new Date(date);
    if (holidayDate < academicCalendar.startDate || holidayDate > academicCalendar.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Holiday date must be within the calendar period'
      });
    }
    
    // Check if holiday already exists on the same date
    const existingHoliday = academicCalendar.holidays.find(h => {
      const existingDate = new Date(h.date);
      existingDate.setHours(0, 0, 0, 0);
      
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      
      return existingDate.getTime() === newDate.getTime();
    });
    
    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: 'A holiday already exists on this date'
      });
    }
    
    academicCalendar.holidays.push({ name, date, description });
    await academicCalendar.save();
    
    res.json({
      success: true,
      message: 'Holiday added successfully',
      data: academicCalendar
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Remove holiday from academic calendar
exports.removeHoliday = async (req, res) => {
  try {
    const academicCalendar = await AcademicCalendar.findById(req.params.id);
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    const holidayId = req.params.holidayId;
    
    // Check if holiday exists
    const holidayIndex = academicCalendar.holidays.findIndex(h => h._id.toString() === holidayId);
    
    if (holidayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }
    
    // Remove the holiday
    academicCalendar.holidays.splice(holidayIndex, 1);
    await academicCalendar.save();
    
    res.json({
      success: true,
      message: 'Holiday removed successfully',
      data: academicCalendar
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get working days (excluding holidays)
exports.getWorkingDays = async (req, res) => {
  try {
    const academicCalendar = await AcademicCalendar.findById(req.params.id);
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    const workingDays = academicCalendar.getWorkingDays();
    
    res.json({
      success: true,
      data: {
        totalDays: workingDays.length,
        workingDays
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Check if a date is a holiday
exports.checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const academicCalendar = await AcademicCalendar.findById(req.params.id);
    
    if (!academicCalendar) {
      return res.status(404).json({ 
        success: false,
        message: 'Academic calendar not found' 
      });
    }
    
    const dateToCheck = new Date(date);
    const isHoliday = academicCalendar.isHoliday(dateToCheck);
    
    let holidayInfo = null;
    if (isHoliday) {
      const holiday = academicCalendar.holidays.find(h => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        
        const checkDate = new Date(dateToCheck);
        checkDate.setHours(0, 0, 0, 0);
        
        return holidayDate.getTime() === checkDate.getTime();
      });
      
      if (holiday) {
        holidayInfo = {
          name: holiday.name,
          date: holiday.date,
          description: holiday.description
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        date: dateToCheck,
        isHoliday,
        holidayInfo
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};
