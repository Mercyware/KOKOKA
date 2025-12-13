const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 12)
 * @param {object} options - Password options
 * @returns {string} Generated password
 */
exports.generatePassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = false,
  } = options;

  let charset = '';

  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset === '') {
    throw new Error('At least one character type must be included');
  }

  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Generate a secure random password with guaranteed character types
 * Ensures at least one uppercase, lowercase, and number
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} Generated password
 */
exports.generateSecurePassword = (length = 12) => {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;

  // Ensure at least one of each type
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  // Add one uppercase
  password += uppercase[randomBytes[0] % uppercase.length];

  // Add one lowercase
  password += lowercase[randomBytes[1] % lowercase.length];

  // Add one number
  password += numbers[randomBytes[2] % numbers.length];

  // Fill the rest randomly
  for (let i = 3; i < length; i++) {
    password += allChars[randomBytes[i] % allChars.length];
  }

  // Shuffle the password to avoid predictable patterns
  password = password.split('').sort(() => crypto.randomBytes(1)[0] - 128).join('');

  return password;
};

module.exports = exports;
