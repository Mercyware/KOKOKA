const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding inventory data...');

  // Get the school
  const school = await prisma.school.findFirst({
    where: { subdomain: 'greenwood' }
  });

  if (!school) {
    console.error('❌ School not found. Please run the main seed first.');
    process.exit(1);
  }

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { schoolId: school.id, role: 'ADMIN' }
  });

  if (!adminUser) {
    console.error('❌ Admin user not found.');
    process.exit(1);
  }

  console.log('📦 Creating inventory categories...');

  // Create categories
  const categories = await Promise.all([
    prisma.inventoryCategory.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and equipment',
        schoolId: school.id,
      }
    }),
    prisma.inventoryCategory.create({
      data: {
        name: 'Furniture',
        description: 'School furniture and fixtures',
        schoolId: school.id,
      }
    }),
    prisma.inventoryCategory.create({
      data: {
        name: 'Laboratory',
        description: 'Laboratory equipment and supplies',
        schoolId: school.id,
      }
    }),
    prisma.inventoryCategory.create({
      data: {
        name: 'Sports',
        description: 'Sports equipment and gear',
        schoolId: school.id,
      }
    }),
    prisma.inventoryCategory.create({
      data: {
        name: 'Stationery',
        description: 'Office and school stationery',
        schoolId: school.id,
      }
    }),
    prisma.inventoryCategory.create({
      data: {
        name: 'Uniforms',
        description: 'School uniforms and accessories',
        schoolId: school.id,
      }
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  console.log('📦 Creating inventory items...');

  // Create items
  const items = await Promise.all([
    // Electronics
    prisma.inventoryItem.create({
      data: {
        name: 'HP Laptop',
        itemCode: 'ELEC-001',
        description: 'HP ProBook 450 G8',
        quantity: 25,
        minimumStock: 5,
        unit: 'pieces',
        unitPrice: 650.00,
        totalValue: 16250.00,
        currency: 'KES',
        itemType: 'EQUIPMENT',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'ICT Lab',
        supplierName: 'Tech Supplies Ltd',
        categoryId: categories[0].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Projector',
        itemCode: 'ELEC-002',
        description: 'Epson EB-X41 Projector',
        quantity: 10,
        minimumStock: 2,
        unit: 'pieces',
        unitPrice: 450.00,
        totalValue: 4500.00,
        currency: 'KES',
        itemType: 'EQUIPMENT',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'AV Store',
        supplierName: 'Tech Supplies Ltd',
        categoryId: categories[0].id,
        schoolId: school.id,
      }
    }),
    // Furniture
    prisma.inventoryItem.create({
      data: {
        name: 'Student Desk',
        itemCode: 'FURN-001',
        description: 'Wooden student desk with chair',
        quantity: 200,
        minimumStock: 20,
        unit: 'pieces',
        unitPrice: 85.00,
        totalValue: 17000.00,
        currency: 'KES',
        itemType: 'FURNITURE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Classrooms',
        supplierName: 'School Furniture Co',
        categoryId: categories[1].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Teacher Desk',
        itemCode: 'FURN-002',
        description: 'Large wooden teacher desk',
        quantity: 30,
        minimumStock: 3,
        unit: 'pieces',
        unitPrice: 150.00,
        totalValue: 4500.00,
        currency: 'KES',
        itemType: 'FURNITURE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Classrooms',
        supplierName: 'School Furniture Co',
        categoryId: categories[1].id,
        schoolId: school.id,
      }
    }),
    // Laboratory
    prisma.inventoryItem.create({
      data: {
        name: 'Microscope',
        itemCode: 'LAB-001',
        description: 'Compound microscope 40x-1000x',
        quantity: 15,
        minimumStock: 3,
        unit: 'pieces',
        unitPrice: 280.00,
        totalValue: 4200.00,
        currency: 'KES',
        itemType: 'EQUIPMENT',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Science Lab',
        supplierName: 'Lab Equipment Suppliers',
        categoryId: categories[2].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Beaker Set',
        itemCode: 'LAB-002',
        description: 'Glass beaker set (50ml-1000ml)',
        quantity: 50,
        minimumStock: 10,
        unit: 'sets',
        unitPrice: 25.00,
        totalValue: 1250.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Science Lab',
        supplierName: 'Lab Equipment Suppliers',
        categoryId: categories[2].id,
        schoolId: school.id,
      }
    }),
    // Sports
    prisma.inventoryItem.create({
      data: {
        name: 'Football',
        itemCode: 'SPORT-001',
        description: 'Official size 5 football',
        quantity: 30,
        minimumStock: 10,
        unit: 'pieces',
        unitPrice: 35.00,
        totalValue: 1050.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Sports Store',
        supplierName: 'Sports Direct',
        categoryId: categories[3].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Basketball',
        itemCode: 'SPORT-002',
        description: 'Official size 7 basketball',
        quantity: 20,
        minimumStock: 5,
        unit: 'pieces',
        unitPrice: 40.00,
        totalValue: 800.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Sports Store',
        supplierName: 'Sports Direct',
        categoryId: categories[3].id,
        schoolId: school.id,
      }
    }),
    // Stationery
    prisma.inventoryItem.create({
      data: {
        name: 'A4 Paper Ream',
        itemCode: 'STAT-001',
        description: 'A4 white copy paper (500 sheets)',
        quantity: 100,
        minimumStock: 20,
        unit: 'reams',
        unitPrice: 5.50,
        totalValue: 550.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Supply Room',
        supplierName: 'Office Supplies Ltd',
        categoryId: categories[4].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Whiteboard Marker',
        itemCode: 'STAT-002',
        description: 'Dry erase markers (pack of 10)',
        quantity: 50,
        minimumStock: 15,
        unit: 'packs',
        unitPrice: 8.00,
        totalValue: 400.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: 'Supply Room',
        supplierName: 'Office Supplies Ltd',
        categoryId: categories[4].id,
        schoolId: school.id,
      }
    }),
    // Uniforms
    prisma.inventoryItem.create({
      data: {
        name: 'School Shirt',
        itemCode: 'UNI-001',
        description: 'Official school shirt (various sizes)',
        quantity: 150,
        minimumStock: 30,
        unit: 'pieces',
        unitPrice: 15.00,
        totalValue: 2250.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'NEW',
        location: 'Uniform Store',
        supplierName: 'School Uniform Co',
        categoryId: categories[5].id,
        schoolId: school.id,
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'School Tie',
        itemCode: 'UNI-002',
        description: 'Official school tie',
        quantity: 200,
        minimumStock: 40,
        unit: 'pieces',
        unitPrice: 8.00,
        totalValue: 1600.00,
        currency: 'KES',
        itemType: 'CONSUMABLE',
        status: 'ACTIVE',
        condition: 'NEW',
        location: 'Uniform Store',
        supplierName: 'School Uniform Co',
        categoryId: categories[5].id,
        schoolId: school.id,
      }
    }),
  ]);

  console.log(`✅ Created ${items.length} inventory items`);

  console.log('📦 Creating sample transactions...');

  // Create some transactions
  await prisma.inventoryTransaction.create({
    data: {
      itemId: items[0].id,
      transactionType: 'PURCHASE',
      quantity: 25,
      unitPrice: 650.00,
      totalValue: 16250.00,
      currency: 'KES',
      description: 'Initial purchase of HP laptops',
      referenceNumber: 'PO-2024-001',
      userId: adminUser.id,
      schoolId: school.id,
    }
  });

  await prisma.inventoryTransaction.create({
    data: {
      itemId: items[8].id,
      transactionType: 'PURCHASE',
      quantity: 100,
      unitPrice: 5.50,
      totalValue: 550.00,
      currency: 'KES',
      description: 'Bulk purchase of A4 paper',
      referenceNumber: 'PO-2024-002',
      userId: adminUser.id,
      schoolId: school.id,
    }
  });

  console.log('✅ Created sample transactions');

  console.log('🎉 Inventory seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding inventory:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
