const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function moveStudentsToOneClass() {
  try {
    console.log('🔄 Moving all students to Grade 6A...');

    // Get Grade 6A class
    const targetClass = await prisma.class.findFirst({
      where: {
        name: 'Grade 6A'
      }
    });

    if (!targetClass) {
      throw new Error('Grade 6A class not found');
    }

    console.log(`📚 Target class: ${targetClass.name} (ID: ${targetClass.id})`);

    // Get all students
    const allStudents = await prisma.student.findMany({
      include: {
        user: { select: { name: true } }
      }
    });

    console.log(`👥 Found ${allStudents.length} students to move`);

    // Update all students to be in Grade 6A
    const updateResult = await prisma.student.updateMany({
      data: {
        currentClassId: targetClass.id
      }
    });

    console.log(`✅ Moved ${updateResult.count} students to ${targetClass.name}`);

    // Update student class history
    await prisma.studentClassHistory.updateMany({
      data: {
        classId: targetClass.id
      }
    });

    console.log('✅ Updated student class history');

    // Delete existing assessments
    await prisma.assessment.deleteMany();
    console.log('🗑️ Deleted existing assessments');

    // Get required data for assessments
    const school = await prisma.school.findFirst();
    const academicYear = await prisma.academicYear.findFirst({ where: { schoolId: school.id } });
    const term = await prisma.term.findFirst({ where: { schoolId: school.id } });
    const teacher = await prisma.teacher.findFirst({ where: { schoolId: school.id } });
    const teacherUser = await prisma.user.findFirst({ where: { id: teacher.userId } });
    const subjects = await prisma.subject.findMany({ where: { schoolId: school.id } });

    // Create assessments for Grade 6A with all 55 students
    console.log('📝 Creating assessments for Grade 6A...');
    
    const assessmentsToCreate = [
      { title: 'Mathematics Quiz - Fractions', subjectCode: 'MATH', totalMarks: 100, type: 'QUIZ' },
      { title: 'English Comprehension Test', subjectCode: 'ELA', totalMarks: 80, type: 'QUIZ' },
      { title: 'Science Experiment Report', subjectCode: 'SCI', totalMarks: 75, type: 'ASSIGNMENT' },
      { title: 'Social Studies Project', subjectCode: 'SS', totalMarks: 90, type: 'PROJECT' },
      { title: 'Mathematics Final Exam', subjectCode: 'MATH', totalMarks: 120, type: 'EXAM' },
      { title: 'English Writing Assessment', subjectCode: 'ELA', totalMarks: 85, type: 'EXAM' }
    ];

    const createdAssessments = [];
    
    for (const assessmentData of assessmentsToCreate) {
      const subject = subjects.find(s => s.code === assessmentData.subjectCode);
      if (!subject) {
        console.log(`⚠️  Skipping ${assessmentData.title} - subject ${assessmentData.subjectCode} not found`);
        continue;
      }

      const assessment = await prisma.assessment.create({
        data: {
          title: assessmentData.title,
          description: `${assessmentData.subjectCode} assessment for Grade 6A with ${allStudents.length} students`,
          type: assessmentData.type,
          totalMarks: assessmentData.totalMarks,
          passingMarks: Math.floor(assessmentData.totalMarks * 0.6),
          duration: assessmentData.type === 'EXAM' ? 120 : 60,
          scheduledDate: new Date(),
          status: 'PUBLISHED',
          schoolId: school.id,
          classId: targetClass.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
          termId: term.id,
          teacherId: teacher.id,
          createdById: teacherUser.id,
          instructions: `Complete all sections carefully. Total marks: ${assessmentData.totalMarks}. This assessment is for Grade 6A with ${allStudents.length} students.`
        }
      });

      createdAssessments.push({
        title: assessment.title,
        subjectName: subject.name,
        totalMarks: assessment.totalMarks,
        type: assessment.type
      });

      console.log(`✅ Created: ${assessment.title} (${subject.name}) - ${assessment.totalMarks} marks`);
    }

    // Verify final setup
    const finalStudentCount = await prisma.student.count({
      where: {
        currentClassId: targetClass.id
      }
    });

    console.log('\n🎉 Single class load testing setup complete!');
    console.log('\n📊 Final Summary:');
    console.log(`   📚 Class: ${targetClass.name}`);
    console.log(`   👥 Students: ${finalStudentCount}`);
    console.log(`   📝 Assessments: ${createdAssessments.length}`);
    
    console.log('\n📋 Created Assessments:');
    createdAssessments.forEach(ass => {
      console.log(`   • ${ass.title} (${ass.subjectName}) - ${ass.totalMarks} marks - ${ass.type}`);
    });

    console.log('\n🚀 Perfect for load testing with all 55 students in Grade 6A!');
    console.log('   • Test pagination with 55 students (3 pages at 20 per page)');
    console.log('   • Test search functionality across 55 student names');
    console.log('   • Test CSV download with 55 student names');
    console.log('   • Test bulk score upload for large classes');
    console.log('   • Test performance with realistic class sizes');

  } catch (error) {
    console.error('❌ Error moving students to single class:', error);
  } finally {
    await prisma.$disconnect();
  }
}

moveStudentsToOneClass();