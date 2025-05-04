const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Get all fees
exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate('student', 'name email')
      .populate('class');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get fee by ID
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student', 'name email')
      .populate('class');
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new fee record
exports.createFee = async (req, res) => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    
    const populatedFee = await Fee.findById(fee._id)
      .populate('student', 'name email')
      .populate('class');
    
    res.status(201).json(populatedFee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update fee record
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('student', 'name email')
      .populate('class');
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete fee record
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get fees by student
exports.getFeesByStudent = async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.params.studentId })
      .populate('student', 'name email')
      .populate('class');
    
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Record fee payment
exports.recordPayment = async (req, res) => {
  try {
    const { feeId, amount, paymentMethod, transactionId, date } = req.body;
    
    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    // Add payment to fee record
    fee.payments.push({
      amount,
      paymentMethod,
      transactionId,
      date: date || new Date(),
      status: 'completed'
    });
    
    // Update paid amount and balance
    fee.amountPaid += amount;
    fee.balance = fee.totalAmount - fee.amountPaid;
    
    // Update status if fully paid
    if (fee.balance <= 0) {
      fee.status = 'paid';
    } else if (fee.amountPaid > 0) {
      fee.status = 'partial';
    }
    
    await fee.save();
    
    const updatedFee = await Fee.findById(feeId)
      .populate('student', 'name email')
      .populate('class');
    
    res.json(updatedFee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate fee report
exports.generateFeeReport = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (classId) {
      query.class = classId;
    }
    
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) {
        query.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dueDate.$lte = new Date(endDate);
      }
    }
    
    // Get fees matching query
    const fees = await Fee.find(query)
      .populate('student', 'name email')
      .populate('class');
    
    // Calculate statistics
    const totalFees = fees.length;
    const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
    const totalBalance = fees.reduce((sum, fee) => sum + fee.balance, 0);
    
    // Count by status
    const statusCounts = {
      pending: fees.filter(fee => fee.status === 'pending').length,
      partial: fees.filter(fee => fee.status === 'partial').length,
      paid: fees.filter(fee => fee.status === 'paid').length,
      overdue: fees.filter(fee => fee.status === 'overdue').length
    };
    
    res.json({
      statistics: {
        totalFees,
        totalAmount,
        totalPaid,
        totalBalance,
        statusCounts
      },
      fees
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
