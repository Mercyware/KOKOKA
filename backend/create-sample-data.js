const { prisma } = require('./config/database');

async function createSampleData() {
  try {
    // Get the school
    let school = await prisma.school.findFirst();
    
    if (!school) {
      console.log('Creating school...');
      school = await prisma.school.create({
        data: {
          name: 'Greenwood International School',
          slug: 'greenwood-international',
          subdomain: 'demo',
          description: 'A leading international school providing quality education',
          type: 'SECONDARY',
          status: 'ACTIVE',
          email: 'admin@greenwood.edu',
          phone: '+1-555-0123'
        }
      });
    }

    // Get or create academic year
    let academicYear = await prisma.academicYear.findFirst({
      where: { schoolId: school.id }
    });

    if (!academicYear) {
      console.log('Creating academic year...');
      academicYear = await prisma.academicYear.create({
        data: {
          name: '2024-2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          isCurrent: true,
          schoolId: school.id
        }
      });
    }

    // Get or create terms
    let terms = await prisma.term.findMany({
      where: { schoolId: school.id }
    });

    if (terms.length === 0) {
      console.log('Creating terms...');
      const termData = [
        {
          name: 'First Term',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          schoolId: school.id,
          academicYearId: academicYear.id
        },
        {
          name: 'Second Term',
          startDate: new Date('2025-01-06'),
          endDate: new Date('2025-04-15'),
          schoolId: school.id,
          academicYearId: academicYear.id
        },
        {
          name: 'Third Term',
          startDate: new Date('2025-04-22'),
          endDate: new Date('2025-06-30'),
          schoolId: school.id,
          academicYearId: academicYear.id
        }
      ];

      for (const term of termData) {
        await prisma.term.create({ data: term });
      }
      
      terms = await prisma.term.findMany({
        where: { schoolId: school.id }
      });
    }

    // Get or create classes
    let classes = await prisma.class.findMany({
      where: { schoolId: school.id }
    });

    if (classes.length === 0) {
      console.log('Creating classes...');
      const classData = [
        { name: 'Grade 9A', grade: '9', capacity: 30, schoolId: school.id },
        { name: 'Grade 9B', grade: '9', capacity: 30, schoolId: school.id },
        { name: 'Grade 10A', grade: '10', capacity: 28, schoolId: school.id }
      ];

      for (const classInfo of classData) {
        await prisma.class.create({ data: classInfo });
      }

      classes = await prisma.class.findMany({
        where: { schoolId: school.id }
      });
    }

    // Get or create subjects
    let subjects = await prisma.subject.findMany({
      where: { schoolId: school.id }
    });

    if (subjects.length === 0) {
      console.log('Creating subjects...');
      const subjectData = [
        { name: 'Mathematics', code: 'MATH', credits: 4, schoolId: school.id },
        { name: 'English Language', code: 'ENG', credits: 4, schoolId: school.id },
        { name: 'Physics', code: 'PHY', credits: 3, schoolId: school.id },
        { name: 'Chemistry', code: 'CHEM', credits: 3, schoolId: school.id },
        { name: 'Biology', code: 'BIO', credits: 3, schoolId: school.id },
        { name: 'History', code: 'HIST', credits: 2, schoolId: school.id },
        { name: 'Geography', code: 'GEO', credits: 2, schoolId: school.id }
      ];

      for (const subject of subjectData) {
        await prisma.subject.create({ data: subject });
      }

      subjects = await prisma.subject.findMany({
        where: { schoolId: school.id }
      });
    }

    // Create some sample users and students
    let students = await prisma.student.findMany({
      where: { schoolId: school.id }
    });

    if (students.length === 0) {
      console.log('Creating sample students...');
      const studentData = [
        {
          admissionNumber: 'GW2024001',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'MALE',
          dateOfBirth: new Date('2008-05-15'),
          status: 'ACTIVE',
          schoolId: school.id,
          currentClassId: classes[0].id, // Grade 9A
          academicYearId: academicYear.id
        },
        {
          admissionNumber: 'GW2024002',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'FEMALE',
          dateOfBirth: new Date('2008-03-22'),
          status: 'ACTIVE',
          schoolId: school.id,
          currentClassId: classes[0].id, // Grade 9A
          academicYearId: academicYear.id
        },
        {
          admissionNumber: 'GW2024003',
          firstName: 'Michael',
          lastName: 'Johnson',
          gender: 'MALE',
          dateOfBirth: new Date('2008-08-10'),
          status: 'ACTIVE',
          schoolId: school.id,
          currentClassId: classes[0].id, // Grade 9A
          academicYearId: academicYear.id
        }
      ];

      for (const student of studentData) {
        await prisma.student.create({ data: student });
      }

      students = await prisma.student.findMany({
        where: { schoolId: school.id }
      });
    }

    console.log('Sample data created successfully!');
    console.log(`School: ${school.name}`);
    console.log(`Academic Year: ${academicYear.name}`);
    console.log(`Terms: ${terms.length}`);
    console.log(`Classes: ${classes.length}`);
    console.log(`Subjects: ${subjects.length}`);
    console.log(`Students: ${students.length}`);

    // Log the IDs for testing
    console.log('\n--- IDs for Testing ---');
    console.log('School ID:', school.id);
    console.log('First Term ID:', terms[0]?.id);
    console.log('First Class ID:', classes[0]?.id);
    console.log('First Student ID:', students[0]?.id);
    console.log('Subject IDs:', subjects.map(s => `${s.name}: ${s.id}`).join(', '));

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();