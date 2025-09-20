const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createDevUser() {
  try {
    // Find the Greenwood school
    const school = await prisma.school.findFirst({
      where: { subdomain: 'greenwood' }
    });

    if (!school) {
      console.error('Greenwood school not found. Please run the seeder first.');
      return;
    }

    // Check if dev-user already exists
    const existingUser = await prisma.user.findFirst({
      where: { id: 'dev-user' }
    });

    if (existingUser) {
      console.log('dev-user already exists');
      return;
    }

    // Create the dev user
    const passwordHash = await bcrypt.hash('dev123', 10);
    
    await prisma.user.create({
      data: {
        id: 'dev-user',
        email: 'dev@greenwood.com',
        passwordHash: passwordHash,
        name: 'Development User',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        schoolId: school.id
      }
    });

    console.log('✅ Created dev-user for development authentication bypass');
  } catch (error) {
    console.error('❌ Error creating dev-user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDevUser();