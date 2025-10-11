const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminNotifications() {
  try {
    console.log('Creating notifications for admin user...');

    // Get school and admin user
    const school = await prisma.school.findFirst();
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!school || !admin) {
      console.error('School or admin not found.');
      return;
    }

    console.log(`Found admin: ${admin.email} (${admin.id})`);

    // Create notifications for admin
    const notificationsData = [
      {
        title: 'System Performance Report',
        message: 'Monthly system performance report is ready for review. All systems are operating normally with 99.9% uptime.',
        type: 'SYSTEM',
        priority: 'NORMAL',
        category: 'SYSTEM',
      },
      {
        title: 'New Teacher Registration',
        message: 'A new teacher has requested access to the system. Please review and approve their account.',
        type: 'ANNOUNCEMENT',
        priority: 'HIGH',
        category: 'ADMINISTRATIVE',
      },
      {
        title: 'Fee Collection Summary',
        message: 'This month\'s fee collection is at 85%. Total collected: $125,000. Pending: $22,000.',
        type: 'FEE_REMINDER',
        priority: 'NORMAL',
        category: 'FINANCIAL',
      },
      {
        title: 'Attendance Report Alert',
        message: 'Overall attendance this week is below 90%. Please review the attendance reports.',
        type: 'ATTENDANCE',
        priority: 'HIGH',
        category: 'ADMINISTRATIVE',
      },
      {
        title: 'Parent-Teacher Meeting Scheduled',
        message: 'Annual parent-teacher meetings are scheduled for next month. Coordination required.',
        type: 'EVENT',
        priority: 'NORMAL',
        category: 'EVENTS',
      },
      {
        title: 'Library Books Overdue',
        message: '15 library books are overdue by more than 30 days. Action may be required.',
        type: 'LIBRARY',
        priority: 'NORMAL',
        category: 'ADMINISTRATIVE',
      },
      {
        title: 'Exam Results Published',
        message: 'Mid-term exam results have been published. Overall pass rate: 92%.',
        type: 'EXAM_RESULT',
        priority: 'HIGH',
        category: 'ACADEMIC',
      },
      {
        title: 'Welcome Administrator',
        message: 'Welcome to the notification system! You will receive important updates and alerts here.',
        type: 'WELCOME',
        priority: 'NORMAL',
        category: 'GENERAL',
      }
    ];

    let createdCount = 0;

    for (const notifData of notificationsData) {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          ...notifData,
          channels: ['IN_APP', 'EMAIL'],
          targetType: 'SPECIFIC_USERS',
          targetUsers: [admin.id],
          targetRoles: [],
          targetClasses: [],
          status: 'SENT',
          sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
          schoolId: school.id,
          createdById: admin.id,
          totalTargets: 1,
          readCount: 0,
        }
      });

      // Create user notification
      await prisma.userNotification.create({
        data: {
          notificationId: notification.id,
          userId: admin.id,
          isRead: Math.random() > 0.6, // 40% read
          isDelivered: true,
          deliveredAt: notification.sentAt,
        }
      });

      createdCount++;
      console.log(`✅ Created: ${notifData.title}`);
    }

    console.log(`\n✅ Successfully created ${createdCount} notifications for admin user`);

  } catch (error) {
    console.error('Error creating admin notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminNotifications();
