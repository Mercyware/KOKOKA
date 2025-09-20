const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');

    // Check if school exists
    const schools = await prisma.school.findMany();
    console.log(`📊 Found ${schools.length} schools:`);
    schools.forEach(school => {
      console.log(`  - ${school.name} (${school.slug})`);
    });

    // Check users
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}`);

    // Check existing staff
    const staffCount = await prisma.staff.count();
    console.log(`👨‍💼 Total staff: ${staffCount}`);

    if (schools.length > 0) {
      const schoolId = schools[0].id;
      console.log(`\nUsing school ID: ${schoolId}`);
      
      // Test if we can insert a single staff member
      try {
        await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            email: 'test.staff@greenwood.com',
            passwordHash: '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO',
            name: 'Test Staff',
            role: 'STAFF',
            isActive: true,
            emailVerified: true,
            schoolId: schoolId
          }
        });
        console.log('✅ Test user created successfully');
      } catch (error) {
        console.log('⚠️ Test user already exists or other error:', error.message);
      }

      try {
        const testUser = await prisma.user.findFirst({
          where: { email: 'test.staff@greenwood.com' }
        });
        
        if (testUser) {
          await prisma.staff.create({
            data: {
              employeeId: 'TEST001',
              firstName: 'Test',
              lastName: 'Staff',
              position: 'Test Position',
              staffType: 'GENERAL',
              joiningDate: new Date(),
              status: 'ACTIVE',
              schoolId: schoolId,
              userId: testUser.id
            }
          });
          console.log('✅ Test staff member created successfully');
        }
      } catch (error) {
        console.log('⚠️ Test staff already exists or other error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();