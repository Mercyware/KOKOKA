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

// Get all master invoices
const getAllMasterInvoices = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { isActive, academicYearId, classId, gradeLevel, page = 1, limit = 50 } = req.query;

    const where = { schoolId };

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    if (classId) {
      where.classId = classId;
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [masterInvoices, total] = await Promise.all([
      prisma.masterInvoice.findMany({
        where,
        include: {
          academicYear: {
            select: {
              id: true,
              name: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          },
          items: {
            include: {
              feeStructure: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              childInvoices: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.masterInvoice.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        masterInvoices,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching master invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch master invoices' });
  }
};

// Get master invoice by ID
const getMasterInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const masterInvoice = await prisma.masterInvoice.findFirst({
      where: { id, schoolId },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        items: {
          include: {
            feeStructure: {
              select: {
                name: true,
                category: true,
                amount: true
              }
            }
          }
        },
        childInvoices: {
          select: {
            id: true,
            invoiceNumber: true,
            studentId: true,
            status: true,
            total: true,
            amountPaid: true,
            balance: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
                admissionNumber: true
              }
            }
          }
        },
        _count: {
          select: {
            childInvoices: true
          }
        }
      }
    });

    if (!masterInvoice) {
      return res.status(404).json({ success: false, message: 'Master invoice not found' });
    }

    res.json({ success: true, data: masterInvoice });
  } catch (error) {
    console.error('Error fetching master invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch master invoice' });
  }
};

// Create master invoice
const createMasterInvoice = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const {
      name,
      description,
      academicYearId,
      term,
      gradeLevel,
      classId,
      dueDate,
      items = []
    } = req.body;

    // Validate required fields
    if (!name || !academicYearId || !term || !dueDate || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, academicYearId, term, dueDate, and items are required'
      });
    }

    // Verify academic year exists
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, schoolId }
    });

    if (!academicYear) {
      return res.status(404).json({ success: false, message: 'Academic year not found' });
    }

    // Verify class exists if classId is provided
    if (classId) {
      const classExists = await prisma.class.findFirst({
        where: { id: classId, schoolId }
      });

      if (!classExists) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const tax = 0; // Can be calculated based on school settings
    const total = subtotal + tax;

    // Create master invoice with items
    const masterInvoice = await prisma.masterInvoice.create({
      data: {
        schoolId,
        name,
        description,
        academicYearId,
        term,
        gradeLevel,
        classId,
        dueDate: new Date(dueDate),
        subtotal,
        tax,
        total,
        items: {
          create: items.map(item => ({
            feeStructureId: item.feeStructureId || null,
            description: item.description,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.amount),
            isMandatory: item.isMandatory !== false // Default to true
          }))
        }
      },
      include: {
        academicYear: {
          select: { id: true, name: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
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

    res.status(201).json({
      success: true,
      message: 'Master invoice created successfully',
      data: masterInvoice
    });
  } catch (error) {
    console.error('Error creating master invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create master invoice' });
  }
};

// Update master invoice
const updateMasterInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const {
      name,
      description,
      dueDate,
      isActive,
      items
    } = req.body;

    // Verify master invoice exists
    const existingMaster = await prisma.masterInvoice.findFirst({
      where: { id, schoolId },
      include: { items: true }
    });

    if (!existingMaster) {
      return res.status(404).json({ success: false, message: 'Master invoice not found' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    // If items are provided, recalculate totals and update items
    if (items && Array.isArray(items)) {
      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const tax = 0;
      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.total = subtotal + tax;

      // Delete existing items and create new ones
      await prisma.masterInvoiceItem.deleteMany({
        where: { masterInvoiceId: id }
      });

      updateData.items = {
        create: items.map(item => ({
          feeStructureId: item.feeStructureId || null,
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.amount),
          isMandatory: item.isMandatory !== false
        }))
      };
    }

    const updatedMasterInvoice = await prisma.masterInvoice.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: {
          select: { id: true, name: true }
        },
        class: {
          select: { id: true, name: true, grade: true }
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

    res.json({
      success: true,
      message: 'Master invoice updated successfully',
      data: updatedMasterInvoice
    });
  } catch (error) {
    console.error('Error updating master invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to update master invoice' });
  }
};

// Delete master invoice
const deleteMasterInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if master invoice has child invoices
    const masterInvoice = await prisma.masterInvoice.findFirst({
      where: { id, schoolId },
      include: {
        _count: {
          select: { childInvoices: true }
        }
      }
    });

    if (!masterInvoice) {
      return res.status(404).json({ success: false, message: 'Master invoice not found' });
    }

    if (masterInvoice._count.childInvoices > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete master invoice. It has ${masterInvoice._count.childInvoices} child invoice(s). Please delete child invoices first or set master invoice to inactive.`
      });
    }

    await prisma.masterInvoice.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Master invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting master invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete master invoice' });
  }
};

// Generate child invoices from master invoice
const generateChildInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const { studentIds = [], applyToAll = false } = req.body;

    // Get master invoice
    const masterInvoice = await prisma.masterInvoice.findFirst({
      where: { id, schoolId },
      include: {
        items: true,
        academicYear: true,
        class: true
      }
    });

    if (!masterInvoice) {
      return res.status(404).json({ success: false, message: 'Master invoice not found' });
    }

    if (!masterInvoice.isActive) {
      return res.status(400).json({ success: false, message: 'Master invoice is not active' });
    }

    // Determine which students to generate invoices for
    let targetStudents = [];

    if (applyToAll) {
      // Get all students in the class/grade
      const where = { schoolId, status: 'ACTIVE' };
      
      if (masterInvoice.classId) {
        where.currentClassId = masterInvoice.classId;
      } else if (masterInvoice.gradeLevel) {
        where.currentClass = {
          grade: masterInvoice.gradeLevel
        };
      }

      targetStudents = await prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true
        }
      });
    } else if (studentIds && studentIds.length > 0) {
      // Get specific students
      targetStudents = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          schoolId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either provide studentIds or set applyToAll to true'
      });
    }

    if (targetStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No eligible students found'
      });
    }

    // Check for existing invoices
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        schoolId,
        masterInvoiceId: id,
        studentId: { in: targetStudents.map(s => s.id) }
      },
      select: {
        studentId: true,
        invoiceNumber: true
      }
    });

    const studentsWithInvoices = new Set(existingInvoices.map(inv => inv.studentId));
    const studentsToGenerate = targetStudents.filter(s => !studentsWithInvoices.has(s.id));

    if (studentsToGenerate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All selected students already have invoices from this master invoice',
        existingInvoices: existingInvoices.map(inv => inv.invoiceNumber)
      });
    }

    // Generate invoices
    const createdInvoices = [];
    const year = masterInvoice.academicYear.name.split('/')[0];

    for (const student of studentsToGenerate) {
      const invoiceNumber = await generateInvoiceNumber(schoolId, year);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          schoolId,
          studentId: student.id,
          masterInvoiceId: id,
          academicYear: masterInvoice.academicYear.name,
          term: masterInvoice.term,
          dueDate: masterInvoice.dueDate,
          subtotal: masterInvoice.subtotal,
          discount: 0,
          tax: masterInvoice.tax,
          total: masterInvoice.total,
          amountPaid: 0,
          balance: masterInvoice.total,
          status: 'DRAFT',
          hasCustomItems: false,
          reminderCount: 0,
          items: {
            create: masterInvoice.items.map(item => ({
              feeStructureId: item.feeStructureId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
            }))
          }
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true
            }
          },
          items: true
        }
      });

      createdInvoices.push(invoice);
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdInvoices.length} invoice(s)`,
      data: {
        generated: createdInvoices.length,
        skipped: studentsWithInvoices.size,
        invoices: createdInvoices
      }
    });
  } catch (error) {
    console.error('Error generating child invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to generate child invoices' });
  }
};

