/**
 * Form validation utilities for consistent validation across the application
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  numeric?: boolean;
  match?: string; // For password confirmation
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a single field value against rules
 */
export const validateField = (
  fieldName: string,
  value: any,
  rules: ValidationRule,
  allValues?: Record<string, any>
): FieldValidationResult => {
  const stringValue = String(value || '').trim();

  // Required validation
  if (rules.required && !stringValue) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} is required`
    };
  }

  // Skip other validations if field is empty and not required
  if (!stringValue && !rules.required) {
    return { isValid: true };
  }

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} must be at least ${rules.minLength} characters long`
    };
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} must be less than ${rules.maxLength} characters`
    };
  }

  // Email validation
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Phone validation (basic)
  if (rules.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(stringValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number'
    };
  }

  // URL validation
  if (rules.url && !/^https?:\/\/.+/.test(stringValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid URL starting with http:// or https://'
    };
  }

  // Numeric validation
  if (rules.numeric && !/^\d+(\.\d+)?$/.test(stringValue)) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} must be a valid number`
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} format is invalid`
    };
  }

  // Match validation (for password confirmation)
  if (rules.match && allValues && stringValue !== allValues[rules.match]) {
    return {
      isValid: false,
      error: `${formatFieldName(fieldName)} does not match`
    };
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return {
        isValid: false,
        error: customError
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate multiple fields at once
 */
export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, ValidationRule>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(fieldName => {
    const result = validateField(fieldName, values[fieldName], rules[fieldName], values);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format field name for display in error messages
 */
export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim();
};

/**
 * Common validation rules that can be reused
 */
export const CommonValidationRules = {
  required: { required: true },
  email: { required: true, email: true },
  optionalEmail: { email: true },
  phone: { phone: true },
  optionalPhone: { phone: true },
  url: { url: true },
  optionalUrl: { url: true },
  password: { 
    required: true, 
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    }
  },
  confirmPassword: (passwordField: string) => ({
    required: true,
    match: passwordField
  }),
  employeeId: {
    required: true,
    minLength: 3,
    pattern: /^[A-Z0-9]+$/i,
    custom: (value: string) => {
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        return 'Employee ID can only contain letters and numbers';
      }
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    custom: (value: string) => {
      if (!/^[a-zA-Z\s\-']+$/.test(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      return null;
    }
  },
  subdomain: {
    required: true,
    minLength: 3,
    maxLength: 63,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    custom: (value: string) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        return 'Subdomain can only contain lowercase letters, numbers, and hyphens';
      }
      return null;
    }
  }
};

/**
 * Create validation rules for specific forms
 */
export const createStaffValidationRules = () => ({
  employeeId: CommonValidationRules.employeeId,
  firstName: CommonValidationRules.name,
  lastName: CommonValidationRules.name,
  middleName: { ...CommonValidationRules.name, required: false },
  staffType: CommonValidationRules.required,
  dateOfBirth: CommonValidationRules.required,
  gender: CommonValidationRules.required,
  phone: { ...CommonValidationRules.phone, required: true },
  department: CommonValidationRules.required,
  position: { required: true, minLength: 2, maxLength: 100 },
  status: CommonValidationRules.required,
  // Address fields (optional)
  streetAddress: { maxLength: 255 },
  city: { maxLength: 100 },
  state: { maxLength: 100 },
  zipCode: { maxLength: 20 },
  country: { maxLength: 100 }
});

export const createSchoolValidationRules = () => ({
  schoolName: { required: true, minLength: 3, maxLength: 100 },
  subdomain: CommonValidationRules.subdomain,
  schoolType: CommonValidationRules.required,
  email: CommonValidationRules.email,
  phone: CommonValidationRules.optionalPhone,
  website: CommonValidationRules.optionalUrl,
  adminName: CommonValidationRules.name,
  adminEmail: CommonValidationRules.email,
  adminPassword: CommonValidationRules.password,
  confirmPassword: CommonValidationRules.confirmPassword('adminPassword')
});
