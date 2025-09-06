const { prisma } = require('./config/database');

async function checkData() {
  try {
    const school = await prisma.school.findUnique({ where: { subdomain: 'greenwood' } });
    console.log('School:', school ? { id: school.id, name: school.name } : 'Not found');
    
    if (school) {
      const [classes, subjects, academicYears, terms] = await Promise.all([
        prisma.class.findMany({ where: { schoolId: school.id } }),
        prisma.subject.findMany({ where: { schoolId: school.id } }),
        prisma.academicYear.findMany({ where: { schoolId: school.id } }),
        prisma.term.findMany({ where: { schoolId: school.id } })
      ]);
      
      console.log('Classes count:', classes.length);
      console.log('Subjects count:', subjects.length);
      console.log('Academic Years count:', academicYears.length);
      console.log('Terms count:', terms.length);
      
      if (classes.length > 0) console.log('Sample class:', classes[0]);
      if (subjects.length > 0) console.log('Sample subject:', subjects[0]);
      if (academicYears.length > 0) console.log('Sample academic year:', academicYears[0]);
      if (terms.length > 0) console.log('Sample term:', terms[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();