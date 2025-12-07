const { prisma } = require('../config/database');

// Get all fee structures for a school
const getAllFeeStructures = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { isActive, academicYearId, gradeLevel, page = 1, limit = 50 } = req.query;

    const where = { schoolId };

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    // Filter by gradeLevel: null means applies to all classes, or matches specific class
    if (gradeLevel) {
      where.OR = [
        { gradeLevel: null },  // Applies to all classes
        { gradeLevel: gradeLevel }  // Applies to specific class
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [feeStructures, total] = await Promise.all([
      prisma.feeStructure.findMany({
        where,
        include: {
          academicYear: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { category: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.feeStructure.count({ where })
    ]);

    res.json({
      feeStructures,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({ error: 'Failed to fetch fee structures' });
  }
};

// Get a single fee structure by ID
const getFeeStructureById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    const feeStructure = await prisma.feeStructure.findFirst({
      where: { id, schoolId }
    });

    if (!feeStructure) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    res.json(feeStructure);
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ error: 'Failed to fetch fee structure' });
  }
};

// Create a new fee structure
const createFeeStructure = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { name, description, amount, frequency, gradeLevel, category, academicYearId } = req.body;

    // Validation
    if (!name || !amount || !frequency || !academicYearId) {
      return res.status(400).json({ error: 'Name, amount, frequency, and academic year are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        schoolId,
        academicYearId,
        name,
        description,
        amount,
        frequency,
        gradeLevel,
        category,
        isActive: true
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(feeStructure);
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ error: 'Failed to create fee structure' });
  }
};

// Update a fee structure
const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;
    const { name, description, amount, frequency, gradeLevel, category, isActive, academicYearId } = req.body;

    // Check if fee structure exists
    const existingFeeStructure = await prisma.feeStructure.findFirst({
      where: { id, schoolId }
    });

    if (!existingFeeStructure) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const feeStructure = await prisma.feeStructure.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(amount && { amount }),
        ...(frequency && { frequency }),
        ...(gradeLevel !== undefined && { gradeLevel }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(academicYearId && { academicYearId })
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(feeStructure);
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.status(500).json({ error: 'Failed to update fee structure' });
  }
};

// Delete a fee structure
const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if fee structure exists
    const feeStructure = await prisma.feeStructure.findFirst({
      where: { id, schoolId }
    });

    if (!feeStructure) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    // Check if fee structure is used in any invoices
    const invoiceItemsCount = await prisma.invoiceItem.count({
      where: { feeStructureId: id }
    });

    if (invoiceItemsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete fee structure. It is used in ${invoiceItemsCount} invoice(s). Consider deactivating it instead.`
      });
    }

    await prisma.feeStructure.delete({
      where: { id }
    });

    res.json({ message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.status(500).json({ error: 'Failed to delete fee structure' });
  }
};

module.exports = {
  getAllFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
};
