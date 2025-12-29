const { prisma } = require('./config/database');

async function checkChildInvoices() {
  try {
    // Get all master invoices
    const masterInvoices = await prisma.masterInvoice.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            childInvoices: true
          }
        }
      }
    });

    console.log('\n=== Master Invoices ===');
    masterInvoices.forEach(mi => {
      console.log(`${mi.name}: ${mi._count.childInvoices} child invoices`);
    });

    // Get invoices linked to master invoices
    const linkedInvoices = await prisma.invoice.findMany({
      where: {
        masterInvoiceId: { not: null }
      },
      select: {
        id: true,
        invoiceNumber: true,
        masterInvoiceId: true,
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('\n=== Child Invoices ===');
    if (linkedInvoices.length === 0) {
      console.log('No child invoices found. You need to generate them from the UI.');
    } else {
      linkedInvoices.forEach(inv => {
        console.log(`${inv.invoiceNumber} - ${inv.student.firstName} ${inv.student.lastName} (Master: ${inv.masterInvoiceId})`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChildInvoices();
