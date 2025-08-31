# Standard Error Management System

This documentation explains how to use the standardized error management system implemented in the KOKOKA project for consistent form handling, validation, and user feedback.

## Overview

The standard error management system provides:

- **Centralized Error Handling**: Consistent error processing from API responses
- **Form State Management**: Unified form state with validation
- **Toast Notifications**: Standardized success/error feedback
- **Field-level Validation**: Real-time validation with visual feedback
- **Loading States**: Automatic loading state management
- **Type Safety**: Full TypeScript support

## Core Components

### 1. useFormErrors Hook
Basic error management with toast notifications.

```typescript
import { useFormErrors } from '@/hooks/useFormErrors';

const { 
  errors, 
  hasErrors, 
  setError, 
  clearError, 
  showToastError, 
  showToastSuccess 
} = useFormErrors();
```

### 2. useFormSubmission Hook
Handles form submission with loading states and error handling.

```typescript
import { useFormSubmission } from '@/hooks/useFormSubmission';

const { isSubmitting, handleSubmit } = useFormSubmission({
  entity: 'Staff member',
  operation: 'update'
});
```

### 3. useStandardForm Hook
Comprehensive form management combining state, validation, and submission.

```typescript
import { useStandardForm } from '@/hooks/useStandardForm';
import { createStaffValidationRules } from '@/utils/formValidation';

const form = useStandardForm({
  initialValues: { name: '', email: '' },
  validationRules: createStaffValidationRules(),
  entity: 'Staff member',
  operation: 'create'
});
```

## Validation System

### Pre-built Validation Rules

```typescript
import { CommonValidationRules } from '@/utils/formValidation';

// Common rules
CommonValidationRules.required
CommonValidationRules.email
CommonValidationRules.phone
CommonValidationRules.password
CommonValidationRules.name

// Pre-configured form rules
import { createStaffValidationRules, createSchoolValidationRules } from '@/utils/formValidation';
```

### Custom Validation Rules

```typescript
const customRules = {
  employeeId: {
    required: true,
    minLength: 3,
    custom: (value: string) => {
      if (!/^EMP\d+$/.test(value)) {
        return 'Employee ID must start with EMP followed by numbers';
      }
      return null;
    }
  }
};
```

## UI Components

### FormField Component
Standardized form field wrapper with error display.

```typescript
import { FormField } from '@/components/ui/form-error';

<FormField
  label="First Name"
  required
  error={form.errors.firstName}
  htmlFor="firstName"
>
  <Input
    id="firstName"
    value={form.values.firstName}
    onChange={form.handleInputChange('firstName')}
    onBlur={() => form.validateField('firstName')}
  />
</FormField>
```

### FormSection Component
Organizes form sections with consistent styling.

```typescript
import { FormSection } from '@/components/ui/form-error';

<FormSection
  title="Personal Information"
  description="Enter basic personal details"
  icon={<User className="h-5 w-5" />}
>
  {/* Form fields */}
</FormSection>
```

### FormError Component
Displays field-specific errors with consistent styling.

```typescript
import { FormError } from '@/components/ui/form-error';

<FormError error={form.errors.fieldName} />
```

## Complete Form Example

