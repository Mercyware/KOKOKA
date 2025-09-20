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
  const academicCalendars = await createAcademicCalendar(school.id, academicYear.id);

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

  // 9. Create Assessments - TEMPORARILY DISABLED DUE TO SCHEMA COMPLEXITY
  // console.log('📝 Creating assessments...');
  // const assessments = await createAssessments(school.id, subjects, academicCalendars);
  const assessments = []; // Placeholder for now

  // 10. Create Staff (including teachers)
  console.log('👨‍🏫 Creating staff...');
  const staff = await createStaff(school.id, users);

    // 10. Create Students
  console.log('👨‍🎓 Creating students...');
  const students = await createStudents(school.id, users, classes, houses, academicYear.id, sections);

  // 11. Create Class-Subject History - TEMPORARILY DISABLED
  // console.log('📋 Creating class-subject history...');
  // await createClassSubjectHistory(school.id, classes, subjects, staff, academicYear.id);

  // 12. Create Class Teachers - TEMPORARILY DISABLED
  // console.log('👨‍🏫 Creating class teacher assignments...');
  // await createClassTeachers(school.id, staff, classes, academicYear.id);

  // 13. Create Sample Assessment for Testing - TEMPORARILY DISABLED
  // console.log('📝 Creating sample assessment for testing...');
  // await createSampleAssessment(school.id, classes[0], subjects[0], academicYear.id, academicCalendars[0], staff[0]);

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
- Assessments: ${assessments.length}
- Staff: ${staff.length}
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
  try {
    // Clear data in reverse dependency order (most dependent first)
    console.log('🧹 Clearing existing data...');
    
    // Delete in dependency order (most dependent first)
    await prisma.grade.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.classTeacher.deleteMany();
    await prisma.classSubjectHistory.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.student.deleteMany();
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
  } catch (error) {
    console.log('Some tables may not exist, continuing with seeding...');
  }
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

  // Return the created calendars
  return await prisma.academicCalendar.findMany({
    where: { schoolId }
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
    // Additional students for load testing
    { email: 'michael.brown@greenwood.com', passwordHash: passwordHash, name: 'Michael Brown', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'sarah.wilson@greenwood.com', passwordHash: passwordHash, name: 'Sarah Wilson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'david.martinez@greenwood.com', passwordHash: passwordHash, name: 'David Martinez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'olivia.garcia@greenwood.com', passwordHash: passwordHash, name: 'Olivia Garcia', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'james.anderson@greenwood.com', passwordHash: passwordHash, name: 'James Anderson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'sophia.taylor@greenwood.com', passwordHash: passwordHash, name: 'Sophia Taylor', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'benjamin.thomas@greenwood.com', passwordHash: passwordHash, name: 'Benjamin Thomas', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'isabella.jackson@greenwood.com', passwordHash: passwordHash, name: 'Isabella Jackson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'matthew.white@greenwood.com', passwordHash: passwordHash, name: 'Matthew White', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'ava.harris@greenwood.com', passwordHash: passwordHash, name: 'Ava Harris', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'ethan.clark@greenwood.com', passwordHash: passwordHash, name: 'Ethan Clark', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'mia.lewis@greenwood.com', passwordHash: passwordHash, name: 'Mia Lewis', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'alexander.robinson@greenwood.com', passwordHash: passwordHash, name: 'Alexander Robinson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'charlotte.walker@greenwood.com', passwordHash: passwordHash, name: 'Charlotte Walker', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'daniel.perez@greenwood.com', passwordHash: passwordHash, name: 'Daniel Perez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'amelia.hall@greenwood.com', passwordHash: passwordHash, name: 'Amelia Hall', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'william.young@greenwood.com', passwordHash: passwordHash, name: 'William Young', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'harper.allen@greenwood.com', passwordHash: passwordHash, name: 'Harper Allen', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'henry.sanchez@greenwood.com', passwordHash: passwordHash, name: 'Henry Sanchez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'evelyn.wright@greenwood.com', passwordHash: passwordHash, name: 'Evelyn Wright', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'sebastian.lopez@greenwood.com', passwordHash: passwordHash, name: 'Sebastian Lopez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'abigail.hill@greenwood.com', passwordHash: passwordHash, name: 'Abigail Hill', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'jackson.scott@greenwood.com', passwordHash: passwordHash, name: 'Jackson Scott', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'emily.green@greenwood.com', passwordHash: passwordHash, name: 'Emily Green', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'owen.adams@greenwood.com', passwordHash: passwordHash, name: 'Owen Adams', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'ella.baker@greenwood.com', passwordHash: passwordHash, name: 'Ella Baker', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'lucas.gonzalez@greenwood.com', passwordHash: passwordHash, name: 'Lucas Gonzalez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'avery.nelson@greenwood.com', passwordHash: passwordHash, name: 'Avery Nelson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'carter.carter@greenwood.com', passwordHash: passwordHash, name: 'Carter Carter', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'scarlett.mitchell@greenwood.com', passwordHash: passwordHash, name: 'Scarlett Mitchell', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'wyatt.perez@greenwood.com', passwordHash: passwordHash, name: 'Wyatt Perez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'madison.roberts@greenwood.com', passwordHash: passwordHash, name: 'Madison Roberts', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'jack.turner@greenwood.com', passwordHash: passwordHash, name: 'Jack Turner', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'layla.phillips@greenwood.com', passwordHash: passwordHash, name: 'Layla Phillips', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'jacob.campbell@greenwood.com', passwordHash: passwordHash, name: 'Jacob Campbell', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'grace.parker@greenwood.com', passwordHash: passwordHash, name: 'Grace Parker', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'mason.evans@greenwood.com', passwordHash: passwordHash, name: 'Mason Evans', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'chloe.edwards@greenwood.com', passwordHash: passwordHash, name: 'Chloe Edwards', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'noah.collins@greenwood.com', passwordHash: passwordHash, name: 'Noah Collins', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'lily.stewart@greenwood.com', passwordHash: passwordHash, name: 'Lily Stewart', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'elijah.sanchez@greenwood.com', passwordHash: passwordHash, name: 'Elijah Sanchez', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'zoe.morris@greenwood.com', passwordHash: passwordHash, name: 'Zoe Morris', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'luke.rogers@greenwood.com', passwordHash: passwordHash, name: 'Luke Rogers', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'nora.reed@greenwood.com', passwordHash: passwordHash, name: 'Nora Reed', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'levi.cook@greenwood.com', passwordHash: passwordHash, name: 'Levi Cook', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'hazel.morgan@greenwood.com', passwordHash: passwordHash, name: 'Hazel Morgan', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'oliver.bailey@greenwood.com', passwordHash: passwordHash, name: 'Oliver Bailey', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'violet.rivera@greenwood.com', passwordHash: passwordHash, name: 'Violet Rivera', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'asher.cooper@greenwood.com', passwordHash: passwordHash, name: 'Asher Cooper', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'aurora.richardson@greenwood.com', passwordHash: passwordHash, name: 'Aurora Richardson', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'grayson.cox@greenwood.com', passwordHash: passwordHash, name: 'Grayson Cox', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
    { email: 'savannah.ward@greenwood.com', passwordHash: passwordHash, name: 'Savannah Ward', role: 'STUDENT', isActive: true, emailVerified: true, schoolId: schoolId },
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

async function createAssessments(schoolId, subjects, academicCalendars) {
  const assessmentTypes = ['ASSIGNMENT', 'QUIZ', 'EXAM', 'TEST'];
  const assessmentData = [];

  // Create assessments for each subject in each academic calendar
  for (const calendar of academicCalendars) {
    for (const subject of subjects) {
      // Create different types of assessments
      const assessments = [
        {
          title: `${subject.name} Assignment 1`,
          description: `First assignment for ${subject.name} in ${calendar.term} term`,
          type: 'ASSIGNMENT',
          totalMarks: 50,
          passingMarks: 30,
          dueDate: new Date(calendar.startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after start
          subjectId: subject.id,
          academicCalendarId: calendar.id,
          schoolId: schoolId,
          status: 'PUBLISHED',
          instructions: `Complete all exercises in Chapter 1-3 of your ${subject.name} textbook.`
        },
        {
          title: `${subject.name} Quiz 1`,
          description: `First quiz for ${subject.name} in ${calendar.term} term`,
          type: 'QUIZ',
          totalMarks: 25,
          passingMarks: 15,
          dueDate: new Date(calendar.startDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks after start
          subjectId: subject.id,
          academicCalendarId: calendar.id,
          schoolId: schoolId,
          status: 'PUBLISHED',
          instructions: `30-minute quiz covering basic concepts from the first three weeks.`
        },
        {
          title: `${subject.name} Mid-Term Exam`,
          description: `Mid-term examination for ${subject.name} in ${calendar.term} term`,
          type: 'EXAM',
          totalMarks: 100,
          passingMarks: 60,
          dueDate: new Date((calendar.startDate.getTime() + calendar.endDate.getTime()) / 2), // Mid-term
          subjectId: subject.id,
          academicCalendarId: calendar.id,
          schoolId: schoolId,
          status: 'PUBLISHED',
          instructions: `Comprehensive exam covering all topics taught in the first half of the term.`
        }
      ];

      assessmentData.push(...assessments);
    }
  }

  await prisma.assessment.createMany({
    data: assessmentData
  });

  return await prisma.assessment.findMany({
    where: { schoolId },
    include: {
      subject: true,
      academicCalendar: true
    }
  });
}

async function createStaff(schoolId, users) {
  const teacherUsers = users.filter(user => user.role === 'TEACHER');
  
  const staffData = [
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
      position: 'Mathematics Teacher',
      qualification: 'M.Ed. Mathematics',
      experience: 8,
      joiningDate: new Date('2018-08-15'),
      salary: 65000.00,
      status: 'ACTIVE',
      staffType: 'TEACHER',
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
      position: 'English Teacher',
      qualification: 'M.A. English Literature',
      experience: 6,
      joiningDate: new Date('2020-01-10'),
      salary: 62000.00,
      status: 'ACTIVE',
      staffType: 'TEACHER',
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
      position: 'Biology Teacher',
      qualification: 'M.S. Biology',
      experience: 10,
      joiningDate: new Date('2016-09-01'),
      salary: 68000.00,
      status: 'ACTIVE',
      staffType: 'TEACHER',
      schoolId: schoolId,
      userId: teacherUsers[2].id
    }
  ];

  const staff = [];
  for (const staffMember of staffData) {
    const staffRecord = await prisma.staff.create({
      data: staffMember
    });
    staff.push(staffRecord);
  }

  return staff;
}

async function createStudents(schoolId, users, classes, houses, academicYearId, sections) {
  const studentUsers = users.filter(user => user.role === 'STUDENT');
  
  // Sample data for comprehensive student information
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
  const nationalities = ['American', 'Canadian', 'British', 'Indian', 'Chinese', 'Mexican', 'German', 'French'];
  const religions = ['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Other', 'None'];
  const languages = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic', 'German'];
  const allergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Shellfish', 'Fish'];
  const medicalConditions = ['Asthma', 'Diabetes Type 1', 'ADHD', 'Autism Spectrum', 'Epilepsy', 'Food Allergies'];
  const talents = ['Music', 'Art', 'Sports', 'Mathematics', 'Writing', 'Dancing', 'Public Speaking', 'Technology'];
  const extracurriculars = ['Soccer', 'Basketball', 'Piano', 'Guitar', 'Chess', 'Debate', 'Art Club', 'Science Club'];
  const previousSchools = ['Springfield Elementary', 'Riverside Primary', 'Oak Hill School', 'Maple Grove Academy'];
  
  // Generate student data for all student users
  const studentsData = studentUsers.map((studentUser, index) => {
    const names = studentUser.name.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');
    
    // Distribute students across different classes, houses, and sections
    const classIndex = index % classes.length;
    const houseIndex = index % houses.length;
    const sectionIndex = index % sections.length;
    
    // Generate different birth years (2010-2014 for grades 1-8)
    const birthYear = 2010 + (index % 5);
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    
    // Determine gender from common first names
    const maleNames = ['Michael', 'David', 'James', 'Benjamin', 'Matthew', 'Ethan', 'Alexander', 'Daniel', 'William', 'Henry', 'Sebastian', 'Jackson', 'Owen', 'Lucas', 'Carter', 'Wyatt', 'Jack', 'Jacob', 'Mason', 'Noah', 'Elijah', 'Luke', 'Levi', 'Oliver', 'Asher', 'Grayson'];
    const gender = maleNames.includes(firstName) ? 'MALE' : 'FEMALE';
    
    // Generate comprehensive student data
    const studentAllergies = Math.random() > 0.7 ? [allergies[Math.floor(Math.random() * allergies.length)]] : [];
    const studentMedicalConditions = Math.random() > 0.9 ? [medicalConditions[Math.floor(Math.random() * medicalConditions.length)]] : [];
    const studentTalents = [talents[Math.floor(Math.random() * talents.length)], talents[Math.floor(Math.random() * talents.length)]].filter((v, i, a) => a.indexOf(v) === i);
    const studentExtracurriculars = [extracurriculars[Math.floor(Math.random() * extracurriculars.length)]];
    const studentLanguages = ['English', languages[Math.floor(Math.random() * languages.length)]].filter((v, i, a) => a.indexOf(v) === i);
    
    return {
      // Basic Information
      admissionNumber: `STU2024${String(index + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      dateOfBirth: new Date(birthYear, birthMonth - 1, birthDay),
      gender,
      email: studentUser.email,
      phone: `+1-555-${String(200 + index).padStart(4, '0')}`,
      
      // Address Information
      streetAddress: `${100 + index} Student Street`,
      city: 'Springfield',
      state: 'California',
      zipCode: '90210',
      country: 'United States',
      
      // Permanent Address (some different, some same)
      permanentStreetAddress: Math.random() > 0.3 ? `${100 + index} Student Street` : `${200 + index} Permanent Ave`,
      permanentCity: Math.random() > 0.3 ? 'Springfield' : 'Los Angeles',
      permanentState: 'California',
      permanentZipCode: Math.random() > 0.3 ? '90210' : '90211',
      permanentCountry: 'United States',
      
      // Additional Personal Information
      placeOfBirth: Math.random() > 0.5 ? 'Springfield, CA' : 'Los Angeles, CA',
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      religion: religions[Math.floor(Math.random() * religions.length)],
      bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
      motherTongue: languages[Math.floor(Math.random() * languages.length)],
      previousSchool: Math.random() > 0.2 ? previousSchools[Math.floor(Math.random() * previousSchools.length)] : null,
      previousClass: Math.random() > 0.2 ? `Grade ${Math.floor(Math.random() * 5) + 1}` : null,
      
      // Medical Information
      medicalInfo: {
        height: `${120 + Math.floor(Math.random() * 40)}cm`,
        weight: `${25 + Math.floor(Math.random() * 25)}kg`,
        lastCheckup: '2024-08-15',
        generalHealth: 'Good'
      },
      allergies: studentAllergies,
      medicalConditions: studentMedicalConditions,
      immunizations: {
        MMR: true,
        DPT: true,
        Polio: true,
        Hepatitis: true,
        lastUpdated: '2024-01-15'
      },
      emergencyMedicalInfo: studentMedicalConditions.length > 0 ? `Has ${studentMedicalConditions.join(', ')}` : null,
      doctorName: `Dr. ${['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'][Math.floor(Math.random() * 5)]}`,
      doctorPhone: `+1-555-${String(300 + index).padStart(4, '0')}`,
      hospitalPreference: ['Springfield General', 'City Medical Center', 'Regional Hospital'][Math.floor(Math.random() * 3)],
      
      // Emergency Contacts
      emergencyContacts: [
        {
          name: `Emergency Contact ${index + 1}`,
          relationship: 'Family Friend',
          phone: `+1-555-${String(400 + index).padStart(4, '0')}`,
          address: `${300 + index} Emergency St, Springfield, CA`
        }
      ],
      
      // Academic Background
      previousAcademicRecord: {
        previousGrade: Math.random() > 0.2 ? `Grade ${Math.floor(Math.random() * 5) + 1}` : null,
        performance: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
        subjects: ['Math', 'English', 'Science', 'Social Studies']
      },
      specialNeeds: Math.random() > 0.95 ? 'Requires additional learning support' : null,
      talents: studentTalents,
      extracurriculars: studentExtracurriculars,
      
      // Administrative Information
      applicationDate: new Date('2024-07-15'),
      interviewDate: new Date('2024-08-01'),
      admissionTestScore: Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 60 : null, // 60-100
      feesPaid: Math.floor(Math.random() * 5000) + 1000, // $1000-$6000
      scholarshipInfo: Math.random() > 0.8 ? { type: 'Merit Scholarship', amount: 1000, percentage: 25 } : null,
      transportInfo: {
        mode: ['Bus', 'Car', 'Walk'][Math.floor(Math.random() * 3)],
        busRoute: Math.random() > 0.5 ? `Route ${Math.floor(Math.random() * 10) + 1}` : null
      },
      
      // Behavioral and Social Information
      behavioralNotes: Math.random() > 0.8 ? 'Excellent behavior and attitude' : null,
      socialBackground: 'Middle class family background',
      languagesSpoken: studentLanguages,
      
      // Documents and Identification
      identificationDocs: {
        birthCertificate: true,
        passport: Math.random() > 0.5,
        ssn: true,
        medicalRecords: true
      },
      photographs: {
        passport: true,
        school: true,
        family: Math.random() > 0.5
      },
      documentsSubmitted: ['Birth Certificate', 'Medical Records', 'Previous School Records', 'Passport Photos'],
      
      // Core fields
      admissionDate: new Date('2024-09-01'),
      status: 'ACTIVE',
      schoolId: schoolId,
      userId: studentUser.id,
      currentClassId: classes[classIndex].id,
      currentSectionId: sections[sectionIndex].id,
      academicYearId: academicYearId,
      houseId: houses[houseIndex].id
    };
  });

  const students = [];
  for (const studentData of studentsData) {
    const student = await prisma.student.create({
      data: studentData
    });
    students.push(student);
    
    // Create student class history record with section
    await prisma.studentClassHistory.create({
      data: {
        studentId: student.id,
        classId: student.currentClassId,
        sectionId: student.currentSectionId,
        schoolId: schoolId,
        academicYearId: academicYearId,
        startDate: new Date('2024-09-01'),
        status: 'ACTIVE'
      }
    });
  }

  return students;
}

async function createClassSubjectHistory(schoolId, classes, subjects, staff, academicYearId) {
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
          staffId: staff[grade <= 3 ? 0 : grade <= 6 ? 1 : 2].id, // Assign staff by grade level
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
            staffId: staff[1].id, // Mary Wilson for arts subjects
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
            staffId: staff[2].id, // David Garcia for advanced subjects
            status: 'ACTIVE',
            startDate: new Date('2024-09-01')
          }
        });
      }
    }
  }
}

async function createClassTeachers(schoolId, staff, classes, academicYearId) {
  // Assign class teachers to different grade levels
  const assignments = [
    { staff: staff[0], classes: classes.slice(0, 3), canManage: true }, // John Doe - Grades 1-3
    { staff: staff[1], classes: classes.slice(3, 6), canManage: true }, // Mary Wilson - Grades 4-6
    { staff: staff[2], classes: classes.slice(6, 8), canManage: true }  // David Garcia - Grades 7-8
  ];

  for (const assignment of assignments) {
    for (const cls of assignment.classes) {
      await prisma.classTeacher.create({
        data: {
          staffId: assignment.staff.id,
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
    const curriculum = await prisma.globalCurriculum.upsert({
      where: { name: curriculumData.name },
      update: curriculumData,
      create: curriculumData
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
    await prisma.globalCurriculumSubject.upsert({
      where: {
        globalCurriculumId_code_gradeLevel: {
          globalCurriculumId: curriculumId,
          code: subject.code,
          gradeLevel: subject.gradeLevel
        }
      },
      update: {
        ...subject,
        globalCurriculumId: curriculumId
      },
      create: {
        ...subject,
        globalCurriculumId: curriculumId
      }
    });
  }
}

async function createSampleAssessment(schoolId, targetClass, subject, academicYearId, term, teacher) {
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
      schoolId,
      classId: targetClass.id,
      subjectId: subject.id,
      academicYearId,
      termId: term.id,
      teacherId: teacher.id,
      instructions: 'Answer all questions. Show your work for full credit.',
      rubricData: null,
      allowLateSubmission: true,
      lateSubmissionPenalty: 10
    }
  });

  console.log(`✅ Created sample assessment: ${assessment.title} for ${targetClass.name} - ${subject.name}`);
  return assessment;
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });