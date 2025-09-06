const { prisma } = require('../config/database');

async function main() {
  console.log('🌱 Creating basic test data for scoring system...');

  try {
    // Create or find school
    let school = await prisma.school.findUnique({
      where: { subdomain: 'greenwood' }
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Greenwood International School',
          slug: 'greenwood-international',
          subdomain: 'greenwood',
          type: 'SECONDARY',
          status: 'ACTIVE',
          email: 'admin@greenwood.edu',
          phone: '+1 555-0100'
        }
      });
      console.log('✅ Created school:', school.name);
    }

    // Create academic year
    let academicYear = await prisma.academicYear.findFirst({
      where: { schoolId: school.id }
    });

    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: {
          name: '2024-2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          isCurrent: true,
          schoolId: school.id
        }
      });
      console.log('✅ Created academic year:', academicYear.name);
    }

    // Create terms
    const termsData = [
      { name: 'First Term', startDate: new Date('2024-09-01'), endDate: new Date('2024-12-15') },
      { name: 'Second Term', startDate: new Date('2025-01-15'), endDate: new Date('2025-04-15') },
      { name: 'Third Term', startDate: new Date('2025-04-20'), endDate: new Date('2025-06-30') }
    ];

    for (const termData of termsData) {
      const existingTerm = await prisma.term.findFirst({
        where: { 
          name: termData.name,
          schoolId: school.id,
          academicYearId: academicYear.id
        }
      });

      if (!existingTerm) {
        await prisma.term.create({
          data: {
            ...termData,
            schoolId: school.id,
            academicYearId: academicYear.id
          }
        });
        console.log('✅ Created term:', termData.name);
      }
    }

    // Create classes
    const classesData = [
      { name: 'Grade 1A', grade: '1' },
      { name: 'Grade 2A', grade: '2' },
      { name: 'Grade 3A', grade: '3' },
      { name: 'Grade 4A', grade: '4' },
      { name: 'Grade 5A', grade: '5' }
    ];

    for (const classData of classesData) {
      const existingClass = await prisma.class.findFirst({
        where: { 
          name: classData.name,
          schoolId: school.id
        }
      });

      if (!existingClass) {
        await prisma.class.create({
          data: {
            ...classData,
            capacity: 30,
            schoolId: school.id
          }
        });
        console.log('✅ Created class:', classData.name);
      }
    }

    // Create subjects
    const subjectsData = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English Language Arts', code: 'ELA' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SS' },
      { name: 'Physical Education', code: 'PE' },
      { name: 'Art', code: 'ART' },
      { name: 'Music', code: 'MUS' }
    ];

    for (const subjectData of subjectsData) {
      const existingSubject = await prisma.subject.findFirst({
        where: { 
          name: subjectData.name,
          schoolId: school.id
        }
      });

      if (!existingSubject) {
        await prisma.subject.create({
          data: {
            ...subjectData,
            credits: 1,
            schoolId: school.id
          }
        });
        console.log('✅ Created subject:', subjectData.name);
      }
    }

    // Create a test user (admin)
    let adminUser = await prisma.user.findFirst({
      where: { 
        email: 'admin@greenwood.edu',
        schoolId: school.id
      }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@greenwood.edu',
          passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
          name: 'School Administrator',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true,
          schoolId: school.id
        }
      });
      console.log('✅ Created admin user');
    }

    // Create some test students and a teacher for assessment creation
    let teacher = await prisma.teacher.findFirst({
      where: { schoolId: school.id }
    });

    if (!teacher) {
      const teacherUser = await prisma.user.create({
        data: {
          email: 'teacher@greenwood.edu',
          passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
          name: 'John Doe',
          role: 'TEACHER',
          isActive: true,
          emailVerified: true,
          schoolId: school.id
        }
      });

      teacher = await prisma.teacher.create({
        data: {
          employeeId: 'T001',
          userId: teacherUser.id,
          firstName: 'John',
          lastName: 'Doe',
          joiningDate: new Date('2024-08-01'),
          status: 'ACTIVE',
          schoolId: school.id
        }
      });
      console.log('✅ Created teacher');
    }

    // Create test students
    const grade1Class = await prisma.class.findFirst({
      where: { name: 'Grade 1A', schoolId: school.id }
    });

    if (grade1Class) {
      const studentsData = [
        { name: 'Alice Smith', email: 'alice@test.com' },
        { name: 'Bob Johnson', email: 'bob@test.com' },
        { name: 'Charlie Brown', email: 'charlie@test.com' }
      ];

      for (let i = 0; i < studentsData.length; i++) {
        const studentData = studentsData[i];
        const existingStudent = await prisma.user.findFirst({
          where: { email: studentData.email, schoolId: school.id }
        });

        if (!existingStudent) {
          const studentUser = await prisma.user.create({
            data: {
              email: studentData.email,
              passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
              name: studentData.name,
              role: 'STUDENT',
              isActive: true,
              emailVerified: true,
              schoolId: school.id
            }
          });

          const [firstName, lastName] = studentData.name.split(' ');
          const student = await prisma.student.create({
            data: {
              admissionNumber: `S00${i + 1}`,
              firstName: firstName || studentData.name,
              lastName: lastName || 'Student',
              userId: studentUser.id,
              schoolId: school.id
            }
          });

          // Create student class history
          await prisma.studentClassHistory.create({
            data: {
              studentId: student.id,
              classId: grade1Class.id,
              academicYearId: academicYear.id,
              status: 'ACTIVE',
              schoolId: school.id
            }
          });

          console.log('✅ Created student:', studentData.name);
        }
      }
    }

    // Create a sample assessment
    const mathSubject = await prisma.subject.findFirst({
      where: { name: 'Mathematics', schoolId: school.id }
    });

    const firstTerm = await prisma.term.findFirst({
      where: { name: 'First Term', schoolId: school.id }
    });

    if (mathSubject && grade1Class && teacher && firstTerm) {
      const existingAssessment = await prisma.assessment.findFirst({
        where: { 
          title: 'Math Quiz 1',
          schoolId: school.id
        }
      });

      if (!existingAssessment) {
        await prisma.assessment.create({
          data: {
            title: 'Math Quiz 1',
            description: 'Basic arithmetic quiz',
            type: 'QUIZ',
            totalMarks: 100,
            passingMarks: 60,
            weight: 1.0,
            duration: 60,
            scheduledDate: new Date('2024-10-15'),
            status: 'PUBLISHED',
            gradingMethod: 'PERCENTAGE',
            schoolId: school.id,
            subjectId: mathSubject.id,
            classId: grade1Class.id,
            academicYearId: academicYear.id,
            termId: firstTerm.id,
            teacherId: teacher.id,
            createdById: adminUser.id
          }
        });
        console.log('✅ Created sample assessment');
      }
    }

    console.log('🎉 Basic seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });