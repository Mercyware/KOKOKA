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

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { status, studentId, invoiceId, paymentMethod, page = 1, limit = 50 } = req.query;

    const where = { schoolId };
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

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
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
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
      return res.json({ message: 'Payment already recorded', payment: existingPayment });
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

    res.json({ message: 'Payment verified and recorded successfully', payment });
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
  initializePaystackPayment,
  verifyPaystackPayment
};
