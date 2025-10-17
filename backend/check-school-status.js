const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.school.findFirst({where:{subdomain:'greenwood'}}).then(s => {
  console.log('School:', s.name);
  console.log('Subdomain:', s.subdomain);
  console.log('Status:', s.status);
  console.log('ID:', s.id);
  prisma.$disconnect();
});
