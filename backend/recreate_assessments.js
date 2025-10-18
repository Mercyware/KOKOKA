const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recreateAssessments() {
  try {
    // Delete existing assessments
    console.log('🗑️ Deleting existing assessments...');
    await prisma.assessment.deleteMany();
    console.log('✅ Existing assessments deleted');

    // Get school data
    const school = await prisma.school.findFirst();
    const academicYear = await prisma.academicYear.findFirst({ where: { schoolId: school.id } });
    const term = await prisma.term.findFirst({ where: { schoolId: school.id } });
    const teacher = await prisma.teacher.findFirst({ where: { schoolId: school.id } });
    const teacherUser = await prisma.user.findFirst({ where: { id: teacher.userId } });

    // Get all classes with their student counts
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Get all subjects
    const subjects = await prisma.subject.findMany({
      where: { schoolId: school.id }
    });

    console.log('\n📝 Creating assessments for classes with students...');

    // Create assessments for each class that has students
    const assessmentsToCreate = [
      { className: 'Grade 1', subjectCode: 'MATH', title: 'Grade 1 Math Assessment', totalMarks: 50 },
      { className: 'Grade 2', subjectCode: 'ELA', title: 'Grade 2 Reading Test', totalMarks: 60 },
      { className: 'Grade 3', subjectCode: 'SCI', title: 'Grade 3 Science Quiz', totalMarks: 70 },
      { className: 'Grade 4', subjectCode: 'MATH', title: 'Grade 4 Math Test', totalMarks: 80 },
      { className: 'Grade 5', subjectCode: 'ELA', title: 'Grade 5 Writing Assessment', totalMarks: 90 },
      { className: 'Grade 6', subjectCode: 'SCI', title: 'Grade 6 Science Exam', totalMarks: 100 },
      { className: 'Grade 7', subjectCode: 'MATH', title: 'Grade 7 Algebra Test', totalMarks: 110 },
      { className: 'Grade 8', subjectCode: 'ELA', title: 'Grade 8 Literature Exam', totalMarks: 120 }
    ];

    const createdAssessments = [];

    for (const assessmentData of assessmentsToCreate) {
      // Find the class
      const targetClass = classes.find(c => c.name === assessmentData.className);
      if (!targetClass || targetClass._count.students === 0) {
        console.log(`⚠️  Skipping ${assessmentData.className} - no students found`);
        continue;
      }

      // Find the subject
      const subject = subjects.find(s => s.code === assessmentData.subjectCode);
      if (!subject) {
        console.log(`⚠️  Skipping ${assessmentData.title} - subject ${assessmentData.subjectCode} not found`);
        continue;
      }

      // Create assessment
      const assessment = await prisma.assessment.create({
        data: {
          title: assessmentData.title,
          description: `${assessmentData.subjectCode} assessment for ${assessmentData.className}`,
          type: assessmentData.title.includes('Exam') ? 'EXAM' : 'QUIZ',
          totalMarks: assessmentData.totalMarks,
          passingMarks: Math.floor(assessmentData.totalMarks * 0.6),
          duration: 60,
          scheduledDate: new Date(),
          status: 'PUBLISHED',
          schoolId: school.id,
          classId: targetClass.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
          termId: term.id,
          teacherId: teacher.id,
          createdById: teacherUser.id,
          instructions: `Complete all sections carefully. Total marks: ${assessmentData.totalMarks}`
        }
      });

      createdAssessments.push({
        title: assessment.title,
        className: targetClass.name,
        subjectName: subject.name,
        studentCount: targetClass._count.students,
        totalMarks: assessment.totalMarks
      });

      console.log(`✅ Created: ${assessment.title} for ${targetClass.name} (${targetClass._count.students} students)`);
    }

    console.log('\n🎉 Assessment creation complete!');
    console.log('\n📊 Summary:');
    createdAssessments.forEach(ass => {
      console.log(`   ${ass.title}`);
      console.log(`     Class: ${ass.className} (${ass.studentCount} students)`);
      console.log(`     Subject: ${ass.subjectName}`);
      console.log(`     Total Marks: ${ass.totalMarks}`);
      console.log('');
    });

    console.log(`📈 Total: ${createdAssessments.length} assessments created`);
    console.log(`👥 Total students across all assessments: ${createdAssessments.reduce((sum, ass) => sum + ass.studentCount, 0)}`);

  } catch (error) {
    console.error('❌ Error recreating assessments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateAssessments();