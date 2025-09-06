const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clear existing data in reverse dependency order
  console.log('🧹 Clearing existing data...');
  await clearExistingData();

  // 1. Create School
  console.log('🏫 Creating school...');
  const school = await createSchool();

  // 2. Create Academic Year
  console.log('📅 Creating academic year...');
  const academicYear = await createAcademicYear(school.id);

  // 3. Create Academic Calendar
  console.log('📆 Creating academic calendar...');
  await createAcademicCalendar(school.id, academicYear.id);

  // 4. Create Users (Admin, Principal, Teachers, etc.)
  console.log('👥 Creating users...');
  const users = await createUsers(school.id);

  // 5. Create Houses
  console.log('🏠 Creating houses...');
  const houses = await createHouses(school.id);

  // 6. Create Sections  
  console.log('📚 Creating sections...');
  const sections = await createSections(school.id);

  // 7. Create Classes
  console.log('🎓 Creating classes...');
  const classes = await createClasses(school.id);

  // 8. Create Subjects
  console.log('📖 Creating subjects...');
  const subjects = await createSubjects(school.id);

  // 9. Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teachers = await createTeachers(school.id, users);

  // 10. Create Students
  console.log('👨‍🎓 Creating students...');
  const students = await createStudents(school.id, users, classes, houses, academicYear.id);

  // 11. Create Class-Subject History
  console.log('📋 Creating class-subject history...');
  await createClassSubjectHistory(school.id, classes, subjects, teachers, academicYear.id);

  // 12. Create Class Teachers
  console.log('👨‍🏫 Creating class teacher assignments...');
  await createClassTeachers(school.id, teachers, classes, academicYear.id);

  // 13. Create Guardians
  console.log('👨‍👩‍👧‍👦 Creating guardians...');
  await createGuardians(school.id, students);

  // 14. Create Sample Curriculum
  console.log('📚 Creating sample curriculum...');
  await createSampleCurriculum(school.id, subjects, users[0].id);

  // 15. Create Global Curricula (for reference)
  console.log('🌍 Creating global curricula...');
  await createGlobalCurricula();

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- School: ${school.name} (${school.subdomain}.example.com)
- Users: ${users.length} (including admin, teachers, students, parents)
- Academic Year: ${academicYear.name}
- Houses: ${houses.length}
- Sections: ${sections.length}  
- Classes: ${classes.length}
- Subjects: ${subjects.length}
- Teachers: ${teachers.length}
- Students: ${students.length}

