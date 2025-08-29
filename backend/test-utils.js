// Test utility to set school status for testing purposes
// This can be used in development to test the pending approval feature

const { prisma } = require('../config/database');

async function setSchoolStatus(schoolId, status) {
  try {
    const school = await prisma.school.update({
      where: { id: schoolId },
      data: { status: status.toUpperCase() }
    });
    
    console.log(`School status updated: ${school.name} -> ${school.status}`);
    return school;
  } catch (error) {
    console.error('Error updating school status:', error);
    throw error;
  }
}

async function listSchools() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Available schools:');
    schools.forEach(school => {
      console.log(`- ${school.name} (${school.subdomain}) - ${school.status} - ID: ${school.id}`);
    });
    
    return schools;
  } catch (error) {
    console.error('Error listing schools:', error);
    throw error;
  }
}

async function getUsersWithSchools() {
  try {
    const users = await prisma.user.findMany({
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true
          }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Recent users with schools:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      if (user.school) {
        console.log(`  School: ${user.school.name} - Status: ${user.school.status}`);
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

// Export functions for use in other scripts
module.exports = {
  setSchoolStatus,
  listSchools,
  getUsersWithSchools
};

// If run directly, show available schools
if (require.main === module) {
  console.log('School Management Test Utility');
  console.log('==============================');
  
  listSchools()
    .then(() => {
      console.log('\nTo set a school to pending status:');
      console.log('node test-utils.js setStatus <schoolId> pending');
      console.log('\nTo set a school to active status:');
      console.log('node test-utils.js setStatus <schoolId> active');
    })
    .catch(console.error)
    .finally(() => process.exit());
}
