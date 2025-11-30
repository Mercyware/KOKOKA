const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAcademicDates() {
  try {
    console.log('🔄 Updating academic year and term dates...\n');

    const today = new Date();
    const currentYear = today.getFullYear();

    // Set academic year to current year cycle (e.g., 2025-2026)
    const academicYearStart = new Date(currentYear, 8, 1); // September 1, current year
    const academicYearEnd = new Date(currentYear + 1, 5, 30); // June 30, next year

    console.log(`Academic Year: ${currentYear}-${currentYear + 1}`);
    console.log(`  Start: ${academicYearStart.toISOString().split('T')[0]}`);
    console.log(`  End: ${academicYearEnd.toISOString().split('T')[0]}\n`);

    // Update all academic years to be current
    const academicYears = await prisma.academicYear.findMany({
      where: { isCurrent: true }
    });

    for (const year of academicYears) {
      await prisma.academicYear.update({
        where: { id: year.id },
        data: {
          name: `${currentYear}-${currentYear + 1}`,
          startDate: academicYearStart,
          endDate: academicYearEnd
        }
      });
      console.log(`✅ Updated Academic Year: ${year.id}`);
    }

    // Update terms to align with current academic year
    const terms = await prisma.term.findMany();

    for (const term of terms) {
      let termStart, termEnd, isCurrent = false;

      if (term.name.includes('1') || term.name.toLowerCase().includes('first')) {
        // Term 1: Sept - Dec
        termStart = new Date(currentYear, 8, 1); // Sept 1
        termEnd = new Date(currentYear, 11, 20); // Dec 20
        isCurrent = today >= termStart && today <= termEnd;
      } else if (term.name.includes('2') || term.name.toLowerCase().includes('second')) {
        // Term 2: Jan - Mar
        termStart = new Date(currentYear + 1, 0, 8); // Jan 8
        termEnd = new Date(currentYear + 1, 2, 28); // Mar 28
        isCurrent = today >= termStart && today <= termEnd;
      } else if (term.name.includes('3') || term.name.toLowerCase().includes('third')) {
        // Term 3: Apr - Jun
        termStart = new Date(currentYear + 1, 3, 8); // Apr 8
        termEnd = new Date(currentYear + 1, 5, 30); // Jun 30
        isCurrent = today >= termStart && today <= termEnd;
      } else {
        continue; // Skip unknown terms
      }

      await prisma.term.update({
        where: { id: term.id },
        data: {
          startDate: termStart,
          endDate: termEnd
        }
      });

      console.log(`✅ Updated ${term.name}: ${termStart.toISOString().split('T')[0]} to ${termEnd.toISOString().split('T')[0]} ${isCurrent ? '(CURRENT)' : ''}`);
    }

    console.log('\n✅ Academic dates updated successfully!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateAcademicDates();
