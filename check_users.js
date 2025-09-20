const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka'
    }
  }
});

async function checkUsers() {
  try {
    // Get Greenwood school
    const school = await prisma.school.findUnique({
      where: { subdomain: 'greenwood' }
    });

    if (!school) {
      console.log('❌ Greenwood school not found');
      return;
    }

    console.log('✅ School found:', school.name);

    // Get users in this school
    const users = await prisma.user.findMany({
      where: { schoolId: school.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log(`\n📋 Found ${users.length} users in ${school.name}:`);
    users.forEach(user => {
      console.log(`  ${user.id} | ${user.email} | ${user.role} | ${user.name}`);
    });

    // Check if the specific user from JWT exists
    const jwtUserId = '07a31906-3d1d-4f98'; // Partial ID from your token
    const matchingUser = users.find(u => u.id.startsWith(jwtUserId));

    if (matchingUser) {
      console.log(`\n✅ JWT user found: ${matchingUser.email}`);
    } else {
      console.log(`\n❌ JWT user (${jwtUserId}...) not found in database`);
      console.log('💡 You may need to log in again with a valid user');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();