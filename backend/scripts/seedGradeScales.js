const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedGradeScales() {
  try {
    console.log('Seeding grade scales...');

    // Get the first school
    const school = await prisma.school.findFirst();
    
    if (!school) {
      console.log('No school found. Please create a school first.');
      return;
    }

    console.log(`Creating grade scales for school: ${school.name}`);

    // Create Primary School Grading Scale
    const primaryGradeScale = await prisma.gradeScale.create({
      data: {
        schoolId: school.id,
        name: 'Primary School Grading (100%)',
        isActive: true,
        gradeRanges: {
          create: [
            { grade: 'A', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
            { grade: 'B', minScore: 80, maxScore: 89, gradePoint: 3.0, remark: 'Very Good', color: '#3B82F6' },
            { grade: 'C', minScore: 70, maxScore: 79, gradePoint: 2.5, remark: 'Good', color: '#F59E0B' },
            { grade: 'D', minScore: 60, maxScore: 69, gradePoint: 2.0, remark: 'Fair', color: '#EF4444' },
            { grade: 'F', minScore: 0, maxScore: 59, gradePoint: 0.0, remark: 'Poor', color: '#6B7280' }
          ]
        }
      }
    });

    console.log('✅ Primary grade scale created:', primaryGradeScale.name);

    // Create Secondary School Grading Scale
    const secondaryGradeScale = await prisma.gradeScale.create({
      data: {
        schoolId: school.id,
        name: 'Secondary School Grading (WAEC/NECO)',
        isActive: false,
        gradeRanges: {
          create: [
            { grade: 'A1', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
            { grade: 'A2', minScore: 85, maxScore: 89, gradePoint: 3.8, remark: 'Very Good', color: '#059669' },
            { grade: 'B1', minScore: 80, maxScore: 84, gradePoint: 3.5, remark: 'Good', color: '#3B82F6' },
            { grade: 'B2', minScore: 75, maxScore: 79, gradePoint: 3.2, remark: 'Good', color: '#2563EB' },
            { grade: 'C1', minScore: 70, maxScore: 74, gradePoint: 3.0, remark: 'Credit', color: '#F59E0B' },
            { grade: 'C2', minScore: 65, maxScore: 69, gradePoint: 2.5, remark: 'Credit', color: '#D97706' },
            { grade: 'C3', minScore: 60, maxScore: 64, gradePoint: 2.2, remark: 'Credit', color: '#B45309' },
            { grade: 'D', minScore: 50, maxScore: 59, gradePoint: 2.0, remark: 'Pass', color: '#EF4444' },
            { grade: 'F', minScore: 0, maxScore: 49, gradePoint: 0.0, remark: 'Fail', color: '#6B7280' }
          ]
        }
      }
    });

    console.log('✅ Secondary grade scale created:', secondaryGradeScale.name);
    console.log('✅ Grade scales seeded successfully!');

  } catch (error) {
    console.error('Error seeding grade scales:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedGradeScales()
    .then(() => {
      console.log('✅ Grade scale seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Grade scale seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedGradeScales };