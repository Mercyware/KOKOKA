const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runStaffMigration() {
  try {
    console.log('🚀 Starting staff data migration...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'add_staff_data.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split the SQL content by statements and execute them
    const statements = sqlContent
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .filter(statement => !statement.trim().startsWith('--'))
      .map(statement => statement.trim());

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let executed = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          executed++;
        } catch (error) {
          if (error.message.includes('duplicate key') || error.message.includes('CONFLICT')) {
            console.log(`⚠️ Skipping duplicate entry: ${error.message.substring(0, 100)}...`);
          } else {
            console.error(`❌ Error executing statement: ${statement.substring(0, 100)}...`);
            console.error(error.message);
          }
        }
      }
    }

    console.log(`✅ Successfully executed ${executed} statements`);

    // Get summary of staff by type
    const staffSummary = await prisma.$queryRaw`
      SELECT 
        "staffType" as staff_type, 
        COUNT(*) as count 
      FROM staff 
      WHERE "schoolId" = (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)
      GROUP BY "staffType"
      ORDER BY "staffType"
    `;

    console.log('\n📊 Staff Summary:');
    console.table(staffSummary);

    // Get list of all staff with their details
    const allStaff = await prisma.staff.findMany({
      where: {
        school: {
          slug: 'greenwood-international'
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`\n👥 Total Staff Members: ${allStaff.length}`);
    console.log('\nStaff Details:');
    allStaff.forEach(staff => {
      const type = staff.staffType === 'TEACHER' ? '👨‍🏫' : 
                   staff.staffType === 'ADMINISTRATOR' ? '👨‍💼' :
                   staff.staffType === 'LIBRARIAN' ? '📚' :
                   staff.staffType === 'NURSE' ? '👩‍⚕️' :
                   staff.staffType === 'COUNSELOR' ? '🧠' : '👷‍♂️';
      
      console.log(`${type} ${staff.firstName} ${staff.lastName} (${staff.employeeId}) - ${staff.position} [${staff.staffType}]`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runStaffMigration();