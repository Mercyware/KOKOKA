const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingCompleted: true,
        onboardingStep: true,
        schoolId: true,
        school: {
          select: {
            name: true,
            subdomain: true,
            status: true
          }
        }
      }
    });

    console.log('Admin users in database:');
    console.log(JSON.stringify(users, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUsers();
