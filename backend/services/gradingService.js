// Grading service for calculating grades and analyzing academic performance

// Calculate grade based on score and total marks
exports.calculateGrade = (score, totalMarks) => {
  // Calculate percentage
  const percentage = (score / totalMarks) * 100;
  
  // Determine grade based on percentage
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Calculate GPA based on grades
exports.calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;
  
  const gradePoints = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0
  };
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(grade => {
    const points = gradePoints[grade.grade] || 0;
    const credits = grade.credits || 1;
    
    totalPoints += points * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Calculate class average for an exam
exports.calculateClassAverage = (scores) => {
  if (!scores || scores.length === 0) return 0;
  
  const sum = scores.reduce((total, score) => total + score, 0);
  return sum / scores.length;
};

// Generate grade distribution for an exam
exports.generateGradeDistribution = (scores, totalMarks) => {
  if (!scores || scores.length === 0) {
    return { A: 0, B: 0, C: 0, D: 0, F: 0 };
  }
  
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  
  scores.forEach(score => {
    const grade = this.calculateGrade(score, totalMarks);
    distribution[grade]++;
  });
  
  return distribution;
};

// Calculate percentile rank for a score
exports.calculatePercentileRank = (score, allScores) => {
  if (!allScores || allScores.length === 0) return 0;
  
  // Sort scores in ascending order
  const sortedScores = [...allScores].sort((a, b) => a - b);
  
  // Find the position of the score
  const position = sortedScores.findIndex(s => s >= score);
  
  // Calculate percentile
  return (position / sortedScores.length) * 100;
};

// Generate performance report for a student
exports.generateStudentReport = (student, exams) => {
  if (!student || !exams || exams.length === 0) {
    return {
      student: student ? student.name : 'Unknown',
      averageGrade: 'N/A',
      subjects: []
    };
  }
  
  const subjectPerformance = {};
  
  // Process each exam result
  student.grades.forEach(grade => {
    const exam = exams.find(e => e._id.toString() === grade.exam.toString());
    
    if (!exam) return;
    
    const subject = exam.subject.name || 'Unknown Subject';
    
    if (!subjectPerformance[subject]) {
      subjectPerformance[subject] = {
        subject,
        exams: [],
        averageScore: 0,
        averageGrade: '',
        trend: 'stable'
      };
    }
    
    subjectPerformance[subject].exams.push({
      examTitle: exam.title,
      score: grade.score,
      totalMarks: exam.totalMarks,
      percentage: (grade.score / exam.totalMarks) * 100,
      grade: grade.grade,
      date: grade.date
    });
  });
  
  // Calculate averages for each subject
  Object.keys(subjectPerformance).forEach(subject => {
    const subjectData = subjectPerformance[subject];
    
    if (subjectData.exams.length > 0) {
      const totalScore = subjectData.exams.reduce((sum, exam) => sum + exam.percentage, 0);
      subjectData.averageScore = totalScore / subjectData.exams.length;
      subjectData.averageGrade = this.calculateGrade(subjectData.averageScore, 100);
      
      // Calculate trend if there are multiple exams
      if (subjectData.exams.length > 1) {
        // Sort exams by date
        const sortedExams = [...subjectData.exams].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        const firstExam = sortedExams[0];
        const lastExam = sortedExams[sortedExams.length - 1];
        
        if (lastExam.percentage > firstExam.percentage + 5) {
          subjectData.trend = 'improving';
        } else if (lastExam.percentage < firstExam.percentage - 5) {
          subjectData.trend = 'declining';
        } else {
          subjectData.trend = 'stable';
        }
      }
    }
  });
  
  // Calculate overall average
  const subjects = Object.values(subjectPerformance);
  const overallAverage = subjects.length > 0
    ? subjects.reduce((sum, subject) => sum + subject.averageScore, 0) / subjects.length
    : 0;
  
  return {
    student: student.name,
    averageGrade: this.calculateGrade(overallAverage, 100),
    averageScore: overallAverage,
    subjects
  };
};

// Analyze exam difficulty based on results
exports.analyzeExamDifficulty = (scores, totalMarks) => {
  if (!scores || scores.length === 0) {
    return {
      difficulty: 'unknown',
      averageScore: 0,
      passRate: 0
    };
  }
  
  const averageScore = this.calculateClassAverage(scores);
  const averagePercentage = (averageScore / totalMarks) * 100;
  const passingScore = totalMarks * 0.6; // 60% is passing
  const passCount = scores.filter(score => score >= passingScore).length;
  const passRate = (passCount / scores.length) * 100;
  
  let difficulty;
  
  if (averagePercentage >= 85) {
    difficulty = 'easy';
  } else if (averagePercentage >= 70) {
    difficulty = 'moderate';
  } else if (averagePercentage >= 55) {
    difficulty = 'challenging';
  } else {
    difficulty = 'difficult';
  }
  
  return {
    difficulty,
    averageScore,
    averagePercentage,
    passRate,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  };
};

// Generate recommendations based on performance
exports.generateRecommendations = (studentReport) => {
  if (!studentReport || !studentReport.subjects || studentReport.subjects.length === 0) {
    return [];
  }
  
  const recommendations = [];
  
  // Find weakest subjects (below 70%)
  const weakSubjects = studentReport.subjects.filter(
    subject => subject.averageScore < 70
  );
  
  if (weakSubjects.length > 0) {
    weakSubjects.forEach(subject => {
      recommendations.push({
        type: 'improvement',
        subject: subject.subject,
        message: `Focus on improving ${subject.subject} performance with additional study time and practice.`
      });
    });
  }
  
  // Find declining subjects
  const decliningSubjects = studentReport.subjects.filter(
    subject => subject.trend === 'declining'
  );
  
  if (decliningSubjects.length > 0) {
    decliningSubjects.forEach(subject => {
      recommendations.push({
        type: 'attention',
        subject: subject.subject,
        message: `Pay special attention to ${subject.subject} as performance is declining.`
      });
    });
  }
  
  // Find strong subjects (above 85%)
  const strongSubjects = studentReport.subjects.filter(
    subject => subject.averageScore >= 85
  );
  
  if (strongSubjects.length > 0) {
    strongSubjects.forEach(subject => {
      recommendations.push({
        type: 'strength',
        subject: subject.subject,
        message: `Continue excellent work in ${subject.subject}.`
      });
    });
  }
  
  // Overall recommendation
  if (studentReport.averageScore >= 85) {
    recommendations.push({
      type: 'overall',
      message: 'Excellent overall performance. Consider taking on more challenging work or helping peers.'
    });
  } else if (studentReport.averageScore >= 70) {
    recommendations.push({
      type: 'overall',
      message: 'Good overall performance. Focus on turning B grades into A grades with more thorough preparation.'
    });
  } else if (studentReport.averageScore >= 60) {
    recommendations.push({
      type: 'overall',
      message: 'Satisfactory overall performance. Establish a regular study schedule and seek help in weaker subjects.'
    });
  } else {
    recommendations.push({
      type: 'overall',
      message: 'Performance needs improvement. Consider tutoring, additional study time, and meeting with teachers for guidance.'
    });
  }
  
  return recommendations;
};
