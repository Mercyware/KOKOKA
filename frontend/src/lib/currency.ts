/**
 * Currency utility functions and constants
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

/**
 * Supported currencies for the school management system
 * This list can be extended as needed
 */
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    locale: 'en-KE',
    decimalPlaces: 0,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimalPlaces: 2,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    decimalPlaces: 2,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    decimalPlaces: 2,
  },
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    locale: 'en-NG',
    decimalPlaces: 2,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
    decimalPlaces: 2,
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    locale: 'en-GH',
    decimalPlaces: 2,
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    locale: 'en-UG',
    decimalPlaces: 0,
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    locale: 'en-TZ',
    decimalPlaces: 0,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    locale: 'en-IN',
    decimalPlaces: 2,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    locale: 'en-AU',
    decimalPlaces: 2,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    locale: 'en-CA',
    decimalPlaces: 2,
  },
];

/**
 * Default currency (Kenyan Shilling)
 */
export const DEFAULT_CURRENCY: Currency = SUPPORTED_CURRENCIES[0];

/**
 * Get currency by code
 */
export function getCurrency(code: string): Currency {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCY;
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY.code): string {
  const currency = getCurrency(currencyCode);

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    const formattedAmount = amount.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });
    return `${currency.symbol} ${formattedAmount}`;
  }
}

/**
 * Format amount with custom symbol
 */
export function formatAmount(amount: number, currencyCode: string = DEFAULT_CURRENCY.code): string {
  const currency = getCurrency(currencyCode);
  const formattedAmount = amount.toLocaleString(currency.locale, {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });
  return `${currency.symbol} ${formattedAmount}`;
}
