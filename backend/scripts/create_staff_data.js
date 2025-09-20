const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createStaffMembers() {
  try {
    console.log('🚀 Creating staff members...');

    // Get the school
    const school = await prisma.school.findFirst({
      where: { slug: 'greenwood-international' }
    });

    if (!school) {
      throw new Error('School not found');
    }

    console.log(`🏫 Using school: ${school.name}`);

    const passwordHash = await bcrypt.hash('staff123', 10);

    // Define staff data
    const staffData = [
      // Administrative Staff
      {
        user: {
          email: 'head.admin@greenwood.com',
          name: 'Robert Wilson',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'ADM001',
          firstName: 'Robert',
          lastName: 'Wilson',
          dateOfBirth: new Date('1975-03-15'),
          gender: 'MALE',
          phone: '+1-555-0201',
          streetAddress: '456 Oak Street',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Head Administrator',
          staffType: 'ADMINISTRATOR',
          joiningDate: new Date('2022-08-01'),
          salary: 75000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'finance.manager@greenwood.com',
          name: 'Linda Martinez',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'FIN001',
          firstName: 'Linda',
          lastName: 'Martinez',
          middleName: 'Rose',
          dateOfBirth: new Date('1978-07-20'),
          gender: 'FEMALE',
          phone: '+1-555-0202',
          streetAddress: '789 Pine Avenue',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Finance Manager',
          staffType: 'ACCOUNTANT',
          joiningDate: new Date('2022-09-01'),
          salary: 68000.00,
          status: 'ACTIVE'
        }
      },
      // Teaching Staff (marked as TEACHER type)
      {
        user: {
          email: 'math.teacher.staff@greenwood.com',
          name: 'Dr. James Thompson',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'TCH001',
          firstName: 'James',
          lastName: 'Thompson',
          middleName: 'Robert',
          dateOfBirth: new Date('1980-01-10'),
          gender: 'MALE',
          phone: '+1-555-0301',
          streetAddress: '123 Maple Drive',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Senior Mathematics Teacher',
          staffType: 'TEACHER',
          joiningDate: new Date('2021-08-15'),
          salary: 72000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'science.teacher.staff@greenwood.com',
          name: 'Dr. Maria Rodriguez',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'TCH002',
          firstName: 'Maria',
          lastName: 'Rodriguez',
          middleName: 'Elena',
          dateOfBirth: new Date('1982-05-18'),
          gender: 'FEMALE',
          phone: '+1-555-0302',
          streetAddress: '567 Elm Street',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Science Department Head',
          staffType: 'TEACHER',
          joiningDate: new Date('2021-08-15'),
          salary: 74000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'english.teacher.staff@greenwood.com',
          name: 'Sarah Williams',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'TCH003',
          firstName: 'Sarah',
          lastName: 'Williams',
          dateOfBirth: new Date('1985-11-03'),
          gender: 'FEMALE',
          phone: '+1-555-0303',
          streetAddress: '890 Cedar Lane',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'English Literature Teacher',
          staffType: 'TEACHER',
          joiningDate: new Date('2022-01-10'),
          salary: 65000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'history.teacher.staff@greenwood.com',
          name: 'Michael Davis',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'TCH004',
          firstName: 'Michael',
          lastName: 'Davis',
          middleName: 'John',
          dateOfBirth: new Date('1979-09-25'),
          gender: 'MALE',
          phone: '+1-555-0304',
          streetAddress: '234 Birch Road',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'History Teacher',
          staffType: 'TEACHER',
          joiningDate: new Date('2021-08-20'),
          salary: 67000.00,
          status: 'ACTIVE'
        }
      },
      // Support Staff
      {
        user: {
          email: 'librarian@greenwood.com',
          name: 'Emily Chen',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'LIB001',
          firstName: 'Emily',
          lastName: 'Chen',
          dateOfBirth: new Date('1983-04-12'),
          gender: 'FEMALE',
          phone: '+1-555-0401',
          streetAddress: '678 Willow Street',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Head Librarian',
          staffType: 'LIBRARIAN',
          joiningDate: new Date('2022-06-01'),
          salary: 55000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'nurse@greenwood.com',
          name: 'Jennifer Anderson',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'NUR001',
          firstName: 'Jennifer',
          lastName: 'Anderson',
          middleName: 'Marie',
          dateOfBirth: new Date('1976-08-30'),
          gender: 'FEMALE',
          phone: '+1-555-0501',
          streetAddress: '345 Spruce Avenue',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'School Nurse',
          staffType: 'NURSE',
          joiningDate: new Date('2022-08-15'),
          salary: 62000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'counselor@greenwood.com',
          name: 'David Kim',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'COU001',
          firstName: 'David',
          lastName: 'Kim',
          middleName: 'Min',
          dateOfBirth: new Date('1981-12-08'),
          gender: 'MALE',
          phone: '+1-555-0601',
          streetAddress: '901 Poplar Drive',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Student Counselor',
          staffType: 'COUNSELOR',
          joiningDate: new Date('2022-08-01'),
          salary: 58000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'maintenance@greenwood.com',
          name: 'Carlos Ramirez',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'MNT001',
          firstName: 'Carlos',
          lastName: 'Ramirez',
          dateOfBirth: new Date('1977-02-14'),
          gender: 'MALE',
          phone: '+1-555-0701',
          streetAddress: '456 Hickory Lane',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Maintenance Supervisor',
          staffType: 'MAINTENANCE',
          joiningDate: new Date('2022-07-01'),
          salary: 48000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'security@greenwood.com',
          name: 'Thomas Brown',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'SEC001',
          firstName: 'Thomas',
          lastName: 'Brown',
          middleName: 'William',
          dateOfBirth: new Date('1974-06-22'),
          gender: 'MALE',
          phone: '+1-555-0801',
          streetAddress: '123 Ash Street',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Security Officer',
          staffType: 'SECURITY',
          joiningDate: new Date('2022-08-01'),
          salary: 45000.00,
          status: 'ACTIVE'
        }
      },
      {
        user: {
          email: 'reception@greenwood.com',
          name: 'Jessica Lee',
          role: 'STAFF'
        },
        staff: {
          employeeId: 'REC001',
          firstName: 'Jessica',
          lastName: 'Lee',
          middleName: 'Anne',
          dateOfBirth: new Date('1988-10-05'),
          gender: 'FEMALE',
          phone: '+1-555-0901',
          streetAddress: '789 Walnut Avenue',
          city: 'Springfield',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          position: 'Front Desk Receptionist',
          staffType: 'RECEPTIONIST',
          joiningDate: new Date('2023-01-15'),
          salary: 42000.00,
          status: 'ACTIVE'
        }
      }
    ];

    let created = 0;
    let skipped = 0;

    for (const item of staffData) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: item.user.email }
        });

        let user;
        if (existingUser) {
          console.log(`👤 User ${item.user.email} already exists`);
          user = existingUser;
          skipped++;
        } else {
          // Create user
          user = await prisma.user.create({
            data: {
              email: item.user.email,
              passwordHash: passwordHash,
              name: item.user.name,
              role: item.user.role,
              isActive: true,
              emailVerified: true,
              schoolId: school.id
            }
          });
          console.log(`✅ Created user: ${item.user.name}`);
        }

        // Check if staff already exists
        const existingStaff = await prisma.staff.findFirst({
          where: {
            schoolId: school.id,
            employeeId: item.staff.employeeId
          }
        });

        if (existingStaff) {
          console.log(`👨‍💼 Staff ${item.staff.employeeId} already exists`);
          skipped++;
        } else {
          // Create staff
          await prisma.staff.create({
            data: {
              ...item.staff,
              schoolId: school.id,
              userId: user.id
            }
          });
          console.log(`✅ Created staff: ${item.staff.firstName} ${item.staff.lastName} (${item.staff.staffType})`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error creating staff ${item.user.name}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Created: ${created} staff members`);
    console.log(`⏭️ Skipped: ${skipped} (already exist)`);

    // Get final count and breakdown
    const staffSummary = await prisma.staff.groupBy({
      by: ['staffType'],
      where: {
        schoolId: school.id
      },
      _count: {
        staffType: true
      }
    });

    console.log('\n📈 Staff by Type:');
    staffSummary.forEach(group => {
      const emoji = group.staffType === 'TEACHER' ? '👨‍🏫' : 
                   group.staffType === 'ADMINISTRATOR' ? '👨‍💼' :
                   group.staffType === 'LIBRARIAN' ? '📚' :
                   group.staffType === 'NURSE' ? '👩‍⚕️' :
                   group.staffType === 'COUNSELOR' ? '🧠' : 
                   group.staffType === 'ACCOUNTANT' ? '💰' :
                   '👷‍♂️';
      console.log(`${emoji} ${group.staffType}: ${group._count.staffType}`);
    });

    // Show teachers specifically
    const teachers = await prisma.staff.findMany({
      where: {
        schoolId: school.id,
        staffType: 'TEACHER'
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`\n👨‍🏫 Teachers (${teachers.length}):`);
    teachers.forEach(teacher => {
      console.log(`  • ${teacher.firstName} ${teacher.lastName} - ${teacher.position}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffMembers();