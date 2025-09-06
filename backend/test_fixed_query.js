const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFixedQuery() {
  try {
    const assessmentId = 'a48e9f31-7812-4681-92fc-f331a1fff1a8';
    
    // Get the assessment first
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } }
      }
    });
    
    if (!assessment) {
      console.log('❌ Assessment not found');
      return;
    }
    
    console.log('🔍 Testing the FIXED query (using lowercase "active")...\n');
    console.log(`Assessment: ${assessment.title}`);
    console.log(`Class: ${assessment.class.name} (ID: ${assessment.class.id})`);
    console.log(`Academic Year: ${assessment.academicYear.name} (ID: ${assessment.academicYear.id})`);
    console.log(`School: ${assessment.school.name} (ID: ${assessment.school.id})`);
    console.log('');
    
    // Test the FIXED query with lowercase 'active' status
    const studentsFixed = await prisma.student.findMany({
      where: {
        schoolId: assessment.schoolId,
        studentClassHistory: {
          some: {
            classId: assessment.classId,
            academicYearId: assessment.academicYearId,
            status: 'active' // FIXED: using lowercase
          }
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        studentClassHistory: {
          where: {
            classId: assessment.classId,
            academicYearId: assessment.academicYearId,
            status: 'active' // FIXED: using lowercase
          },
          include: {
            class: {
              select: { id: true, name: true, grade: true }
            },
            academicYear: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } }
      ]
    });
    
    console.log(`✅ FIXED Query result: ${studentsFixed.length} students found\n`);
    
    if (studentsFixed.length > 0) {
      console.log('👥 Students found (first 10):');
      studentsFixed.slice(0, 10).forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.user?.name} (${student.user?.email})`);
      });
      if (studentsFixed.length > 10) {
        console.log(`   ... and ${studentsFixed.length - 10} more`);
      }
    }
    
    // Test the OLD query with uppercase 'ACTIVE' status to compare
    console.log('\n🔍 Comparing with the OLD query (using uppercase "ACTIVE")...\n');
    
    const studentsOld = await prisma.student.findMany({
      where: {
        schoolId: assessment.schoolId,
        studentClassHistory: {
          some: {
            classId: assessment.classId,
            academicYearId: assessment.academicYearId,
            status: 'ACTIVE' // OLD: using uppercase
          }
        }
      }
    });
    
    console.log(`❌ OLD Query result: ${studentsOld.length} students found`);
    
    console.log('\n🎯 SUMMARY:');
    console.log(`- Fixed query (lowercase 'active'): ${studentsFixed.length} students`);
    console.log(`- Old query (uppercase 'ACTIVE'): ${studentsOld.length} students`);
    console.log(`- The issue was case sensitivity in the status field!`);
    
    // Test the new endpoint logic
    console.log('\n🆕 Testing new endpoint logic...\n');
    
    // Get existing scores for these students
    const existingScores = await prisma.grade.findMany({
      where: {
        assessmentId,
        schoolId: assessment.schoolId,
        studentId: {
          in: studentsFixed.map(s => s.id)
        }
      }
    });
    
    // Create a map of existing scores by student ID
    const scoresMap = existingScores.reduce((acc, score) => {
      acc[score.studentId] = score;
      return acc;
    }, {});
    
    // Add existing scores to student data
    const studentsWithScores = studentsFixed.map(student => ({
      id: student.id,
      name: student.user?.name,
      email: student.user?.email,
      existingScore: scoresMap[student.id] || null
    }));
    
    console.log(`📊 Students with existing scores:`);
    studentsWithScores.slice(0, 5).forEach((student, index) => {
      const scoreInfo = student.existingScore ? 
        `${student.existingScore.marksObtained}/${student.existingScore.totalMarks} (${student.existingScore.percentage}%)` : 
        'No score yet';
      console.log(`   ${index + 1}. ${student.name}: ${scoreInfo}`);
    });
    
    if (studentsWithScores.length > 5) {
      console.log(`   ... and ${studentsWithScores.length - 5} more`);
    }
    
    console.log('\n✅ The fix should work! The API endpoint should now return students.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedQuery();
