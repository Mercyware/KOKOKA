const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAttendanceDates() {
  try {
    console.log('🔄 Updating attendance dates to current date range...\n');

    // Get current date and calculate range
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 60); // Go back 60 days

    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`);

    // Get all attendance records
    const allRecords = await prisma.attendance.findMany({
      orderBy: { date: 'asc' }
    });

    console.log(`\nFound ${allRecords.length} attendance records to update`);

    if (allRecords.length === 0) {
      console.log('⚠️ No attendance records found. Please run seed first.');
      await prisma.$disconnect();
      return;
    }

    // Calculate the date shift needed
    const oldestRecord = allRecords[0];
    const newestRecord = allRecords[allRecords.length - 1];

    console.log(`Old date range: ${oldestRecord.date.toISOString().split('T')[0]} to ${newestRecord.date.toISOString().split('T')[0]}`);

    // Calculate how many days to shift (move newest record to today)
    const daysDiff = Math.floor((today - newestRecord.date) / (1000 * 60 * 60 * 24));

    console.log(`\nShifting all dates forward by ${daysDiff} days...`);

    // Update in batches
    const batchSize = 100;
    let updated = 0;

    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);

      await Promise.all(batch.map(record => {
        const newDate = new Date(record.date);
        newDate.setDate(newDate.getDate() + daysDiff);

        return prisma.attendance.update({
          where: { id: record.id },
          data: {
            date: newDate,
            createdAt: newDate,
            updatedAt: newDate
          }
        });
      }));

      updated += batch.length;
      console.log(`   ✓ Updated ${updated}/${allRecords.length} records`);
    }

    // Verify the update
    const updatedOldest = await prisma.attendance.findFirst({
      orderBy: { date: 'asc' }
    });
    const updatedNewest = await prisma.attendance.findFirst({
      orderBy: { date: 'desc' }
    });

    console.log(`\n✅ Update complete!`);
    console.log(`New date range: ${updatedOldest.date.toISOString().split('T')[0]} to ${updatedNewest.date.toISOString().split('T')[0]}`);

    // Verify records in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const lastMonthCount = await prisma.attendance.count({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lte: today
        }
      }
    });

    console.log(`\n📊 Records in last 30 days: ${lastMonthCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateAttendanceDates();
