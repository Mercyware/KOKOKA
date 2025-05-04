// Timetable service for generating and optimizing school timetables

// Helper function to check if two time slots overlap
const doTimeSlotsOverlap = (slot1, slot2) => {
  const [start1, end1] = [slot1.startTime, slot1.endTime].map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  const [start2, end2] = [slot2.startTime, slot2.endTime].map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  return (start1 < end2 && start2 < end1);
};

// Generate a basic timetable template
exports.generateBasicTimetable = async (classId, academicYear, term) => {
  try {
    // This would typically fetch data from the database
    // For this example, we'll create a mock timetable
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const periods = [
      { periodNumber: 1, startTime: '08:00', endTime: '08:45' },
      { periodNumber: 2, startTime: '08:50', endTime: '09:35' },
      { periodNumber: 3, startTime: '09:40', endTime: '10:25' },
      { periodNumber: 4, startTime: '10:40', endTime: '11:25' },
      { periodNumber: 5, startTime: '11:30', endTime: '12:15' },
      { periodNumber: 6, startTime: '12:20', endTime: '13:05' },
      { periodNumber: 7, startTime: '14:00', endTime: '14:45' },
      { periodNumber: 8, startTime: '14:50', endTime: '15:35' }
    ];
    
    const schedule = days.map(day => {
      return {
        day,
        periods: periods.map(period => ({
          ...period,
          subject: 'To be assigned',
          teacher: null,
          location: 'Regular Classroom'
        }))
      };
    });
    
    const breaks = [
      {
        day: 'monday',
        name: 'Morning Break',
        startTime: '10:25',
        endTime: '10:40'
      },
      {
        day: 'tuesday',
        name: 'Morning Break',
        startTime: '10:25',
        endTime: '10:40'
      },
      {
        day: 'wednesday',
        name: 'Morning Break',
        startTime: '10:25',
        endTime: '10:40'
      },
      {
        day: 'thursday',
        name: 'Morning Break',
        startTime: '10:25',
        endTime: '10:40'
      },
      {
        day: 'friday',
        name: 'Morning Break',
        startTime: '10:25',
        endTime: '10:40'
      },
      {
        day: 'monday',
        name: 'Lunch Break',
        startTime: '13:05',
        endTime: '14:00'
      },
      {
        day: 'tuesday',
        name: 'Lunch Break',
        startTime: '13:05',
        endTime: '14:00'
      },
      {
        day: 'wednesday',
        name: 'Lunch Break',
        startTime: '13:05',
        endTime: '14:00'
      },
      {
        day: 'thursday',
        name: 'Lunch Break',
        startTime: '13:05',
        endTime: '14:00'
      },
      {
        day: 'friday',
        name: 'Lunch Break',
        startTime: '13:05',
        endTime: '14:00'
      }
    ];
    
    return {
      class: classId,
      academicYear,
      term,
      effectiveFrom: new Date(),
      schedule,
      breaks,
      status: 'draft'
    };
  } catch (error) {
    console.error('Error generating basic timetable:', error);
    throw new Error('Failed to generate basic timetable');
  }
};

