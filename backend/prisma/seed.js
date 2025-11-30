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

  // 9. Create Grade Scales
  console.log('📊 Creating grade scales...');
  const gradeScales = await createGradeScales(school.id);

  // 10. Create Assessments - TEMPORARILY DISABLED DUE TO SCHEMA COMPLEXITY
  // console.log('📝 Creating assessments...');
  // const assessments = await createAssessments(school.id, subjects, academicCalendars);
  const assessments = []; // Placeholder for now

  // 11. Create Staff (including teachers)
  console.log('👨‍🏫 Creating staff...');
  const staff = await createStaff(school.id, users);

  // 12. Create Students
  console.log('👨‍🎓 Creating students...');
  const students = await createStudents(school.id, users, classes, houses, academicYear.id, sections);

  // 13. Create Class-Subject History - TEMPORARILY DISABLED
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

  // 16. Create Subject Assignments
  console.log('📋 Creating subject assignments...');
  const subjectAssignments = await createSubjectAssignments(school.id, staff, subjects, classes, sections, academicYear.id);

  // 17. Create Library Books
  console.log('📚 Creating library books...');
  const books = await createLibraryBooks(school.id, subjects);

  // 18. Create Book Issues
  console.log('📖 Creating book issues...');
  const bookIssues = await createBookIssues(school.id, books, students, users);

  // 19. Create Hostels
  console.log('🏠 Creating hostels...');
  const hostels = await createHostels(school.id, staff);

  // 20. Create Hostel Rooms
  console.log('🚪 Creating hostel rooms...');
  const rooms = await createHostelRooms(school.id, hostels);

  // 21. Create Hostel Allocations
  console.log('🛏️ Creating hostel allocations...');
  const allocations = await createHostelAllocations(school.id, hostels, rooms, students, academicYear.id);

  // 22. Create Hostel Fees
  console.log('💰 Creating hostel fees...');
  const hostelFees = await createHostelFees(school.id, hostels, academicYear.id);

  // 23. Create Message Threads and Messages
  console.log('💬 Creating message threads and messages...');
  const { threads, messages } = await createMessaging(school.id, users, classes, students);

  // 24. Create Transport Routes
  console.log('🚌 Creating transport routes...');
  const routes = await createTransportRoutes(school.id);

  // 25. Create Vehicles
  console.log('🚐 Creating vehicles...');
  const vehicles = await createVehicles(school.id);

  // 26. Create Route-Vehicle Assignments
  console.log('🗺️  Creating route-vehicle assignments...');
  const routeVehicleAssignments = await createRouteVehicleAssignments(routes, vehicles);

  // 27. Create Student Transport Assignments
  console.log('🎒 Creating student transport assignments...');
  const studentTransportAssignments = await createStudentTransportAssignments(school.id, routes, vehicles, students, academicYear.id);

  // 28. Create Vehicle Maintenance Records
  console.log('🔧 Creating vehicle maintenance records...');
  const maintenanceRecords = await createVehicleMaintenance(vehicles);

  // 29. Create Inventory Categories
  console.log('📦 Creating inventory categories...');
  const inventoryCategories = await createInventoryCategories(school.id);

  // 30. Create Inventory Items
  console.log('📋 Creating inventory items...');
  const inventoryItems = await createInventoryItems(school.id, inventoryCategories);

  // 31. Create Inventory Transactions
  console.log('💱 Creating inventory transactions...');
  const inventoryTransactions = await createInventoryTransactions(school.id, inventoryItems, users[0].id);

  // 32. Create Inventory Allocations
  console.log('🏷️  Creating inventory allocations...');
  const inventoryAllocations = await createInventoryAllocations(school.id, inventoryItems, students, staff, users[0].id);

  // 33. Create Attendance Records
  console.log('📅 Creating attendance records...');
  const attendanceRecords = await createAttendanceRecords(school.id, students, classes, staff, academicYear.id);

  // 34. Create Notifications
  console.log('🔔 Creating notifications...');
  const notifications = await createNotifications(school.id, users, students, classes);

  // 34. Create Results (Report Cards)
  console.log('📝 Creating student results...');
  // Fetch terms first
  const terms = await prisma.term.findMany({ where: { schoolId: school.id } });
  if (terms.length > 0) {
    const results = await createResults(school.id, students, classes, subjects, terms[0], gradeScales[0]);
  }

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
- Subject Assignments: ${subjectAssignments.length}
- Library Books: ${books.length}
- Book Issues: ${bookIssues.length}
- Hostels: ${hostels.length}
- Hostel Rooms: ${rooms.length}
- Hostel Allocations: ${allocations.length}
- Hostel Fees: ${hostelFees.length}
- Message Threads: ${threads.length}
- Messages: ${messages.length}
- Transport Routes: ${routes.length}
- Vehicles: ${vehicles.length}
- Route-Vehicle Assignments: ${routeVehicleAssignments.length}
- Student Transport Assignments: ${studentTransportAssignments.length}
- Maintenance Records: ${maintenanceRecords.length}
- Notifications: ${notifications.length}

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
    await prisma.attendance.deleteMany();
    await prisma.messageRecipient.deleteMany();
    await prisma.message.deleteMany();
    await prisma.messageThreadParticipant.deleteMany();
    await prisma.messageThread.deleteMany();
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
      name: 'Grade 1',
      grade: '1',
      capacity: 25,
      description: 'First grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 2',
      grade: '2',
      capacity: 25,
      description: 'Second grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 3',
      grade: '3',
      capacity: 28,
      description: 'Third grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 4',
      grade: '4',
      capacity: 28,
      description: 'Fourth grade primary class',
      schoolId: schoolId
    },
    {
      name: 'Grade 5',
      grade: '5',
      capacity: 30,
      description: 'Fifth grade intermediate class',
      schoolId: schoolId
    },
    {
      name: 'Grade 6',
      grade: '6',
      capacity: 30,
      description: 'Sixth grade intermediate class',
      schoolId: schoolId
    },
    {
      name: 'Grade 7',
      grade: '7',
      capacity: 32,
      description: 'Seventh grade middle school class',
      schoolId: schoolId
    },
    {
      name: 'Grade 8',
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

async function createGradeScales(schoolId) {
  const gradeScalesData = [
    {
      name: 'Primary School Grading (100%)',
      isActive: true,
      schoolId: schoolId,
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
      schoolId: schoolId,
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
  }

  console.log(`✅ Created ${gradeScales.length} grade scales`);
  return gradeScales;
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

async function createAttendanceRecords(schoolId, students, classes, staff, academicYearId) {
  console.log('📅 Creating attendance records...');

  const attendanceRecords = [];

  // Get all active terms
  const terms = await prisma.term.findMany({
    where: {
      academicYearId: academicYearId
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  if (terms.length === 0) {
    console.log('⚠️ No terms found, skipping attendance records');
    return [];
  }

  const currentTerm = terms[0]; // Use first term for simplicity

  // Use term dates for attendance records
  const termStartDate = new Date(currentTerm.startDate);
  const termEndDate = new Date(currentTerm.endDate);
  const today = new Date();

  // Create attendance from term start up to today or term end, whichever is earlier
  const startDate = new Date(termStartDate);
  const endDate = today < termEndDate ? today : termEndDate;

  console.log(`   Creating records from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  // Get a teacher to mark attendance
  const teacherStaff = staff.find(s => s.staffType === 'TEACHER');
  if (!teacherStaff) {
    console.log('⚠️ No teachers found, skipping attendance records');
    return [];
  }

  // Define student attendance patterns for variety
  // 70% students will have good attendance (85-100%)
  // 20% students will have average attendance (70-84%)
  // 10% students will have poor attendance (50-69%)
  const studentAttendanceProfiles = students.map(student => {
    const random = Math.random();
    let profile;

    if (random < 0.7) {
      // Good attendance: 85-100% present, 0-5% late, 0-10% absent
      profile = { presentChance: 0.85, lateChance: 0.05, absentChance: 0.10 };
    } else if (random < 0.9) {
      // Average attendance: 70-84% present, 5-10% late, 10-20% absent
      profile = { presentChance: 0.70, lateChance: 0.10, absentChance: 0.20 };
    } else {
      // Poor attendance: 50-69% present, 5-15% late, 20-40% absent
      profile = { presentChance: 0.50, lateChance: 0.15, absentChance: 0.35 };
    }

    return {
      studentId: student.id,
      classId: student.currentClassId,
      ...profile
    };
  });

  // Generate attendance for each school day (Mon-Fri)
  let currentDate = new Date(startDate);
  let recordCount = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Create attendance records for all students for this day
      for (const profile of studentAttendanceProfiles) {
        const random = Math.random();
        let status;

        if (random < profile.presentChance) {
          status = 'PRESENT';
        } else if (random < profile.presentChance + profile.lateChance) {
          status = 'LATE';
        } else {
          status = 'ABSENT';
        }

        // Create the attendance record
        attendanceRecords.push({
          studentId: profile.studentId,
          classId: profile.classId,
          date: new Date(currentDate),
          status: status,
          markedById: teacherStaff.userId,
          schoolId: schoolId,
          termId: currentTerm.id,
          academicYearId: academicYearId,
          notes: status === 'ABSENT' ? (Math.random() > 0.7 ? 'Sick' : null) : null,
          createdAt: new Date(currentDate),
          updatedAt: new Date(currentDate)
        });

        recordCount++;
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Batch create all attendance records
  console.log(`📝 Creating ${recordCount} attendance records...`);

  // Create in batches of 500 to avoid overwhelming the database
  const batchSize = 500;
  for (let i = 0; i < attendanceRecords.length; i += batchSize) {
    const batch = attendanceRecords.slice(i, i + batchSize);
    await prisma.attendance.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`   ✓ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(attendanceRecords.length / batchSize)}`);
  }

  console.log(`✅ Created ${recordCount} attendance records across ${Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))} days`);

  // Calculate and log some statistics
  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;

  console.log(`   📊 Statistics: ${presentCount} Present (${((presentCount / recordCount) * 100).toFixed(1)}%), ${lateCount} Late (${((lateCount / recordCount) * 100).toFixed(1)}%), ${absentCount} Absent (${((absentCount / recordCount) * 100).toFixed(1)}%)`);

  return attendanceRecords;
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
      implementationStatus: 'ACTIVE',
      adoptionDate: new Date('2024-09-01'),
      startYear: 2024,
      endYear: 2025,
      createdBy: createdById
    }
  });

  // Add core subjects to the curriculum with topics and concepts
  const coreSubjects = subjects.filter(s => ['MATH', 'ELA', 'SCI', 'SS', 'PE'].includes(s.code));

  for (let i = 0; i < coreSubjects.length; i++) {
    const subject = coreSubjects[i];
    const curriculumSubject = await prisma.curriculumSubject.create({
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

    // Add topics and concepts for Mathematics
    if (subject.code === 'MATH') {
      const topic1 = await prisma.topic.create({
        data: {
          curriculumSubjectId: curriculumSubject.id,
          name: 'Number and Place Value',
          description: 'Understanding numbers, counting, and place value system',
          displayOrder: 1,
          estimatedHours: 15,
          difficultyLevel: 'BEGINNER'
        }
      });

      await prisma.concept.createMany({
        data: [
          { topicId: topic1.id, name: 'Counting to 100', bloomsLevel: 'REMEMBER', displayOrder: 1, isCore: true },
          { topicId: topic1.id, name: 'Understanding place value (tens and ones)', bloomsLevel: 'UNDERSTAND', displayOrder: 2, isCore: true },
          { topicId: topic1.id, name: 'Comparing and ordering numbers', bloomsLevel: 'APPLY', displayOrder: 3, isCore: true }
        ]
      });

      const topic2 = await prisma.topic.create({
        data: {
          curriculumSubjectId: curriculumSubject.id,
          name: 'Addition and Subtraction',
          description: 'Basic operations of addition and subtraction',
          displayOrder: 2,
          estimatedHours: 20,
          difficultyLevel: 'BEGINNER'
        }
      });

      await prisma.concept.createMany({
        data: [
          { topicId: topic2.id, name: 'Adding single-digit numbers', bloomsLevel: 'APPLY', displayOrder: 1, isCore: true },
          { topicId: topic2.id, name: 'Subtracting single-digit numbers', bloomsLevel: 'APPLY', displayOrder: 2, isCore: true },
          { topicId: topic2.id, name: 'Word problems involving addition/subtraction', bloomsLevel: 'ANALYZE', displayOrder: 3, isCore: true }
        ]
      });

      // Add learning objectives
      await prisma.learningObjective.createMany({
        data: [
          { curriculumSubjectId: curriculumSubject.id, code: 'M1.1', description: 'Count reliably to 100', bloomsLevel: 'REMEMBER', displayOrder: 1 },
          { curriculumSubjectId: curriculumSubject.id, code: 'M1.2', description: 'Add and subtract one-digit numbers', bloomsLevel: 'APPLY', displayOrder: 2 },
          { curriculumSubjectId: curriculumSubject.id, code: 'M1.3', description: 'Solve simple word problems', bloomsLevel: 'ANALYZE', displayOrder: 3 }
        ]
      });
    }

    // Add topics and concepts for English Language Arts
    else if (subject.code === 'ELA') {
      const topic1 = await prisma.topic.create({
        data: {
          curriculumSubjectId: curriculumSubject.id,
          name: 'Phonics and Reading',
          description: 'Foundational reading skills and phonemic awareness',
          displayOrder: 1,
          estimatedHours: 25,
          difficultyLevel: 'BEGINNER'
        }
      });

      await prisma.concept.createMany({
        data: [
          { topicId: topic1.id, name: 'Letter sounds and recognition', bloomsLevel: 'REMEMBER', displayOrder: 1, isCore: true },
          { topicId: topic1.id, name: 'Blending sounds to read words', bloomsLevel: 'UNDERSTAND', displayOrder: 2, isCore: true },
          { topicId: topic1.id, name: 'Reading simple sentences', bloomsLevel: 'APPLY', displayOrder: 3, isCore: true }
        ]
      });

      const topic2 = await prisma.topic.create({
        data: {
          curriculumSubjectId: curriculumSubject.id,
          name: 'Writing and Composition',
          description: 'Basic writing skills and sentence formation',
          displayOrder: 2,
          estimatedHours: 20,
          difficultyLevel: 'BEGINNER'
        }
      });

      await prisma.concept.createMany({
        data: [
          { topicId: topic2.id, name: 'Forming letters correctly', bloomsLevel: 'REMEMBER', displayOrder: 1, isCore: true },
          { topicId: topic2.id, name: 'Writing simple sentences', bloomsLevel: 'APPLY', displayOrder: 2, isCore: true },
          { topicId: topic2.id, name: 'Using capital letters and periods', bloomsLevel: 'APPLY', displayOrder: 3, isCore: true }
        ]
      });
    }

    // Add topics and concepts for Science
    else if (subject.code === 'SCI') {
      const topic1 = await prisma.topic.create({
        data: {
          curriculumSubjectId: curriculumSubject.id,
          name: 'Living Things',
          description: 'Understanding plants, animals, and their characteristics',
          displayOrder: 1,
          estimatedHours: 12,
          difficultyLevel: 'BEGINNER'
        }
      });

      await prisma.concept.createMany({
        data: [
          { topicId: topic1.id, name: 'Identifying living vs non-living things', bloomsLevel: 'UNDERSTAND', displayOrder: 1, isCore: true },
          { topicId: topic1.id, name: 'Parts of a plant', bloomsLevel: 'REMEMBER', displayOrder: 2, isCore: true },
          { topicId: topic1.id, name: 'Animal habitats', bloomsLevel: 'UNDERSTAND', displayOrder: 3, isCore: true }
        ]
      });
    }
  }

  console.log(`✅ Created curriculum with topics and concepts`);
  return curriculum;
}

async function createGlobalCurricula() {
  // Global curricula functionality removed - using school-specific curricula only
  console.log('✅ Skipping global curricula (using school-specific curricula)');
  return;
}

async function createGlobalCurriculumSubjects(curriculumId, type) {
  // Not needed anymore
  return;
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

async function createSubjectAssignments(schoolId, staff, subjects, classes, sections, academicYearId) {
  console.log('📋 Creating subject assignments...');

  // Define teacher specializations (based on their qualifications)
  const teacherSpecializations = {
    'john.doe@greenwood.com': ['MATH', 'SCI'],  // John Doe - Math & Science
    'mary.johnson@greenwood.com': ['ELA', 'SS'], // Mary Johnson - English & Social Studies
    'david.wilson@greenwood.com': ['PE', 'ART'], // David Wilson - PE & Art
    'sarah.brown@greenwood.com': ['MUS', 'ART'], // Sarah Brown - Music & Art
    'michael.davis@greenwood.com': ['SCI', 'MATH'], // Michael Davis - Science & Math
    'emily.miller@greenwood.com': ['ELA', 'SS']  // Emily Miller - English & Social Studies
  };

  const assignments = [];

  // Get teacher users to match with specializations
  const teacherUsers = await prisma.user.findMany({
    where: {
      schoolId,
      role: 'TEACHER'
    }
  });

  for (const cls of classes) {
    const grade = parseInt(cls.grade);

    // For each class, assign teachers to subjects based on their specializations
    for (const [teacherEmail, subjectCodes] of Object.entries(teacherSpecializations)) {
      const teacherUser = teacherUsers.find(u => u.email === teacherEmail);
      if (!teacherUser) continue;

      const teacher = staff.find(s => s.userId === teacherUser.id);
      if (!teacher) continue;

      for (const subjectCode of subjectCodes) {
        const subject = subjects.find(s => s.code === subjectCode);
        if (!subject) continue;

        // Skip PE and Art for lower grades if needed
        if ((subjectCode === 'PE' || subjectCode === 'ART') && grade < 3) continue;

        // Create assignment for the entire class
        try {
          const assignment = await prisma.subjectAssignment.create({
            data: {
              staffId: teacher.id,
              subjectId: subject.id,
              classId: cls.id,
              academicYearId,
              schoolId,
              sectionId: null, // Teaching entire class
              startDate: new Date('2024-09-01'),
              endDate: new Date('2025-06-30'),
              status: 'ACTIVE',
              hoursPerWeek: getHoursPerWeek(subjectCode, grade),
              isMainTeacher: true,
              canGrade: true,
              canMarkAttendance: true,
              notes: `Assigned to teach ${subject.name} for ${cls.name}`,
              description: `Academic year assignment for ${subject.name} in ${cls.name}`
            }
          });

          assignments.push(assignment);
          console.log(`✅ Assigned ${teacher.firstName} ${teacher.lastName} to teach ${subject.name} in ${cls.name}`);

        } catch (error) {
          if (error.code === 'P2002') {
            // Skip duplicate assignments
            console.log(`⚠️ Assignment already exists: ${teacher.firstName} ${teacher.lastName} - ${subject.name} - ${cls.name}`);
          } else {
            console.error(`❌ Error creating assignment: ${error.message}`);
          }
        }
      }
    }

    // Also create some section-specific assignments for demonstration
    // For example, assign a teacher to teach Math to only Section A of Grade 1
    if (grade === 1) {
      const sectionA = sections.find(s => s.name === 'A');
      const mathSubject = subjects.find(s => s.code === 'MATH');
      const johnDoe = staff.find(s => s.firstName === 'John' && s.lastName === 'Doe');

      if (sectionA && mathSubject && johnDoe) {
        try {
          const sectionAssignment = await prisma.subjectAssignment.create({
            data: {
              staffId: johnDoe.id,
              subjectId: mathSubject.id,
              classId: cls.id,
              academicYearId,
              schoolId,
              sectionId: sectionA.id, // Teaching only Section A
              startDate: new Date('2024-09-01'),
              endDate: new Date('2025-06-30'),
              status: 'ACTIVE',
              hoursPerWeek: 5,
              isMainTeacher: false, // This is a section-specific assignment
              canGrade: true,
              canMarkAttendance: true,
              notes: `Section-specific assignment for Math in ${cls.name} Section A`,
              description: `Teaching Math to Section A students only`
            }
          });

          assignments.push(sectionAssignment);
          console.log(`✅ Created section-specific assignment: ${johnDoe.firstName} ${johnDoe.lastName} - Math - ${cls.name} Section A`);

        } catch (error) {
          if (error.code !== 'P2002') {
            console.error(`❌ Error creating section assignment: ${error.message}`);
          }
        }
      }
    }
  }

  console.log(`✅ Created ${assignments.length} subject assignments`);
  return assignments;
}

async function createLibraryBooks(schoolId, subjects) {
  const books = [];

  const libraryBooks = [
    // Physical Books
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0743273565",
      publisher: "Scribner",
      publishedDate: new Date('1925-04-10'),
      bookType: 'PHYSICAL',
      category: 'LITERATURE',
      description: "A classic American novel set in the Jazz Age",
      pages: 180,
      totalCopies: 5,
      availableCopies: 5,
      location: "Shelf A1",
      rackNumber: "A1-001",
      price: 15.99,
      subjects: ['LITERATURE', 'ENGLISH'],
      tags: ['Classic', 'Fiction', 'American Literature']
    },
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "978-0262033848",
      publisher: "MIT Press",
      publishedDate: new Date('2009-07-31'),
      bookType: 'PHYSICAL',
      category: 'TEXTBOOK',
      description: "Comprehensive guide to algorithms and data structures",
      pages: 1312,
      totalCopies: 3,
      availableCopies: 3,
      location: "Shelf C3",
      rackNumber: "C3-015",
      price: 89.99,
      subjects: ['COMPUTER SCIENCE'],
      tags: ['Computer Science', 'Algorithms', 'Textbook']
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      isbn: "978-0553380163",
      publisher: "Bantam",
      publishedDate: new Date('1988-04-01'),
      bookType: 'PHYSICAL',
      category: 'SCIENCE',
      description: "Exploration of the universe from the Big Bang to black holes",
      pages: 256,
      totalCopies: 4,
      availableCopies: 4,
      location: "Shelf B2",
      rackNumber: "B2-020",
      price: 18.99,
      subjects: ['PHYSICS', 'SCIENCE'],
      tags: ['Science', 'Physics', 'Cosmology']
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0141439518",
      publisher: "Penguin Classics",
      publishedDate: new Date('1813-01-28'),
      bookType: 'PHYSICAL',
      category: 'LITERATURE',
      description: "Classic romance and social commentary",
      pages: 432,
      totalCopies: 6,
      availableCopies: 6,
      location: "Shelf A2",
      rackNumber: "A2-005",
      price: 12.99,
      subjects: ['LITERATURE', 'ENGLISH'],
      tags: ['Classic', 'Romance', 'British Literature']
    },
    // E-books
    {
      title: "Digital Mathematics: An Interactive Guide",
      author: "Dr. Sarah Chen",
      isbn: "978-1234567890",
      publisher: "Digital Press",
      publishedDate: new Date('2023-01-15'),
      bookType: 'EBOOK',
      category: 'MATHEMATICS',
      description: "Interactive e-book for learning mathematics with digital exercises",
      pages: 450,
      fileUrl: "https://storage.example.com/ebooks/digital-mathematics.pdf",
      fileFormat: "PDF",
      fileSize: 15728640, // 15 MB
      downloadLimit: null, // Unlimited downloads
      totalCopies: 1,
      availableCopies: 1,
      price: 29.99,
      subjects: ['MATHEMATICS'],
      tags: ['E-book', 'Mathematics', 'Interactive', 'Digital']
    },
    {
      title: "Modern Physics: A Digital Journey",
      author: "Prof. Michael Roberts",
      isbn: "978-9876543210",
      publisher: "Science Digital",
      publishedDate: new Date('2023-06-01'),
      bookType: 'EBOOK',
      category: 'SCIENCE',
      description: "Comprehensive digital physics textbook with multimedia content",
      pages: 680,
      fileUrl: "https://storage.example.com/ebooks/modern-physics.epub",
      fileFormat: "EPUB",
      fileSize: 25165824, // 24 MB
      downloadLimit: 5, // Max 5 downloads per issue
      totalCopies: 1,
      availableCopies: 1,
      price: 39.99,
      subjects: ['PHYSICS', 'SCIENCE'],
      tags: ['E-book', 'Physics', 'Science', 'Digital', 'Multimedia']
    },
    {
      title: "World Literature Collection",
      author: "Various Authors",
      isbn: "978-5555555555",
      publisher: "Global Books Digital",
      publishedDate: new Date('2024-01-01'),
      bookType: 'EBOOK',
      category: 'LITERATURE',
      description: "A comprehensive collection of world literature classics in digital format",
      pages: 2400,
      fileUrl: "https://storage.example.com/ebooks/world-literature.pdf",
      fileFormat: "PDF",
      fileSize: 35651584, // 34 MB
      downloadLimit: null,
      totalCopies: 1,
      availableCopies: 1,
      price: 49.99,
      subjects: ['LITERATURE'],
      tags: ['E-book', 'Literature', 'Classics', 'Collection']
    },
    {
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      isbn: "978-1285741550",
      publisher: "Cengage Learning",
      publishedDate: new Date('2015-01-01'),
      bookType: 'PHYSICAL',
      category: 'MATHEMATICS',
      description: "Comprehensive calculus textbook",
      pages: 1368,
      totalCopies: 10,
      availableCopies: 10,
      location: "Shelf C1",
      rackNumber: "C1-010",
      price: 299.99,
      subjects: ['MATHEMATICS'],
      tags: ['Mathematics', 'Calculus', 'Textbook']
    },
    {
      title: "World History: Patterns of Interaction",
      author: "Roger B. Beck",
      isbn: "978-0547491127",
      publisher: "Houghton Mifflin Harcourt",
      publishedDate: new Date('2012-01-01'),
      bookType: 'PHYSICAL',
      category: 'HISTORY',
      description: "Comprehensive world history textbook",
      pages: 1120,
      totalCopies: 8,
      availableCopies: 8,
      location: "Shelf D1",
      rackNumber: "D1-008",
      price: 79.99,
      subjects: ['HISTORY', 'SOCIAL STUDIES'],
      tags: ['History', 'World History', 'Textbook']
    },
    {
      title: "The Oxford English Dictionary",
      author: "Oxford University Press",
      isbn: "978-0198611868",
      publisher: "Oxford University Press",
      publishedDate: new Date('1989-03-30'),
      bookType: 'PHYSICAL',
      category: 'REFERENCE',
      description: "Comprehensive English language dictionary",
      pages: 21730,
      totalCopies: 2,
      availableCopies: 2,
      location: "Reference Section",
      rackNumber: "REF-001",
      price: 1200.00,
      subjects: ['ENGLISH', 'REFERENCE'],
      tags: ['Reference', 'Dictionary', 'English']
    },
    {
      title: "National Geographic Magazine - January 2024",
      author: "National Geographic Society",
      isbn: null,
      publisher: "National Geographic",
      publishedDate: new Date('2024-01-01'),
      bookType: 'PHYSICAL',
      category: 'MAGAZINE',
      description: "Monthly geography and science magazine",
      pages: 128,
      totalCopies: 3,
      availableCopies: 3,
      location: "Magazine Rack",
      rackNumber: "MAG-001",
      price: 6.99,
      subjects: ['GEOGRAPHY', 'SCIENCE'],
      tags: ['Magazine', 'Geography', 'Science', 'Current']
    },
  ];

  for (const bookData of libraryBooks) {
    try {
      const book = await prisma.book.create({
        data: {
          ...bookData,
          schoolId,
          status: 'AVAILABLE'
        }
      });
      books.push(book);
      console.log(`✅ Created book: ${book.title}`);
    } catch (error) {
      console.error(`❌ Error creating book ${bookData.title}:`, error.message);
    }
  }

  console.log(`✅ Created ${books.length} library books`);
  return books;
}

async function createBookIssues(schoolId, books, students, users) {
  const bookIssues = [];

  // Issue some books to students
  if (students.length > 0 && books.length > 0) {
    // Issue first book to first student
    const book1 = books[0];
    const student1 = students[0];
    const issuer = users[0]; // Admin user

    try {
      const issue1 = await prisma.bookIssue.create({
        data: {
          bookId: book1.id,
          studentId: student1.id,
          schoolId,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: 'ISSUED',
          issuedById: issuer.id,
          issueNotes: 'First book issue for testing'
        }
      });

      // Update book available copies
      await prisma.book.update({
        where: { id: book1.id },
        data: {
          availableCopies: book1.availableCopies - 1,
          issuedCopies: book1.issuedCopies + 1,
          status: book1.availableCopies - 1 > 0 ? 'AVAILABLE' : 'ISSUED'
        }
      });

      bookIssues.push(issue1);
      console.log(`✅ Issued book "${book1.title}" to ${student1.firstName} ${student1.lastName}`);
    } catch (error) {
      console.error(`❌ Error issuing book:`, error.message);
    }

    // Issue and return a book (for history)
    if (books.length > 2 && students.length > 1) {
      const book2 = books[2];
      const student2 = students[1];

      try {
        const issue2 = await prisma.bookIssue.create({
          data: {
            bookId: book2.id,
            studentId: student2.id,
            schoolId,
            issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
            dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (overdue when returned)
            returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Returned 2 days ago
            status: 'RETURNED',
            condition: 'GOOD',
            fine: 2.00, // Late return fine
            fineReason: 'Late return - 4 days overdue',
            finePaid: true,
            issuedById: issuer.id,
            returnedById: issuer.id,
            issueNotes: 'Regular issue',
            returnNotes: 'Returned in good condition, 4 days overdue'
          }
        });

        bookIssues.push(issue2);
        console.log(`✅ Created returned book issue for "${book2.title}"`);
      } catch (error) {
        console.error(`❌ Error creating returned book issue:`, error.message);
      }
    }
  }

  console.log(`✅ Created ${bookIssues.length} book issues`);
  return bookIssues;
}

async function createHostels(schoolId, staff) {
  const hostels = [];

  // Get some staff members to be wardens
  const wardens = staff.slice(0, 3); // Use first 3 staff members as wardens

  const hostelData = [
    {
      name: "Phoenix Boys Hostel",
      hostelType: 'BOYS',
      gender: 'MALE',
      address: "123 Campus Road, Near Main Building",
      capacity: 100,
      wardenId: wardens[0]?.id || null,
      facilities: ['WiFi', 'Laundry', 'Study Room', 'Recreation Room', 'Library', 'Gym'],
      description: "Modern boys hostel with excellent facilities and 24/7 security",
      status: 'ACTIVE'
    },
    {
      name: "Athena Girls Hostel",
      hostelType: 'GIRLS',
      gender: 'FEMALE',
      address: "456 Garden Avenue, East Campus",
      capacity: 80,
      wardenId: wardens[1]?.id || null,
      facilities: ['WiFi', 'Laundry', 'Study Room', 'Common Room', 'Library', 'Yoga Room'],
      description: "Safe and secure girls hostel with all modern amenities",
      status: 'ACTIVE'
    },
    {
      name: "International Mixed Hostel",
      hostelType: 'MIXED',
      gender: null,
      address: "789 University Drive, South Campus",
      capacity: 60,
      wardenId: wardens[2]?.id || null,
      facilities: ['WiFi', 'Laundry', 'Study Room', 'Common Room', 'Library', 'Cafeteria'],
      description: "Mixed hostel for international students with separate floors for boys and girls",
      status: 'ACTIVE'
    }
  ];

  for (const data of hostelData) {
    try {
      const hostel = await prisma.hostel.create({
        data: {
          ...data,
          schoolId,
          availableBeds: data.capacity,
          occupiedBeds: 0
        }
      });
      hostels.push(hostel);
      console.log(`✅ Created hostel: ${hostel.name}`);
    } catch (error) {
      console.error(`❌ Error creating hostel ${data.name}:`, error.message);
    }
  }

  console.log(`✅ Created ${hostels.length} hostels`);
  return hostels;
}

async function createHostelRooms(schoolId, hostels) {
  const rooms = [];

  for (const hostel of hostels) {
    // Create different types of rooms for each hostel
    const roomConfigs = [
      { count: 10, type: 'SINGLE', capacity: 1, floor: 1, facilities: ['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'] },
      { count: 15, type: 'DOUBLE', capacity: 2, floor: 1, facilities: ['AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'] },
      { count: 10, type: 'DOUBLE', capacity: 2, floor: 2, facilities: ['Study Table', 'Wardrobe', 'Shared Bathroom'] },
      { count: 8, type: 'TRIPLE', capacity: 3, floor: 2, facilities: ['Fan', 'Study Table', 'Wardrobe', 'Shared Bathroom'] },
      { count: 5, type: 'QUAD', capacity: 4, floor: 3, facilities: ['Fan', 'Study Table', 'Wardrobe', 'Shared Bathroom'] }
    ];

    let roomCounter = 1;
    for (const config of roomConfigs) {
      for (let i = 0; i < config.count; i++) {
        const roomNumber = `${config.floor}${String(roomCounter).padStart(2, '0')}`;
        try {
          const room = await prisma.hostelRoom.create({
            data: {
              roomNumber,
              floor: config.floor,
              roomType: config.type,
              capacity: config.capacity,
              availableBeds: config.capacity,
              occupiedBeds: 0,
              facilities: config.facilities,
              status: 'AVAILABLE',
              hostelId: hostel.id
            }
          });
          rooms.push(room);
          roomCounter++;
        } catch (error) {
          console.error(`❌ Error creating room ${roomNumber} in ${hostel.name}:`, error.message);
        }
      }
    }
    console.log(`✅ Created rooms for ${hostel.name}`);
  }

  console.log(`✅ Created ${rooms.length} hostel rooms`);
  return rooms;
}

async function createHostelAllocations(schoolId, hostels, rooms, students, academicYearId) {
  const allocations = [];

  // Allocate some students to hostels
  // Boys to Phoenix hostel, Girls to Athena hostel
  const boysHostel = hostels.find(h => h.hostelType === 'BOYS');
  const girlsHostel = hostels.find(h => h.hostelType === 'GIRLS');
  const mixedHostel = hostels.find(h => h.hostelType === 'MIXED');

  // Allocate 10 male students to boys hostel
  const maleStudents = students.filter(s => s.gender === 'MALE').slice(0, 10);
  const boysRooms = rooms.filter(r => r.hostelId === boysHostel?.id && r.availableBeds > 0);

  let roomIndex = 0;
  for (const student of maleStudents) {
    if (roomIndex >= boysRooms.length) break;
    const room = boysRooms[roomIndex];

    try {
      const allocation = await prisma.hostelAllocation.create({
        data: {
          studentId: student.id,
          hostelId: boysHostel.id,
          roomId: room.id,
          bedNumber: `B${room.occupiedBeds + 1}`,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          status: 'ACTIVE',
          academicYearId,
          schoolId
        }
      });

      // Update room occupancy
      await prisma.hostelRoom.update({
        where: { id: room.id },
        data: {
          occupiedBeds: room.occupiedBeds + 1,
          availableBeds: room.availableBeds - 1,
          status: room.availableBeds - 1 === 0 ? 'OCCUPIED' : 'AVAILABLE'
        }
      });

      allocations.push(allocation);
      console.log(`✅ Allocated ${student.firstName} ${student.lastName} to ${boysHostel.name} - Room ${room.roomNumber}`);

      if (room.occupiedBeds + 1 >= room.capacity) roomIndex++;
    } catch (error) {
      console.error(`❌ Error allocating student:`, error.message);
    }
  }

  // Allocate 8 female students to girls hostel
  const femaleStudents = students.filter(s => s.gender === 'FEMALE').slice(0, 8);
  const girlsRooms = rooms.filter(r => r.hostelId === girlsHostel?.id && r.availableBeds > 0);

  roomIndex = 0;
  for (const student of femaleStudents) {
    if (roomIndex >= girlsRooms.length) break;
    const room = girlsRooms[roomIndex];

    try {
      const allocation = await prisma.hostelAllocation.create({
        data: {
          studentId: student.id,
          hostelId: girlsHostel.id,
          roomId: room.id,
          bedNumber: `B${room.occupiedBeds + 1}`,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          status: 'ACTIVE',
          academicYearId,
          schoolId
        }
      });

      // Update room occupancy
      await prisma.hostelRoom.update({
        where: { id: room.id },
        data: {
          occupiedBeds: room.occupiedBeds + 1,
          availableBeds: room.availableBeds - 1,
          status: room.availableBeds - 1 === 0 ? 'OCCUPIED' : 'AVAILABLE'
        }
      });

      allocations.push(allocation);
      console.log(`✅ Allocated ${student.firstName} ${student.lastName} to ${girlsHostel.name} - Room ${room.roomNumber}`);

      if (room.occupiedBeds + 1 >= room.capacity) roomIndex++;
    } catch (error) {
      console.error(`❌ Error allocating student:`, error.message);
    }
  }

  // Update hostel occupancy
  for (const hostel of hostels) {
    const hostelAllocations = allocations.filter(a => a.hostelId === hostel.id);
    await prisma.hostel.update({
      where: { id: hostel.id },
      data: {
        occupiedBeds: hostelAllocations.length,
        availableBeds: hostel.capacity - hostelAllocations.length
      }
    });
  }

  console.log(`✅ Created ${allocations.length} hostel allocations`);
  return allocations;
}

async function createHostelFees(schoolId, hostels, academicYearId) {
  const fees = [];

  const roomTypeFees = {
    SINGLE: { amount: 5000, securityDeposit: 1000, admissionFee: 500 },
    DOUBLE: { amount: 3500, securityDeposit: 750, admissionFee: 500 },
    TRIPLE: { amount: 2500, securityDeposit: 500, admissionFee: 500 },
    QUAD: { amount: 2000, securityDeposit: 500, admissionFee: 500 },
    DORMITORY: { amount: 1500, securityDeposit: 300, admissionFee: 500 }
  };

  for (const hostel of hostels) {
    for (const [roomType, feeData] of Object.entries(roomTypeFees)) {
      try {
        const fee = await prisma.hostelFee.create({
          data: {
            hostelId: hostel.id,
            roomType,
            amount: feeData.amount,
            frequency: 'MONTHLY',
            securityDeposit: feeData.securityDeposit,
            admissionFee: feeData.admissionFee,
            status: 'ACTIVE',
            academicYearId,
            schoolId
          }
        });
        fees.push(fee);
      } catch (error) {
        console.error(`❌ Error creating hostel fee:`, error.message);
      }
    }
    console.log(`✅ Created fees for ${hostel.name}`);
  }

  console.log(`✅ Created ${fees.length} hostel fees`);
  return fees;
}

function getHoursPerWeek(subjectCode, grade) {
  // Define hours per week based on subject and grade level
  const hoursMap = {
    'MATH': grade <= 2 ? 6 : grade <= 5 ? 5 : 4,
    'ELA': grade <= 2 ? 6 : grade <= 5 ? 5 : 4,
    'SCI': grade <= 2 ? 3 : grade <= 5 ? 4 : 4,
    'SS': grade <= 2 ? 3 : grade <= 5 ? 3 : 4,
    'PE': 2,
    'ART': 2,
    'MUS': 2
  };

  return hoursMap[subjectCode] || 3;
}

async function createMessaging(schoolId, users, classes, allStudents) {
  const threads = [];
  const messages = [];

  try {
    // Find specific users for demo conversations
    const admin = users.find(u => u.role === 'ADMIN');
    const teachers = users.filter(u => u.role === 'TEACHER');
    const students = users.filter(u => u.role === 'STUDENT');
    const parents = users.filter(u => u.role === 'PARENT');

    // 1. Create a direct message thread between admin and teacher
    if (admin && teachers.length > 0) {
      const thread1 = await prisma.messageThread.create({
        data: {
          subject: 'Welcome to the new academic year',
          type: 'DIRECT',
          isGroup: false,
          status: 'ACTIVE',
          schoolId,
          createdById: admin.id,
          lastMessageAt: new Date(),
          lastMessagePreview: 'Thank you for the warm welcome!',
        }
      });
      threads.push(thread1);

      // Add participants
      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread1.id, userId: admin.id, isAdmin: true, unreadCount: 0 },
          { threadId: thread1.id, userId: teachers[0].id, isAdmin: false, unreadCount: 0 },
        ]
      });

      // Create messages in the thread
      const msg1 = await prisma.message.create({
        data: {
          threadId: thread1.id,
          content: 'Welcome to the new academic year! We are excited to have you on board.',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: admin.id,
          schoolId,
        }
      });
      messages.push(msg1);

      // Create recipient records
      await prisma.messageRecipient.create({
        data: {
          messageId: msg1.id,
          recipientId: teachers[0].id,
          isRead: true,
          readAt: new Date(),
          deliveryStatus: 'READ',
        }
      });

      const msg2 = await prisma.message.create({
        data: {
          threadId: thread1.id,
          content: 'Thank you for the warm welcome! Looking forward to a great year.',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: teachers[0].id,
          schoolId,
        }
      });
      messages.push(msg2);

      await prisma.messageRecipient.create({
        data: {
          messageId: msg2.id,
          recipientId: admin.id,
          isRead: true,
          readAt: new Date(),
          deliveryStatus: 'READ',
        }
      });
    }

    // 2. Create a group message thread for teachers
    if (teachers.length >= 2) {
      const thread2 = await prisma.messageThread.create({
        data: {
          subject: 'Teachers Group Discussion',
          type: 'GROUP',
          isGroup: true,
          groupName: 'All Teachers',
          status: 'ACTIVE',
          schoolId,
          createdById: admin.id,
          lastMessageAt: new Date(),
          lastMessagePreview: 'Great idea! Let\'s schedule it for next week.',
        }
      });
      threads.push(thread2);

      // Add all teachers as participants
      const teacherParticipants = teachers.slice(0, 3).map((teacher, index) => ({
        threadId: thread2.id,
        userId: teacher.id,
        isAdmin: index === 0,
        unreadCount: 0,
      }));

      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread2.id, userId: admin.id, isAdmin: true, unreadCount: 0 },
          ...teacherParticipants,
        ]
      });

      // Create group messages
      const groupMsg1 = await prisma.message.create({
        data: {
          threadId: thread2.id,
          content: 'Hello everyone! Let\'s plan our curriculum meeting for this month.',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: admin.id,
          schoolId,
        }
      });
      messages.push(groupMsg1);

      // Create recipients for all participants except sender
      const recipientsData = teachers.slice(0, 3).map(teacher => ({
        messageId: groupMsg1.id,
        recipientId: teacher.id,
        isRead: true,
        readAt: new Date(),
        deliveryStatus: 'READ',
      }));

      await prisma.messageRecipient.createMany({ data: recipientsData });

      if (teachers.length > 0) {
        const groupMsg2 = await prisma.message.create({
          data: {
            threadId: thread2.id,
            content: 'Great idea! Let\'s schedule it for next week.',
            messageType: 'TEXT',
            priority: 'NORMAL',
            senderId: teachers[0].id,
            schoolId,
          }
        });
        messages.push(groupMsg2);

        await prisma.messageRecipient.createMany({
          data: [
            { messageId: groupMsg2.id, recipientId: admin.id, isRead: true, readAt: new Date(), deliveryStatus: 'READ' },
            ...teachers.slice(1, 3).map(t => ({
              messageId: groupMsg2.id,
              recipientId: t.id,
              isRead: false,
              deliveryStatus: 'DELIVERED',
            })),
          ]
        });
      }
    }

    // 3. Create a class announcement thread
    if (classes.length > 0 && teachers.length > 0 && students.length > 0) {
      const thread3 = await prisma.messageThread.create({
        data: {
          subject: 'Class Assignment Reminder',
          type: 'CLASS',
          isGroup: true,
          groupName: classes[0].name,
          status: 'ACTIVE',
          classId: classes[0].id,
          entityType: 'Class',
          entityId: classes[0].id,
          schoolId,
          createdById: teachers[0].id,
          lastMessageAt: new Date(),
          lastMessagePreview: 'Please submit your assignments by Friday.',
        }
      });
      threads.push(thread3);

      // Add teacher and students as participants
      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread3.id, userId: teachers[0].id, isAdmin: true, unreadCount: 0 },
          ...students.slice(0, 5).map(student => ({
            threadId: thread3.id,
            userId: student.id,
            isAdmin: false,
            unreadCount: 1,
          })),
        ]
      });

      const classMsg = await prisma.message.create({
        data: {
          threadId: thread3.id,
          content: 'Please submit your assignments by Friday. Make sure to include all required sections.',
          messageType: 'TEXT',
          priority: 'HIGH',
          isImportant: true,
          senderId: teachers[0].id,
          schoolId,
        }
      });
      messages.push(classMsg);

      await prisma.messageRecipient.createMany({
        data: students.slice(0, 5).map(student => ({
          messageId: classMsg.id,
          recipientId: student.id,
          isRead: false,
          deliveryStatus: 'DELIVERED',
        }))
      });
    }

    // 4. Create a parent-teacher conversation
    if (teachers.length > 0 && parents.length > 0) {
      const thread4 = await prisma.messageThread.create({
        data: {
          subject: 'Student Progress Discussion',
          type: 'DIRECT',
          isGroup: false,
          status: 'ACTIVE',
          schoolId,
          createdById: parents[0].id,
          lastMessageAt: new Date(),
          lastMessagePreview: 'I would be happy to meet. How about Tuesday at 3 PM?',
        }
      });
      threads.push(thread4);

      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread4.id, userId: parents[0].id, isAdmin: false, unreadCount: 0 },
          { threadId: thread4.id, userId: teachers[0].id, isAdmin: false, unreadCount: 0 },
        ]
      });

      const parentMsg1 = await prisma.message.create({
        data: {
          threadId: thread4.id,
          content: 'Hello, I would like to discuss my child\'s recent test scores. Can we schedule a meeting?',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: parents[0].id,
          schoolId,
        }
      });
      messages.push(parentMsg1);

      await prisma.messageRecipient.create({
        data: {
          messageId: parentMsg1.id,
          recipientId: teachers[0].id,
          isRead: true,
          readAt: new Date(),
          deliveryStatus: 'READ',
        }
      });

      const teacherReply = await prisma.message.create({
        data: {
          threadId: thread4.id,
          content: 'I would be happy to meet. How about Tuesday at 3 PM?',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: teachers[0].id,
          parentMessageId: parentMsg1.id,
          schoolId,
        }
      });
      messages.push(teacherReply);

      await prisma.messageRecipient.create({
        data: {
          messageId: teacherReply.id,
          recipientId: parents[0].id,
          isRead: true,
          readAt: new Date(),
          deliveryStatus: 'READ',
        }
      });
    }

    // 5. Create more direct conversations between different users
    if (teachers.length >= 2) {
      const thread5 = await prisma.messageThread.create({
        data: {
          subject: 'Midterm Exam Coordination',
          type: 'DIRECT',
          isGroup: false,
          status: 'ACTIVE',
          schoolId,
          createdById: teachers[0].id,
          lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          lastMessagePreview: 'Sounds good! I\'ll prepare the questions by Friday.',
        }
      });
      threads.push(thread5);

      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread5.id, userId: teachers[0].id, isAdmin: false, unreadCount: 0 },
          { threadId: thread5.id, userId: teachers[1].id, isAdmin: false, unreadCount: 1 },
        ]
      });

      const coordMsg1 = await prisma.message.create({
        data: {
          threadId: thread5.id,
          content: 'Hi! Can we coordinate on the midterm exam schedule? I think we should align our exam dates.',
          messageType: 'TEXT',
          priority: 'HIGH',
          isImportant: true,
          senderId: teachers[0].id,
          schoolId,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        }
      });
      messages.push(coordMsg1);

      await prisma.messageRecipient.create({
        data: {
          messageId: coordMsg1.id,
          recipientId: teachers[1].id,
          isRead: true,
          readAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
          deliveryStatus: 'READ',
        }
      });

      const coordMsg2 = await prisma.message.create({
        data: {
          threadId: thread5.id,
          content: 'Sounds good! I\'ll prepare the questions by Friday.',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: teachers[1].id,
          schoolId,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        }
      });
      messages.push(coordMsg2);

      await prisma.messageRecipient.create({
        data: {
          messageId: coordMsg2.id,
          recipientId: teachers[0].id,
          isRead: false,
          deliveryStatus: 'DELIVERED',
        }
      });
    }

    // 6. Create a student-to-student conversation
    if (students.length >= 2) {
      const thread6 = await prisma.messageThread.create({
        data: {
          subject: 'Study Group',
          type: 'DIRECT',
          isGroup: false,
          status: 'ACTIVE',
          schoolId,
          createdById: students[0].id,
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
          lastMessagePreview: 'Perfect! See you at 3 PM in the library.',
        }
      });
      threads.push(thread6);

      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread6.id, userId: students[0].id, isAdmin: false, unreadCount: 0 },
          { threadId: thread6.id, userId: students[1].id, isAdmin: false, unreadCount: 2 },
        ]
      });

      const studyMsg1 = await prisma.message.create({
        data: {
          threadId: thread6.id,
          content: 'Hey! Want to join our study group for the math exam?',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: students[0].id,
          schoolId,
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
        }
      });
      messages.push(studyMsg1);

      await prisma.messageRecipient.create({
        data: {
          messageId: studyMsg1.id,
          recipientId: students[1].id,
          isRead: true,
          readAt: new Date(Date.now() - 40 * 60 * 1000),
          deliveryStatus: 'READ',
        }
      });

      const studyMsg2 = await prisma.message.create({
        data: {
          threadId: thread6.id,
          content: 'Yes! When and where?',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: students[1].id,
          schoolId,
          createdAt: new Date(Date.now() - 35 * 60 * 1000),
        }
      });
      messages.push(studyMsg2);

      await prisma.messageRecipient.create({
        data: {
          messageId: studyMsg2.id,
          recipientId: students[0].id,
          isRead: true,
          readAt: new Date(Date.now() - 32 * 60 * 1000),
          deliveryStatus: 'READ',
        }
      });

      const studyMsg3 = await prisma.message.create({
        data: {
          threadId: thread6.id,
          content: 'Perfect! See you at 3 PM in the library.',
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: students[0].id,
          schoolId,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        }
      });
      messages.push(studyMsg3);

      await prisma.messageRecipient.create({
        data: {
          messageId: studyMsg3.id,
          recipientId: students[1].id,
          isRead: false,
          deliveryStatus: 'DELIVERED',
        }
      });
    }

    console.log(`✅ Created ${threads.length} message threads and ${messages.length} messages`);
    return { threads, messages };
  } catch (error) {
    console.error('❌ Error creating messaging data:', error);
    return { threads: [], messages: [] };
  }
}

async function createTransportRoutes(schoolId) {
  const routes = [];

  try {
    // Route 1: Downtown - School
    const route1 = await prisma.transportRoute.create({
      data: {
        routeName: 'Downtown Route',
        routeNumber: 'R001',
        description: 'Main route covering downtown and central business district',
        startPoint: 'Downtown Central Bus Station',
        endPoint: 'School Main Gate',
        stops: [
          { name: 'Downtown Central', time: '06:30', coordinates: { lat: -1.2864, lng: 36.8172 } },
          { name: 'City Mall', time: '06:45', coordinates: { lat: -1.2921, lng: 36.8219 } },
          { name: 'Library Corner', time: '07:00', coordinates: { lat: -1.2985, lng: 36.8245 } },
          { name: 'School Main Gate', time: '07:20', coordinates: { lat: -1.3031, lng: 36.8281 } },
        ],
        distance: 12.5,
        estimatedTime: 50,
        fare: 150.00,
        currency: 'KES',
        status: 'ACTIVE',
        isActive: true,
        schoolId,
      },
    });
    routes.push(route1);

    // Route 2: Westlands - School
    const route2 = await prisma.transportRoute.create({
      data: {
        routeName: 'Westlands Route',
        routeNumber: 'R002',
        description: 'Covering Westlands, Parklands, and surrounding areas',
        startPoint: 'Westlands Square',
        endPoint: 'School Main Gate',
        stops: [
          { name: 'Westlands Square', time: '06:20', coordinates: { lat: -1.2673, lng: 36.8103 } },
          { name: 'Parklands', time: '06:35', coordinates: { lat: -1.2755, lng: 36.8201 } },
          { name: 'Museum Hill', time: '06:50', coordinates: { lat: -1.2852, lng: 36.8234 } },
          { name: 'School Main Gate', time: '07:15', coordinates: { lat: -1.3031, lng: 36.8281 } },
        ],
        distance: 10.2,
        estimatedTime: 55,
        fare: 130.00,
        currency: 'KES',
        status: 'ACTIVE',
        isActive: true,
        schoolId,
      },
    });
    routes.push(route2);

    // Route 3: Eastlands - School
    const route3 = await prisma.transportRoute.create({
      data: {
        routeName: 'Eastlands Route',
        routeNumber: 'R003',
        description: 'Serving Eastlands estates and surrounding neighborhoods',
        startPoint: 'Eastlands Plaza',
        endPoint: 'School Main Gate',
        stops: [
          { name: 'Eastlands Plaza', time: '06:00', coordinates: { lat: -1.2845, lng: 36.8912 } },
          { name: 'Savannah Junction', time: '06:20', coordinates: { lat: -1.2901, lng: 36.8756 } },
          { name: 'Industrial Area', time: '06:40', coordinates: { lat: -1.2967, lng: 36.8512 } },
          { name: 'School Main Gate', time: '07:10', coordinates: { lat: -1.3031, lng: 36.8281 } },
        ],
        distance: 15.8,
        estimatedTime: 70,
        fare: 180.00,
        currency: 'KES',
        status: 'ACTIVE',
        isActive: true,
        schoolId,
      },
    });
    routes.push(route3);

    // Route 4: Karen - School
    const route4 = await prisma.transportRoute.create({
      data: {
        routeName: 'Karen Route',
        routeNumber: 'R004',
        description: 'Premium route covering Karen, Langata, and surrounding suburbs',
        startPoint: 'Karen Shopping Center',
        endPoint: 'School Main Gate',
        stops: [
          { name: 'Karen Shopping Center', time: '06:15', coordinates: { lat: -1.3234, lng: 36.7112 } },
          { name: 'Langata', time: '06:35', coordinates: { lat: -1.3145, lng: 36.7489 } },
          { name: 'Adams Arcade', time: '06:50', coordinates: { lat: -1.3089, lng: 36.7823 } },
          { name: 'School Main Gate', time: '07:20', coordinates: { lat: -1.3031, lng: 36.8281 } },
        ],
        distance: 18.5,
        estimatedTime: 65,
        fare: 200.00,
        currency: 'KES',
        status: 'ACTIVE',
        isActive: true,
        schoolId,
      },
    });
    routes.push(route4);

    console.log(`✅ Created ${routes.length} transport routes`);
    return routes;
  } catch (error) {
    console.error('❌ Error creating transport routes:', error);
    return [];
  }
}

async function createVehicles(schoolId) {
  const vehicles = [];

  try {
    // Vehicle 1: School Bus 1
    const vehicle1 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'BUS-001',
        vehicleName: 'Green Valley Express',
        vehicleType: 'BUS',
        make: 'Toyota',
        model: 'Coaster',
        year: 2020,
        color: 'White with Green Stripes',
        registrationNumber: 'KCA 123A',
        seatingCapacity: 45,
        currentOccupancy: 0,
        driverName: 'John Kamau',
        driverPhone: '+254712345001',
        driverLicense: 'DL-2019-001234',
        lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        roadworthyExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        gpsEnabled: true,
        gpsDeviceId: 'GPS-BUS001',
        status: 'ACTIVE',
        condition: 'EXCELLENT',
        schoolId,
      },
    });
    vehicles.push(vehicle1);

    // Vehicle 2: School Bus 2
    const vehicle2 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'BUS-002',
        vehicleName: 'Sunshine Cruiser',
        vehicleType: 'BUS',
        make: 'Isuzu',
        model: 'NQR',
        year: 2019,
        color: 'Yellow with Blue Stripes',
        registrationNumber: 'KCB 456B',
        seatingCapacity: 40,
        currentOccupancy: 0,
        driverName: 'Peter Omondi',
        driverPhone: '+254712345002',
        driverLicense: 'DL-2018-005678',
        lastServiceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        insuranceExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        roadworthyExpiry: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000),
        gpsEnabled: true,
        gpsDeviceId: 'GPS-BUS002',
        status: 'ACTIVE',
        condition: 'GOOD',
        schoolId,
      },
    });
    vehicles.push(vehicle2);

    // Vehicle 3: Minibus
    const vehicle3 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'VAN-001',
        vehicleName: 'Quick Shuttle',
        vehicleType: 'MINIBUS',
        make: 'Nissan',
        model: 'Civilian',
        year: 2021,
        color: 'White',
        registrationNumber: 'KCC 789C',
        seatingCapacity: 25,
        currentOccupancy: 0,
        driverName: 'Mary Njeri',
        driverPhone: '+254712345003',
        driverLicense: 'DL-2020-009012',
        lastServiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        insuranceExpiry: new Date(Date.now() + 220 * 24 * 60 * 60 * 1000),
        roadworthyExpiry: new Date(Date.now() + 190 * 24 * 60 * 60 * 1000),
        gpsEnabled: true,
        gpsDeviceId: 'GPS-VAN001',
        status: 'ACTIVE',
        condition: 'EXCELLENT',
        schoolId,
      },
    });
    vehicles.push(vehicle3);

    // Vehicle 4: School Van
    const vehicle4 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'VAN-002',
        vehicleName: 'Swift Runner',
        vehicleType: 'VAN',
        make: 'Toyota',
        model: 'Hiace',
        year: 2018,
        color: 'Silver',
        registrationNumber: 'KCD 012D',
        seatingCapacity: 14,
        currentOccupancy: 0,
        driverName: 'David Mwangi',
        driverPhone: '+254712345004',
        driverLicense: 'DL-2017-003456',
        lastServiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        insuranceExpiry: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
        roadworthyExpiry: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
        gpsEnabled: false,
        gpsDeviceId: null,
        status: 'ACTIVE',
        condition: 'FAIR',
        schoolId,
      },
    });
    vehicles.push(vehicle4);

    console.log(`✅ Created ${vehicles.length} vehicles`);
    return vehicles;
  } catch (error) {
    console.error('❌ Error creating vehicles:', error);
    return [];
  }
}

async function createRouteVehicleAssignments(routes, vehicles) {
  const assignments = [];

  try {
    // Assign vehicles to routes
    if (routes[0] && vehicles[0]) {
      const assignment1 = await prisma.routeVehicleAssignment.create({
        data: {
          routeId: routes[0].id,
          vehicleId: vehicles[0].id,
          dayOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          departureTime: '06:30',
          arrivalTime: '07:20',
          direction: 'BOTH',
          startDate: new Date(),
          status: 'ACTIVE',
          isActive: true,
        },
      });
      assignments.push(assignment1);
    }

    if (routes[1] && vehicles[1]) {
      const assignment2 = await prisma.routeVehicleAssignment.create({
        data: {
          routeId: routes[1].id,
          vehicleId: vehicles[1].id,
          dayOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          departureTime: '06:20',
          arrivalTime: '07:15',
          direction: 'BOTH',
          startDate: new Date(),
          status: 'ACTIVE',
          isActive: true,
        },
      });
      assignments.push(assignment2);
    }

    if (routes[2] && vehicles[2]) {
      const assignment3 = await prisma.routeVehicleAssignment.create({
        data: {
          routeId: routes[2].id,
          vehicleId: vehicles[2].id,
          dayOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          departureTime: '06:00',
          arrivalTime: '07:10',
          direction: 'BOTH',
          startDate: new Date(),
          status: 'ACTIVE',
          isActive: true,
        },
      });
      assignments.push(assignment3);
    }

    if (routes[3] && vehicles[3]) {
      const assignment4 = await prisma.routeVehicleAssignment.create({
        data: {
          routeId: routes[3].id,
          vehicleId: vehicles[3].id,
          dayOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          departureTime: '06:15',
          arrivalTime: '07:20',
          direction: 'BOTH',
          startDate: new Date(),
          status: 'ACTIVE',
          isActive: true,
        },
      });
      assignments.push(assignment4);
    }

    console.log(`✅ Created ${assignments.length} route-vehicle assignments`);
    return assignments;
  } catch (error) {
    console.error('❌ Error creating route-vehicle assignments:', error);
    return [];
  }
}

async function createStudentTransportAssignments(schoolId, routes, vehicles, students, academicYearId) {
  const assignments = [];

  try {
    const studentsPerRoute = Math.floor(students.length / routes.length);

    for (let i = 0; i < routes.length && i < vehicles.length; i++) {
      const route = routes[i];
      const vehicle = vehicles[i];
      const routeStudents = students.slice(i * studentsPerRoute, (i + 1) * studentsPerRoute);

      for (const student of routeStudents) {
        try {
          const assignment = await prisma.studentTransportAssignment.create({
            data: {
              studentId: student.id,
              routeId: route.id,
              vehicleId: vehicle.id,
              pickupPoint: route.stops[0]?.name || route.startPoint,
              pickupTime: route.stops[0]?.time || '06:30',
              dropoffPoint: route.stops[route.stops.length - 1]?.name || route.endPoint,
              dropoffTime: route.stops[route.stops.length - 1]?.time || '07:30',
              startDate: new Date(),
              academicYearId,
              status: 'ACTIVE',
              isActive: true,
              schoolId,
            },
          });
          assignments.push(assignment);

          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { currentOccupancy: { increment: 1 } },
          });
        } catch (err) {
          console.error(`Error assigning student:`, err.message);
        }
      }
    }

    console.log(`✅ Created ${assignments.length} student transport assignments`);
    return assignments;
  } catch (error) {
    console.error('❌ Error creating student transport assignments:', error);
    return [];
  }
}

async function createVehicleMaintenance(vehicles) {
  const records = [];

  try {
    for (const vehicle of vehicles.slice(0, 3)) {
      const maintenance1 = await prisma.vehicleMaintenance.create({
        data: {
          vehicleId: vehicle.id,
          maintenanceType: 'ROUTINE_SERVICE',
          description: 'Regular service - oil change, filter replacement, general inspection',
          cost: 8500.00,
          currency: 'KES',
          serviceProvider: 'AutoCare Services Ltd',
          mechanicName: 'James Otieno',
          mechanicPhone: '+254722111222',
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          odometerReading: 45000,
          notes: 'All systems checked and running smoothly',
        },
      });
      records.push(maintenance1);

      const maintenance2 = await prisma.vehicleMaintenance.create({
        data: {
          vehicleId: vehicle.id,
          maintenanceType: 'TIRE_REPLACEMENT',
          description: 'Replaced front tires due to wear',
          cost: 12000.00,
          currency: 'KES',
          serviceProvider: 'TirePro Kenya',
          mechanicName: 'Samuel Kibet',
          mechanicPhone: '+254733222333',
          scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          odometerReading: 46500,
          notes: 'Front tires showing signs of wear, replacement recommended',
        },
      });
      records.push(maintenance2);
    }

    console.log(`✅ Created ${records.length} vehicle maintenance records`);
    return records;
  } catch (error) {
    console.error('❌ Error creating vehicle maintenance records:', error);
    return [];
  }
}

// ================================
// INVENTORY MANAGEMENT FUNCTIONS
// ================================

async function createInventoryCategories(schoolId) {
  const categories = [];

  try {
    // Main Categories
    const electronics = await prisma.inventoryCategory.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        schoolId,
      }
    });
    categories.push(electronics);

    const furniture = await prisma.inventoryCategory.create({
      data: {
        name: 'Furniture',
        description: 'School furniture and fixtures',
        schoolId,
      }
    });
    categories.push(furniture);

    const laboratory = await prisma.inventoryCategory.create({
      data: {
        name: 'Laboratory Equipment',
        description: 'Science lab equipment and supplies',
        schoolId,
      }
    });
    categories.push(laboratory);

    const sports = await prisma.inventoryCategory.create({
      data: {
        name: 'Sports Equipment',
        description: 'Sports and physical education equipment',
        schoolId,
      }
    });
    categories.push(sports);

    const stationery = await prisma.inventoryCategory.create({
      data: {
        name: 'Stationery',
        description: 'Office and school stationery supplies',
        schoolId,
      }
    });
    categories.push(stationery);

    const uniforms = await prisma.inventoryCategory.create({
      data: {
        name: 'Uniforms',
        description: 'School uniforms and accessories',
        schoolId,
      }
    });
    categories.push(uniforms);

    console.log(`✅ Created ${categories.length} inventory categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error creating inventory categories:', error);
    return [];
  }
}

async function createInventoryItems(schoolId, categories) {
  const items = [];

  try {
    if (categories.length === 0) {
      console.warn('⚠️ No categories found for inventory items');
      return items;
    }

    // Electronics items
    const electronicsCategory = categories.find(c => c.name === 'Electronics');
    if (electronicsCategory) {
      const laptop = await prisma.inventoryItem.create({
        data: {
          name: 'Dell Laptop - Core i5',
          description: 'Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD',
          itemCode: 'ELEC-LAP-001',
          barcode: '123456789001',
          categoryId: electronicsCategory.id,
          quantity: 25,
          minimumStock: 5,
          maximumStock: 50,
          reorderLevel: 10,
          unit: 'pieces',
          location: 'IT Store Room',
          shelf: 'A1',
          bin: '001',
          unitPrice: 45000,
          totalValue: 1125000,
          currency: 'KES',
          supplierName: 'TechSupply Kenya',
          supplierContact: '+254700123456',
          itemType: 'ELECTRONICS',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          tags: ['computer', 'laptop', 'education'],
          schoolId,
        }
      });
      items.push(laptop);

      const projector = await prisma.inventoryItem.create({
        data: {
          name: 'Epson Projector EB-X41',
          description: 'Epson EB-X41 XGA 3LCD Projector, 3600 lumens',
          itemCode: 'ELEC-PROJ-001',
          barcode: '123456789002',
          categoryId: electronicsCategory.id,
          quantity: 12,
          minimumStock: 2,
          maximumStock: 20,
          reorderLevel: 5,
          unit: 'pieces',
          location: 'IT Store Room',
          shelf: 'B2',
          bin: '005',
          unitPrice: 55000,
          totalValue: 660000,
          currency: 'KES',
          supplierName: 'Office Electronics Ltd',
          supplierContact: '+254711234567',
          itemType: 'ELECTRONICS',
          status: 'ACTIVE',
          condition: 'GOOD',
          warrantyExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
          tags: ['projector', 'presentation', 'classroom'],
          schoolId,
        }
      });
      items.push(projector);
    }

    // Furniture items
    const furnitureCategory = categories.find(c => c.name === 'Furniture');
    if (furnitureCategory) {
      const desk = await prisma.inventoryItem.create({
        data: {
          name: 'Student Desk - Standard',
          description: 'Wooden student desk with attached chair',
          itemCode: 'FURN-DESK-001',
          barcode: '123456789003',
          categoryId: furnitureCategory.id,
          quantity: 150,
          minimumStock: 20,
          maximumStock: 200,
          reorderLevel: 30,
          unit: 'pieces',
          location: 'Furniture Storage',
          shelf: 'Ground Floor',
          bin: 'Zone A',
          unitPrice: 3500,
          totalValue: 525000,
          currency: 'KES',
          supplierName: 'School Furniture Co.',
          supplierContact: '+254722345678',
          itemType: 'FURNITURE',
          status: 'ACTIVE',
          condition: 'GOOD',
          tags: ['desk', 'student', 'classroom'],
          schoolId,
        }
      });
      items.push(desk);

      const chair = await prisma.inventoryItem.create({
        data: {
          name: 'Office Chair - Ergonomic',
          description: 'Ergonomic office chair with adjustable height',
          itemCode: 'FURN-CHAIR-001',
          barcode: '123456789004',
          categoryId: furnitureCategory.id,
          quantity: 45,
          minimumStock: 10,
          maximumStock: 60,
          reorderLevel: 15,
          unit: 'pieces',
          location: 'Furniture Storage',
          shelf: 'First Floor',
          bin: 'Zone B',
          unitPrice: 8500,
          totalValue: 382500,
          currency: 'KES',
          supplierName: 'Office Furniture Kenya',
          supplierContact: '+254733456789',
          itemType: 'FURNITURE',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['chair', 'office', 'staff'],
          schoolId,
        }
      });
      items.push(chair);
    }

    // Laboratory Equipment
    const labCategory = categories.find(c => c.name === 'Laboratory Equipment');
    if (labCategory) {
      const microscope = await prisma.inventoryItem.create({
        data: {
          name: 'Compound Microscope',
          description: 'Binocular compound microscope, 40x-1000x magnification',
          itemCode: 'LAB-MICR-001',
          barcode: '123456789005',
          categoryId: labCategory.id,
          quantity: 20,
          minimumStock: 5,
          maximumStock: 30,
          reorderLevel: 8,
          unit: 'pieces',
          location: 'Science Lab 1',
          shelf: 'Cabinet A',
          bin: 'Drawer 1',
          unitPrice: 25000,
          totalValue: 500000,
          currency: 'KES',
          supplierName: 'Scientific Supplies Ltd',
          supplierContact: '+254744567890',
          itemType: 'LABORATORY',
          status: 'ACTIVE',
          condition: 'GOOD',
          warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          tags: ['microscope', 'biology', 'science'],
          schoolId,
        }
      });
      items.push(microscope);

      const beaker = await prisma.inventoryItem.create({
        data: {
          name: 'Beaker Set - 250ml',
          description: 'Glass beakers, 250ml capacity, pack of 12',
          itemCode: 'LAB-BEAK-001',
          barcode: '123456789006',
          categoryId: labCategory.id,
          quantity: 60,
          minimumStock: 15,
          maximumStock: 100,
          reorderLevel: 20,
          unit: 'pieces',
          location: 'Science Lab 2',
          shelf: 'Cabinet B',
          bin: 'Drawer 2',
          unitPrice: 150,
          totalValue: 9000,
          currency: 'KES',
          supplierName: 'Lab Glass Supplies',
          supplierContact: '+254755678901',
          itemType: 'LABORATORY',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['beaker', 'chemistry', 'glassware'],
          schoolId,
        }
      });
      items.push(beaker);
    }

    // Sports Equipment
    const sportsCategory = categories.find(c => c.name === 'Sports Equipment');
    if (sportsCategory) {
      const football = await prisma.inventoryItem.create({
        data: {
          name: 'Football - Size 5',
          description: 'Professional quality football, size 5',
          itemCode: 'SPORT-FB-001',
          barcode: '123456789007',
          categoryId: sportsCategory.id,
          quantity: 30,
          minimumStock: 10,
          maximumStock: 50,
          reorderLevel: 15,
          unit: 'pieces',
          location: 'Sports Store',
          shelf: 'Rack 1',
          bin: 'Ball Section',
          unitPrice: 1500,
          totalValue: 45000,
          currency: 'KES',
          supplierName: 'Sports World Kenya',
          supplierContact: '+254766789012',
          itemType: 'SPORTS',
          status: 'ACTIVE',
          condition: 'GOOD',
          tags: ['football', 'soccer', 'ball'],
          schoolId,
        }
      });
      items.push(football);

      const basketballHoop = await prisma.inventoryItem.create({
        data: {
          name: 'Basketball Hoop - Adjustable',
          description: 'Portable basketball hoop with adjustable height',
          itemCode: 'SPORT-BBH-001',
          barcode: '123456789008',
          categoryId: sportsCategory.id,
          quantity: 4,
          minimumStock: 1,
          maximumStock: 6,
          reorderLevel: 2,
          unit: 'pieces',
          location: 'Sports Store',
          shelf: 'Ground',
          bin: 'Large Equipment',
          unitPrice: 45000,
          totalValue: 180000,
          currency: 'KES',
          supplierName: 'Pro Sports Equipment',
          supplierContact: '+254777890123',
          itemType: 'SPORTS',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['basketball', 'hoop', 'court'],
          schoolId,
        }
      });
      items.push(basketballHoop);
    }

    // Stationery
    const stationeryCategory = categories.find(c => c.name === 'Stationery');
    if (stationeryCategory) {
      const notebooks = await prisma.inventoryItem.create({
        data: {
          name: 'Exercise Books - A4',
          description: 'A4 exercise books, 96 pages',
          itemCode: 'STAT-NB-001',
          barcode: '123456789009',
          categoryId: stationeryCategory.id,
          quantity: 500,
          minimumStock: 100,
          maximumStock: 1000,
          reorderLevel: 150,
          unit: 'pieces',
          location: 'Stationery Store',
          shelf: 'S1',
          bin: 'B01',
          unitPrice: 50,
          totalValue: 25000,
          currency: 'KES',
          supplierName: 'Stationery World',
          supplierContact: '+254788901234',
          itemType: 'CONSUMABLE',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['notebook', 'stationery', 'student'],
          schoolId,
        }
      });
      items.push(notebooks);

      const pens = await prisma.inventoryItem.create({
        data: {
          name: 'Ballpoint Pens - Blue',
          description: 'Blue ballpoint pens, box of 50',
          itemCode: 'STAT-PEN-001',
          barcode: '123456789010',
          categoryId: stationeryCategory.id,
          quantity: 200,
          minimumStock: 50,
          maximumStock: 500,
          reorderLevel: 75,
          unit: 'boxes',
          location: 'Stationery Store',
          shelf: 'S2',
          bin: 'B02',
          unitPrice: 500,
          totalValue: 100000,
          currency: 'KES',
          supplierName: 'Office Supplies Kenya',
          supplierContact: '+254799012345',
          itemType: 'CONSUMABLE',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['pen', 'stationery', 'writing'],
          schoolId,
        }
      });
      items.push(pens);
    }

    // Uniforms
    const uniformsCategory = categories.find(c => c.name === 'Uniforms');
    if (uniformsCategory) {
      const shirt = await prisma.inventoryItem.create({
        data: {
          name: 'School Shirt - White (Medium)',
          description: 'White school shirt, medium size',
          itemCode: 'UNIF-SH-M-001',
          barcode: '123456789011',
          categoryId: uniformsCategory.id,
          quantity: 80,
          minimumStock: 20,
          maximumStock: 150,
          reorderLevel: 30,
          unit: 'pieces',
          location: 'Uniform Store',
          shelf: 'U1',
          bin: 'Shirts-M',
          unitPrice: 800,
          totalValue: 64000,
          currency: 'KES',
          supplierName: 'School Uniforms Ltd',
          supplierContact: '+254700111222',
          itemType: 'UNIFORMS',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['uniform', 'shirt', 'medium'],
          schoolId,
        }
      });
      items.push(shirt);

      const tie = await prisma.inventoryItem.create({
        data: {
          name: 'School Tie - Blue Striped',
          description: 'Blue striped school tie',
          itemCode: 'UNIF-TIE-001',
          barcode: '123456789012',
          categoryId: uniformsCategory.id,
          quantity: 120,
          minimumStock: 30,
          maximumStock: 200,
          reorderLevel: 50,
          unit: 'pieces',
          location: 'Uniform Store',
          shelf: 'U2',
          bin: 'Accessories',
          unitPrice: 300,
          totalValue: 36000,
          currency: 'KES',
          supplierName: 'School Uniforms Ltd',
          supplierContact: '+254700111222',
          itemType: 'UNIFORMS',
          status: 'ACTIVE',
          condition: 'EXCELLENT',
          tags: ['uniform', 'tie', 'accessory'],
          schoolId,
        }
      });
      items.push(tie);
    }

    console.log(`✅ Created ${items.length} inventory items`);
    return items;
  } catch (error) {
    console.error('❌ Error creating inventory items:', error);
    return [];
  }
}

async function createInventoryTransactions(schoolId, items, userId) {
  const transactions = [];

  try {
    if (items.length === 0 || !userId) {
      console.warn('⚠️ No items or user found for transactions');
      return transactions;
    }

    // Create purchase transactions for some items
    for (let i = 0; i < Math.min(5, items.length); i++) {
      const item = items[i];
      const purchaseQty = Math.floor(item.quantity * 0.3);

      const transaction = await prisma.inventoryTransaction.create({
        data: {
          transactionType: 'PURCHASE',
          quantity: purchaseQty,
          unitPrice: item.unitPrice,
          totalAmount: purchaseQty * item.unitPrice,
          itemId: item.id,
          previousQty: item.quantity - purchaseQty,
          newQty: item.quantity,
          referenceType: 'PURCHASE_ORDER',
          referenceNumber: `PO-2025-${String(i + 1).padStart(4, '0')}`,
          userId,
          supplierName: item.supplierName,
          notes: `Initial stock purchase for ${item.name}`,
          transactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          schoolId,
        }
      });
      transactions.push(transaction);
    }

    // Create issue transactions
    if (items.length > 2) {
      const issueTransaction = await prisma.inventoryTransaction.create({
        data: {
          transactionType: 'ISSUE',
          quantity: 5,
          itemId: items[0].id,
          previousQty: items[0].quantity,
          newQty: items[0].quantity - 5,
          referenceType: 'ISSUE_NOTE',
          referenceNumber: 'ISS-2025-0001',
          userId,
          recipientName: 'Computer Lab',
          recipientType: 'DEPARTMENT',
          notes: 'Issued laptops to computer lab',
          transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          schoolId,
        }
      });
      transactions.push(issueTransaction);
    }

    // Create adjustment transaction
    if (items.length > 3) {
      const adjustTransaction = await prisma.inventoryTransaction.create({
        data: {
          transactionType: 'ADJUSTMENT',
          quantity: -2,
          itemId: items[3].id,
          previousQty: items[3].quantity + 2,
          newQty: items[3].quantity,
          userId,
          reason: 'Stock count correction',
          notes: 'Adjusted stock after physical count',
          transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          schoolId,
        }
      });
      transactions.push(adjustTransaction);
    }

    console.log(`✅ Created ${transactions.length} inventory transactions`);
    return transactions;
  } catch (error) {
    console.error('❌ Error creating inventory transactions:', error);
    return [];
  }
}

async function createInventoryAllocations(schoolId, items, students, teachers, userId) {
  const allocations = [];

  try {
    if (items.length === 0 || students.length === 0 || !userId) {
      console.warn('⚠️ No items, students, or user found for allocations');
      return allocations;
    }

    // Allocate laptops to students
    const laptop = items.find(i => i.itemCode === 'ELEC-LAP-001');
    if (laptop && students.length > 0) {
      for (let i = 0; i < Math.min(3, students.length); i++) {
        const student = students[i];
        const allocation = await prisma.inventoryAllocation.create({
          data: {
            itemId: laptop.id,
            quantity: 1,
            allocatedTo: `${student.firstName} ${student.lastName}`,
            allocatedToType: 'STUDENT',
            allocatedToId: student.id,
            allocationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            expectedReturn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'ALLOCATED',
            issuedCondition: 'GOOD',
            allocatedBy: userId,
            purpose: 'Learning and assignments',
            notes: `Laptop allocated for academic year`,
            schoolId,
          }
        });
        allocations.push(allocation);
      }
    }

    // Allocate sports equipment
    const football = items.find(i => i.itemCode === 'SPORT-FB-001');
    if (football) {
      const allocation = await prisma.inventoryAllocation.create({
        data: {
          itemId: football.id,
          quantity: 10,
          allocatedTo: 'Sports Department',
          allocatedToType: 'DEPARTMENT',
          allocationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: 'ALLOCATED',
          issuedCondition: 'EXCELLENT',
          allocatedBy: userId,
          purpose: 'Sports training and matches',
          notes: 'Footballs for the sports season',
          schoolId,
        }
      });
      allocations.push(allocation);
    }

    // Allocate some items to teachers
    if (teachers.length > 0 && items.length > 5) {
      const teacher = teachers[0];
      const teacherUser = await prisma.user.findFirst({
        where: { email: teacher.email }
      });

      if (teacherUser) {
        const projector = items.find(i => i.itemCode === 'ELEC-PROJ-001');
        if (projector) {
          const allocation = await prisma.inventoryAllocation.create({
            data: {
              itemId: projector.id,
              quantity: 1,
              allocatedTo: `${teacher.firstName} ${teacher.lastName}`,
              allocatedToType: 'TEACHER',
              allocatedToId: teacherUser.id,
              allocationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              expectedReturn: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              status: 'ALLOCATED',
              issuedCondition: 'GOOD',
              allocatedBy: userId,
              purpose: 'Classroom presentations',
              notes: 'Projector for teaching',
              schoolId,
            }
          });
          allocations.push(allocation);
        }
      }
    }

    // Create a returned allocation
    if (items.length > 0 && students.length > 1) {
      const student = students[1];
      const item = items.find(i => i.itemType === 'SPORTS');
      if (item) {
        const returnedAllocation = await prisma.inventoryAllocation.create({
          data: {
            itemId: item.id,
            quantity: 1,
            allocatedTo: `${student.firstName} ${student.lastName}`,
            allocatedToType: 'STUDENT',
            allocatedToId: student.id,
            allocationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            expectedReturn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            actualReturn: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            status: 'RETURNED',
            issuedCondition: 'GOOD',
            returnCondition: 'GOOD',
            allocatedBy: userId,
            purpose: 'Sports practice',
            notes: 'Equipment for practice sessions',
            returnNotes: 'Returned in good condition',
            schoolId,
          }
        });
        allocations.push(returnedAllocation);
      }
    }

    console.log(`✅ Created ${allocations.length} inventory allocations`);
    return allocations;
  } catch (error) {
    console.error('❌ Error creating inventory allocations:', error);
    return [];
  }
}

async function createNotifications(schoolId, users, students, classes) {
  const notifications = [];

  try {
    const admin = users.find(u => u.role === 'ADMIN');
    const teachers = users.filter(u => u.role === 'TEACHER');
    const studentUsers = users.filter(u => u.role === 'STUDENT');
    const parents = users.filter(u => u.role === 'PARENT');

    // 1. System-wide announcement
    const notif1 = await prisma.notification.create({
      data: {
        title: 'Welcome to the New Academic Year',
        message: 'We are excited to begin a new academic year! Please check your schedules and prepare for the first day of classes.',
        type: 'ANNOUNCEMENT',
        priority: 'HIGH',
        category: 'GENERAL',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ALL_USERS',
        targetUsers: [],
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        schoolId,
        createdById: admin.id,
      }
    });
    notifications.push(notif1);

    // Create user notifications for this announcement
    const allUsers = [...teachers, ...studentUsers, ...parents, admin];
    for (const user of allUsers.slice(0, 10)) { // Limit to 10 users for demo
      await prisma.userNotification.create({
        data: {
          notificationId: notif1.id,
          userId: user.id,
          isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) : null,
          isDelivered: true,
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        }
      });
    }

    // 2. Fee payment reminder
    const notif2 = await prisma.notification.create({
      data: {
        title: 'Fee Payment Reminder',
        message: 'This is a reminder that school fees are due by the end of this month. Please ensure timely payment to avoid late fees.',
        type: 'FEE_REMINDER',
        priority: 'NORMAL',
        category: 'FINANCIAL',
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        targetType: 'ROLE_BASED',
        targetUsers: [],
        targetRoles: ['PARENT'],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        schoolId,
        createdById: admin.id,
      }
    });
    notifications.push(notif2);

    // Create notifications for parents
    for (const parent of parents) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif2.id,
          userId: parent.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: new Date(),
        }
      });
    }

    // 3. Assignment deadline notification
    if (classes.length > 0) {
      const notif3 = await prisma.notification.create({
        data: {
          title: 'Assignment Due Soon',
          message: 'Reminder: Your Mathematics assignment is due tomorrow. Please submit before 11:59 PM.',
          type: 'ACADEMIC',
          priority: 'HIGH',
          category: 'ACADEMIC',
          channels: ['IN_APP', 'PUSH'],
          targetType: 'CLASS_BASED',
          targetUsers: [],
          targetRoles: [],
          targetClasses: [classes[0].id],
          status: 'SENT',
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
          schoolId,
          createdById: teachers[0].id,
        }
      });
      notifications.push(notif3);

      // Create notifications for students in the class
      const classStudents = students.filter(s => s.currentClassId === classes[0].id).slice(0, 5);
      for (const student of classStudents) {
        const studentUser = users.find(u => u.email === `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@${student.school.subdomain}.com`);
        if (studentUser) {
          await prisma.userNotification.create({
            data: {
              notificationId: notif3.id,
              userId: studentUser.id,
              isRead: Math.random() < 0.7,
              readAt: Math.random() < 0.7 ? new Date(Date.now() - 30 * 60 * 1000) : null,
              isDelivered: true,
              deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            }
          });
        }
      }
    }

    // 4. Event notification
    const notif4 = await prisma.notification.create({
      data: {
        title: 'Sports Day Next Week',
        message: 'Get ready for our annual Sports Day event next Friday! All students are encouraged to participate. Registration is now open.',
        type: 'EVENT',
        priority: 'NORMAL',
        category: 'EVENT',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ROLE_BASED',
        targetUsers: [],
        targetRoles: ['STUDENT', 'TEACHER', 'PARENT'],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        schoolId,
        createdById: admin.id,
      }
    });
    notifications.push(notif4);

    // Create notifications for students, teachers, and parents
    const eventTargets = [...studentUsers.slice(0, 8), ...teachers.slice(0, 3), ...parents.slice(0, 3)];
    for (const user of eventTargets) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif4.id,
          userId: user.id,
          isRead: Math.random() > 0.6,
          readAt: Math.random() > 0.6 ? new Date(Date.now() - 4 * 60 * 60 * 1000) : null,
          isDelivered: true,
          deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        }
      });
    }

    // 5. Grade published notification
    const notif5 = await prisma.notification.create({
      data: {
        title: 'Grades Published',
        message: 'Your midterm exam grades have been published. Check your gradebook to see your results.',
        type: 'GRADE',
        priority: 'HIGH',
        category: 'ACADEMIC',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ROLE_BASED',
        targetUsers: [],
        targetRoles: ['STUDENT'],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        schoolId,
        createdById: teachers[0].id,
      }
    });
    notifications.push(notif5);

    // Create notifications for students
    for (const student of studentUsers.slice(0, 6)) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif5.id,
          userId: student.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: new Date(),
        }
      });
    }

    // 6. Attendance alert
    const notif6 = await prisma.notification.create({
      data: {
        title: 'Attendance Alert',
        message: 'Your child was marked absent today. If this is incorrect, please contact the school office.',
        type: 'ALERT',
        priority: 'URGENT',
        category: 'ATTENDANCE',
        channels: ['IN_APP', 'SMS', 'EMAIL'],
        targetType: 'SPECIFIC_USERS',
        targetUsers: parents.length > 0 ? [parents[0].id] : [],
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        schoolId,
        createdById: admin.id,
      }
    });
    notifications.push(notif6);

    if (parents.length > 0) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif6.id,
          userId: parents[0].id,
          isRead: false,
          isDelivered: true,
          deliveredAt: new Date(),
        }
      });
    }

    console.log(`✅ Created ${notifications.length} notifications`);
    return notifications;
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    return [];
  }
}

