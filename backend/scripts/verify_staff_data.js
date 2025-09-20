const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyStaffData() {
  try {
    console.log('🔍 Verifying staff data migration...');

    const school = await prisma.school.findFirst({
      where: { slug: 'greenwood-international' }
    });

    if (!school) {
      throw new Error('School not found');
    }

    // Get total staff count
    const totalStaff = await prisma.staff.count({
      where: { schoolId: school.id }
    });

    console.log(`\n📊 Total Staff Members: ${totalStaff}`);

    // Get staff by type with details
    const staffByType = await prisma.staff.groupBy({
      by: ['staffType'],
      where: { schoolId: school.id },
      _count: { staffType: true }
    });

    console.log('\n📋 Staff Distribution:');
    let teacherCount = 0;
    staffByType.forEach(group => {
      const emoji = group.staffType === 'TEACHER' ? '👨‍🏫' : 
                   group.staffType === 'ADMINISTRATOR' ? '👨‍💼' :
                   group.staffType === 'LIBRARIAN' ? '📚' :
                   group.staffType === 'NURSE' ? '👩‍⚕️' :
                   group.staffType === 'COUNSELOR' ? '🧠' : 
                   group.staffType === 'ACCOUNTANT' ? '💰' :
                   '👷‍♂️';
      console.log(`${emoji} ${group.staffType}: ${group._count.staffType}`);
      
      if (group.staffType === 'TEACHER') {
        teacherCount = group._count.staffType;
      }
    });

    // Detailed teacher information
    console.log(`\n👨‍🏫 Teacher Details (${teacherCount} found):`);
    const teachers = await prisma.staff.findMany({
      where: {
        schoolId: school.id,
        staffType: 'TEACHER'
      },
      include: {
        user: {
          select: { 
            name: true, 
            email: true,
            role: true,
            isActive: true 
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    teachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.firstName} ${teacher.lastName}`);
      console.log(`     Position: ${teacher.position}`);
      console.log(`     Employee ID: ${teacher.employeeId}`);
      console.log(`     Email: ${teacher.user?.email}`);
      console.log(`     Status: ${teacher.status}`);
      console.log(`     Joined: ${teacher.joiningDate.toDateString()}`);
      console.log(`     Salary: $${teacher.salary?.toLocaleString()}`);
      console.log('');
    });

    // Non-teaching staff
    const nonTeachingStaff = await prisma.staff.findMany({
      where: {
        schoolId: school.id,
        staffType: { not: 'TEACHER' }
      },
      include: {
        user: {
          select: { 
            name: true, 
            email: true 
          }
        }
      },
      orderBy: [
        { staffType: 'asc' },
        { firstName: 'asc' }
      ]
    });

    console.log(`👨‍💼 Non-Teaching Staff (${nonTeachingStaff.length} found):`);
    nonTeachingStaff.forEach((staff, index) => {
      const emoji = staff.staffType === 'ADMINISTRATOR' ? '👨‍💼' :
                   staff.staffType === 'LIBRARIAN' ? '📚' :
                   staff.staffType === 'NURSE' ? '👩‍⚕️' :
                   staff.staffType === 'COUNSELOR' ? '🧠' : 
                   staff.staffType === 'ACCOUNTANT' ? '💰' :
                   '👷‍♂️';
      
      console.log(`  ${emoji} ${staff.firstName} ${staff.lastName} - ${staff.staffType}`);
      console.log(`     Position: ${staff.position}`);
      console.log(`     Employee ID: ${staff.employeeId}`);
      console.log('');
    });

    // Verification checklist
    console.log('✅ Verification Checklist:');
    console.log(`   📊 Total staff created: ${totalStaff >= 12 ? '✅' : '❌'} (${totalStaff}/12+)`);
    console.log(`   👨‍🏫 Teachers created: ${teacherCount >= 4 ? '✅' : '❌'} (${teacherCount}/4+)`);
    console.log(`   👥 All staff have users: ${await checkAllStaffHaveUsers(school.id) ? '✅' : '❌'}`);
    console.log(`   📧 All users have emails: ${await checkAllUsersHaveEmails(school.id) ? '✅' : '❌'}`);
    console.log(`   🏫 All linked to correct school: ${await checkAllLinkedToSchool(school.id) ? '✅' : '❌'}`);

    if (teacherCount >= 4 && totalStaff >= 12) {
      console.log('\n🎉 Migration verification PASSED! Staff data successfully created with teachers.');
    } else {
      console.log('\n⚠️ Migration verification INCOMPLETE. Some staff may be missing.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkAllStaffHaveUsers(schoolId) {
  const staffWithoutUsers = await prisma.staff.count({
    where: {
      schoolId: schoolId,
      user: null
    }
  });
  return staffWithoutUsers === 0;
}

async function checkAllUsersHaveEmails(schoolId) {
  const staffUsers = await prisma.staff.findMany({
    where: { schoolId: schoolId },
    include: {
      user: {
        select: { email: true }
      }
    }
  });
  
  return staffUsers.every(staff => staff.user && staff.user.email);
}

async function checkAllLinkedToSchool(schoolId) {
  const staffNotLinkedToSchool = await prisma.staff.count({
    where: {
      schoolId: { not: schoolId }
    }
  });
  return staffNotLinkedToSchool === 0;
}

verifyStaffData();