// Generate optimized timetable based on constraints
exports.generateOptimizedTimetable = async (classId, constraints = {}) => {
  try {
    // Fetch required data from database
    // For this example, we'll use mock data
    
    // Get basic timetable template
    const timetable = await this.generateBasicTimetable(
      classId,
      constraints.academicYear || '2023-2024',
      constraints.term || 'Term 1'
    );
    
    // Mock subjects with their weekly hour requirements
    const subjects = [
      { name: 'Mathematics', hoursPerWeek: 5, teacherId: '60d0fe4f5311236168a109ca' },
      { name: 'Science', hoursPerWeek: 4, teacherId: '60d0fe4f5311236168a109cb' },
      { name: 'English', hoursPerWeek: 5, teacherId: '60d0fe4f5311236168a109cc' },
      { name: 'History', hoursPerWeek: 3, teacherId: '60d0fe4f5311236168a109cd' },
      { name: 'Geography', hoursPerWeek: 2, teacherId: '60d0fe4f5311236168a109ce' },
      { name: 'Physical Education', hoursPerWeek: 2, teacherId: '60d0fe4f5311236168a109cf' },
      { name: 'Art', hoursPerWeek: 2, teacherId: '60d0fe4f5311236168a109d0' },
      { name: 'Music', hoursPerWeek: 1, teacherId: '60d0fe4f5311236168a109d1' },
      { name: 'Computer Science', hoursPerWeek: 2, teacherId: '60d0fe4f5311236168a109d2' },
      { name: 'Foreign Language', hoursPerWeek: 3, teacherId: '60d0fe4f5311236168a109d3' }
    ];
    
    // Apply constraints if provided
    if (constraints.subjectConstraints) {
      constraints.subjectConstraints.forEach(constraint => {
        const subject = subjects.find(s => s.name === constraint.subject);
        if (subject) {
          if (constraint.hoursPerWeek) {
            subject.hoursPerWeek = constraint.hoursPerWeek;
          }
          if (constraint.teacherId) {
            subject.teacherId = constraint.teacherId;
          }
        }
      });
    }
    
    // Track teacher availability
    const teacherSchedule = {};
    
    // Distribute subjects across the timetable
    let subjectIndex = 0;
    let remainingHours = subjects.reduce((sum, subject) => sum + subject.hoursPerWeek, 0);
    
    // Preferred subject distribution (e.g., Math in morning)
    const subjectPreferences = {
      'Mathematics': { preferredPeriods: [1, 2, 3] },
      'Science': { preferredPeriods: [2, 3, 4] },
      'Physical Education': { preferredPeriods: [7, 8] }
    };
    
    // Assign subjects to periods
    timetable.schedule.forEach(daySchedule => {
      const day = daySchedule.day;
      
      daySchedule.periods.forEach(period => {
        // Skip if no more subjects to assign
        if (remainingHours <= 0) return;
        
        // Get current subject
        let subject = subjects[subjectIndex % subjects.length];
        
        // If current subject has reached its weekly hours, move to next
        while (subject.hoursPerWeek <= 0) {
          subjectIndex++;
          subject = subjects[subjectIndex % subjects.length];
        }
        
        // Check teacher availability
        const teacherId = subject.teacherId;
        const timeSlot = `${day}-${period.startTime}-${period.endTime}`;
        
        if (!teacherSchedule[teacherId]) {
          teacherSchedule[teacherId] = [];
        }
        
        // Check if teacher is already scheduled at this time
        if (teacherSchedule[teacherId].includes(timeSlot)) {
          // Try to find another subject with available hours and teacher
          let foundAlternative = false;
          
          for (let i = 0; i < subjects.length; i++) {
            const altSubject = subjects[i];
            
            if (altSubject.hoursPerWeek > 0 && 
                !teacherSchedule[altSubject.teacherId]?.includes(timeSlot)) {
              subject = altSubject;
              foundAlternative = true;
              break;
            }
          }
          
          // If no alternative found, leave this slot unassigned
          if (!foundAlternative) {
            period.subject = 'Unassigned';
            period.teacher = null;
            return;
          }
        }
        
        // Check subject preferences
        const preferences = subjectPreferences[subject.name];
        if (preferences && !preferences.preferredPeriods.includes(period.periodNumber)) {
          // Try to find a subject that prefers this period
          for (let i = 0; i < subjects.length; i++) {
            const altSubject = subjects[i];
            const altPreferences = subjectPreferences[altSubject.name];
            
            if (altSubject.hoursPerWeek > 0 && 
                altPreferences?.preferredPeriods.includes(period.periodNumber) &&
                !teacherSchedule[altSubject.teacherId]?.includes(timeSlot)) {
              subject = altSubject;
              break;
            }
          }
        }
        
        // Assign subject to period
        period.subject = subject.name;
        period.teacher = subject.teacherId;
        
        // Update teacher schedule
        teacherSchedule[subject.teacherId].push(timeSlot);
        
        // Decrement subject hours
        subject.hoursPerWeek--;
        remainingHours--;
        
        // Move to next subject
        subjectIndex++;
      });
    });
    
    return timetable;
  } catch (error) {
    console.error('Error generating optimized timetable:', error);
    throw new Error('Failed to generate optimized timetable');
  }
};

// Check timetable for conflicts
exports.checkTimetableConflicts = (timetable) => {
  const conflicts = [];
  
  // Check for teacher conflicts (same teacher scheduled at the same time)
  const teacherSchedule = {};
  
  timetable.schedule.forEach(daySchedule => {
    const day = daySchedule.day;
    
    daySchedule.periods.forEach(period => {
      if (!period.teacher) return;
      
      const teacherId = period.teacher.toString();
      const timeSlot = {
        day,
        startTime: period.startTime,
        endTime: period.endTime
      };
      
      if (!teacherSchedule[teacherId]) {
        teacherSchedule[teacherId] = [];
      }
      
      // Check for overlapping time slots
      for (const existingSlot of teacherSchedule[teacherId]) {
        if (existingSlot.day === day && doTimeSlotsOverlap(existingSlot, timeSlot)) {
          conflicts.push({
            type: 'teacher',
            teacherId,
            day,
            time: `${period.startTime}-${period.endTime}`,
            subject: period.subject,
            message: 'Teacher is scheduled for multiple classes at the same time'
          });
          break;
        }
      }
      
      teacherSchedule[teacherId].push(timeSlot);
    });
  });
  
  // Check for subject distribution (e.g., same subject multiple times in a day)
  const subjectDistribution = {};
  
  timetable.schedule.forEach(daySchedule => {
    const day = daySchedule.day;
    const daySubjects = {};
    
    daySchedule.periods.forEach(period => {
      const subject = period.subject;
      
      if (!subject || subject === 'Unassigned' || subject === 'To be assigned') return;
      
      if (!daySubjects[subject]) {
        daySubjects[subject] = 0;
      }
      
      daySubjects[subject]++;
      
      if (daySubjects[subject] > 2) {
        conflicts.push({
          type: 'subject',
          subject,
          day,
          message: `${subject} is scheduled more than twice in a day`
        });
      }
    });
    
    // Track weekly distribution
    Object.keys(daySubjects).forEach(subject => {
      if (!subjectDistribution[subject]) {
        subjectDistribution[subject] = 0;
      }
      
      subjectDistribution[subject] += daySubjects[subject];
    });
  });
  
  return conflicts;
};

