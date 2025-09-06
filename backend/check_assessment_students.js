const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssessmentStudents() {
  try {
    // Get all assessments
    const assessments = await prisma.assessment.findMany({
      include: {
        class: {
          select: { name: true }
        },
        subject: {
          select: { name: true }
        }
      }
    });

    console.log('📝 Current Assessments:');
    for (const assessment of assessments) {
      console.log(`\n${assessment.title} (${assessment.class.name} - ${assessment.subject.name})`);
      
      // Check students in this class
      const studentsInClass = await prisma.student.count({
        where: {
          currentClassId: assessment.classId
        }
      });
      
      console.log(`   Students in ${assessment.class.name}: ${studentsInClass}`);
    }

    // Check student distribution across classes
    console.log('\n🎓 Student Distribution by Class:');
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    classes.forEach(cls => {
      console.log(`   ${cls.name}: ${cls._count.students} students`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessmentStudents();