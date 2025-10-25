const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchools() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        status: true
      }
    });
    console.log('Schools in database:');
    console.log(JSON.stringify(schools, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchools();
