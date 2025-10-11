const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('Checking messaging data in database...\n');

  try {
    // Count threads
    const threadCount = await prisma.messageThread.count();
    console.log(`✅ Message Threads: ${threadCount}`);

    // Count messages
    const messageCount = await prisma.message.count();
    console.log(`✅ Messages: ${messageCount}`);

    // Count participants
    const participantCount = await prisma.messageThreadParticipant.count();
    console.log(`✅ Thread Participants: ${participantCount}`);

    // Get all threads with participants
    const threads = await prisma.messageThread.findMany({
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    console.log(`\n📧 Thread Details:`);
    threads.forEach((thread, index) => {
      console.log(`\n${index + 1}. ${thread.subject || thread.groupName || 'Untitled'}`);
      console.log(`   Type: ${thread.type}`);
      console.log(`   Messages: ${thread._count.messages}`);
      console.log(`   Participants:`);
      thread.participants.forEach(p => {
        console.log(`     - ${p.user.name} (${p.user.email}) - ${p.user.role}`);
      });
    });

    // Check for a specific user (admin)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminUser) {
      console.log(`\n🔍 Checking threads for Admin (${adminUser.email}):`);
      const adminThreads = await prisma.messageThread.findMany({
        where: {
          participants: {
            some: {
              userId: adminUser.id,
              status: 'ACTIVE'
            }
          }
        }
      });
      console.log(`   Admin is in ${adminThreads.length} threads`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
