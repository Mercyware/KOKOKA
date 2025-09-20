const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const students = await prisma.student.findMany({
      take: 3,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        currentSectionId: true,
        currentSection: {
          select: { name: true }
        },
        // Medical information
        medicalInfo: true,
        emergencyContacts: true,
        // Administrative information  
        permanentStreetAddress: true,
        previousAcademicRecord: true,
        feesPaid: true,
        transportInfo: true,
        // Social and behavioral
        languagesSpoken: true,
        talents: true,
        behavioralNotes: true,
        // Documentation
        documentsSubmitted: true
      }
    });
    
    console.log(`Found ${students.length} students with comprehensive information:`);
    students.forEach((student, index) => {
      console.log(`\n--- Student ${index + 1} ---`);
      console.log(`Name: ${student.firstName} ${student.lastName}`);
      console.log(`Admission Number: ${student.admissionNumber}`);
      console.log(`Section: ${student.currentSection?.name || 'Not assigned'}`);
      console.log(`Medical Info:`, student.medicalInfo ? 'Available' : 'Not available');
      console.log(`Emergency Contacts:`, student.emergencyContacts ? 'Available' : 'Not available');
      console.log(`Languages Spoken:`, student.languagesSpoken || 'None specified');
      console.log(`Special Talents:`, student.talents || 'None specified');
    });

    // Check class history
    const classHistories = await prisma.studentClassHistory.findMany({
      take: 5,
      select: {
        studentId: true,
        classId: true,
        student: {
          select: { firstName: true, lastName: true }
        },
        class: {
          select: { name: true }
        }
      }
    });

    console.log(`\n--- Class History (${classHistories.length} entries) ---`);
    classHistories.forEach((history, index) => {
      console.log(`${index + 1}. ${history.student.firstName} ${history.student.lastName} -> ${history.class.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();