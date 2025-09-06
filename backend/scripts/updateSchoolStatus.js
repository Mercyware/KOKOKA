const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSchoolStatus() {
  try {
    const schoolId = 'd5559fcb-0aac-4b12-a154-a0c62f2bafdb';
    const newStatus = 'ACTIVE';
    
    console.log(`Updating school status to ${newStatus}...`);
    
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true
      }
    });
    
    console.log('School status updated successfully:');
    console.log(updatedSchool);
    
  } catch (error) {
    console.error('Error updating school status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchoolStatus();
