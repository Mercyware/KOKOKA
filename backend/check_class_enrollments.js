const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClassEnrollments() {
  try {
    const assessmentId = 'a48e9f31-7812-4681-92fc-f331a1fff1a8';
    
    // Get the assessment details first
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } }
      }
    });
    
    console.log('🔍 Checking class enrollments...\n');
    console.log(`Assessment: ${assessment.title}`);
    console.log(`Class: ${assessment.class.name} (ID: ${assessment.class.id})`);
    console.log(`Academic Year: ${assessment.academicYear.name} (ID: ${assessment.academicYear.id})`);
    console.log('');
    
    // Check all students with class history for this specific class
    const studentsWithHistory = await prisma.student.findMany({
      where: {
        schoolId: assessment.schoolId,
        studentClassHistory: {
          some: {
            classId: assessment.class.id
          }
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        studentClassHistory: {
          where: {
            classId: assessment.class.id
          },
          include: {
            academicYear: {
              select: { name: true }
            },
            class: {
              select: { name: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    console.log(`👥 Students who have been in class ${assessment.class.name}: ${studentsWithHistory.length}`);
    
    if (studentsWithHistory.length > 0) {
      studentsWithHistory.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.user?.name}`);
        student.studentClassHistory.forEach(history => {
          console.log(`   📅 ${history.academicYear?.name}: ${history.status} (${history.class?.name})`);
        });
      });
    }
    
    console.log('\n🔍 Checking academic year specific enrollments...');
    
    // Check students enrolled in the target academic year (any class)
    const studentsInAcademicYear = await prisma.student.findMany({
      where: {
        schoolId: assessment.schoolId,
        studentClassHistory: {
          some: {
            academicYearId: assessment.academicYear.id,
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
            academicYearId: assessment.academicYear.id,
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
    
    console.log(`👥 Students enrolled in academic year ${assessment.academicYear.name}: ${studentsInAcademicYear.length}`);
    
    if (studentsInAcademicYear.length > 0) {
      const classCounts = {};
      studentsInAcademicYear.forEach(student => {
        student.studentClassHistory.forEach(history => {
          const className = history.class?.name;
          classCounts[className] = (classCounts[className] || 0) + 1;
        });
      });
      
      console.log('📊 Distribution by class:');
      Object.entries(classCounts).forEach(([className, count]) => {
        console.log(`   ${className}: ${count} students`);
      });
    }
    
    console.log('\n🔍 Checking all classes in the school...');
    
    // Check all classes and their current enrollments
    const allClasses = await prisma.class.findMany({
      where: {
        schoolId: assessment.schoolId
      },
      include: {
        _count: {
          select: {
            studentClassHistory: {
              where: {
                academicYearId: assessment.academicYear.id,
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📚 All classes in school:`);
    allClasses.forEach(cls => {
      console.log(`   ${cls.name} (Grade ${cls.grade}): ${cls._count.studentClassHistory} students enrolled for ${assessment.academicYear.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClassEnrollments();
