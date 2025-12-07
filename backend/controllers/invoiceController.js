const { prisma } = require('../config/database');

// Helper function to generate invoice number
const generateInvoiceNumber = async (schoolId, academicYear) => {
  const year = academicYear || new Date().getFullYear().toString();
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      schoolId,
      invoiceNumber: { startsWith: `INV-${year}-` }
    },
    orderBy: { invoiceNumber: 'desc' }
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { status, studentId, academicYear, term, page = 1, limit = 50 } = req.query;

    const where = { schoolId };
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYear = academicYear;
    if (term) where.term = term;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true
            }
          },
          items: {
            include: {
              feeStructure: {
                select: { name: true, category: true }
              }
            }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const invoice = await prisma.invoice.findFirst({
      where: { id, schoolId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            feeStructure: {
              select: { name: true, category: true }
            }
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Create a new invoice
const createInvoice = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { studentId, academicYear, term, dueDate, items, discount = 0, tax = 0, notes } = req.body;

    // Validation
    if (!studentId || !academicYear || !term || !dueDate || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Student ID, academic year, term, due date, and items are required'
      });
    }

    // Verify student exists and belongs to school
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const total = subtotal - parseFloat(discount) + parseFloat(tax);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(schoolId, academicYear);

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        schoolId,
        studentId,
        academicYear,
        term,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        status: 'ISSUED',
        subtotal,
        discount: parseFloat(discount),
        tax: parseFloat(tax),
        total,
        amountPaid: 0,
        balance: total,
        notes,
        items: {
          create: items.map(item => ({
            feeStructureId: item.feeStructureId || null,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.amount)
          }))
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        items: {
          include: {
            feeStructure: {
              select: { name: true, category: true }
            }
          }
        }
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const { dueDate, discount, tax, notes, status } = req.body;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, schoolId },
      include: { items: true }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Prevent editing paid invoices
    if (existingInvoice.status === 'PAID') {
      return res.status(400).json({ error: 'Cannot edit a paid invoice' });
    }

    // Recalculate if discount or tax changed
    const updateData = {};
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    if (discount !== undefined || tax !== undefined) {
      const newDiscount = discount !== undefined ? parseFloat(discount) : existingInvoice.discount;
      const newTax = tax !== undefined ? parseFloat(tax) : existingInvoice.tax;
      const subtotal = existingInvoice.subtotal;
      const total = subtotal - newDiscount + newTax;
      const balance = total - existingInvoice.amountPaid;

      updateData.discount = newDiscount;
      updateData.tax = newTax;
      updateData.total = total;
      updateData.balance = balance;

      // Update status based on payment
      if (balance === 0) {
        updateData.status = 'PAID';
      } else if (existingInvoice.amountPaid > 0) {
        updateData.status = 'PARTIALLY_PAID';
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        items: {
          include: {
            feeStructure: {
              select: { name: true, category: true }
            }
          }
        },
        payments: true
      }
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if invoice exists
    const invoice = await prisma.invoice.findFirst({
      where: { id, schoolId },
      include: { payments: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Prevent deleting invoices with payments
    if (invoice.payments.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete invoice with payment records. Cancel the invoice instead.'
      });
    }

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

// Get outstanding invoices (for debt management)
const getOutstandingInvoices = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      studentId,
      studentName,
      classId,
      academicYear,
      term,
      status,
      minBalance,
      maxBalance,
      overdueDays,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const where = {
      schoolId,
      balance: { gt: 0 }
    };

    // Status filter - default to outstanding statuses if not specified
    if (status && status !== 'all') {
      where.status = status;
    } else {
      where.status = { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] };
    }

    // Student filter
    if (studentId) where.studentId = studentId;

    // Student name search
    if (studentName) {
      where.student = {
        OR: [
          { firstName: { contains: studentName, mode: 'insensitive' } },
          { lastName: { contains: studentName, mode: 'insensitive' } }
        ]
      };
    }

    // Class filter
    if (classId && classId !== 'all') {
      where.student = {
        ...where.student,
        currentClassId: classId
      };
    }

    // Academic year and term filters
    if (academicYear && academicYear !== 'all') where.academicYear = academicYear;
    if (term && term !== 'all') where.term = term;

    // Balance range filter
    if (minBalance || maxBalance) {
      where.balance = { ...where.balance };
      if (minBalance) where.balance.gte = parseFloat(minBalance);
      if (maxBalance) where.balance.lte = parseFloat(maxBalance);
    }

    // Overdue filter - invoices overdue by specific number of days
    if (overdueDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.setDate() - parseInt(overdueDays));
      where.dueDate = { lt: daysAgo };
      where.status = { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    const orderBy = {};
    if (sortBy === 'balance') {
      orderBy.balance = sortOrder;
    } else if (sortBy === 'studentName') {
      orderBy.student = { firstName: sortOrder };
    } else if (sortBy === 'total') {
      orderBy.total = sortOrder;
    } else {
      orderBy.dueDate = sortOrder;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
              email: true,
              phone: true,
              currentClass: {
                select: { name: true }
              }
            }
          },
          payments: {
            where: { status: 'COMPLETED' },
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              paymentMethod: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.invoice.count({ where })
    ]);

    // Calculate summary statistics
    const totalOutstanding = invoices.reduce((sum, inv) => sum + parseFloat(inv.balance), 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || 0), 0);

    // Count overdue invoices
    const overdueCount = invoices.filter(inv =>
      new Date(inv.dueDate) < new Date() && inv.balance > 0
    ).length;

    // Group by status
    const byStatus = invoices.reduce((acc, inv) => {
      if (!acc[inv.status]) {
        acc[inv.status] = { count: 0, totalBalance: 0 };
      }
      acc[inv.status].count++;
      acc[inv.status].totalBalance += parseFloat(inv.balance);
      return acc;
    }, {});

    res.json({
      invoices,
      summary: {
        totalInvoices: invoices.length,
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        totalInvoiced: parseFloat(totalInvoiced.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        overdueCount,
        byStatus: Object.entries(byStatus).map(([status, data]) => ({
          status,
          count: data.count,
          totalBalance: parseFloat(data.totalBalance.toFixed(2))
        }))
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching outstanding invoices:', error);
    res.status(500).json({ error: 'Failed to fetch outstanding invoices' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getOutstandingInvoices
};
