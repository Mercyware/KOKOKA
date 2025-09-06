const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStudentQuery() {
  try {
    const classId = '46c91dcf-d730-4ebf-a27c-edd912a0776d'; // Grade 6A
    const academicYearId = 'e5241a5c-1427-487b-ad47-9163a2ee1c1c'; // 2024-2025
    const schoolId = 'e2b7c8d4-5f6a-7b8c-9d0e-1f2a3b4c5d6e'; // Assuming from the assessment
    
    console.log('🔍 Testing the exact query from getStudentsInClass...\n');
    console.log(`Class ID: ${classId}`);
    console.log(`Academic Year ID: ${academicYearId}\n`);
    
    // Get school ID from assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: 'a48e9f31-7812-4681-92fc-f331a1fff1a8' },
      select: { schoolId: true }
    });
    
    console.log(`School ID: ${assessment.schoolId}\n`);
    
    // Test the exact query from scoreController.js
    const students = await prisma.student.findMany({
      where: {
        schoolId: assessment.schoolId,
        studentClassHistory: {
          some: {
            classId,
            academicYearId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        studentClassHistory: {
          where: {
            classId,
            academicYearId,
            status: 'ACTIVE'
          },
          include: {
            class: {
              select: { id: true, name: true, grade: true }
            },
            academicYear: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } }
      ]
    });
    
    console.log(`✅ Query result: ${students.length} students found\n`);
    
    if (students.length > 0) {
      console.log('👥 Students found:');
      students.slice(0, 10).forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.user?.name} (${student.user?.email})`);
        student.studentClassHistory.forEach(history => {
          console.log(`      📅 ${history.academicYear?.name} - ${history.class?.name} (${history.status})`);
        });
      });
      if (students.length > 10) {
        console.log(`   ... and ${students.length - 10} more`);
      }
    } else {
      console.log('❌ No students found. Let me check the data structure...\n');
      
      // Check a few students directly
      const sampleStudents = await prisma.student.findMany({
        where: { schoolId: assessment.schoolId },
        take: 3,
        include: {
          user: {
            select: { name: true }
          },
          studentClassHistory: {
            include: {
              class: {
                select: { id: true, name: true }
              },
              academicYear: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
      
      console.log('🔍 Sample student data structure:');
      sampleStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.user?.name} (Student ID: ${student.id})`);
        console.log('   Class History:');
        student.studentClassHistory.forEach((history, hIndex) => {
          console.log(`     ${hIndex + 1}. Class: ${history.class?.name} (${history.class?.id})`);
          console.log(`        Academic Year: ${history.academicYear?.name} (${history.academicYear?.id})`);
          console.log(`        Status: ${history.status}`);
        });
      });
      
      // Check if the IDs match what we're looking for
      console.log('\n🎯 Checking for exact matches...');
      const historyCount = await prisma.studentClassHistory.count({
        where: {
          classId: classId,
          academicYearId: academicYearId,
          status: 'ACTIVE'
        }
      });
      
      console.log(`StudentClassHistory records with exact criteria: ${historyCount}`);
      
      if (historyCount > 0) {
        const sampleHistory = await prisma.studentClassHistory.findMany({
          where: {
            classId: classId,
            academicYearId: academicYearId,
            status: 'ACTIVE'
          },
          take: 3,
          include: {
            student: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            },
            class: {
              select: { name: true }
            },
            academicYear: {
              select: { name: true }
            }
          }
        });
        
        console.log('\n📋 Sample matching history records:');
        sampleHistory.forEach((history, index) => {
          console.log(`   ${index + 1}. Student: ${history.student.user?.name}`);
          console.log(`      Class: ${history.class?.name}`);
          console.log(`      Academic Year: ${history.academicYear?.name}`);
          console.log(`      Status: ${history.status}`);
          console.log(`      Student School ID: ${history.student.schoolId}`);
          console.log(`      Expected School ID: ${assessment.schoolId}`);
          console.log(`      School ID Match: ${history.student.schoolId === assessment.schoolId}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentQuery();
