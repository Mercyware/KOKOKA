const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service for managing report card templates and generation
 */
class ReportCardService {
  
  /**
   * Create default report card templates for a school
   */
  static async createDefaultTemplates(schoolId, createdById) {
    try {
      console.log(`Creating default report card templates for school: ${schoolId}`);

      // Standard grading scale
      const standardGradingScale = {
        type: 'PERCENTAGE',
        scale: {
          A: { min: 90, max: 100, gpa: 4.0, description: 'Excellent' },
          B: { min: 80, max: 89, gpa: 3.0, description: 'Very Good' },
          C: { min: 70, max: 79, gpa: 2.0, description: 'Good' },
          D: { min: 60, max: 69, gpa: 1.0, description: 'Satisfactory' },
          F: { min: 0, max: 59, gpa: 0.0, description: 'Needs Improvement' }
        }
      };

      // Basic layout structure
      const standardLayout = {
        sections: [
          'header',
          'student-info',
          'subject-grades',
          'overall-summary',
          'attendance',
          'conduct',
          'comments',
          'signatures'
        ],
        headerConfig: {
          includeSchoolLogo: true,
          includeSchoolName: true,
          includeAddress: true
        },
        subjectTableConfig: {
          columns: ['subject', 'grade', 'percentage', 'gpa'],
          showTeacherName: false,
          showCreditHours: false
        }
      };

      // Template 1: Standard Term Report
      const termReportTemplate = await prisma.reportCardTemplate.create({
        data: {
          name: 'Standard Term Report',
          description: 'Standard report card template for term-based reporting',
          type: 'TERM_REPORT',
          layout: standardLayout,
          subjectOrder: [], // Will be populated when subjects are known
          includeAttendance: true,
          includeConduct: true,
          includeCreditHours: false,
          includeClassRank: true,
          includeGPA: true,
          includePercentile: false,
          includeComments: true,
          includeSignatures: true,
          gradingScale: standardGradingScale,
          passingGrade: 'D',
          showLetterGrades: true,
          showPercentages: true,
          showGPA: true,
          headerText: 'STUDENT REPORT CARD',
          footerText: 'This is an official document. Please keep for your records.',
          pageSize: 'A4',
          orientation: 'portrait',
          isActive: true,
          isDefault: true,
          isSystem: true,
          schoolId,
          createdById
        }
      });

      // Template 2: Progress Report (Mid-Term)
      const progressReportLayout = {
        ...standardLayout,
        sections: [
          'header',
          'student-info', 
          'subject-progress',
          'overall-summary',
          'attendance',
          'teacher-feedback',
          'recommendations'
        ]
      };

      const progressReportTemplate = await prisma.reportCardTemplate.create({
        data: {
          name: 'Mid-Term Progress Report',
          description: 'Progress report template for mid-term assessments',
          type: 'PROGRESS_REPORT',
          layout: progressReportLayout,
          subjectOrder: [],
          includeAttendance: true,
          includeConduct: false,
          includeCreditHours: false,
          includeClassRank: false,
          includeGPA: false,
          includePercentile: false,
          includeComments: true,
          includeSignatures: false,
          gradingScale: standardGradingScale,
          passingGrade: 'D',
          showLetterGrades: false,
          showPercentages: true,
          showGPA: false,
          headerText: 'PROGRESS REPORT',
          footerText: 'This report shows current progress. Final grades may vary.',
          pageSize: 'A4',
          orientation: 'portrait',
          isActive: true,
          isDefault: false,
          isSystem: true,
          schoolId,
          createdById
        }
      });

      // Template 3: Comprehensive Annual Report
      const annualReportLayout = {
        ...standardLayout,
        sections: [
          'header',
          'student-info',
          'academic-summary',
          'subject-grades',
          'overall-performance',
          'attendance-summary',
          'conduct-assessment',
          'extracurricular',
          'teacher-comments',
          'recommendations',
          'promotion-status',
          'signatures'
        ]
      };

      const annualReportTemplate = await prisma.reportCardTemplate.create({
        data: {
          name: 'Comprehensive Annual Report',
          description: 'Detailed annual report card with comprehensive student assessment',
          type: 'ANNUAL_REPORT',
          layout: annualReportLayout,
          subjectOrder: [],
          includeAttendance: true,
          includeConduct: true,
          includeCreditHours: true,
          includeClassRank: true,
          includeGPA: true,
          includePercentile: true,
          includeComments: true,
          includeSignatures: true,
          gradingScale: standardGradingScale,
          passingGrade: 'D',
          showLetterGrades: true,
          showPercentages: true,
          showGPA: true,
          headerText: 'ANNUAL REPORT CARD',
          footerText: 'This is an official academic transcript. Handle with care.',
          pageSize: 'A4',
          orientation: 'portrait',
          isActive: true,
          isDefault: false,
          isSystem: true,
          schoolId,
          createdById
        }
      });

      // Template 4: Simple Semester Report
      const semesterReportTemplate = await prisma.reportCardTemplate.create({
        data: {
          name: 'Simple Semester Report',
          description: 'Simple and clean semester report card template',
          type: 'SEMESTER_REPORT',
          layout: standardLayout,
          subjectOrder: [],
          includeAttendance: true,
          includeConduct: false,
          includeCreditHours: false,
          includeClassRank: false,
          includeGPA: true,
          includePercentile: false,
          includeComments: false,
          includeSignatures: true,
          gradingScale: standardGradingScale,
          passingGrade: 'D',
          showLetterGrades: true,
          showPercentages: false,
          showGPA: true,
          headerText: 'SEMESTER REPORT',
          footerText: '',
          pageSize: 'A4',
          orientation: 'portrait',
          isActive: true,
          isDefault: false,
          isSystem: true,
          schoolId,
          createdById
        }
      });

      console.log(`Created ${4} default report card templates for school: ${schoolId}`);
      return {
        termReport: termReportTemplate,
        progressReport: progressReportTemplate,
        annualReport: annualReportTemplate,
        semesterReport: semesterReportTemplate
      };

    } catch (error) {
      console.error('Error creating default report card templates:', error);
      throw error;
    }
  }

  /**
   * Calculate student performance data for report card generation
   */
  static async calculateStudentPerformance(studentId, academicYearId, termId = null) {
    try {
      // Get all grade entries for the student in the specified period
      const gradeEntries = await prisma.gradeEntry.findMany({
        where: {
          studentId,
          gradeBook: {
            academicYearId,
            ...(termId && { termId })
          }
        },
        include: {
          gradeBook: {
            include: {
              subject: true,
              teacher: {
                select: {
                  firstName: true,
                  lastName: true,
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (gradeEntries.length === 0) {
        return {
          subjectGrades: [],
          overallPerformance: {
            totalSubjects: 0,
            averagePercentage: 0,
            overallGrade: 'N/A',
            gpa: 0
          },
          hasData: false
        };
      }

      // Group grades by subject
      const subjectMap = new Map();
      
      gradeEntries.forEach(entry => {
        const subject = entry.gradeBook.subject;
        const subjectId = subject.id;

        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            subject: subject,
            teacher: entry.gradeBook.teacher,
            grades: [],
            totalMarks: 0,
            obtainedMarks: 0,
            assessmentCount: 0
          });
        }

        const subjectData = subjectMap.get(subjectId);
        subjectData.grades.push(entry);
        subjectData.totalMarks += entry.maxScore || 0;
        subjectData.obtainedMarks += entry.rawScore || 0;
        subjectData.assessmentCount += 1;
      });

      // Calculate subject-wise performance
      const subjectGrades = [];
      let totalGradePoints = 0;
      let totalSubjects = 0;

      subjectMap.forEach((subjectData, subjectId) => {
        const percentage = subjectData.totalMarks > 0 ? 
          (subjectData.obtainedMarks / subjectData.totalMarks) * 100 : 0;
        
        const letterGrade = this.calculateLetterGrade(percentage);
        const gradePoint = this.calculateGradePoint(letterGrade);

        subjectGrades.push({
          subject: subjectData.subject,
          teacher: subjectData.teacher,
          assessmentCount: subjectData.assessmentCount,
          totalMarks: subjectData.totalMarks,
          obtainedMarks: subjectData.obtainedMarks,
          percentage: percentage,
          letterGrade: letterGrade,
          gradePoint: gradePoint,
          grades: subjectData.grades
        });

        totalGradePoints += gradePoint;
        totalSubjects += 1;
      });

      // Calculate overall performance
      const averagePercentage = totalSubjects > 0 ? 
        subjectGrades.reduce((sum, subject) => sum + subject.percentage, 0) / totalSubjects : 0;
      const overallGPA = totalSubjects > 0 ? totalGradePoints / totalSubjects : 0;
      const overallGrade = this.calculateLetterGrade(averagePercentage);

      return {
        subjectGrades: subjectGrades.sort((a, b) => a.subject.name.localeCompare(b.subject.name)),
        overallPerformance: {
          totalSubjects,
          averagePercentage,
          overallGrade,
          gpa: overallGPA
        },
        hasData: true
      };

    } catch (error) {
      console.error('Error calculating student performance:', error);
      throw error;
    }
  }

  /**
   * Calculate letter grade from percentage
   */
  static calculateLetterGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Calculate grade point from letter grade
   */
  static calculateGradePoint(letterGrade) {
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };
    return gradePoints[letterGrade] || 0.0;
  }

  /**
   * Calculate attendance data for a student
   */
  static async calculateAttendance(studentId, academicYearId, termId = null) {
    try {
      // This would integrate with your attendance system
      // For now, returning mock data
      return {
        totalDays: 100,
        presentDays: 95,
        absentDays: 5,
        lateArrivals: 2,
        percentage: 95.0,
        status: 'Good'
      };
    } catch (error) {
      console.error('Error calculating attendance:', error);
      return null;
    }
  }

  /**
   * Get conduct/behavior assessment for a student
   */
  static async getConductAssessment(studentId, academicYearId, termId = null) {
    try {
      // This would integrate with your behavior tracking system
      // For now, returning mock data
      return {
        grade: 'A',
        description: 'Excellent behavior and attitude',
        areas: {
          'Discipline': 'A',
          'Cooperation': 'A',
          'Leadership': 'B',
          'Punctuality': 'A'
        }
      };
    } catch (error) {
      console.error('Error getting conduct assessment:', error);
      return null;
    }
  }
}

module.exports = ReportCardService;
