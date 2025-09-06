const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleAssessment() {
  try {
    // Get the school
    const school = await prisma.school.findFirst();
    if (!school) {
      throw new Error('No school found');
    }

    // Get a class (Grade 6A)
    const targetClass = await prisma.class.findFirst({
      where: {
        name: 'Grade 6A',
        schoolId: school.id
      }
    });
    if (!targetClass) {
      throw new Error('Grade 6A class not found');
    }

    // Get Math subject
    const subject = await prisma.subject.findFirst({
      where: {
        code: 'MATH',
        schoolId: school.id
      }
    });
    if (!subject) {
      throw new Error('Math subject not found');
    }

    // Get academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        schoolId: school.id
      }
    });
    if (!academicYear) {
      throw new Error('Academic year not found');
    }

    // Get a term
    const term = await prisma.term.findFirst({
      where: {
        schoolId: school.id,
        academicYearId: academicYear.id
      }
    });
    if (!term) {
      throw new Error('Term not found');
    }

    // Get a teacher
    const teacher = await prisma.teacher.findFirst({
      where: {
        schoolId: school.id
      }
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Get the teacher user for createdById
    const teacherUser = await prisma.user.findFirst({
      where: {
        id: teacher.userId
      }
    });

    // Create the assessment
    const assessment = await prisma.assessment.create({
      data: {
        title: 'Math Quiz - Chapter 1',
        description: 'Basic arithmetic and problem solving skills assessment',
        type: 'QUIZ',
        totalMarks: 100,
        passingMarks: 60,
        duration: 60, // minutes
        scheduledDate: new Date(),
        status: 'PUBLISHED',
        schoolId: school.id,
        classId: targetClass.id,
        subjectId: subject.id,
        academicYearId: academicYear.id,
        termId: term.id,
        teacherId: teacher.id,
        createdById: teacherUser.id,
        instructions: 'Answer all questions. Show your work for full credit.'
      }
    });

    console.log(`✅ Created sample assessment: ${assessment.title}`);
    console.log(`   Class: ${targetClass.name}`);
    console.log(`   Subject: ${subject.name}`);
    console.log(`   Total Marks: ${assessment.totalMarks}`);
    console.log(`   Assessment ID: ${assessment.id}`);

    // Create a few more assessments for different classes and subjects
    const additionalAssessments = [
      {
        title: 'English Comprehension Test',
        subject: 'ELA',
        class: 'Grade 5A',
        totalMarks: 80
      },
      {
        title: 'Science Lab Report',
        subject: 'SCI',
        class: 'Grade 7A',
        totalMarks: 50
      },
      {
        title: 'Math Final Exam',
        subject: 'MATH',
        class: 'Grade 8A',
        totalMarks: 120
      }
    ];

    for (const assData of additionalAssessments) {
      const assClass = await prisma.class.findFirst({
        where: { name: assData.class, schoolId: school.id }
      });
      const assSubject = await prisma.subject.findFirst({
        where: { code: assData.subject, schoolId: school.id }
      });

      if (assClass && assSubject) {
        const additionalAssessment = await prisma.assessment.create({
          data: {
            title: assData.title,
            description: `Assessment for ${assData.subject}`,
            type: assData.title.includes('Exam') ? 'EXAM' : 'QUIZ',
            totalMarks: assData.totalMarks,
            passingMarks: Math.floor(assData.totalMarks * 0.6),
            duration: 90,
            scheduledDate: new Date(),
            status: 'PUBLISHED',
            schoolId: school.id,
            classId: assClass.id,
            subjectId: assSubject.id,
            academicYearId: academicYear.id,
            termId: term.id,
            teacherId: teacher.id,
            createdById: teacherUser.id,
            instructions: 'Complete all sections carefully.'
          }
        });
        console.log(`✅ Created additional assessment: ${additionalAssessment.title} for ${assClass.name} - ${assSubject.name}`);
      }
    }

    console.log('\n🎉 All sample assessments created successfully!');

  } catch (error) {
    console.error('❌ Error creating assessment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAssessment();