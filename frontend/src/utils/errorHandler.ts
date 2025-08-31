/**
 * Centralized error handling utilities
 */

import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  statusCode?: number;
}

export interface ErrorResponse {
  message: string;
  errors?: ApiError[];
  success: boolean;
}

/**
 * Extract error message from various error types
 */
export const extractErrorMessage = (error: any): string => {
  // Handle Axios errors
  if (error?.isAxiosError || error?.response) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Try to get error message from response data
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Try to get error from response data errors array
    if (axiosError.response?.data?.errors?.length) {
      return axiosError.response.data.errors[0].message;
    }
    
    // Fallback to status text or generic message
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }
    
    // Handle network errors
    if (axiosError.message?.includes('network') || axiosError.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Handle timeout errors
    if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
      return 'Request timeout. Please try again.';
    }
  }
  
  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle objects with message property
  if (error?.message) {
    return error.message;
  }
  
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extract field-specific errors from API response
 */
export const extractFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (error?.isAxiosError || error?.response) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errors = axiosError.response?.data?.errors;
    
    if (errors && Array.isArray(errors)) {
      errors.forEach(err => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
    }
  }
  
  return fieldErrors;
};

/**
 * Get appropriate error message based on HTTP status code
 */
export const getStatusCodeMessage = (statusCode?: number): string => {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists or there is a conflict with the current state.';
    case 422:
      return 'The provided data is invalid. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Request timeout. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Create a comprehensive error handler for API calls
 */
export const handleApiError = (error: any) => {
  const message = extractErrorMessage(error);
  const fieldErrors = extractFieldErrors(error);
  const statusCode = error?.response?.status;
  
  return {
    message,
    fieldErrors,
    statusCode,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
    isNetworkError: error?.message?.includes('network') || error?.code === 'NETWORK_ERROR',
    isTimeoutError: error?.code === 'ECONNABORTED' || error?.message?.includes('timeout'),
    isAuthError: statusCode === 401 || statusCode === 403,
    isValidationError: statusCode === 422 || statusCode === 400,
    isServerError: statusCode && statusCode >= 500,
  };
};

/**
 * Common error messages for different operations
 */
export const ErrorMessages = {
  // General
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Authentication
  AUTH_REQUIRED: 'Please log in to continue.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  
  // Validation
  INVALID_INPUT: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  
  // CRUD Operations
  CREATE_SUCCESS: 'Created successfully.',
  CREATE_FAILED: 'Failed to create. Please try again.',
  UPDATE_SUCCESS: 'Updated successfully.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  DELETE_SUCCESS: 'Deleted successfully.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  FETCH_FAILED: 'Failed to load data. Please refresh and try again.',
  
  // Specific to school management
  STAFF_CREATE_SUCCESS: 'Staff member created successfully.',
  STAFF_UPDATE_SUCCESS: 'Staff member updated successfully.',
  STAFF_DELETE_SUCCESS: 'Staff member removed successfully.',
  STUDENT_CREATE_SUCCESS: 'Student registered successfully.',
  STUDENT_UPDATE_SUCCESS: 'Student information updated successfully.',
  SCHOOL_REGISTER_SUCCESS: 'School registered successfully.',
  SUBDOMAIN_UNAVAILABLE: 'This subdomain is already taken. Please choose another one.',
  EMAIL_ALREADY_EXISTS: 'This email address is already registered.',
} as const;

/**
 * Success message helper
 */
export const getSuccessMessage = (operation: string, entity: string): string => {
  const formattedOperation = operation.charAt(0).toUpperCase() + operation.slice(1);
  const formattedEntity = entity.toLowerCase();
  
  switch (operation.toLowerCase()) {
    case 'create':
    case 'add':
      return `${entity} created successfully.`;
    case 'update':
    case 'edit':
      return `${entity} updated successfully.`;
    case 'delete':
    case 'remove':
      return `${entity} deleted successfully.`;
    default:
      return `${formattedOperation} completed successfully.`;
  }
};
