const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const studentCount = await prisma.student.count();
    const userCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    });
    
    console.log(`🎓 Total students: ${studentCount}`);
    console.log(`👤 Total student users: ${userCount}`);
    
    // Get a few sample student names
    const sampleStudents = await prisma.student.findMany({
      take: 10,
      include: {
        user: {
          select: { name: true }
        },
        currentClass: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n📝 Sample students:');
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.user?.name} (${student.currentClass?.name})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();