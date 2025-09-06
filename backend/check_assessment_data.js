const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssessmentData() {
  try {
    const assessmentId = 'a48e9f31-7812-4681-92fc-f331a1fff1a8';
    
    console.log('🔍 Checking assessment data...\n');
    
    // Check if the assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
        },
        academicYear: {
          select: { id: true, name: true }
        },
        term: {
          select: { id: true, name: true }
        },
        teacher: {
          select: { id: true, firstName: true, lastName: true }
        },
        school: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!assessment) {
      console.log('❌ Assessment not found with ID:', assessmentId);
      return;
    }
    
    console.log('✅ Assessment found:');
    console.log(`   Title: ${assessment.title}`);
    console.log(`   Type: ${assessment.type}`);
    console.log(`   Status: ${assessment.status}`);
    console.log(`   Class: ${assessment.class?.name} (${assessment.class?.grade})`);
    console.log(`   Subject: ${assessment.subject?.name} (${assessment.subject?.code})`);
    console.log(`   Academic Year: ${assessment.academicYear?.name}`);
    console.log(`   Term: ${assessment.term?.name}`);
    console.log(`   School: ${assessment.school?.name}`);
    console.log(`   Total Marks: ${assessment.totalMarks}`);
    console.log(`   Passing Marks: ${assessment.passingMarks}`);
    console.log('');
    
    // Check students in the assessment's class for the academic year
    if (assessment.classId && assessment.academicYearId) {
      const studentsInClass = await prisma.student.findMany({
        where: {
          schoolId: assessment.schoolId,
          studentClassHistory: {
            some: {
              classId: assessment.classId,
              academicYearId: assessment.academicYearId,
              status: 'ACTIVE'
            }
          }
        },
        include: {
          user: {
            select: { name: true, email: true }
          },
          studentClassHistory: {
            where: {
              classId: assessment.classId,
              academicYearId: assessment.academicYearId,
              status: 'ACTIVE'
            },
            include: {
              class: {
                select: { name: true }
              }
            }
          }
        }
      });
      
      console.log(`👥 Students in class ${assessment.class?.name}: ${studentsInClass.length}`);
      
      if (studentsInClass.length > 0) {
        console.log('   Sample students:');
        studentsInClass.slice(0, 5).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.user?.name} (${student.user?.email})`);
        });
        if (studentsInClass.length > 5) {
          console.log(`   ... and ${studentsInClass.length - 5} more`);
        }
      } else {
        console.log('   ⚠️  No students found in this class for the academic year');
        
        // Check if there are students in the class for other academic years
        const studentsInClassOtherYears = await prisma.student.findMany({
          where: {
            schoolId: assessment.schoolId,
            studentClassHistory: {
              some: {
                classId: assessment.classId,
                status: 'ACTIVE'
              }
            }
          },
          include: {
            user: {
              select: { name: true }
            },
            studentClassHistory: {
              where: {
                classId: assessment.classId,
                status: 'ACTIVE'
              },
              include: {
                academicYear: {
                  select: { name: true }
                }
              }
            }
          }
        });
        
        if (studentsInClassOtherYears.length > 0) {
          console.log(`   ℹ️  Found ${studentsInClassOtherYears.length} students in this class for other academic years:`);
          studentsInClassOtherYears.slice(0, 3).forEach((student, index) => {
            const academicYears = student.studentClassHistory.map(h => h.academicYear?.name).join(', ');
            console.log(`   ${index + 1}. ${student.user?.name} (Academic Years: ${academicYears})`);
          });
        }
      }
    }
    
    console.log('');
    
    // Check existing scores for this assessment
    const existingScores = await prisma.grade.findMany({
      where: {
        assessmentId: assessmentId,
        schoolId: assessment.schoolId
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });
    
    console.log(`📊 Existing scores for this assessment: ${existingScores.length}`);
    if (existingScores.length > 0) {
      existingScores.forEach((score, index) => {
        console.log(`   ${index + 1}. ${score.student.user?.name}: ${score.marksObtained}/${score.totalMarks} (${score.percentage}%)`);
      });
    }
    
    console.log('\n🔍 Additional diagnostics:');
    
    // Check total counts
    const totalStudents = await prisma.student.count({
      where: { schoolId: assessment.schoolId }
    });
    console.log(`   Total students in school: ${totalStudents}`);
    
    const totalClasses = await prisma.class.count({
      where: { schoolId: assessment.schoolId }
    });
    console.log(`   Total classes in school: ${totalClasses}`);
    
    const totalAssessments = await prisma.assessment.count({
      where: { schoolId: assessment.schoolId }
    });
    console.log(`   Total assessments in school: ${totalAssessments}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessmentData();