🔐 Login Credentials:
- Admin: admin@${school.subdomain}.com / admin123
- Principal: principal@${school.subdomain}.com / principal123
- Teacher (John Doe): john.doe@${school.subdomain}.com / teacher123
- Student (Jane Smith): jane.smith@${school.subdomain}.com / student123
- Parent (Robert Smith): robert.smith@${school.subdomain}.com / parent123
  `);
}

async function clearExistingData() {
  // Clear in reverse dependency order
  await prisma.globalCurriculumSubject.deleteMany();
  await prisma.globalCurriculum.deleteMany();
  await prisma.curriculumSubject.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.guardianStudent.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.classSubjectHistory.deleteMany();
  await prisma.studentClassHistory.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.section.deleteMany();
  await prisma.house.deleteMany();
  await prisma.academicCalendar.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
}

async function createSchool() {
  const school = await prisma.school.create({
    data: {
      name: 'Greenwood International School',
      slug: 'greenwood-international',
      subdomain: 'greenwood',
      logo: '/logos/greenwood-logo.png',
      description: 'A premier international school providing quality education from primary to secondary levels.',
      established: new Date('2010-08-15'),
      type: 'SECONDARY',
      status: 'ACTIVE',
      streetAddress: '123 Education Lane',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      email: 'info@greenwood.edu',
      phone: '+1-555-0123',
      website: 'https://greenwood.edu',
      settings: {
        timezone: 'America/Los_Angeles',
        language: 'en',
        currency: 'USD',
        academicYearStart: 'September',
        weekStartDay: 'Monday',
        gradingScale: {
          'A+': { min: 97, max: 100 },
          'A': { min: 93, max: 96 },
          'A-': { min: 90, max: 92 },
          'B+': { min: 87, max: 89 },
          'B': { min: 83, max: 86 },
          'B-': { min: 80, max: 82 },
          'C+': { min: 77, max: 79 },
          'C': { min: 73, max: 76 },
          'C-': { min: 70, max: 72 },
          'D': { min: 60, max: 69 },
          'F': { min: 0, max: 59 }
        }
      }
    }
  });

  return school;
}

async function createAcademicYear(schoolId) {
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
      schoolId: schoolId
    }
  });

  // Create terms for the academic year
  await prisma.term.createMany({
    data: [
      {
        name: 'First Term',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-20'),
        schoolId: schoolId,
        academicYearId: academicYear.id
      },
      {
        name: 'Second Term',
        startDate: new Date('2025-01-08'),
        endDate: new Date('2025-03-28'),
        schoolId: schoolId,
        academicYearId: academicYear.id
      },
      {
        name: 'Third Term',
        startDate: new Date('2025-04-07'),
        endDate: new Date('2025-06-30'),
        schoolId: schoolId,
        academicYearId: academicYear.id
      }
    ]
  });

  return academicYear;
}

async function createAcademicCalendar(schoolId, academicYearId) {
  const calendars = [
    {
      term: 'FIRST',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
      holidays: [
        { name: 'Labor Day', date: '2024-09-02', description: 'National Holiday' },
        { name: 'Columbus Day', date: '2024-10-14', description: 'National Holiday' },
        { name: 'Thanksgiving Break', date: '2024-11-25', description: 'Week-long break' },
        { name: 'Winter Break', date: '2024-12-21', description: 'Holiday break' }
      ],
      schoolId,
      academicYearId
    },
    {
      term: 'SECOND',
      startDate: new Date('2025-01-08'),
      endDate: new Date('2025-03-28'),
      holidays: [
        { name: 'Martin Luther King Jr. Day', date: '2025-01-20', description: 'National Holiday' },
        { name: 'Presidents Day', date: '2025-02-17', description: 'National Holiday' },
        { name: 'Spring Break', date: '2025-03-24', description: 'Week-long break' }
      ],
      schoolId,
      academicYearId
    },
    {
      term: 'THIRD',
      startDate: new Date('2025-04-07'),
      endDate: new Date('2025-06-30'),
      holidays: [
        { name: 'Memorial Day', date: '2025-05-26', description: 'National Holiday' },
        { name: 'Graduation Day', date: '2025-06-15', description: 'School ceremony' }
      ],
      schoolId,
      academicYearId
    }
  ];

  await prisma.academicCalendar.createMany({
    data: calendars
  });
}

async function createUsers(schoolId) {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const usersData = [
    {
      email: 'admin@greenwood.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'principal@greenwood.com', 
      passwordHash: await bcrypt.hash('principal123', 10),
      name: 'Dr. Sarah Johnson',
      role: 'PRINCIPAL',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'vice.principal@greenwood.com',
      passwordHash: await bcrypt.hash('vice123', 10),
      name: 'Mr. Michael Brown',
      role: 'VICE_PRINCIPAL', 
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'john.doe@greenwood.com',
      passwordHash: await bcrypt.hash('teacher123', 10),
      name: 'John Doe',
      role: 'TEACHER',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'mary.wilson@greenwood.com',
      passwordHash: passwordHash,
      name: 'Mary Wilson',
      role: 'TEACHER',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'david.garcia@greenwood.com',
      passwordHash: passwordHash,
      name: 'David Garcia',
      role: 'TEACHER',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'jane.smith@greenwood.com',
      passwordHash: await bcrypt.hash('student123', 10),
      name: 'Jane Smith',
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'alex.johnson@greenwood.com',
      passwordHash: passwordHash,
      name: 'Alex Johnson',
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'emma.davis@greenwood.com',
      passwordHash: passwordHash,
      name: 'Emma Davis',
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'robert.smith@greenwood.com',
      passwordHash: await bcrypt.hash('parent123', 10),
      name: 'Robert Smith',
      role: 'PARENT',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'linda.johnson@greenwood.com',
      passwordHash: passwordHash,
      name: 'Linda Johnson',
      role: 'PARENT',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    },
    {
      email: 'librarian@greenwood.com',
      passwordHash: passwordHash,
      name: 'Nancy White',
      role: 'LIBRARIAN',
      isActive: true,
      emailVerified: true,
      schoolId: schoolId
    }
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: userData
    });
    users.push(user);
  }

  return users;
}

async function createHouses(schoolId) {
  const housesData = [
    {
      name: 'Phoenix House',
      code: 'PHX',
      color: '#FF4444',
      description: 'Courage, Leadership, and Determination',
      schoolId: schoolId
    },
    {
      name: 'Dragon House',
      code: 'DRG',
      color: '#4444FF',
      description: 'Wisdom, Strength, and Honor',
      schoolId: schoolId
    },
    {
      name: 'Eagle House',
      code: 'EGL',
      color: '#44FF44',
      description: 'Excellence, Vision, and Freedom',
      schoolId: schoolId
    },
    {
      name: 'Lion House',
      code: 'LIO',
      color: '#FFAA00',
      description: 'Bravery, Pride, and Nobility',
      schoolId: schoolId
    }
  ];

  const houses = [];
  for (const houseData of housesData) {
    const house = await prisma.house.create({
      data: houseData
    });
    houses.push(house);
  }

  return houses;
}

async function createSections(schoolId) {
  const sectionsData = [
    {
      name: 'Section A',
      capacity: 30,
      description: 'Primary section for regular curriculum',
      schoolId: schoolId
    },
    {
      name: 'Section B',
      capacity: 30,
      description: 'Secondary section for regular curriculum',
      schoolId: schoolId
    },
    {
      name: 'Section C',
      capacity: 25,
      description: 'Advanced section for accelerated learning',
      schoolId: schoolId
    },
    {
      name: 'Section D',
      capacity: 20,
      description: 'Special needs support section',
      schoolId: schoolId
    }
  ];

  const sections = [];
  for (const sectionData of sectionsData) {
    const section = await prisma.section.create({
      data: sectionData
    });
    sections.push(section);
  }

  return sections;
}

async function createClasses(schoolId) {
  const classesData = [
    {
      name: 'Grade 1A',
      grade: '1',
      capacity: 25,
      description: 'First grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 2A',
      grade: '2',
      capacity: 25,
      description: 'Second grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 3A',
      grade: '3',
      capacity: 28,
      description: 'Third grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 4A',
      grade: '4',
      capacity: 28,
      description: 'Fourth grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 5A',
      grade: '5',
      capacity: 30,
      description: 'Fifth grade intermediate class',
      schoolId: schoolId
    },
    {
      name: 'Grade 6A',
      grade: '6',
      capacity: 30,
      description: 'Sixth grade intermediate class',
      schoolId: schoolId
    },
    {
      name: 'Grade 7A',
      grade: '7',
      capacity: 32,
      description: 'Seventh grade middle school class',
      schoolId: schoolId
    },
    {
      name: 'Grade 8A',
      grade: '8',
      capacity: 32,
      description: 'Eighth grade middle school class',
      schoolId: schoolId
    }
  ];

  const classes = [];
  for (const classData of classesData) {
    const cls = await prisma.class.create({
      data: classData
    });
    classes.push(cls);
  }

  return classes;
}

async function createSubjects(schoolId) {
  const subjectsData = [
    {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Number theory, algebra, geometry, and statistics',
      credits: 4,
      schoolId: schoolId
    },
    {
      name: 'English Language Arts',
      code: 'ELA',
      description: 'Reading, writing, speaking, and listening skills',
      credits: 4,
      schoolId: schoolId
    },
    {
      name: 'Science',
      code: 'SCI',
      description: 'Physical, life, and earth sciences',
      credits: 3,
      schoolId: schoolId
    },
    {
      name: 'Social Studies',
      code: 'SS',
      description: 'History, geography, civics, and culture',
      credits: 3,
      schoolId: schoolId
    },
    {
      name: 'Physical Education',
      code: 'PE',
      description: 'Physical fitness, sports, and health education',
      credits: 2,
      schoolId: schoolId
    },
    {
      name: 'Art',
      code: 'ART',
      description: 'Visual arts, crafts, and creative expression',
      credits: 2,
      schoolId: schoolId
    },
    {
      name: 'Music',
      code: 'MUS',
      description: 'Vocal and instrumental music education',
      credits: 2,
      schoolId: schoolId
    },
    {
      name: 'Computer Science',
      code: 'CS',
      description: 'Programming, digital literacy, and technology',
      credits: 2,
      schoolId: schoolId
    },
    {
      name: 'Foreign Language (Spanish)',
      code: 'SPAN',
      description: 'Spanish language acquisition and culture',
      credits: 3,
      schoolId: schoolId
    },
    {
      name: 'Library Skills',
      code: 'LIB',
      description: 'Research skills, information literacy, and reading',
      credits: 1,
      schoolId: schoolId
    }
  ];

  const subjects = [];
  for (const subjectData of subjectsData) {
    const subject = await prisma.subject.create({
      data: subjectData
    });
    subjects.push(subject);
  }

  return subjects;
}

async function createTeachers(schoolId, users) {
  const teacherUsers = users.filter(user => user.role === 'TEACHER');
  
  const teachersData = [
    {
      employeeId: 'T001',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'MALE',
      phone: '+1-555-0101',
      streetAddress: '456 Teacher Lane',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      qualification: 'M.Ed. Mathematics',
      experience: 8,
      joiningDate: new Date('2018-08-15'),
      salary: 65000.00,
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: teacherUsers[0].id
    },
    {
      employeeId: 'T002',
      firstName: 'Mary',
      lastName: 'Wilson',
      dateOfBirth: new Date('1987-07-22'),
      gender: 'FEMALE',
      phone: '+1-555-0102',
      streetAddress: '789 Education Street',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      qualification: 'M.A. English Literature',
      experience: 6,
      joiningDate: new Date('2020-01-10'),
      salary: 62000.00,
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: teacherUsers[1].id
    },
    {
      employeeId: 'T003',
      firstName: 'David',
      lastName: 'Garcia',
      dateOfBirth: new Date('1983-11-08'),
      gender: 'MALE',
      phone: '+1-555-0103',
      streetAddress: '321 Science Avenue',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      qualification: 'M.S. Biology',
      experience: 10,
      joiningDate: new Date('2016-09-01'),
      salary: 68000.00,
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: teacherUsers[2].id
    }
  ];

  const teachers = [];
  for (const teacherData of teachersData) {
    const teacher = await prisma.teacher.create({
      data: teacherData
    });
    teachers.push(teacher);
  }

  return teachers;
}

async function createStudents(schoolId, users, classes, houses, academicYearId) {
  const studentUsers = users.filter(user => user.role === 'STUDENT');
  
  const studentsData = [
    {
      admissionNumber: 'STU2024001',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('2012-04-10'),
      gender: 'FEMALE',
      email: 'jane.smith@greenwood.com',
      phone: '+1-555-0201',
      streetAddress: '123 Student Road',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      admissionDate: new Date('2024-09-01'),
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: studentUsers[0].id,
      currentClassId: classes[5].id, // Grade 6A
      academicYearId: academicYearId,
      houseId: houses[0].id // Phoenix House
    },
    {
      admissionNumber: 'STU2024002',
      firstName: 'Alex',
      lastName: 'Johnson',
      dateOfBirth: new Date('2013-08-15'),
      gender: 'MALE',
      email: 'alex.johnson@greenwood.com',
      phone: '+1-555-0202',
      streetAddress: '456 Learning Lane',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      admissionDate: new Date('2024-09-01'),
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: studentUsers[1].id,
      currentClassId: classes[4].id, // Grade 5A
      academicYearId: academicYearId,
      houseId: houses[1].id // Dragon House
    },
    {
      admissionNumber: 'STU2024003',
      firstName: 'Emma',
      lastName: 'Davis',
      dateOfBirth: new Date('2011-12-03'),
      gender: 'FEMALE',
      email: 'emma.davis@greenwood.com',
      phone: '+1-555-0203',
      streetAddress: '789 Academy Street',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      admissionDate: new Date('2024-09-01'),
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: studentUsers[2].id,
      currentClassId: classes[6].id, // Grade 7A
      academicYearId: academicYearId,
      houseId: houses[2].id // Eagle House
    }
  ];

  const students = [];
  for (const studentData of studentsData) {
    const student = await prisma.student.create({
      data: studentData
    });
    students.push(student);
    
    // Create student class history record
    await prisma.studentClassHistory.create({
      data: {
        studentId: student.id,
        classId: student.currentClassId,
        schoolId: schoolId,
        academicYearId: academicYearId,
        startDate: new Date('2024-09-01'),
        status: 'active'
      }
    });
  }

  return students;
}

async function createClassSubjectHistory(schoolId, classes, subjects, teachers, academicYearId) {
  // Assign core subjects to all classes and specific subjects to appropriate grades
  const coreSubjects = subjects.filter(s => ['MATH', 'ELA', 'SCI', 'SS', 'PE'].includes(s.code));
  const electiveSubjects = subjects.filter(s => !['MATH', 'ELA', 'SCI', 'SS', 'PE'].includes(s.code));

  for (const cls of classes) {
    const grade = parseInt(cls.grade);
    
    // Assign core subjects to all classes
    for (const subject of coreSubjects) {
      await prisma.classSubjectHistory.create({
        data: {
          classId: cls.id,
          subjectId: subject.id,
          academicYearId: academicYearId,
          schoolId: schoolId,
          isCore: true,
          isOptional: false,
          credits: subject.credits,
          hoursPerWeek: subject.code === 'MATH' || subject.code === 'ELA' ? 5 : 
                       subject.code === 'SCI' || subject.code === 'SS' ? 4 : 3,
          teacherId: teachers[grade <= 3 ? 0 : grade <= 6 ? 1 : 2].id, // Assign teachers by grade level
          status: 'ACTIVE',
          startDate: new Date('2024-09-01')
        }
      });
    }

    // Assign elective subjects based on grade level
    if (grade >= 3) {
      const artMusic = electiveSubjects.filter(s => ['ART', 'MUS'].includes(s.code));
      for (const subject of artMusic) {
        await prisma.classSubjectHistory.create({
          data: {
            classId: cls.id,
            subjectId: subject.id,
            academicYearId: academicYearId,
            schoolId: schoolId,
            isCore: false,
            isOptional: true,
            credits: subject.credits,
            hoursPerWeek: 2,
            teacherId: teachers[1].id, // Mary Wilson for arts subjects
            status: 'ACTIVE',
            startDate: new Date('2024-09-01')
          }
        });
      }
    }

    // Computer Science and Foreign Language for higher grades
    if (grade >= 5) {
      const advancedSubjects = electiveSubjects.filter(s => ['CS', 'SPAN'].includes(s.code));
      for (const subject of advancedSubjects) {
        await prisma.classSubjectHistory.create({
          data: {
            classId: cls.id,
            subjectId: subject.id,
            academicYearId: academicYearId,
            schoolId: schoolId,
            isCore: false,
            isOptional: true,
            credits: subject.credits,
            hoursPerWeek: 3,
            teacherId: teachers[2].id, // David Garcia for advanced subjects
            status: 'ACTIVE',
            startDate: new Date('2024-09-01')
          }
        });
      }
    }
  }
}

async function createClassTeachers(schoolId, teachers, classes, academicYearId) {
  // Assign class teachers to different grade levels
  const assignments = [
    { teacher: teachers[0], classes: classes.slice(0, 3), canManage: true }, // John Doe - Grades 1-3
    { teacher: teachers[1], classes: classes.slice(3, 6), canManage: true }, // Mary Wilson - Grades 4-6
    { teacher: teachers[2], classes: classes.slice(6, 8), canManage: true }  // David Garcia - Grades 7-8
  ];

  for (const assignment of assignments) {
    for (const cls of assignment.classes) {
      await prisma.classTeacher.create({
        data: {
          teacherId: assignment.teacher.id,
          classId: cls.id,
          schoolId: schoolId,
          academicYearId: academicYearId,
          isClassTeacher: true,
          isSubjectTeacher: false,
          subjects: [],
          assignedDate: new Date('2024-08-15'),
          startDate: new Date('2024-09-01'),
          status: 'ACTIVE',
          canMarkAttendance: true,
          canGradeAssignments: true,
          canManageClassroom: assignment.canManage,
          notes: `Assigned as class teacher for ${cls.name}`
        }
      });
    }
  }
}

async function createGuardians(schoolId, students) {
  const parentUsers = await prisma.user.findMany({
    where: {
      schoolId: schoolId,
      role: 'PARENT'
    }
  });

  const guardiansData = [
    {
      firstName: 'Robert',
      lastName: 'Smith',
      title: 'Mr.',
      gender: 'MALE',
      email: 'robert.smith@greenwood.com',
      phone: '+1-555-0301',
      alternativePhone: '+1-555-0302',
      streetAddress: '123 Student Road',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      occupation: 'Software Engineer',
      employer: 'Tech Solutions Inc.',
      schoolId: schoolId,
      userId: parentUsers[0].id,
      status: 'ACTIVE'
    },
    {
      firstName: 'Linda',
      lastName: 'Johnson',
      title: 'Mrs.',
      gender: 'FEMALE',
      email: 'linda.johnson@greenwood.com',
      phone: '+1-555-0311',
      alternativePhone: '+1-555-0312',
      streetAddress: '456 Learning Lane',
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      occupation: 'Marketing Manager',
      employer: 'Global Marketing Corp.',
      schoolId: schoolId,
      userId: parentUsers[1].id,
      status: 'ACTIVE'
    }
  ];

  const guardians = [];
  for (const guardianData of guardiansData) {
    const guardian = await prisma.guardian.create({
      data: guardianData
    });
    guardians.push(guardian);
  }

  // Create guardian-student relationships
  await prisma.guardianStudent.createMany({
    data: [
      {
        guardianId: guardians[0].id,
        studentId: students[0].id, // Jane Smith
        relationship: 'FATHER',
        isPrimary: true,
        emergencyContact: true,
        authorizedPickup: true,
        financialResponsibility: true,
        academicReportsAccess: true,
        disciplinaryReportsAccess: true,
        medicalInfoAccess: true
      },
      {
        guardianId: guardians[1].id,
        studentId: students[1].id, // Alex Johnson
        relationship: 'MOTHER',
        isPrimary: true,
        emergencyContact: true,
        authorizedPickup: true,
        financialResponsibility: true,
        academicReportsAccess: true,
        disciplinaryReportsAccess: true,
        medicalInfoAccess: true
      }
    ]
  });

  return guardians;
}

async function createSampleCurriculum(schoolId, subjects, createdById) {
  const curriculum = await prisma.curriculum.create({
    data: {
      name: 'Greenwood International Primary Curriculum',
      description: 'Comprehensive curriculum for primary education at Greenwood International School',
      version: '2024.1',
      type: 'STANDARD',
      status: 'ACTIVE',
      schoolId: schoolId,
      implementationStatus: 'IN_PROGRESS',
      adoptionDate: new Date('2024-09-01'),
      startYear: 2024,
      endYear: 2025,
      createdBy: createdById
    }
  });

  // Add core subjects to the curriculum
  const coreSubjects = subjects.filter(s => ['MATH', 'ELA', 'SCI', 'SS', 'PE'].includes(s.code));
  
  for (let i = 0; i < coreSubjects.length; i++) {
    const subject = coreSubjects[i];
    await prisma.curriculumSubject.create({
      data: {
        curriculumId: curriculum.id,
        subjectId: subject.id,
        gradeLevel: 1, // Base grade level - can be customized per class
        hoursPerWeek: subject.code === 'MATH' || subject.code === 'ELA' ? 5 : 
                     subject.code === 'SCI' || subject.code === 'SS' ? 4 : 3,
        isCore: true,
        isOptional: false,
        displayOrder: i + 1
      }
    });
  }

  return curriculum;
}

async function createGlobalCurricula() {
  // Sample Global Curricula Data (similar to original seed.js but shorter)
  const globalCurriculaData = [
    {
      name: "Cambridge International Primary Programme",
      description: "A comprehensive primary education curriculum framework designed for learners aged 5-11 years.",
      version: "2023.1",
      type: "CAMBRIDGE",
      provider: "Cambridge Assessment International Education",
      country: "United Kingdom",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "INSTITUTIONAL",
      adoptionCount: 245,
      tags: ["primary", "international", "cambridge", "inquiry-based"],
      difficulty: "STANDARD"
    },
    {
      name: "International Baccalaureate Primary Years Programme",
      description: "The PYP is designed for students aged 3-12. It focuses on the development of the whole child.",
      version: "2018",
      type: "IB",
      provider: "International Baccalaureate Organization",
      country: "Switzerland",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "INSTITUTIONAL",
      adoptionCount: 189,
      tags: ["primary", "international", "ib", "transdisciplinary"],
      difficulty: "ADVANCED"
    }
  ];

  for (const curriculumData of globalCurriculaData) {
    const curriculum = await prisma.globalCurriculum.create({
      data: curriculumData
    });
    
    // Add sample subjects for each global curriculum
    await createGlobalCurriculumSubjects(curriculum.id, curriculum.type);
  }
}

async function createGlobalCurriculumSubjects(curriculumId, type) {
  let subjects = [];
  
  if (type === 'CAMBRIDGE') {
    subjects = [
      { name: "English", code: "ENG", description: "Cambridge Primary English", gradeLevel: 1, category: "Languages", recommendedHours: 6, isCore: true },
      { name: "Mathematics", code: "MAT", description: "Cambridge Primary Mathematics", gradeLevel: 1, category: "Mathematics", recommendedHours: 5, isCore: true },
      { name: "Science", code: "SCI", description: "Cambridge Primary Science", gradeLevel: 1, category: "Sciences", recommendedHours: 4, isCore: true }
    ];
  } else if (type === 'IB') {
    subjects = [
      { name: "Language Arts", code: "LA", description: "IB PYP Language Arts", gradeLevel: 1, category: "Languages", recommendedHours: 6, isCore: true },
      { name: "Mathematics", code: "MAT", description: "IB PYP Mathematics", gradeLevel: 1, category: "Mathematics", recommendedHours: 5, isCore: true },
      { name: "Science", code: "SCI", description: "IB PYP Science & Technology", gradeLevel: 1, category: "Sciences", recommendedHours: 4, isCore: true }
    ];
  }

  for (const subject of subjects) {
    await prisma.globalCurriculumSubject.create({
      data: {
        ...subject,
        globalCurriculumId: curriculumId
      }
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });