const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResults() {
  try {
    const results = await prisma.result.findMany({
      select: {
        class: { select: { name: true, grade: true } },
        term: { select: { name: true } }
      }
    });

    console.log('Total results:', results.length);

    const grouped = {};
    results.forEach(r => {
      const key = r.class.name + ' - ' + r.term.name;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    console.log('\nResults by Class and Term:');
    Object.entries(grouped).forEach(([key, count]) => {
      console.log('  ' + key + ': ' + count + ' students');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkResults();
