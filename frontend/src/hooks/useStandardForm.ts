import { useState, useCallback, useEffect } from 'react';
import { useFormErrors } from './useFormErrors';
import { useFormSubmission } from './useFormSubmission';
import { validateForm, ValidationRule } from '../utils/formValidation';

interface UseStandardFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  entity?: string;
  operation?: string;
}

interface UseStandardFormReturn<T> {
  // Form state
  values: T;
  errors: Record<string, string>;
  hasErrors: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Form actions
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
  handleInputChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof T) => (value: string) => void;
  
  // Validation
  validateField: (field: keyof T) => boolean;
  validateAllFields: () => boolean;
  clearFieldError: (field: keyof T) => void;
  
  // Submission
  handleSubmit: (submitFn: (values: T) => Promise<any>) => Promise<void>;
  
  // Error management
  showError: (message: string, field?: keyof T) => void;
  showSuccess: (message: string) => void;
  clearErrors: () => void;
}

/**
 * Comprehensive hook that combines form state, validation, error handling, and submission
 */
export const useStandardForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {} as Partial<Record<keyof T, ValidationRule>>,
  validateOnChange = false,
  validateOnBlur = true,
  entity = 'Item',
  operation = 'save'
}: UseStandardFormOptions<T>): UseStandardFormReturn<T> => {
  
  const [values, setValues] = useState<T>(initialValues);
  const {
    errors,
    hasErrors,
    setError,
    clearError,
    clearAllErrors,
    setErrors,
    showToastError,
    showToastSuccess
  } = useFormErrors();
  
  const {
    isSubmitting,
    submitError,
    handleSubmit: handleFormSubmit,
    clearSubmitError
  } = useFormSubmission({
    entity,
    operation,
    showSuccessToast: true,
    showErrorToast: false // We'll handle toast errors manually for more control
  });

  // Set individual field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field as string]) {
      clearError(field as string);
    }
    
    // Validate on change if enabled
    if (validateOnChange && validationRules[field]) {
      setTimeout(() => {
        const result = validateForm(
          { ...values, [field]: value },
          { [field]: validationRules[field] } as any
        );
        if (!result.isValid && result.errors[field as string]) {
          setError(field as string, result.errors[field as string]);
        }
      }, 0);
    }
  }, [values, errors, validationRules, validateOnChange, clearError, setError]);

  // Set multiple values
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    clearAllErrors();
    clearSubmitError();
  }, [initialValues, clearAllErrors, clearSubmitError]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof T) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(field, e.target.value);
    }, [setValue]
  );

  // Handle select changes
  const handleSelectChange = useCallback((field: keyof T) => 
    (value: string) => {
      setValue(field, value);
    }, [setValue]
  );

  // Validate single field
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validationRules[field]) return true;
    
    const result = validateForm(
      values,
      { [field]: validationRules[field] } as any
    );
    
    if (!result.isValid && result.errors[field as string]) {
      setError(field as string, result.errors[field as string]);
      return false;
    } else {
      clearError(field as string);
      return true;
    }
  }, [values, validationRules, setError, clearError]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    if (Object.keys(validationRules).length === 0) return true;
    
    const result = validateForm(values, validationRules as any);
    
    if (!result.isValid) {
      setErrors(result.errors);
      return false;
    } else {
      clearAllErrors();
      return true;
    }
  }, [values, validationRules, setErrors, clearAllErrors]);

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    clearError(field as string);
  }, [clearError]);

  // Submit handler
  const handleSubmit = useCallback(async (
    submitFn: (values: T) => Promise<any>
  ) => {
    // Validate all fields before submission
    if (!validateAllFields()) {
      showToastError('Please fix the errors before submitting');
      return;
    }

    await handleFormSubmit(() => submitFn(values), {
      onError: (error) => {
        // Don't show toast here since handleFormSubmit already handles field errors
        // and we want to show only one error message
        console.error('Submission failed:', error);
      }
    });
  }, [values, validateAllFields, handleFormSubmit, showToastError]);

  // Error management helpers
  const showError = useCallback((message: string, field?: keyof T) => {
    if (field) {
      setError(field as string, message);
    } else {
      showToastError(message);
    }
  }, [setError, showToastError]);

  const showSuccess = useCallback((message: string) => {
    showToastSuccess(message);
  }, [showToastSuccess]);

  const clearErrors = useCallback(() => {
    clearAllErrors();
    clearSubmitError();
  }, [clearAllErrors, clearSubmitError]);

  // Handle blur validation
  useEffect(() => {
    if (validateOnBlur) {
      // This effect will run whenever values change, but we only want to validate on blur
      // The actual blur validation is handled in the components using onBlur events
    }
  }, [validateOnBlur]);

  return {
    // Form state
    values,
    errors,
    hasErrors: hasErrors || !!submitError,
    isSubmitting,
    submitError,
    
    // Form actions
    setValue,
    setValues: setMultipleValues,
    resetForm,
    handleInputChange,
    handleSelectChange,
    
    // Validation
    validateField,
    validateAllFields,
    clearFieldError,
    
    // Submission
    handleSubmit,
    
    // Error management
    showError,
    showSuccess,
    clearErrors,
  };
};
