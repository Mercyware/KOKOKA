const { prisma } = require('../config/database');

// Helper function to generate payment number
const generatePaymentNumber = async (schoolId) => {
  const year = new Date().getFullYear().toString();
  const lastPayment = await prisma.payment.findFirst({
    where: {
      schoolId,
      paymentNumber: { startsWith: `PAY-${year}-` }
    },
    orderBy: { paymentNumber: 'desc' }
  });

  let nextNumber = 1;
  if (lastPayment) {
    const lastNumber = parseInt(lastPayment.paymentNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }

  return `PAY-${year}-${String(nextNumber).padStart(5, '0')}`;
};

// Helper function to update invoice payment status
const updateInvoiceStatus = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: 'COMPLETED' } } }
  });

  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const balance = parseFloat(invoice.total) - totalPaid;

  let status = 'ISSUED';
  if (balance === 0) {
    status = 'PAID';
  } else if (totalPaid > 0) {
    status = 'PARTIALLY_PAID';
  } else if (new Date() > invoice.dueDate) {
    status = 'OVERDUE';
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: totalPaid,
      balance,
      status
    }
  });
};

// Get all payments with enhanced filters
const getAllPayments = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      status,
      studentId,
      invoiceId,
      paymentMethod,
      studentName,
      startDate,
      endDate,
      academicYear,
      term,
      minAmount,
      maxAmount,
      page = 1,
      limit = 50
    } = req.query;

    // Get school currency
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { settings: true }
    });
    const currency = school?.settings?.currency || 'USD';

    const where = { schoolId };

    // Basic filters
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.paymentDate.lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    // Student name search
    if (studentName) {
      where.student = {
        OR: [
          { firstName: { contains: studentName, mode: 'insensitive' } },
          { lastName: { contains: studentName, mode: 'insensitive' } }
        ]
      };
    }

    // Academic year and term filter
    if (academicYear || term) {
      where.invoice = {};
      if (academicYear) where.invoice.academicYear = academicYear;
      if (term) where.invoice.term = term;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              academicYear: true,
              term: true,
              total: true
            }
          }
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      currency,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const payment = await prisma.payment.findFirst({
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            academicYear: true,
            term: true,
            total: true,
            balance: true,
            items: {
              include: {
                feeStructure: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const userId = req.user.id;
    const { invoiceId, amount, paymentMethod, paymentDate, referenceNumber, notes } = req.body;

    // Validation
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({
        error: 'Invoice ID, amount, and payment method are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    // Verify invoice exists and belongs to school
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId },
      include: {
        payments: { where: { status: 'COMPLETED' } }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if payment amount exceeds balance
    const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const currentBalance = parseFloat(invoice.total) - totalPaid;

    if (parseFloat(amount) > currentBalance) {
      return res.status(400).json({
        error: `Payment amount (${amount}) exceeds invoice balance (${currentBalance})`
      });
    }

    // Generate payment number
    const paymentNumber = await generatePaymentNumber(schoolId);

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        schoolId,
        invoiceId,
        studentId: invoice.studentId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod,
        referenceNumber,
        status: 'COMPLETED',
        notes,
        processedBy: userId
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            academicYear: true,
            term: true
          }
        }
      }
    });

    // Update invoice status
    await updateInvoiceStatus(invoiceId);

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const { paymentMethod, referenceNumber, notes, status } = req.body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findFirst({
      where: { id, schoolId }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Prevent editing completed payments
    if (existingPayment.status === 'COMPLETED' && status !== 'REFUNDED') {
      return res.status(400).json({
        error: 'Cannot edit completed payment. Only refund status changes are allowed.'
      });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(paymentMethod && { paymentMethod }),
        ...(referenceNumber !== undefined && { referenceNumber }),
        ...(notes !== undefined && { notes }),
        ...(status && { status })
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            academicYear: true,
            term: true
          }
        }
      }
    });

    // Update invoice status if payment status changed
    if (status) {
      await updateInvoiceStatus(payment.invoiceId);
    }

    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// Delete payment (soft delete by marking as failed)
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if payment exists
    const payment = await prisma.payment.findFirst({
      where: { id, schoolId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Mark as failed instead of deleting
    await prisma.payment.update({
      where: { id },
      data: { status: 'FAILED' }
    });

    // Update invoice status
    await updateInvoiceStatus(payment.invoiceId);

    res.json({ message: 'Payment marked as failed successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

// Get payment summary/statistics
const getPaymentSummary = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { startDate, endDate, academicYear } = req.query;

    // Get school currency
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { settings: true }
    });
    const currency = school?.settings?.currency || 'USD';

    const where = { schoolId, status: 'COMPLETED' };

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (academicYear) {
      const invoices = await prisma.invoice.findMany({
        where: { schoolId, academicYear },
        select: { id: true }
      });
      where.invoiceId = { in: invoices.map(i => i.id) };
    }

    const [payments, paymentsByMethod] = await Promise.all([
      prisma.payment.findMany({ where }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { amount: true },
        _count: true
      })
    ]);

    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      totalPayments: payments.length,
      totalAmount,
      currency,
      byMethod: paymentsByMethod.map(pm => ({
        method: pm.paymentMethod,
        count: pm._count,
        amount: parseFloat(pm._sum.amount || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
};

// Get comprehensive payment report
const getPaymentReport = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      startDate,
      endDate,
      academicYear,
      term,
      studentId,
      classId,
      paymentMethod,
      status = 'COMPLETED',
      groupBy = 'none' // none, student, method, academicYear, term, date
    } = req.query;

    // Get school currency
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { settings: true }
    });
    const currency = school?.settings?.currency || 'USD';

    const where = { schoolId };

    // Apply filters
    if (status && status !== 'all') where.status = status;
    if (studentId) where.studentId = studentId;
    if (paymentMethod && paymentMethod !== 'all') where.paymentMethod = paymentMethod;

    // Class filter
    if (classId && classId !== 'all') {
      where.student = {
        currentClassId: classId
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.paymentDate.lte = end;
      }
    }

    // Academic year and term filter - build invoice filter properly
    const invoiceFilter = {};
    if (academicYear && academicYear !== 'all') invoiceFilter.academicYear = academicYear;
    if (term && term !== 'all') invoiceFilter.term = term;
    if (Object.keys(invoiceFilter).length > 0) {
      where.invoice = invoiceFilter;
    }

    // Fetch all payments with detailed information
    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            currentClass: {
              select: {
                name: true
              }
            }
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            academicYear: true,
            term: true,
            total: true,
            items: {
              include: {
                feeStructure: {
                  select: { name: true, category: true }
                }
              }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    // Calculate overall statistics
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPayments = payments.length;

    // Group by payment method
    const byMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count++;
      acc[method].amount += parseFloat(payment.amount);
      return acc;
    }, {});

    // Group by academic year
    const byAcademicYear = payments.reduce((acc, payment) => {
      const year = payment.invoice?.academicYear || 'Unknown';
      if (!acc[year]) {
        acc[year] = { count: 0, amount: 0 };
      }
      acc[year].count++;
      acc[year].amount += parseFloat(payment.amount);
      return acc;
    }, {});

    // Group by term
    const byTerm = payments.reduce((acc, payment) => {
      const term = payment.invoice?.term || 'Unknown';
      if (!acc[term]) {
        acc[term] = { count: 0, amount: 0 };
      }
      acc[term].count++;
      acc[term].amount += parseFloat(payment.amount);
      return acc;
    }, {});

    // Group by student (top payers)
    const byStudent = payments.reduce((acc, payment) => {
      const studentId = payment.studentId;
      const studentName = `${payment.student.firstName} ${payment.student.lastName}`;
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName,
          admissionNumber: payment.student.admissionNumber,
          grade: payment.student.currentClass?.name || 'N/A',
          count: 0,
          amount: 0
        };
      }
      acc[studentId].count++;
      acc[studentId].amount += parseFloat(payment.amount);
      return acc;
    }, {});

    // Group by date (daily collections)
    const byDate = payments.reduce((acc, payment) => {
      const date = payment.paymentDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, amount: 0 };
      }
      acc[date].count++;
      acc[date].amount += parseFloat(payment.amount);
      return acc;
    }, {});

    // Fee category breakdown
    const byFeeCategory = {};
    payments.forEach(payment => {
      if (payment.invoice?.items) {
        payment.invoice.items.forEach(item => {
          const category = item.feeStructure?.category || 'Unknown';
          if (!byFeeCategory[category]) {
            byFeeCategory[category] = { count: 0, amount: 0 };
          }
          byFeeCategory[category].count++;
          // Proportional amount based on item amount vs invoice total
          const invoiceTotal = parseFloat(payment.invoice.total);
          if (invoiceTotal > 0) {
            const proportion = parseFloat(item.amount) / invoiceTotal;
            byFeeCategory[category].amount += parseFloat(payment.amount) * proportion;
          }
        });
      }
    });

    // Build response based on groupBy parameter
    let groupedData = null;
    switch (groupBy) {
      case 'student':
        groupedData = Object.values(byStudent).sort((a, b) => b.amount - a.amount);
        break;
      case 'method':
        groupedData = Object.entries(byMethod).map(([method, data]) => ({
          method,
          ...data
        }));
        break;
      case 'academicYear':
        groupedData = Object.entries(byAcademicYear).map(([year, data]) => ({
          academicYear: year,
          ...data
        }));
        break;
      case 'term':
        groupedData = Object.entries(byTerm).map(([term, data]) => ({
          term,
          ...data
        }));
        break;
      case 'date':
        groupedData = Object.entries(byDate)
          .map(([date, data]) => ({
            date,
            ...data
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        groupedData = null;
    }

    res.json({
      currency,
      summary: {
        totalPayments,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        averagePayment: totalPayments > 0 ? parseFloat((totalAmount / totalPayments).toFixed(2)) : 0,
        dateRange: {
          start: startDate || payments[payments.length - 1]?.paymentDate,
          end: endDate || payments[0]?.paymentDate
        }
      },
      breakdown: {
        byMethod: Object.entries(byMethod).map(([method, data]) => ({
          method,
          count: data.count,
          amount: parseFloat(data.amount.toFixed(2)),
          percentage: totalAmount > 0 ? parseFloat(((data.amount / totalAmount) * 100).toFixed(2)) : 0
        })),
        byAcademicYear: Object.entries(byAcademicYear).map(([year, data]) => ({
          academicYear: year,
          count: data.count,
          amount: parseFloat(data.amount.toFixed(2)),
          percentage: totalAmount > 0 ? parseFloat(((data.amount / totalAmount) * 100).toFixed(2)) : 0
        })),
        byTerm: Object.entries(byTerm).map(([term, data]) => ({
          term,
          count: data.count,
          amount: parseFloat(data.amount.toFixed(2)),
          percentage: totalAmount > 0 ? parseFloat(((data.amount / totalAmount) * 100).toFixed(2)) : 0
        })),
        byFeeCategory: Object.entries(byFeeCategory).map(([category, data]) => ({
          category,
          count: data.count,
          amount: parseFloat(data.amount.toFixed(2)),
          percentage: totalAmount > 0 ? parseFloat(((data.amount / totalAmount) * 100).toFixed(2)) : 0
        }))
      },
      topPayers: Object.values(byStudent)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map(student => ({
          ...student,
          amount: parseFloat(student.amount.toFixed(2))
        })),
      dailyCollections: Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          count: data.count,
          amount: parseFloat(data.amount.toFixed(2))
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30), // Last 30 days
      groupedData,
      payments: payments.map(p => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: parseFloat(p.amount),
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        status: p.status,
        student: {
          id: p.student.id,
          name: `${p.student.firstName} ${p.student.lastName}`,
          admissionNumber: p.student.admissionNumber,
          grade: p.student.currentClass?.name || 'N/A'
        },
        invoice: p.invoice ? {
          invoiceNumber: p.invoice.invoiceNumber,
          academicYear: p.invoice.academicYear,
          term: p.invoice.term,
          total: parseFloat(p.invoice.total)
        } : null
      }))
    });
  } catch (error) {
    console.error('Error generating payment report:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ error: 'Failed to generate payment report', details: error.message });
  }
};