```typescript
import React, { useEffect, useState } from 'react';
import { useStandardForm } from '@/hooks/useStandardForm';
import { createStaffValidationRules } from '@/utils/formValidation';
import { FormField, FormSection } from '@/components/ui/form-error';

interface StaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

const CreateStaffForm: React.FC = () => {
  const form = useStandardForm<StaffData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
    },
    validationRules: createStaffValidationRules(),
    validateOnBlur: true,
    entity: 'Staff member',
    operation: 'create'
  });

  const handleSubmit = async () => {
    // API call
    await staffService.createStaff(form.values);
    // Success handling and navigation handled automatically
  };

  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      form.handleSubmit(handleSubmit); 
    }}>
      <FormSection 
        title="Personal Information"
        icon={<User className="h-5 w-5" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name"
            required
            error={form.errors.firstName}
            htmlFor="firstName"
          >
            <Input
              id="firstName"
              value={form.values.firstName}
              onChange={form.handleInputChange('firstName')}
              onBlur={() => form.validateField('firstName')}
              placeholder="Enter first name"
            />
          </FormField>

          <FormField
            label="Last Name"
            required
            error={form.errors.lastName}
            htmlFor="lastName"
          >
            <Input
              id="lastName"
              value={form.values.lastName}
              onChange={form.handleInputChange('lastName')}
              onBlur={() => form.validateField('lastName')}
              placeholder="Enter last name"
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          required
          error={form.errors.email}
          htmlFor="email"
        >
          <Input
            id="email"
            type="email"
            value={form.values.email}
            onChange={form.handleInputChange('email')}
            onBlur={() => form.validateField('email')}
            placeholder="Enter email address"
          />
        </FormField>
      </FormSection>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={form.isSubmitting}
        >
          {form.isSubmitting ? 'Creating...' : 'Create Staff Member'}
        </Button>
      </div>
    </form>
  );
};
```

## Error Handling Patterns

### API Error Handling

The system automatically extracts error information from API responses:

```typescript
// Field-specific errors are automatically mapped
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already taken" },
    { "field": "phone", "message": "Invalid phone format" }
  ]
}
```

### Custom Error Messages

```typescript
// Show general error
form.showError('Something went wrong');

// Show field-specific error
form.showError('This email is already taken', 'email');

// Show success message
form.showSuccess('Staff member created successfully');
```

### Loading States

```typescript
// Check if form is submitting
if (form.isSubmitting) {
  return <Loader />;
}

// Disable buttons during submission
<Button disabled={form.isSubmitting}>
  {form.isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

## Best Practices

### 1. Use Appropriate Validation
- Always use validation rules for user input
- Prefer client-side validation for immediate feedback
- Handle server-side validation errors gracefully

### 2. Consistent Error Display
- Use FormField for consistent field error display
- Show toast notifications for general errors
- Use red dot pattern for visual error indicators

### 3. Loading States
- Show loading indicators during API calls
- Disable form interactions while submitting
- Provide meaningful loading messages

### 4. Success Feedback
- Show success toasts for completed operations
- Navigate appropriately after successful submissions
- Clear form state when appropriate

### 5. Accessibility
- Use proper label associations
- Provide clear error messages
- Support keyboard navigation
- Use ARIA attributes where appropriate

## Migration Guide

### From Manual Error Handling

```typescript
// Before
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.call();
    toast({ title: 'Success' });
  } catch (error) {
    setErrors(extractErrors(error));
    toast({ title: 'Error', variant: 'destructive' });
  }
  setLoading(false);
};

// After
const form = useStandardForm({
  initialValues: {},
  validationRules: {},
  entity: 'Item'
});

const handleSubmit = async () => {
  await api.call();
  // Success/error handling automatic
};
```

### From useToast to Standard System

```typescript
// Before
const { toast } = useToast();
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});

// After
const form = useStandardForm({});
form.showError('Something went wrong');
```

## Files Created

### Core Hooks
- `frontend/src/hooks/useFormErrors.ts` - Basic error management
- `frontend/src/hooks/useFormSubmission.ts` - Form submission handling  
- `frontend/src/hooks/useStandardForm.ts` - Complete form management

### Utilities
- `frontend/src/utils/formValidation.ts` - Validation rules and utilities
- `frontend/src/utils/errorHandler.ts` - API error processing

### UI Components  
- `frontend/src/components/ui/form-error.tsx` - Error display components

### Documentation
- `frontend/src/docs/STANDARD_ERROR_MANAGEMENT.md` - This documentation

This standardized system ensures consistent error handling across all forms in the KOKOKA application while providing a better user experience and improved developer productivity.
