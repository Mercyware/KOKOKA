const { prisma } = require('../config/database');
const AppError = require('../utils/appError');

// Get all academic calendars
exports.getAllAcademicCalendars = async (req, res) => {
  try {
    const schoolId = req.school.id;
    
    const academicCalendars = await prisma.academicCalendar.findMany({
      where: { schoolId },
      include: {
        academicYear: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: academicCalendars.length,
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
    const { id } = req.params;
    const schoolId = req.school.id;

    const academicCalendar = await prisma.academicCalendar.findFirst({
      where: { 
        id,
        schoolId 
      },
      include: {
        academicYear: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!academicCalendar) {
      return res.status(404).json({
        success: false,
        message: 'Academic calendar not found'
      });
    }

    res.status(200).json({
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
    const schoolId = req.school.id;
    const userId = req.user.id;
    const { academicYearId, term, startDate, endDate, holidays = [] } = req.body;

    // Verify that the academic year exists and belongs to the school
    const academicYear = await prisma.academicYear.findFirst({
      where: { 
        id: academicYearId,
        schoolId 
      }
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // Check if calendar already exists for this school, academic year, and term
    const existingCalendar = await prisma.academicCalendar.findFirst({
      where: {
        schoolId,
        academicYearId,
        term: term.toUpperCase()
      }
    });

    if (existingCalendar) {
      return res.status(400).json({
        success: false,
        message: 'Academic calendar already exists for this school, academic year, and term'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const academicStart = new Date(academicYear.startDate);
    const academicEnd = new Date(academicYear.endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    if (start < academicStart || end > academicEnd) {
      return res.status(400).json({
        success: false,
        message: 'Calendar dates must be within the academic year period'
      });
    }

    // Validate holidays
    if (holidays && holidays.length > 0) {
      for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date);
        if (holidayDate < start || holidayDate > end) {
          return res.status(400).json({
            success: false,
            message: `Holiday "${holiday.name}" date is outside the calendar period`
          });
        }
      }
    }

    const academicCalendar = await prisma.academicCalendar.create({
      data: {
        schoolId,
        academicYearId,
        term: term.toUpperCase(),
        startDate: start,
        endDate: end,
        holidays: holidays || [],
        createdById: userId
      },
      include: {
        academicYear: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

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
    const { id } = req.params;
    const schoolId = req.school.id;
    const { academicYearId, term, startDate, endDate, holidays } = req.body;

    // Check if calendar exists and belongs to school
    const existingCalendar = await prisma.academicCalendar.findFirst({
      where: { 
        id,
        schoolId 
      }
    });

    if (!existingCalendar) {
      return res.status(404).json({
        success: false,
        message: 'Academic calendar not found'
      });
    }

    // If academic year is being updated, verify it exists
    if (academicYearId) {
      const academicYear = await prisma.academicYear.findFirst({
        where: { 
          id: academicYearId,
          schoolId 
        }
      });

      if (!academicYear) {
        return res.status(404).json({
          success: false,
          message: 'Academic year not found'
        });
      }

      // Validate that dates are within academic year
      const start = new Date(startDate || existingCalendar.startDate);
      const end = new Date(endDate || existingCalendar.endDate);
      const academicStart = new Date(academicYear.startDate);
      const academicEnd = new Date(academicYear.endDate);

      if (start < academicStart || end > academicEnd) {
        return res.status(400).json({
          success: false,
          message: 'Calendar dates must be within the academic year period'
        });
      }
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be after end date'
        });
      }
    }

    // Check for duplicate calendar
    if (academicYearId || term) {
      const duplicateCalendar = await prisma.academicCalendar.findFirst({
        where: {
          schoolId,
          academicYearId: academicYearId || existingCalendar.academicYearId,
          term: term ? term.toUpperCase() : existingCalendar.term,
          id: { not: id }
        }
      });

      if (duplicateCalendar) {
        return res.status(400).json({
          success: false,
          message: 'Academic calendar already exists for this school, academic year, and term'
        });
      }
    }

    // Validate holidays if provided
    if (holidays) {
      const start = new Date(startDate || existingCalendar.startDate);
      const end = new Date(endDate || existingCalendar.endDate);

      for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date);
        if (holidayDate < start || holidayDate > end) {
          return res.status(400).json({
            success: false,
            message: `Holiday "${holiday.name}" date is outside the calendar period`
          });
        }
      }
    }

    // Prepare update data
    const updateData = {};
    if (academicYearId) updateData.academicYearId = academicYearId;
    if (term) updateData.term = term.toUpperCase();
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (holidays) updateData.holidays = holidays;

    const academicCalendar = await prisma.academicCalendar.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(200).json({
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
    const { id } = req.params;
    const schoolId = req.school.id;

    const academicCalendar = await prisma.academicCalendar.findFirst({
      where: { 
        id,
        schoolId 
      }
    });

    if (!academicCalendar) {
      return res.status(404).json({
        success: false,
        message: 'Academic calendar not found'
      });
    }

    await prisma.academicCalendar.delete({
      where: { id }
    });

    res.status(200).json({
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
    const { academicYearId } = req.params;
    const schoolId = req.school.id;

    const academicCalendars = await prisma.academicCalendar.findMany({
      where: { 
        academicYearId,
        schoolId 
      },
      include: {
        academicYear: {
          select: { id: true, name: true, startDate: true, endDate: true }
        }
      },
      orderBy: { term: 'asc' }
    });

    res.status(200).json({
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

// Get working days (excluding holidays)
exports.getWorkingDays = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const academicCalendar = await prisma.academicCalendar.findFirst({
      where: { 
        id,
        schoolId 
      }
    });

    if (!academicCalendar) {
      return res.status(404).json({
        success: false,
        message: 'Academic calendar not found'
      });
    }

    const workingDays = [];
    const currentDate = new Date(academicCalendar.startDate);
    const endDate = new Date(academicCalendar.endDate);
    const holidays = academicCalendar.holidays || [];

    while (currentDate <= endDate) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      // Check if current date is a holiday
      const isHoliday = holidays.some(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.toISOString().split('T')[0] === currentDateStr;
      });

      if (!isHoliday) {
        workingDays.push(currentDateStr);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
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
    const { id } = req.params;
    const { date } = req.query;
    const schoolId = req.school.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const academicCalendar = await prisma.academicCalendar.findFirst({
      where: { 
        id,
        schoolId 
      }
    });

    if (!academicCalendar) {
      return res.status(404).json({
        success: false,
        message: 'Academic calendar not found'
      });
    }

    const dateToCheck = new Date(date);
    const dateToCheckStr = dateToCheck.toISOString().split('T')[0];
    const holidays = academicCalendar.holidays || [];

    let holidayInfo = null;
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.toISOString().split('T')[0] === dateToCheckStr;
    });

    const isHoliday = !!holiday;
    if (isHoliday) {
      holidayInfo = {
        name: holiday.name,
        date: holiday.date,
        description: holiday.description || null
      };
    }

    res.status(200).json({
      success: true,
      data: {
        date: dateToCheckStr,
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