const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTermDates() {
  try {
    const terms = await prisma.term.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true
      },
      orderBy: { startDate: 'desc' }
    });

    console.log('Terms in database:');
    terms.forEach(term => {
      const start = new Date(term.startDate);
      const end = new Date(term.endDate);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      console.log(`\n${term.name}:`);
      console.log(`  Start: ${start.toISOString().split('T')[0]}`);
      console.log(`  End: ${end.toISOString().split('T')[0]}`);
      console.log(`  Days: ${days}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkTermDates();