// Suggest improvements for a timetable
exports.suggestTimetableImprovements = (timetable) => {
  const suggestions = [];
  
  // Check for balanced subject distribution
  const subjectCounts = {};
  let totalPeriods = 0;
  
  timetable.schedule.forEach(daySchedule => {
    daySchedule.periods.forEach(period => {
      if (!period.subject || period.subject === 'Unassigned' || period.subject === 'To be assigned') return;
      
      if (!subjectCounts[period.subject]) {
        subjectCounts[period.subject] = 0;
      }
      
      subjectCounts[period.subject]++;
      totalPeriods++;
    });
  });
  
  // Check if any subject has too many or too few periods
  const averagePeriodsPerSubject = totalPeriods / Object.keys(subjectCounts).length;
  
  Object.keys(subjectCounts).forEach(subject => {
    const count = subjectCounts[subject];
    
    if (count > averagePeriodsPerSubject * 1.5) {
      suggestions.push({
        type: 'distribution',
        subject,
        message: `${subject} has too many periods (${count}). Consider reducing.`
      });
    } else if (count < averagePeriodsPerSubject * 0.5) {
      suggestions.push({
        type: 'distribution',
        subject,
        message: `${subject} has too few periods (${count}). Consider increasing.`
      });
    }
  });
  
  // Check for subject placement (e.g., difficult subjects in morning)
  const difficultSubjects = ['Mathematics', 'Science', 'English'];
  const afternoonPeriods = [6, 7, 8];
  
  timetable.schedule.forEach(daySchedule => {
    daySchedule.periods.forEach(period => {
      if (difficultSubjects.includes(period.subject) && 
          afternoonPeriods.includes(period.periodNumber)) {
        suggestions.push({
          type: 'placement',
          subject: period.subject,
          day: daySchedule.day,
          period: period.periodNumber,
          message: `${period.subject} is scheduled in the afternoon (period ${period.periodNumber}). Consider moving to morning for better student focus.`
        });
      }
    });
  });
  
  // Check for consecutive periods of the same subject
  timetable.schedule.forEach(daySchedule => {
    for (let i = 0; i < daySchedule.periods.length - 1; i++) {
      const currentPeriod = daySchedule.periods[i];
      const nextPeriod = daySchedule.periods[i + 1];
      
      if (currentPeriod.subject === nextPeriod.subject && 
          currentPeriod.subject !== 'Unassigned' && 
          currentPeriod.subject !== 'To be assigned') {
        suggestions.push({
          type: 'consecutive',
          subject: currentPeriod.subject,
          day: daySchedule.day,
          periods: [currentPeriod.periodNumber, nextPeriod.periodNumber],
          message: `${currentPeriod.subject} is scheduled for consecutive periods (${currentPeriod.periodNumber}-${nextPeriod.periodNumber}) on ${daySchedule.day}. This may be good for labs/workshops but consider splitting if it's a regular class.`
        });
      }
    }
  });
  
  return suggestions;
};

// Export timetable to different formats
exports.exportTimetable = (timetable, format = 'json') => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(timetable, null, 2);
        
      case 'csv':
        // Generate CSV format
        let csv = 'Day,Period,Start Time,End Time,Subject,Teacher\n';
        
        timetable.schedule.forEach(daySchedule => {
          const day = daySchedule.day;
          
          daySchedule.periods.forEach(period => {
            csv += `${day},${period.periodNumber},${period.startTime},${period.endTime},${period.subject},${period.teacher || 'Unassigned'}\n`;
          });
        });
        
        return csv;
        
      case 'html':
        // Generate HTML table
        let html = '<table border="1">\n';
        html += '  <thead>\n';
        html += '    <tr>\n';
        html += '      <th>Period</th>\n';
        
        // Add days as columns
        timetable.schedule.forEach(daySchedule => {
          html += `      <th>${daySchedule.day.charAt(0).toUpperCase() + daySchedule.day.slice(1)}</th>\n`;
        });
        
        html += '    </tr>\n';
        html += '  </thead>\n';
        html += '  <tbody>\n';
        
        // Get max number of periods
        const maxPeriods = Math.max(...timetable.schedule.map(day => day.periods.length));
        
        // Generate rows for each period
        for (let i = 0; i < maxPeriods; i++) {
          html += '    <tr>\n';
          html += `      <td>${i + 1} (${timetable.schedule[0].periods[i]?.startTime}-${timetable.schedule[0].periods[i]?.endTime})</td>\n`;
          
          // Add subject for each day
          timetable.schedule.forEach(daySchedule => {
            const period = daySchedule.periods[i];
            if (period) {
              html += `      <td>${period.subject}</td>\n`;
            } else {
              html += '      <td></td>\n';
            }
          });
          
          html += '    </tr>\n';
        }
        
        html += '  </tbody>\n';
        html += '</table>';
        
        return html;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting timetable:', error);
    throw new Error('Failed to export timetable');
  }
};
