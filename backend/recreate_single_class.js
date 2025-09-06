const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recreateSingleClass() {
  try {
    console.log('🗑️ Deleting existing data...');
    
    // Delete in reverse dependency order
    await prisma.grade.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.studentClassHistory.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } });
    
    console.log('✅ Existing data cleared');

    // Get school and other existing data
    const school = await prisma.school.findFirst();
    const academicYear = await prisma.academicYear.findFirst({ where: { schoolId: school.id } });
    const term = await prisma.term.findFirst({ where: { schoolId: school.id } });
    const houses = await prisma.house.findMany({ where: { schoolId: school.id } });
    
    // Get or create a single class for all students
    let targetClass = await prisma.class.findFirst({
      where: { 
        name: 'Grade 6A',
        schoolId: school.id 
      }
    });

    if (!targetClass) {
      targetClass = await prisma.class.create({
        data: {
          name: 'Grade 6A',
          grade: '6',
          capacity: 60,
          schoolId: school.id,
          academicYearId: academicYear.id
        }
      });
    }

    console.log(`📚 Using class: ${targetClass.name} (capacity: ${targetClass.capacity})`);

    // Create teacher first
    console.log('👨‍🏫 Creating teacher...');
    const passwordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password
    
    const teacherUser = await prisma.user.create({
      data: {
        email: 'john.doe@greenwood.com',
        passwordHash,
        name: 'John Doe',
        role: 'TEACHER',
        isActive: true,
        emailVerified: true,
        schoolId: school.id
      }
    });

    const teacher = await prisma.teacher.create({
      data: {
        employeeId: 'TCH001',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        qualification: 'B.Ed Mathematics',
        experience: 5,
        status: 'ACTIVE',
        schoolId: school.id,
        userId: teacherUser.id
      }
    });

    console.log('✅ Teacher created');

    // Create all 55 students
    console.log('👨‍🎓 Creating 55 students for single class...');
    
    const studentNames = [
      'Jane Smith', 'Alex Johnson', 'Emma Davis', 'Michael Brown', 'Sarah Wilson',
      'David Martinez', 'Olivia Garcia', 'James Anderson', 'Sophia Taylor', 'Benjamin Thomas',
      'Isabella Jackson', 'Matthew White', 'Ava Harris', 'Ethan Clark', 'Mia Lewis',
      'Alexander Robinson', 'Charlotte Walker', 'Daniel Perez', 'Amelia Hall', 'William Young',
      'Harper Allen', 'Henry Sanchez', 'Evelyn Wright', 'Sebastian Lopez', 'Abigail Hill',
      'Jackson Scott', 'Emily Green', 'Owen Adams', 'Ella Baker', 'Lucas Gonzalez',
      'Avery Nelson', 'Carter Carter', 'Scarlett Mitchell', 'Wyatt Perez', 'Madison Roberts',
      'Jack Turner', 'Layla Phillips', 'Jacob Campbell', 'Grace Parker', 'Mason Evans',
      'Chloe Edwards', 'Noah Collins', 'Lily Stewart', 'Elijah Sanchez', 'Zoe Morris',
      'Luke Rogers', 'Nora Reed', 'Levi Cook', 'Hazel Morgan', 'Oliver Bailey',
      'Violet Rivera', 'Asher Cooper', 'Aurora Richardson', 'Grayson Cox', 'Savannah Ward'
    ];

    const students = [];
    
    for (let i = 0; i < studentNames.length; i++) {
      const names = studentNames[i].split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      
      // Create user for each student
      const studentUser = await prisma.user.create({
        data: {
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@greenwood.com`,
          passwordHash,
          name: studentNames[i],
          role: 'STUDENT',
          isActive: true,
          emailVerified: true,
          schoolId: school.id
        }
      });

      // Create student record
      const student = await prisma.student.create({
        data: {
          admissionNumber: `STU2024${String(i + 1).padStart(3, '0')}`,
          firstName,
          lastName,
          dateOfBirth: new Date(2012, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: ['Michael', 'Alex', 'David', 'James', 'Benjamin', 'Matthew', 'Ethan', 'Alexander', 'Daniel', 'William', 'Henry', 'Sebastian', 'Jackson', 'Owen', 'Lucas', 'Carter', 'Wyatt', 'Jack', 'Jacob', 'Mason', 'Noah', 'Elijah', 'Luke', 'Levi', 'Oliver', 'Asher', 'Grayson'].includes(firstName) ? 'MALE' : 'FEMALE',
          email: studentUser.email,
          phone: `+1-555-${String(200 + i).padStart(4, '0')}`,
          streetAddress: `${100 + i} Student Street`,
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          admissionDate: new Date('2024-09-01'),
          status: 'ACTIVE',
          schoolId: school.id,
          userId: studentUser.id,
          currentClassId: targetClass.id, // All students in same class
          academicYearId: academicYear.id,
          houseId: houses[i % houses.length].id
        }
      });

      // Create student class history
      await prisma.studentClassHistory.create({
        data: {
          studentId: student.id,
          classId: targetClass.id,
          academicYearId: academicYear.id,
          status: 'ACTIVE',
          startDate: new Date('2024-09-01')
        }
      });

      students.push(student);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1} students...`);
      }
    }

    console.log(`✅ Created ${students.length} students in ${targetClass.name}`);

    // Get subjects
    const subjects = await prisma.subject.findMany({
      where: { schoolId: school.id }
    });

    // Create multiple assessments for the class with all students
    console.log('📝 Creating assessments for the large class...');
    
    const assessmentsToCreate = [
      { title: 'Mathematics Quiz - Algebra', subjectCode: 'MATH', totalMarks: 100, type: 'QUIZ' },
      { title: 'English Comprehension Test', subjectCode: 'ELA', totalMarks: 80, type: 'QUIZ' },
      { title: 'Science Lab Assessment', subjectCode: 'SCI', totalMarks: 75, type: 'QUIZ' },
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
          description: `${assessmentData.subjectCode} assessment for Grade 6A with 55 students`,
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
          instructions: `Complete all sections carefully. Total marks: ${assessmentData.totalMarks}. This assessment is for a class of 55 students.`
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

    console.log('\n🎉 Single class setup complete!');
    console.log('\n📊 Final Summary:');
    console.log(`   📚 Class: ${targetClass.name}`);
    console.log(`   👥 Students: ${students.length}`);
    console.log(`   📝 Assessments: ${createdAssessments.length}`);
    console.log('\n📋 Created Assessments:');
    createdAssessments.forEach(ass => {
      console.log(`   • ${ass.title} (${ass.subjectName}) - ${ass.totalMarks} marks - ${ass.type}`);
    });

    console.log('\n🚀 Perfect for load testing with 55 students in one class!');

  } catch (error) {
    console.error('❌ Error recreating single class setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateSingleClass();