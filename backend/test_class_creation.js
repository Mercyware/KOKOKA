const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClassCreation() {
  try {
    console.log('Testing direct class creation...');
    
    // First, get a school ID
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('No school found, creating one...');
      const newSchool = await prisma.school.create({
        data: {
          name: 'Test School',
          slug: 'test-school',
          subdomain: 'test'
        }
      });
      console.log('Created school:', newSchool.id);
    }

    // Try creating a class with minimal data
    const testClass = await prisma.class.create({
      data: {
        name: 'Test Class',
        grade: '1',
        schoolId: school?.id || newSchool.id
      }
    });
    
    console.log('Successfully created class:', testClass);
  } catch (error) {
    console.error('Error creating class:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClassCreation();