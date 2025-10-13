const { prisma } = require('./config/database');

async function testGradeScaleCreation() {
  try {
    // Get the existing school
    const school = await prisma.school.findFirst();
    
    if (!school) {
      console.log('❌ No school found. Please run the full seed first.');
      return;
    }

    console.log(`✅ Found school: ${school.name}`);

    // Check if grade scales already exist
    const existingGradeScales = await prisma.gradeScale.findMany({
      where: { schoolId: school.id },
      include: { gradeRanges: true }
    });

    if (existingGradeScales.length > 0) {
      console.log(`✅ Found ${existingGradeScales.length} existing grade scale(s)`);
      existingGradeScales.forEach(scale => {
        console.log(`  - ${scale.name} (${scale.isActive ? 'Active' : 'Inactive'})`);
      });
      return;
    }

    // Create grade scales if they don't exist
    console.log('📊 Creating grade scales...');

    const gradeScalesData = [
      {
        name: 'Primary School Grading (100%)',
        isActive: true,
        schoolId: school.id,
        gradeRanges: [
          { grade: 'A', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
          { grade: 'B', minScore: 80, maxScore: 89, gradePoint: 3.0, remark: 'Very Good', color: '#3B82F6' },
          { grade: 'C', minScore: 70, maxScore: 79, gradePoint: 2.5, remark: 'Good', color: '#F59E0B' },
          { grade: 'D', minScore: 60, maxScore: 69, gradePoint: 2.0, remark: 'Fair', color: '#EF4444' },
          { grade: 'F', minScore: 0, maxScore: 59, gradePoint: 0.0, remark: 'Poor', color: '#6B7280' }
        ]
      },
      {
        name: 'Secondary School Grading (WAEC/NECO)',
        isActive: false,
        schoolId: school.id,
        gradeRanges: [
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
    ];

    const gradeScales = [];
    for (const gradeScaleData of gradeScalesData) {
      const { gradeRanges, ...gradeScaleInfo } = gradeScaleData;
      
      const gradeScale = await prisma.gradeScale.create({
        data: {
          ...gradeScaleInfo,
          gradeRanges: {
            create: gradeRanges
          }
        },
        include: {
          gradeRanges: true
        }
      });
      gradeScales.push(gradeScale);
      console.log(`  ✅ Created grade scale: ${gradeScale.name}`);
    }

    console.log(`✅ Successfully created ${gradeScales.length} grade scales`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGradeScaleCreation();