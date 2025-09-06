const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatusValues() {
  try {
    const statuses = await prisma.studentClassHistory.findMany({
      select: { status: true },
      take: 10
    });
    
    const uniqueStatuses = [...new Set(statuses.map(s => s.status))];
    console.log('Actual status values in database:', uniqueStatuses);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatusValues();