// Initialize Paystack payment
const initializePaystackPayment = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { invoiceId, amount, email } = req.body;

    // Validation
    if (!invoiceId || !amount || !email) {
      return res.status(400).json({
        error: 'Invoice ID, amount, and email are required'
      });
    }

    // Verify invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId },
      include: {
        student: true,
        payments: { where: { status: 'COMPLETED' } }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check balance
    const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const currentBalance = parseFloat(invoice.total) - totalPaid;

    if (parseFloat(amount) > currentBalance) {
      return res.status(400).json({
        error: `Payment amount (${amount}) exceeds invoice balance (${currentBalance})`
      });
    }

    // Initialize Paystack transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack not configured' });
    }

    const amountInKobo = Math.round(parseFloat(amount) * 100); // Convert to kobo

    // Get callback URL from environment or use default
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.FRONTEND_URL}/finance/payment-callback`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference: `${invoice.invoiceNumber}-${Date.now()}`,
        callback_url: callbackUrl,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          studentId: invoice.studentId,
          schoolId: schoolId,
          studentName: `${invoice.student.firstName} ${invoice.student.lastName}`,
          custom_fields: [
            {
              display_name: 'Invoice Number',
              variable_name: 'invoice_number',
              value: invoice.invoiceNumber
            },
            {
              display_name: 'Student',
              variable_name: 'student_name',
              value: `${invoice.student.firstName} ${invoice.student.lastName}`
            }
          ]
        }
      })
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Failed to initialize payment' });
    }

    res.json({
      success: true,
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      }
    });
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

// Verify Paystack payment
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const schoolId = req.school.id;

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack not configured' });
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`
      }
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const metadata = data.data.metadata;
    const invoiceId = metadata.invoiceId;
    const amount = data.data.amount / 100; // Convert from kobo

    // Check if payment already recorded
    const existingPayment = await prisma.payment.findFirst({
      where: { referenceNumber: reference, schoolId }
    });

    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment already recorded',
        data: existingPayment
      });
    }

    // Generate payment number
    const paymentNumber = await generatePaymentNumber(schoolId);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        schoolId,
        invoiceId,
        studentId: metadata.studentId,
        amount,
        paymentDate: new Date(data.data.paid_at),
        paymentMethod: 'CARD',
        referenceNumber: reference,
        status: 'COMPLETED',
        notes: `Online payment via Paystack - ${data.data.channel}`,
        processedBy: metadata.studentId // Using studentId as we don't have userId in this context
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            academicYear: true,
            term: true
          }
        }
      }
    });

    // Update invoice status
    await updateInvoiceStatus(invoiceId);

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentSummary,
  getPaymentReport,
  initializePaystackPayment,
  verifyPaystackPayment
};
