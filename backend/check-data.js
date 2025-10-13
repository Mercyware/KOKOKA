const { prisma } = require('./config/database');

async function checkData() {
  try {
    const terms = await prisma.term.findMany();
    console.log('Terms:', terms.length);
    terms.forEach(t => console.log('- ', t.name, t.id));

    const classes = await prisma.class.findMany();
    console.log('\nClasses:', classes.length);
    classes.forEach(c => console.log('- ', c.name, c.id));

    const students = await prisma.student.findMany();
    console.log('\nStudents:', students.length);

    const subjects = await prisma.subject.findMany();
    console.log('\nSubjects:', subjects.length);
    subjects.forEach(s => console.log('- ', s.name, s.id));

    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkData();