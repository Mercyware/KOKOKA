import { useState, useCallback } from 'react';
import { useFormErrors } from './useFormErrors';
import { handleApiError, getSuccessMessage } from '../utils/errorHandler';

interface UseFormSubmissionOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  entity?: string; // For auto-generating success messages
  operation?: string; // For auto-generating success messages
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  resetFormOnSuccess?: boolean;
}

interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  submitError: string | null;
  handleSubmit: (
    submitFn: () => Promise<any>,
    options?: Partial<UseFormSubmissionOptions>
  ) => Promise<void>;
  clearSubmitError: () => void;
}

/**
 * Hook for handling form submission with consistent error handling and loading states
 */
export const useFormSubmission = (
  defaultOptions: UseFormSubmissionOptions = {}
): UseFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { 
    setErrors, 
    clearAllErrors, 
    showToastError, 
    showToastSuccess 
  } = useFormErrors();

  const handleSubmit = useCallback(async (
    submitFn: () => Promise<any>,
    options: Partial<UseFormSubmissionOptions> = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    const {
      onSuccess,
      onError,
      successMessage,
      entity = 'Item',
      operation = 'save',
      showSuccessToast = true,
      showErrorToast = true,
      resetFormOnSuccess = false
    } = mergedOptions;

    setIsSubmitting(true);
    setSubmitError(null);
    if (resetFormOnSuccess) {
      clearAllErrors();
    }

    try {
      const result = await submitFn();
      
      // Success handling
      if (showSuccessToast) {
        const message = successMessage || getSuccessMessage(operation, entity);
        showToastSuccess(message);
      }
      
      if (resetFormOnSuccess) {
        clearAllErrors();
      }
      
      onSuccess?.(result);
    } catch (error: any) {
      console.error(`Form submission error:`, error);
      
      const errorInfo = handleApiError(error);
      
      // Set field-specific errors if available
      if (errorInfo.hasFieldErrors) {
        setErrors(errorInfo.fieldErrors);
      }
      
      // Set general submit error
      setSubmitError(errorInfo.message);
      
      // Show toast error if enabled
      if (showErrorToast) {
        showToastError(errorInfo.message);
      }
      
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [defaultOptions, setErrors, clearAllErrors, showToastError, showToastSuccess]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    clearSubmitError
  };
};
