const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserNotifications() {
  try {
    // Get all users and their notification counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: {
          select: {
            userNotifications: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    console.log('\n=== User Notification Counts ===\n');
    users.forEach(user => {
      console.log(`${user.role.padEnd(10)} | ${user.email.padEnd(35)} | ${user._count.userNotifications} notifications`);
    });

    // Get all notifications
    const allNotifications = await prisma.notification.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        targetType: true,
        status: true,
        _count: {
          select: {
            userNotifications: true
          }
        }
      }
    });

    console.log('\n=== All Notifications ===\n');
    allNotifications.forEach(notif => {
      console.log(`${notif.title.substring(0, 40).padEnd(40)} | ${notif.type.padEnd(15)} | ${notif.targetType.padEnd(15)} | ${notif._count.userNotifications} recipients`);
    });

    // Get total counts
    const totalNotifications = await prisma.notification.count();
    const totalUserNotifications = await prisma.userNotification.count();

    console.log(`\nTotal Notifications: ${totalNotifications}`);
    console.log(`Total User Notifications: ${totalUserNotifications}`);

  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserNotifications();
