const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNotifications() {
  try {
    console.log('Creating test notifications...');

    // Get school and users
    const school = await prisma.school.findFirst();
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, take: 5 });
    const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });
    const parents = await prisma.user.findMany({ where: { role: 'PARENT' }, take: 3 });

    if (!school || !admin) {
      console.error('School or admin not found. Please run the seed script first.');
      return;
    }

    const notifications = [];

    // 1. Welcome announcement
    const notif1 = await prisma.notification.create({
      data: {
        title: 'Welcome to the New Academic Year!',
        message: 'Welcome back to school! We hope you had a wonderful break and are ready for an exciting year ahead.',
        type: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        category: 'GENERAL',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ALL_USERS',
        targetUsers: [],
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        schoolId: school.id,
        createdById: admin.id,
      }
    });
    notifications.push(notif1);

    // Create notifications for all users
    const allUsers = [...students, ...teachers, ...parents];
    for (const user of allUsers) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif1.id,
          userId: user.id,
          isRead: Math.random() > 0.7, // 30% read
          isDelivered: true,
          deliveredAt: notif1.sentAt,
        }
      });
    }

    // 2. Fee payment reminder
    const notif2 = await prisma.notification.create({
      data: {
        title: 'Fee Payment Reminder',
        message: 'This is a reminder that school fees are due by the end of this month. Please ensure timely payment to avoid late fees.',
        type: 'FEE_REMINDER',
        priority: 'HIGH',
        category: 'FINANCIAL',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ROLE_BASED',
        targetUsers: [],
        targetRoles: ['PARENT'],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        schoolId: school.id,
        createdById: admin.id,
      }
    });
    notifications.push(notif2);

    // Create notifications for parents
    for (const parent of parents) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif2.id,
          userId: parent.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: notif2.sentAt,
        }
      });
    }

    // 3. Assignment deadline notification
    const notif3 = await prisma.notification.create({
      data: {
        title: 'Assignment Deadline Approaching',
        message: 'Your Mathematics assignment is due in 2 days. Please make sure to submit it on time.',
        type: 'ASSIGNMENT',
        priority: 'HIGH',
        category: 'ACADEMIC',
        channels: ['IN_APP'],
        targetType: 'SPECIFIC_USERS',
        targetUsers: students.map(s => s.id),
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        schoolId: school.id,
        createdById: teachers[0]?.id || admin.id,
      }
    });
    notifications.push(notif3);

    // Create notifications for students
    for (const student of students) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif3.id,
          userId: student.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: notif3.sentAt,
        }
      });
    }

    // 4. Event notification
    const notif4 = await prisma.notification.create({
      data: {
        title: 'Sports Day Next Week',
        message: 'Our annual Sports Day will be held next Friday. All students are required to participate. Parents are welcome to attend.',
        type: 'EVENT',
        priority: 'NORMAL',
        category: 'EVENTS',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ALL_USERS',
        targetUsers: [],
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        schoolId: school.id,
        createdById: admin.id,
      }
    });
    notifications.push(notif4);

    // Create notifications for all users
    for (const user of allUsers) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif4.id,
          userId: user.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: notif4.sentAt,
        }
      });
    }

    // 5. Grade published notification
    const notif5 = await prisma.notification.create({
      data: {
        title: 'Grades Published',
        message: 'Your term exam grades have been published. You can view them in the gradebook section.',
        type: 'GRADE_UPDATE',
        priority: 'HIGH',
        category: 'ACADEMIC',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ROLE_BASED',
        targetUsers: [],
        targetRoles: ['STUDENT'],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        schoolId: school.id,
        createdById: admin.id,
      }
    });
    notifications.push(notif5);

    // Create notifications for students
    for (const student of students) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif5.id,
          userId: student.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: notif5.sentAt,
        }
      });
    }

    // 6. Urgent system notification
    const notif6 = await prisma.notification.create({
      data: {
        title: 'System Maintenance Notice',
        message: 'The system will be under maintenance this Saturday from 2 AM to 6 AM. Please plan accordingly.',
        type: 'SYSTEM',
        priority: 'URGENT',
        category: 'SYSTEM',
        channels: ['IN_APP', 'EMAIL'],
        targetType: 'ALL_USERS',
        targetUsers: [],
        targetRoles: [],
        targetClasses: [],
        status: 'SENT',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        schoolId: school.id,
        createdById: admin.id,
      }
    });
    notifications.push(notif6);

    // Create notifications for all users
    for (const user of allUsers) {
      await prisma.userNotification.create({
        data: {
          notificationId: notif6.id,
          userId: user.id,
          isRead: false,
          isDelivered: true,
          deliveredAt: notif6.sentAt,
        }
      });
    }

    // Update notification counts
    for (const notification of notifications) {
      const userNotifCount = await prisma.userNotification.count({
        where: { notificationId: notification.id }
      });
      const readCount = await prisma.userNotification.count({
        where: { notificationId: notification.id, isRead: true }
      });

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          totalTargets: userNotifCount,
          readCount: readCount,
        }
      });
    }

    console.log(`✅ Created ${notifications.length} notifications with user notifications`);
    console.log('Test notifications created successfully!');

  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
