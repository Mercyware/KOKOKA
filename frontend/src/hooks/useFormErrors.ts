import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface FormError {
  field?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export interface UseFormErrorsReturn {
  errors: Record<string, string>;
  hasErrors: boolean;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setErrors: (errors: Record<string, string> | FormError[]) => void;
  showFieldError: (field: string) => string | undefined;
  showToastError: (message: string, title?: string) => void;
  showToastSuccess: (message: string, title?: string) => void;
  showToastWarning: (message: string, title?: string) => void;
  showToastInfo: (message: string, title?: string) => void;
}

/**
 * Hook for managing form errors and displaying user feedback
 */
export const useFormErrors = (): UseFormErrorsReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const hasErrors = Object.keys(errors).length > 0;

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setMultipleErrors = useCallback((newErrors: Record<string, string> | FormError[]) => {
    if (Array.isArray(newErrors)) {
      const errorMap: Record<string, string> = {};
      newErrors.forEach(error => {
        if (error.field) {
          errorMap[error.field] = error.message;
        }
      });
      setErrors(errorMap);
    } else {
      setErrors(newErrors);
    }
  }, []);

  const showFieldError = useCallback((field: string) => {
    return errors[field];
  }, [errors]);

  // Toast notification methods
  const showToastError = useCallback((message: string, title = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const showToastSuccess = useCallback((message: string, title = "Success") => {
    toast({
      title,
      description: message,
      variant: "success",
    });
  }, [toast]);

  const showToastWarning = useCallback((message: string, title = "Warning") => {
    toast({
      title,
      description: message,
      variant: "warning",
    });
  }, [toast]);

  const showToastInfo = useCallback((message: string, title = "Info") => {
    toast({
      title,
      description: message,
      variant: "info",
    });
  }, [toast]);

  return {
    errors,
    hasErrors,
    setError,
    clearError,
    clearAllErrors,
    setErrors: setMultipleErrors,
    showFieldError,
    showToastError,
    showToastSuccess,
    showToastWarning,
    showToastInfo,
  };
};
