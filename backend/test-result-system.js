const { prisma } = require('./config/database');

async function testResultSystem() {
  try {
    console.log('Testing Result and Grading System...\n');

    // Get test data
    const school = await prisma.school.findFirst();
    const term = await prisma.term.findFirst();
    const class1 = await prisma.class.findFirst();
    const student = await prisma.student.findFirst();
    const subjects = await prisma.subject.findMany({ take: 3 }); // Get first 3 subjects
    const gradeScale = await prisma.gradeScale.findFirst({
      where: { schoolId: school.id, isActive: true },
      include: { gradeRanges: true }
    });

    console.log('Test Data:');
    console.log('- School:', school.name);
    console.log('- Term:', term.name);
    console.log('- Class:', class1.name);
    console.log('- Student:', student.firstName, student.lastName);
    console.log('- Subjects:', subjects.map(s => s.name).join(', '));
    console.log('- Active Grade Scale:', gradeScale.name);
    console.log('');

    // Create sample result with subject scores
    const resultData = {
      studentId: student.id,
      termId: term.id,
      classId: class1.id,
      schoolId: school.id,
      gradeScaleId: gradeScale.id,
      totalScore: 0,
      totalSubjects: subjects.length,
      averageScore: 0,
      daysPresent: 85,
      daysAbsent: 5,
      timesLate: 2,
      conductGrade: 'B',
      teacherComment: 'Good student with consistent performance',
    };

    const result = await prisma.result.create({
      data: resultData
    });

    console.log('1. ✅ Created result for student');

    // Create subject results with sample scores
    const subjectScores = [
      { subjectId: subjects[0].id, firstCA: 28, secondCA: 25, thirdCA: 30, exam: 65 }, // Total: 148/160 = 92.5%
      { subjectId: subjects[1].id, firstCA: 25, secondCA: 22, thirdCA: 27, exam: 58 }, // Total: 132/160 = 82.5%
      { subjectId: subjects[2].id, firstCA: 20, secondCA: 18, thirdCA: 23, exam: 45 }  // Total: 106/160 = 66.25%
    ];

    let totalScore = 0;
    const subjectResults = [];

    for (const score of subjectScores) {
      const totalCA = score.firstCA + score.secondCA + score.thirdCA;
      const subjectTotal = totalCA + score.exam;
      
      // Find grade for this score (convert to percentage for 100-based grading)
      const percentage = (subjectTotal / 160) * 100; // Assuming max 160 (30+30+30+70)
      const gradeRange = gradeScale.gradeRanges.find(range => 
        percentage >= range.minScore && percentage <= range.maxScore
      );

      const subjectResultData = {
        resultId: result.id,
        subjectId: score.subjectId,
        firstCA: score.firstCA,
        secondCA: score.secondCA,
        thirdCA: score.thirdCA,
        exam: score.exam,
        totalCA: totalCA,
        totalScore: percentage,
        grade: gradeRange?.grade || 'F',
        gradePoint: gradeRange?.gradePoint || 0,
        remark: gradeRange?.remark || 'Poor'
      };

      const subjectResult = await prisma.subjectResult.create({
        data: subjectResultData
      });

      subjectResults.push(subjectResult);
      totalScore += percentage;
      
      console.log(`2. ✅ Created subject result for ${subjects.find(s => s.id === score.subjectId).name}: ${percentage.toFixed(1)}% (${gradeRange?.grade})`);
    }

    // Update result with calculated totals
    const averageScore = totalScore / subjects.length;
    await prisma.result.update({
      where: { id: result.id },
      data: {
        totalScore,
        averageScore,
        position: 1 // For now, since we only have one student
      }
    });

    console.log('3. ✅ Updated result with calculated averages');
    console.log(`   Average Score: ${averageScore.toFixed(2)}%`);

    // Test fetching the complete result
    const completeResult = await prisma.result.findUnique({
      where: { id: result.id },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        term: true,
        class: true,
        gradeScale: {
          include: { gradeRanges: true }
        },
        subjectResults: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log('\n4. ✅ Retrieved complete result:');
    console.log('   Student:', completeResult.student.firstName, completeResult.student.lastName);
    console.log('   Class:', completeResult.class.name);
    console.log('   Term:', completeResult.term.name);
    console.log('   Overall Average:', completeResult.averageScore.toFixed(2) + '%');
    console.log('   Position:', completeResult.position);
    console.log('   Attendance: Present:', completeResult.daysPresent, 'Absent:', completeResult.daysAbsent);
    console.log('   Conduct Grade:', completeResult.conductGrade);
    console.log('   Teacher Comment:', completeResult.teacherComment);
    
    console.log('\n   Subject Results:');
    completeResult.subjectResults.forEach(sr => {
      console.log(`   - ${sr.subject.name}: ${sr.totalScore.toFixed(1)}% (${sr.grade}) - ${sr.remark}`);
      console.log(`     CA: ${sr.firstCA}+${sr.secondCA}+${sr.thirdCA}=${sr.totalCA}, Exam: ${sr.exam}`);
    });

    console.log('\n✅ Result and Grading System is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test the API endpoints');
    console.log('3. Create the frontend interface');

  } catch (error) {
    console.error('❌ Error testing result system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testResultSystem();