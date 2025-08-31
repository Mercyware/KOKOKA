import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type FormMessageType = 'error' | 'success' | 'warning' | 'info';

interface FormErrorProps {
  error?: string;
  className?: string;
  showIcon?: boolean;
}

interface FormMessageProps {
  message?: string;
  type?: FormMessageType;
  className?: string;
  showIcon?: boolean;
}

/**
 * Standardized form error display component
 */
export const FormError: React.FC<FormErrorProps> = ({ 
  error, 
  className, 
  showIcon = true 
}) => {
  if (!error) return null;

  return (
    <FormMessage 
      message={error} 
      type="error" 
      className={className} 
      showIcon={showIcon} 
    />
  );
};

/**
 * Generic form message component for error, success, warning, info
 */
export const FormMessage: React.FC<FormMessageProps> = ({
  message,
  type = 'error',
  className,
  showIcon = true
}) => {
  if (!message) return null;

  const config = {
    error: {
      icon: AlertCircle,
      dotColor: 'bg-red-600 dark:bg-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/50'
    },
    success: {
      icon: CheckCircle,
      dotColor: 'bg-green-600 dark:bg-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/50'
    },
    warning: {
      icon: AlertTriangle,
      dotColor: 'bg-yellow-600 dark:bg-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50'
    },
    info: {
      icon: Info,
      dotColor: 'bg-blue-600 dark:bg-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50'
    }
  }[type];

  return (
    <div className={cn(
      "flex items-center space-x-2 mt-1",
      className
    )}>
      {showIcon && (
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
        </div>
      )}
      <p className={cn("text-sm font-medium", config.textColor)}>
        {message}
      </p>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * Form field wrapper with consistent error display
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  className,
  htmlFor
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      <FormError error={error} />
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form section wrapper for consistent styling
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