async function createResults(schoolId, students, classes, subjects, term, gradeScale) {
  try {
    const results = [];

    // Get students grouped by class
    const studentsByClass = {};
    for (const student of students) {
      if (!studentsByClass[student.currentClassId]) {
        studentsByClass[student.currentClassId] = [];
      }
      studentsByClass[student.currentClassId].push(student);
    }

    // Create results for each student in each class
    for (const cls of classes) {
      const classStudents = studentsByClass[cls.id] || [];
      const classSubjects = subjects.slice(0, 6); // Use first 6 subjects for each class

      for (const student of classStudents) {
        // Generate random scores for the student
        const subjectResults = [];
        let totalScore = 0;

        for (const subject of classSubjects) {
          // Generate realistic random scores
          const firstCA = Math.floor(Math.random() * 11) + 10; // 10-20
          const secondCA = Math.floor(Math.random() * 11) + 10; // 10-20
          const thirdCA = Math.floor(Math.random() * 11) + 10; // 10-20
          const exam = Math.floor(Math.random() * 31) + 40; // 40-70

          const totalCA = firstCA + secondCA + thirdCA;
          const subjectTotal = totalCA + exam;

          // Find grade for this score
          const gradeRange = gradeScale.gradeRanges.find(range =>
            subjectTotal >= range.minScore && subjectTotal <= range.maxScore
          );

          subjectResults.push({
            subjectId: subject.id,
            firstCA,
            secondCA,
            thirdCA,
            exam,
            totalCA,
            totalScore: subjectTotal,
            grade: gradeRange?.grade || 'F',
            gradePoint: gradeRange?.gradePoint || 0,
            remark: gradeRange?.remark || 'Poor',
          });

          totalScore += subjectTotal;
        }

        const averageScore = totalScore / classSubjects.length;

        // Create result
        const result = await prisma.result.create({
          data: {
            studentId: student.id,
            termId: term.id,
            classId: cls.id,
            schoolId: schoolId,
            gradeScaleId: gradeScale.id,
            totalScore,
            totalSubjects: classSubjects.length,
            averageScore,
            daysPresent: Math.floor(Math.random() * 11) + 55, // 55-65 days
            daysAbsent: Math.floor(Math.random() * 5), // 0-4 days
            timesLate: Math.floor(Math.random() * 3), // 0-2 times
            conductGrade: averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B' : averageScore >= 60 ? 'C' : 'D',
            teacherComment: averageScore >= 80
              ? 'Excellent performance. Keep up the good work!'
              : averageScore >= 70
              ? 'Good effort. Continue to work hard.'
              : averageScore >= 60
              ? 'Fair performance. More effort is needed.'
              : 'Needs significant improvement.',
            isPublished: false,
          }
        });

        // Create subject results
        if (subjectResults.length > 0) {
          await prisma.subjectResult.createMany({
            data: subjectResults.map(sr => ({
              resultId: result.id,
              ...sr
            }))
          });
        }

        results.push(result);
      }
    }

    // Calculate positions for all classes
    for (const cls of classes) {
      const classResults = results.filter(r => r.classId === cls.id);
      classResults.sort((a, b) => b.averageScore - a.averageScore);

      for (let i = 0; i < classResults.length; i++) {
        await prisma.result.update({
          where: { id: classResults[i].id },
          data: { position: i + 1 }
        });
      }
    }

    console.log(`✅ Created ${results.length} student results`);
    return results;
  } catch (error) {
    console.error('❌ Error creating results:', error);
    return [];
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