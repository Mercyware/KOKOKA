const logger = require('../utils/logger');

/**
 * Create a Paystack subaccount for a school
 * @param {Object} params - Subaccount parameters
 * @param {string} params.businessName - School name
 * @param {string} params.settlementBank - Bank code
 * @param {string} params.accountNumber - Bank account number
 * @param {number} params.percentageCharge - Percentage to go to subaccount
 * @param {string} params.email - School contact email
 * @returns {Promise<Object>} Subaccount details
 */
const createSubaccount = async ({ businessName, settlementBank, accountNumber, percentageCharge, email }) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_name: businessName,
        settlement_bank: settlementBank,
        account_number: accountNumber,
        percentage_charge: percentageCharge,
        primary_contact_email: email,
        description: `Subaccount for ${businessName}`
      })
    });

    const data = await response.json();

    if (!data.status) {
      logger.error(`Paystack subaccount creation failed: ${data.message}`);
      throw new Error(data.message || 'Failed to create Paystack subaccount');
    }

    logger.info(`Paystack subaccount created successfully: ${data.data.subaccount_code}`);

    return {
      success: true,
      subaccountCode: data.data.subaccount_code,
      subaccountId: data.data.id,
      accountNumber: data.data.account_number,
      bankCode: data.data.settlement_bank,
      percentageCharge: data.data.percentage_charge
    };
  } catch (error) {
    logger.error(`Error creating Paystack subaccount: ${error.message}`);
    throw error;
  }
};

/**
 * List available banks from Paystack
 * @returns {Promise<Array>} List of banks
 */
const listBanks = async () => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch('https://api.paystack.co/bank?currency=NGN&country=nigeria', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`
      }
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to fetch banks');
    }

    return data.data;
  } catch (error) {
    logger.error(`Error fetching banks: ${error.message}`);
    throw error;
  }
};

/**
 * Verify bank account details
 * @param {string} accountNumber - Bank account number
 * @param {string} bankCode - Bank code
 * @returns {Promise<Object>} Account details
 */
const verifyBankAccount = async (accountNumber, bankCode) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`
        }
      }
    );

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to verify bank account');
    }

    return {
      accountNumber: data.data.account_number,
      accountName: data.data.account_name,
      bankId: data.data.bank_id
    };
  } catch (error) {
    logger.error(`Error verifying bank account: ${error.message}`);
    throw error;
  }
};

/**
 * Update a Paystack subaccount
 * @param {string} subaccountCode - Subaccount code
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated subaccount details
 */
const updateSubaccount = async (subaccountCode, updates) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const body = {};
    if (updates.businessName) body.business_name = updates.businessName;
    if (updates.settlementBank) body.settlement_bank = updates.settlementBank;
    if (updates.accountNumber) body.account_number = updates.accountNumber;
    if (updates.percentageCharge !== undefined) body.percentage_charge = updates.percentageCharge;
    if (updates.email) body.primary_contact_email = updates.email;

    const response = await fetch(`https://api.paystack.co/subaccount/${subaccountCode}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to update Paystack subaccount');
    }

    return {
      success: true,
      subaccountCode: data.data.subaccount_code
    };
  } catch (error) {
    logger.error(`Error updating Paystack subaccount: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch subaccount details
 * @param {string} subaccountCode - Subaccount code
 * @returns {Promise<Object>} Subaccount details
 */
const getSubaccount = async (subaccountCode) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch(`https://api.paystack.co/subaccount/${subaccountCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`
      }
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to fetch subaccount');
    }

    return data.data;
  } catch (error) {
    logger.error(`Error fetching subaccount: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createSubaccount,
  listBanks,
  verifyBankAccount,
  updateSubaccount,
  getSubaccount
};
