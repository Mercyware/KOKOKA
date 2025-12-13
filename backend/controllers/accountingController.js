const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// ==================== CATEGORIES ====================

/**
 * Get all accounting categories
 * @route GET /api/accounting/categories
 * @access Private
 */
exports.getCategories = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { type } = req.query;

    const where = { schoolId, isActive: true };
    // Ensure type is a string, not an object
    if (type && typeof type === 'string') {
      where.type = type;
    }

    const categories = await prisma.accountingCategory.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error(`Get categories error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Create accounting category
 * @route POST /api/accounting/categories
 * @access Private (Admin)
 */
exports.createCategory = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    const category = await prisma.accountingCategory.create({
      data: {
        schoolId,
        name,
        type,
        description
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    logger.error(`Create category error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// ==================== INCOME TRANSACTIONS ====================

/**
 * Get all income transactions
 * @route GET /api/accounting/income
 * @access Private
 */
exports.getIncomeTransactions = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      categoryId,
      startDate,
      endDate,
      source,
      page = 1,
      limit = 50
    } = req.query;

    const where = { schoolId };

    if (categoryId) where.categoryId = categoryId;
    if (source) where.source = { contains: source, mode: 'insensitive' };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.incomeTransaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          payment: {
            select: {
              id: true,
              paymentNumber: true,
              student: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.incomeTransaction.count({ where })
    ]);

    // Calculate totals
    const totalAmount = await prisma.incomeTransaction.aggregate({
      where,
      _sum: { amount: true }
    });

    res.json({
      success: true,
      transactions,
      summary: {
        total: total,
        totalAmount: parseFloat(totalAmount._sum.amount || 0)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get income transactions error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income transactions',
      error: error.message
    });
  }
};

/**
 * Create income transaction
 * @route POST /api/accounting/income
 * @access Private (Admin)
 */
exports.createIncomeTransaction = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const userId = req.user.id;
    const {
      categoryId,
      amount,
      date,
      description,
      source,
      reference,
      notes
    } = req.body;

    if (!categoryId || !amount || !description || !source) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, description, and source are required'
      });
    }

    // Verify category belongs to school and is income type
    const category = await prisma.accountingCategory.findFirst({
      where: {
        id: categoryId,
        schoolId,
        type: 'INCOME'
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Income category not found'
      });
    }

    const transaction = await prisma.incomeTransaction.create({
      data: {
        schoolId,
        categoryId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        description,
        source,
        reference,
        notes,
        createdBy: userId
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Income transaction created successfully',
      transaction
    });
  } catch (error) {
    logger.error(`Create income transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create income transaction',
      error: error.message
    });
  }
};

// ==================== EXPENDITURE TRANSACTIONS ====================

/**
 * Get all expenditure transactions
 * @route GET /api/accounting/expenditure
 * @access Private
 */
exports.getExpenditureTransactions = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      categoryId,
      startDate,
      endDate,
      status,
      payee,
      page = 1,
      limit = 50
    } = req.query;

    const where = { schoolId };

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (payee) where.payee = { contains: payee, mode: 'insensitive' };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.expenditureTransaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.expenditureTransaction.count({ where })
    ]);

    // Calculate totals
    const totalAmount = await prisma.expenditureTransaction.aggregate({
      where,
      _sum: { amount: true }
    });

    res.json({
      success: true,
      transactions,
      summary: {
        total: total,
        totalAmount: parseFloat(totalAmount._sum.amount || 0)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get expenditure transactions error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenditure transactions',
      error: error.message
    });
  }
};

/**
 * Create expenditure transaction
 * @route POST /api/accounting/expenditure
 * @access Private (Admin)
 */
exports.createExpenditureTransaction = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const userId = req.user.id;
    const {
      categoryId,
      amount,
      date,
      description,
      vendor,
      payee, // For backward compatibility
      paymentMethod,
      reference,
      notes,
      receiptUrl
    } = req.body;

    if (!categoryId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and description are required'
      });
    }

    // Verify category belongs to school and is expenditure type
    const category = await prisma.accountingCategory.findFirst({
      where: {
        id: categoryId,
        schoolId,
        type: 'EXPENDITURE'
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure category not found'
      });
    }

    const transaction = await prisma.expenditureTransaction.create({
      data: {
        schoolId,
        categoryId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        description,
        payee: payee || vendor || 'N/A', // Use vendor if payee not provided
        paymentMethod: paymentMethod || 'CASH',
        reference,
        notes,
        receiptUrl,
        status: 'PENDING',
        createdBy: userId
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Expenditure transaction created successfully',
      transaction
    });
  } catch (error) {
    logger.error(`Create expenditure transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create expenditure transaction',
      error: error.message
    });
  }
};

/**
 * Approve/update expenditure transaction
 * @route PUT /api/accounting/expenditure/:id
 * @access Private (Admin)
 */
exports.updateExpenditureTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const userId = req.user.id;
    const { status, notes } = req.body;

    const transaction = await prisma.expenditureTransaction.findFirst({
      where: { id, schoolId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure transaction not found'
      });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'APPROVED' || status === 'PAID') {
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const updatedTransaction = await prisma.expenditureTransaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Expenditure transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    logger.error(`Update expenditure transaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update expenditure transaction',
      error: error.message
    });
  }
};

// ==================== REPORTS & DASHBOARD ====================

/**
 * Get accounting summary/dashboard
 * @route GET /api/accounting/summary
 * @access Private
 */
exports.getAccountingSummary = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { startDate, endDate } = req.query;

    const where = { schoolId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // Get income summary
    const [incomeTotal, incomeByCategory] = await Promise.all([
      prisma.incomeTransaction.aggregate({
        where,
        _sum: { amount: true }
      }),
      prisma.incomeTransaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: true
      })
    ]);

    // Get expenditure summary
    const [expenditureTotal, expenditureByCategory] = await Promise.all([
      prisma.expenditureTransaction.aggregate({
        where: { ...where, status: { in: ['APPROVED', 'PAID'] } },
        _sum: { amount: true }
      }),
      prisma.expenditureTransaction.groupBy({
        by: ['categoryId'],
        where: { ...where, status: { in: ['APPROVED', 'PAID'] } },
        _sum: { amount: true },
        _count: true
      })
    ]);

    // Get categories for mapping
    const categories = await prisma.accountingCategory.findMany({
      where: { schoolId }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    const totalIncome = parseFloat(incomeTotal._sum.amount || 0);
    const totalExpenditure = parseFloat(expenditureTotal._sum.amount || 0);
    const netIncome = totalIncome - totalExpenditure;

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenditure,
        netIncome,
        incomeByCategory: incomeByCategory.map(item => ({
          categoryId: item.categoryId,
          categoryName: categoryMap[item.categoryId]?.name || 'Unknown',
          amount: parseFloat(item._sum.amount || 0),
          count: item._count
        })),
        expenditureByCategory: expenditureByCategory.map(item => ({
          categoryId: item.categoryId,
          categoryName: categoryMap[item.categoryId]?.name || 'Unknown',
          amount: parseFloat(item._sum.amount || 0),
          count: item._count
        }))
      }
    });
  } catch (error) {
    logger.error(`Get accounting summary error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounting summary',
      error: error.message
    });
  }
};
