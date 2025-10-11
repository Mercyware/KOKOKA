const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModels() {
  console.log('Checking if messaging models are available in Prisma client...\n');

  const hasMessageThread = typeof prisma.messageThread !== 'undefined';
  const hasMessage = typeof prisma.message !== 'undefined';
  const hasMessageThreadParticipant = typeof prisma.messageThreadParticipant !== 'undefined';
  const hasMessageRecipient = typeof prisma.messageRecipient !== 'undefined';

  console.log('MessageThread model:', hasMessageThread ? '✅ Available' : '❌ Missing');
  console.log('Message model:', hasMessage ? '✅ Available' : '❌ Missing');
  console.log('MessageThreadParticipant model:', hasMessageThreadParticipant ? '✅ Available' : '❌ Missing');
  console.log('MessageRecipient model:', hasMessageRecipient ? '✅ Available' : '❌ Missing');

  if (!hasMessageThread || !hasMessage || !hasMessageThreadParticipant || !hasMessageRecipient) {
    console.log('\n❌ Messaging models are NOT available in Prisma client!');
    console.log('\nYou need to:');
    console.log('1. Run migration: npx prisma migrate dev --name add_messaging_module');
    console.log('2. Generate client: npx prisma generate');
    console.log('\nOr use the full command:');
    console.log('DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" npx prisma migrate dev --name add_messaging_module');
  } else {
    console.log('\n✅ All messaging models are available!');
    console.log('\nYou can now:');
    console.log('1. Seed the database: npm run db:seed');
    console.log('2. Start the server: npm run dev');
  }

  await prisma.$disconnect();
}

checkModels().catch(console.error);
