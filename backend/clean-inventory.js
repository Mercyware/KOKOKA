const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  await prisma.inventoryAllocation.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.inventoryCategory.deleteMany();
  console.log('✅ Cleaned inventory data');
  await prisma.$disconnect();
})();
