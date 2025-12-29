/**
 * Currency utility for backend
 * Provides currency symbols and formatting
 */

const SUPPORTED_CURRENCIES = {
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimalPlaces: 0 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimalPlaces: 2 },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', decimalPlaces: 0 },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', decimalPlaces: 0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
};

const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES.KES;

/**
 * Get currency symbol from currency code
 * @param {string} currencyCode - Currency code (e.g., 'KES', 'USD')
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return DEFAULT_CURRENCY.symbol;
  
  // Handle legacy format where symbol might be stored directly
  if (currencyCode.length <= 3 && currencyCode.toUpperCase() in SUPPORTED_CURRENCIES) {
    return SUPPORTED_CURRENCIES[currencyCode.toUpperCase()].symbol;
  }
  
  // If it's already a symbol (not a code), return it
  // But sanitize common corruptions
  if (currencyCode === '|' || currencyCode === '||') {
    return DEFAULT_CURRENCY.symbol;
  }
  
  // If it looks like a symbol (contains currency symbols), return it
  const currencySymbols = ['$', '£', '€', '₦', '₹', '₵', 'R', 'Sh', 'KSh', 'USh', 'TSh', 'GH₵'];
  if (currencySymbols.some(sym => currencyCode.includes(sym))) {
    return currencyCode;
  }
  
  return DEFAULT_CURRENCY.symbol;
}

/**
 * Get currency info from school settings
 * Checks both school.currency and school.settings.currency
 * @param {Object} school - School object
 * @returns {Object} Currency info with symbol and decimalPlaces
 */
function getSchoolCurrency(school) {
  let currencyCode = null;
  
  // Try school.settings.currency first (JSON field)
  if (school.settings && typeof school.settings === 'object') {
    currencyCode = school.settings.currency || school.settings.system?.currency;
  }
  
  // Fall back to school.currency (direct field)
  if (!currencyCode) {
    currencyCode = school.currency;
  }
  
  // Default to KES if nothing found
  if (!currencyCode) {
    return DEFAULT_CURRENCY;
  }
  
  // Get currency info
  const upperCode = currencyCode.toUpperCase();
  if (upperCode in SUPPORTED_CURRENCIES) {
    return SUPPORTED_CURRENCIES[upperCode];
  }
  
  // Return default with the provided symbol if it's not a recognized code
  return {
    ...DEFAULT_CURRENCY,
    symbol: getCurrencySymbol(currencyCode)
  };
}

/**
 * Format amount with currency
 * @param {number} amount - Amount to format
 * @param {Object} currency - Currency object with symbol and decimalPlaces
 * @returns {string} Formatted amount
 */
function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  const decimals = currency.decimalPlaces || 2;
  const formattedAmount = parseFloat(amount).toFixed(decimals);
  return `${currency.symbol}${formattedAmount}`;
}

module.exports = {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  getSchoolCurrency,
  formatCurrency
};
