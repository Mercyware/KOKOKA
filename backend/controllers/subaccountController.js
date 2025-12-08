const { prisma } = require('../config/database');
const paystackService = require('../services/paystackService');
const logger = require('../utils/logger');

/**
 * Get available banks
 * @route GET /api/schools/settings/banks
 * @access Private (Admin)
 */
exports.getBanks = async (req, res) => {
  try {
    const banks = await paystackService.listBanks();

    res.json({
      success: true,
      banks
    });
  } catch (error) {
    logger.error(`Get banks error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banks',
      error: error.message
    });
  }
};

/**
 * Verify bank account
 * @route POST /api/schools/settings/verify-bank
 * @access Private (Admin)
 */
exports.verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Account number and bank code are required'
      });
    }

    const accountDetails = await paystackService.verifyBankAccount(accountNumber, bankCode);

    res.json({
      success: true,
      accountDetails
    });
  } catch (error) {
    logger.error(`Verify bank account error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to verify bank account',
      error: error.message
    });
  }
};

/**
 * Create Paystack subaccount for school
 * @route POST /api/schools/settings/subaccount
 * @access Private (Admin)
 */
exports.createSubaccount = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { accountNumber, bankCode, accountName } = req.body;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Account number and bank code are required'
      });
    }

    // Check if school already has a subaccount
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (school.paystackSubaccountCode) {
      return res.status(400).json({
        success: false,
        message: 'School already has a Paystack subaccount'
      });
    }

    // Get the subaccount percentage from environment
    const subaccountPercentage = parseFloat(process.env.SCHOOL_SUBACCOUNT_PERCENTAGE || 90);

    // Create subaccount
    const subaccount = await paystackService.createSubaccount({
      businessName: school.name,
      settlementBank: bankCode,
      accountNumber: accountNumber,
      percentageCharge: subaccountPercentage,
      email: school.email || req.user.email
    });

    // Update school with subaccount details
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        paystackSubaccountCode: subaccount.subaccountCode,
        paystackSubaccountId: subaccount.subaccountId.toString(),
        bankAccountNumber: accountNumber,
        bankCode: bankCode,
        bankAccountName: accountName
      }
    });

    res.json({
      success: true,
      message: 'Paystack subaccount created successfully',
      subaccount: {
        subaccountCode: subaccount.subaccountCode,
        accountNumber: updatedSchool.bankAccountNumber,
        accountName: updatedSchool.bankAccountName,
        bankCode: updatedSchool.bankCode
      }
    });
  } catch (error) {
    logger.error(`Create subaccount error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create Paystack subaccount',
      error: error.message
    });
  }
};

/**
 * Get school subaccount details
 * @route GET /api/schools/settings/subaccount
 * @access Private (Admin)
 */
exports.getSubaccount = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        paystackSubaccountCode: true,
        paystackSubaccountId: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankCode: true
      }
    });

    if (!school.paystackSubaccountCode) {
      return res.json({
        success: true,
        hasSubaccount: false,
        message: 'No subaccount configured'
      });
    }

    // Optionally fetch live data from Paystack
    let paystackData = null;
    try {
      paystackData = await paystackService.getSubaccount(school.paystackSubaccountCode);
    } catch (error) {
      logger.warn(`Could not fetch Paystack subaccount data: ${error.message}`);
    }

    res.json({
      success: true,
      hasSubaccount: true,
      subaccount: {
        subaccountCode: school.paystackSubaccountCode,
        accountName: school.bankAccountName,
        accountNumber: school.bankAccountNumber,
        bankCode: school.bankCode,
        paystackData
      }
    });
  } catch (error) {
    logger.error(`Get subaccount error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subaccount details',
      error: error.message
    });
  }
};

/**
 * Update school subaccount
 * @route PUT /api/schools/settings/subaccount
 * @access Private (Admin)
 */
exports.updateSubaccount = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { accountNumber, bankCode, accountName } = req.body;

    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school.paystackSubaccountCode) {
      return res.status(404).json({
        success: false,
        message: 'No subaccount found for this school'
      });
    }

    // Update Paystack subaccount
    const updates = {};
    if (accountNumber) updates.accountNumber = accountNumber;
    if (bankCode) updates.settlementBank = bankCode;
    if (school.name) updates.businessName = school.name;
    if (school.email) updates.email = school.email;

    await paystackService.updateSubaccount(school.paystackSubaccountCode, updates);

    // Update school record
    const updateData = {};
    if (accountNumber) updateData.bankAccountNumber = accountNumber;
    if (bankCode) updateData.bankCode = bankCode;
    if (accountName) updateData.bankAccountName = accountName;

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Subaccount updated successfully',
      subaccount: {
        subaccountCode: updatedSchool.paystackSubaccountCode,
        accountNumber: updatedSchool.bankAccountNumber,
        accountName: updatedSchool.bankAccountName,
        bankCode: updatedSchool.bankCode
      }
    });
  } catch (error) {
    logger.error(`Update subaccount error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update subaccount',
      error: error.message
    });
  }
};

/**
 * Delete/remove subaccount from school
 * @route DELETE /api/schools/settings/subaccount
 * @access Private (Admin)
 */
exports.deleteSubaccount = async (req, res) => {
  try {
    const schoolId = req.school.id;

    // Just remove the subaccount details from the school record
    // We don't delete from Paystack as it may have historical transactions
    await prisma.school.update({
      where: { id: schoolId },
      data: {
        paystackSubaccountCode: null,
        paystackSubaccountId: null,
        bankAccountNumber: null,
        bankCode: null,
        bankAccountName: null
      }
    });

    res.json({
      success: true,
      message: 'Subaccount removed from school'
    });
  } catch (error) {
    logger.error(`Delete subaccount error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to remove subaccount',
      error: error.message
    });
  }
};
