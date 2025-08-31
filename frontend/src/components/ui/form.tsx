import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Eye, EyeOff, X } from 'lucide-react';

// Form Container
export const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6', 
    lg: 'space-y-8',
  }[spacing];

  return (
    <form
      ref={ref}
      className={cn('w-full', spacingClasses, className)}
      {...props}
    />
  );
});
Form.displayName = 'Form';

// Form Section with optional description and icon
export const FormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, title, description, icon, spacing = 'md', children, ...props }, ref) => {
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  }[spacing];

  return (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-6 h-6 text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className={spacingClasses}>
        {children}
      </div>
    </div>
  );
});
FormSection.displayName = 'FormSection';

// Message variants for different states
const messageVariants = cva(
  'flex items-start gap-2 text-sm font-medium',
  {
    variants: {
      type: {
        error: 'text-red-600 dark:text-red-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-amber-600 dark:text-amber-400',
        info: 'text-blue-600 dark:text-blue-400',
      },
    },
    defaultVariants: {
      type: 'error',
    },
  }
);

// Form Message Component
export const FormMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
    VariantProps<typeof messageVariants> & {
      message?: string;
      showIcon?: boolean;
    }
>(({ className, type = 'error', message, showIcon = true, children, ...props }, ref) => {
  if (!message && !children) return null;

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type || 'error'];

  return (
    <div
      ref={ref}
      className={cn(messageVariants({ type }), className)}
      role={type === 'error' ? 'alert' : 'status'}
      {...props}
    >
      {showIcon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <span>{message || children}</span>
    </div>
  );
});
FormMessage.displayName = 'FormMessage';

// Form Field Label
export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
    optional?: boolean;
  }
>(({ className, required, optional, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-label="required">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1 text-gray-500 font-normal">
          (optional)
        </span>
      )}
    </label>
  );
});
FormLabel.displayName = 'FormLabel';

// Form Field Description
export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

// Complete Form Field wrapper
export const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    description?: string;
    error?: string;
    success?: string;
    warning?: string;
    info?: string;
    required?: boolean;
    optional?: boolean;
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ 
  className, 
  label, 
  description, 
  error, 
  success, 
  warning, 
  info,
  required, 
  optional,
  spacing = 'sm',
  children, 
  ...props 
}, ref) => {
  const spacingClasses = {
    sm: 'space-y-1.5',
    md: 'space-y-2',
    lg: 'space-y-3',
  }[spacing];

  const fieldId = React.useId();
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const messageId = (error || success || warning || info) ? `${fieldId}-message` : undefined;

  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {label && (
        <FormLabel htmlFor={fieldId} required={required} optional={optional}>
          {label}
        </FormLabel>
      )}
      
      {description && (
        <FormDescription id={descriptionId}>
          {description}
        </FormDescription>
      )}
      
      <div className={spacingClasses}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                id: fieldId,
                'aria-describedby': cn(
                  descriptionId,
                  messageId
                ).trim() || undefined,
                'aria-invalid': error ? 'true' : undefined,
                ...child.props,
              })
            : child
        )}
        
        {error && (
          <FormMessage id={messageId} type="error" message={error} />
        )}
        {success && (
          <FormMessage id={messageId} type="success" message={success} />
        )}
        {warning && (
          <FormMessage id={messageId} type="warning" message={warning} />
        )}
        {info && (
          <FormMessage id={messageId} type="info" message={info} />
        )}
      </div>
    </div>
  );
});
FormField.displayName = 'FormField';

// Enhanced Input with built-in states
const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-white px-3 py-2 text-sm',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-gray-500 dark:placeholder:text-gray-400',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'dark:bg-gray-950',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-200 dark:border-gray-800',
          'focus-visible:ring-blue-500',
          'text-gray-900 dark:text-gray-100',
        ],
        error: [
          'border-red-500 dark:border-red-500',
          'focus-visible:ring-red-500',
          'text-gray-900 dark:text-gray-100',
        ],
        success: [
          'border-green-500 dark:border-green-500',
          'focus-visible:ring-green-500',
          'text-gray-900 dark:text-gray-100',
        ],
      },
      inputSize: {
        sm: 'h-8 px-2.5 py-1.5 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type = 'text',
    leftIcon, 
    rightIcon,
    clearable,
    onClear,
    value,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const hasValue = value && String(value).length > 0;

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon) || isPassword || (clearable && hasValue);

    return (
      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 flex items-center justify-center">
              {React.isValidElement(leftIcon) 
                ? React.cloneElement(leftIcon, { className: 'w-4 h-4' })
                : leftIcon
              }
            </div>
          </div>
        )}
        
        <input
          type={inputType}
          className={cn(
            inputVariants({ variant, inputSize }),
            hasLeftIcon && 'pl-10',
            hasRightIcon && 'pr-10',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        
        {hasRightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {clearable && hasValue && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 p-0.5 rounded"
                tabIndex={-1}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
              </button>
            )}
            
            {rightIcon && !isPassword && (
              <div className="text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 flex items-center justify-center">
                  {React.isValidElement(rightIcon) 
                    ? React.cloneElement(rightIcon, { className: 'w-4 h-4' })
                    : rightIcon
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Enhanced Textarea
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant?: 'default' | 'error' | 'success';
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  }
>(({ className, variant = 'default', resize = 'vertical', ...props }, ref) => {
  const variants = {
    default: 'border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500',
    error: 'border-red-500 focus-visible:ring-red-500',
    success: 'border-green-500 focus-visible:ring-green-500',
  };

  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  };

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-500 dark:placeholder:text-gray-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-gray-950 text-gray-900 dark:text-gray-100',
        variants[variant],
        resizeClasses[resize],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';