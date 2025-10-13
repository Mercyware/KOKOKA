const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testResultModels() {
  try {
    console.log('Testing Result and Grading models...');

    // Test if the models exist
    console.log('1. Testing GradeScale model...');
    const gradeScaleCount = await prisma.gradeScale.count();
    console.log(`   Found ${gradeScaleCount} grade scales`);

    console.log('2. Testing GradeRange model...');
    const gradeRangeCount = await prisma.gradeRange.count();
    console.log(`   Found ${gradeRangeCount} grade ranges`);

    console.log('3. Testing Result model...');
    const resultCount = await prisma.result.count();
    console.log(`   Found ${resultCount} results`);

    console.log('4. Testing SubjectResult model...');
    const subjectResultCount = await prisma.subjectResult.count();
    console.log(`   Found ${subjectResultCount} subject results`);

    console.log('✅ All result and grading models are working correctly!');

    // Test creating a sample grade scale
    const school = await prisma.school.findFirst();
    if (school) {
      console.log('\n5. Testing grade scale creation...');
      
      const testGradeScale = await prisma.gradeScale.create({
        data: {
          schoolId: school.id,
          name: 'Test Grade Scale',
          isActive: false,
          gradeRanges: {
            create: [
              { grade: 'A', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
              { grade: 'B', minScore: 80, maxScore: 89, gradePoint: 3.0, remark: 'Good', color: '#3B82F6' }
            ]
          }
        }
      });

      console.log(`   Created test grade scale: ${testGradeScale.name}`);

      // Clean up
      await prisma.gradeScale.delete({
        where: { id: testGradeScale.id }
      });

      console.log('   Test grade scale cleaned up');
    }

  } catch (error) {
    console.error('❌ Error testing result models:', error);
    throw error;
  }
}

if (require.main === module) {
  testResultModels()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}