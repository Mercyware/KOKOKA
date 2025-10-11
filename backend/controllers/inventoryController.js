const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================
// INVENTORY CATEGORIES
// ================================

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { schoolId } = req.school;

    const categories = await prisma.inventoryCategory.findMany({
      where: { schoolId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    res.status(500).json({ error: 'Failed to fetch inventory categories' });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    const category = await prisma.inventoryCategory.findFirst({
      where: { id, schoolId },
      include: {
        parent: true,
        children: true,
        items: {
          select: {
            id: true,
            name: true,
            itemCode: true,
            quantity: true,
            status: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { name, description, parentId } = req.body;

    const category = await prisma.inventoryCategory.create({
      data: {
        name,
        description,
        parentId,
        schoolId
      },
      include: {
        parent: true,
        children: true
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    const category = await prisma.inventoryCategory.updateMany({
      where: { id, schoolId },
      data: {
        name,
        description,
        parentId
      }
    });

    if (category.count === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.inventoryCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    // Check if category has items
    const category = await prisma.inventoryCategory.findFirst({
      where: { id, schoolId },
      include: { _count: { select: { items: true } } }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category._count.items > 0) {
      return res.status(400).json({ error: 'Cannot delete category with items' });
    }

    await prisma.inventoryCategory.deleteMany({
      where: { id, schoolId }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// ================================
// INVENTORY ITEMS
// ================================

// Get all items with filters
exports.getItems = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const {
      categoryId,
      status,
      itemType,
      search,
      lowStock,
      page = 1,
      limit = 50
    } = req.query;

    const where = { schoolId };

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (itemType) where.itemType = itemType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { itemCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Low stock filter
    if (lowStock === 'true') {
      where.AND = [
        { quantity: { lte: prisma.inventoryItem.fields.minimumStock } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              transactions: true,
              allocations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventoryItem.count({ where })
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: { id, schoolId },
      include: {
        category: true,
        transactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { transactionDate: 'desc' },
          take: 20
        },
        allocations: {
          include: {
            allocatedByUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { allocationDate: 'desc' },
          take: 20
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const itemData = req.body;

    // Calculate total value
    const totalValue = (itemData.quantity || 0) * (itemData.unitPrice || 0);

    const item = await prisma.inventoryItem.create({
      data: {
        ...itemData,
        totalValue,
        schoolId
      },
      include: {
        category: true
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;
    const itemData = req.body;

    // Calculate total value if quantity or unitPrice changed
    if (itemData.quantity !== undefined || itemData.unitPrice !== undefined) {
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { id, schoolId }
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const quantity = itemData.quantity !== undefined ? itemData.quantity : existingItem.quantity;
      const unitPrice = itemData.unitPrice !== undefined ? itemData.unitPrice : existingItem.unitPrice;
      itemData.totalValue = quantity * unitPrice;

      // Update status based on quantity
      if (quantity === 0) {
        itemData.status = 'OUT_OF_STOCK';
      } else if (quantity <= existingItem.minimumStock) {
        itemData.status = 'LOW_STOCK';
      } else if (itemData.status === 'LOW_STOCK' || itemData.status === 'OUT_OF_STOCK') {
        itemData.status = 'ACTIVE';
      }
    }

    const item = await prisma.inventoryItem.updateMany({
      where: { id, schoolId },
      data: itemData
    });

    if (item.count === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    const result = await prisma.inventoryItem.deleteMany({
      where: { id, schoolId }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// ================================
// INVENTORY TRANSACTIONS
// ================================

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { itemId, transactionType, page = 1, limit = 50 } = req.query;

    const where = { schoolId };
    if (itemId) where.itemId = itemId;
    if (transactionType) where.transactionType = transactionType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              itemCode: true,
              unit: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventoryTransaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { userId } = req.user;
    const transactionData = req.body;

    // Get current item
    const item = await prisma.inventoryItem.findFirst({
      where: { id: transactionData.itemId, schoolId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const previousQty = item.quantity;
    let newQty = previousQty;

    // Calculate new quantity based on transaction type
    switch (transactionData.transactionType) {
      case 'PURCHASE':
      case 'RETURN':
      case 'DONATION':
        newQty = previousQty + transactionData.quantity;
        break;
      case 'ISSUE':
      case 'WRITE_OFF':
      case 'DISPOSAL':
        newQty = previousQty - transactionData.quantity;
        break;
      case 'ADJUSTMENT':
        newQty = previousQty + transactionData.quantity; // quantity can be negative
        break;
      case 'TRANSFER':
        // Transfer logic might be more complex
        newQty = previousQty - transactionData.quantity;
        break;
    }

    if (newQty < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Calculate total amount
    const totalAmount = transactionData.quantity * (transactionData.unitPrice || item.unitPrice);

    // Create transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        ...transactionData,
        previousQty,
        newQty,
        totalAmount,
        userId,
        schoolId
      },
      include: {
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update item quantity and status
    let status = item.status;
    if (newQty === 0) {
      status = 'OUT_OF_STOCK';
    } else if (newQty <= item.minimumStock) {
      status = 'LOW_STOCK';
    } else if (status === 'LOW_STOCK' || status === 'OUT_OF_STOCK') {
      status = 'ACTIVE';
    }

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: newQty,
        totalValue: newQty * item.unitPrice,
        status
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// ================================
// INVENTORY ALLOCATIONS
// ================================

// Get all allocations
exports.getAllocations = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { itemId, status, allocatedToType, page = 1, limit = 50 } = req.query;

    const where = { schoolId };
    if (itemId) where.itemId = itemId;
    if (status) where.status = status;
    if (allocatedToType) where.allocatedToType = allocatedToType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [allocations, total] = await Promise.all([
      prisma.inventoryAllocation.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              itemCode: true,
              unit: true
            }
          },
          allocatedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { allocationDate: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventoryAllocation.count({ where })
    ]);

    res.json({
      allocations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
};

// Get single allocation
exports.getAllocation = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    const allocation = await prisma.inventoryAllocation.findFirst({
      where: { id, schoolId },
      include: {
        item: true,
        allocatedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    res.json(allocation);
  } catch (error) {
    console.error('Error fetching allocation:', error);
    res.status(500).json({ error: 'Failed to fetch allocation' });
  }
};

// Create allocation
exports.createAllocation = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { userId } = req.user;
    const allocationData = req.body;

    // Check item availability
    const item = await prisma.inventoryItem.findFirst({
      where: { id: allocationData.itemId, schoolId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.quantity < allocationData.quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const allocation = await prisma.inventoryAllocation.create({
      data: {
        ...allocationData,
        allocatedBy: userId,
        schoolId
      },
      include: {
        item: true,
        allocatedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update item quantity
    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity - allocationData.quantity,
        totalValue: (item.quantity - allocationData.quantity) * item.unitPrice
      }
    });

    res.status(201).json(allocation);
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
};

// Update allocation (mainly for returns)
exports.updateAllocation = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;
    const { status, actualReturn, returnCondition, returnNotes } = req.body;

    const allocation = await prisma.inventoryAllocation.findFirst({
      where: { id, schoolId },
      include: { item: true }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (actualReturn) updateData.actualReturn = actualReturn;
    if (returnCondition) updateData.returnCondition = returnCondition;
    if (returnNotes) updateData.returnNotes = returnNotes;

    // If returning, update item quantity
    if (status === 'RETURNED' && allocation.status !== 'RETURNED') {
      await prisma.inventoryItem.update({
        where: { id: allocation.itemId },
        data: {
          quantity: allocation.item.quantity + allocation.quantity,
          totalValue: (allocation.item.quantity + allocation.quantity) * allocation.item.unitPrice
        }
      });
    }

    const updatedAllocation = await prisma.inventoryAllocation.update({
      where: { id },
      data: updateData,
      include: {
        item: true,
        allocatedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedAllocation);
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({ error: 'Failed to update allocation' });
  }
};

// Delete allocation
exports.deleteAllocation = async (req, res) => {
  try {
    const { schoolId } = req.school;
    const { id } = req.params;

    const allocation = await prisma.inventoryAllocation.findFirst({
      where: { id, schoolId },
      include: { item: true }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    // If not returned, restore quantity
    if (allocation.status !== 'RETURNED') {
      await prisma.inventoryItem.update({
        where: { id: allocation.itemId },
        data: {
          quantity: allocation.item.quantity + allocation.quantity,
          totalValue: (allocation.item.quantity + allocation.quantity) * allocation.item.unitPrice
        }
      });
    }

    await prisma.inventoryAllocation.delete({
      where: { id }
    });

    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({ error: 'Failed to delete allocation' });
  }
};

// ================================
// DASHBOARD & STATISTICS
// ================================

// Get inventory dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { schoolId } = req.school;

    const [
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      recentTransactions,
      activeAllocations,
      itemsByCategory,
      itemsByType
    ] = await Promise.all([
      prisma.inventoryItem.count({ where: { schoolId } }),
      prisma.inventoryItem.aggregate({
        where: { schoolId },
        _sum: { totalValue: true }
      }),
      prisma.inventoryItem.count({
        where: {
          schoolId,
          status: 'LOW_STOCK'
        }
      }),
      prisma.inventoryItem.count({
        where: {
          schoolId,
          status: 'OUT_OF_STOCK'
        }
      }),
      prisma.inventoryTransaction.findMany({
        where: { schoolId },
        include: {
          item: {
            select: {
              name: true,
              itemCode: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        take: 10
      }),
      prisma.inventoryAllocation.count({
        where: {
          schoolId,
          status: 'ALLOCATED'
        }
      }),
      prisma.inventoryItem.groupBy({
        by: ['categoryId'],
        where: { schoolId },
        _count: true,
        _sum: { totalValue: true }
      }),
      prisma.inventoryItem.groupBy({
        by: ['itemType'],
        where: { schoolId },
        _count: true,
        _sum: { totalValue: true }
      })
    ]);

    res.json({
      overview: {
        totalItems,
        totalValue: totalValue._sum.totalValue || 0,
        lowStockItems,
        outOfStockItems,
        activeAllocations
      },
      recentTransactions,
      itemsByCategory,
      itemsByType
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