// Get master invoice statistics
const getMasterInvoiceStats = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const masterInvoice = await prisma.masterInvoice.findFirst({
      where: { id, schoolId },
      include: {
        childInvoices: {
          select: {
            status: true,
            total: true,
            amountPaid: true,
            balance: true
          }
        }
      }
    });

    if (!masterInvoice) {
      return res.status(404).json({ success: false, message: 'Master invoice not found' });
    }

    const stats = {
      totalInvoices: masterInvoice.childInvoices.length,
      totalAmount: masterInvoice.childInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
      totalPaid: masterInvoice.childInvoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid), 0),
      totalBalance: masterInvoice.childInvoices.reduce((sum, inv) => sum + parseFloat(inv.balance), 0),
      statusBreakdown: {
        DRAFT: masterInvoice.childInvoices.filter(inv => inv.status === 'DRAFT').length,
        ISSUED: masterInvoice.childInvoices.filter(inv => inv.status === 'ISSUED').length,
        PARTIAL: masterInvoice.childInvoices.filter(inv => inv.status === 'PARTIAL').length,
        PAID: masterInvoice.childInvoices.filter(inv => inv.status === 'PAID').length,
        OVERDUE: masterInvoice.childInvoices.filter(inv => inv.status === 'OVERDUE').length,
        CANCELLED: masterInvoice.childInvoices.filter(inv => inv.status === 'CANCELLED').length
      },
      collectionRate: masterInvoice.childInvoices.length > 0
        ? (masterInvoice.childInvoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid), 0) /
          masterInvoice.childInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching master invoice stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getAllMasterInvoices,
  getMasterInvoiceById,
  createMasterInvoice,
  updateMasterInvoice,
  deleteMasterInvoice,
  generateChildInvoices,
  getMasterInvoiceStats
};
