const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    // First, get the class ID for Grade 7A
    const class7A = await prisma.class.findFirst({
      where: { name: 'Grade 7A' },
      select: { id: true, name: true }
    });
    
    console.log('Grade 7A class:', class7A);
    
    // Get the first term
    const firstTerm = await prisma.term.findFirst({
      where: { name: 'First Term' },
      select: { id: true, name: true }
    });
    
    console.log('First Term:', firstTerm);
    
    // Now query results like the API does
    if (class7A && firstTerm) {
      const results = await prisma.result.findMany({
        where: { 
          classId: class7A.id, 
          termId: firstTerm.id 
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          subjectResults: {
            include: {
              subject: {
                select: { name: true, code: true }
              }
            }
          }
        },
        orderBy: { position: 'asc' }
      });
      
      console.log('\nResults found:', results.length);
      if (results.length > 0) {
        console.log('\nFirst result:');
        console.log('- Student:', results[0].student.user.name);
        console.log('- Average:', results[0].averageScore);
        console.log('- Position:', results[0].position);
        console.log('- Subjects:', results[0].subjectResults.length);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
