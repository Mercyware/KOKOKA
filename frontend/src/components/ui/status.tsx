import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2, Minus } from 'lucide-react';

// Status Badge variants
const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
  {
    variants: {
      status: {
        success: [
          'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800',
          'text-green-700 dark:text-green-300',
        ],
        error: [
          'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
          'text-red-700 dark:text-red-300',
        ],
        warning: [
          'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
          'text-amber-700 dark:text-amber-300',
        ],
        info: [
          'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
          'text-blue-700 dark:text-blue-300',
        ],
        pending: [
          'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800',
          'text-gray-700 dark:text-gray-300',
        ],
        processing: [
          'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
          'text-purple-700 dark:text-purple-300',
        ],
        neutral: [
          'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
          'text-gray-600 dark:text-gray-400',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
      variant: {
        default: '',
        outline: 'bg-transparent',
        solid: 'border-transparent',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        status: 'success',
        className: 'bg-green-600 text-white',
      },
      {
        variant: 'solid',
        status: 'error',
        className: 'bg-red-600 text-white',
      },
      {
        variant: 'solid',
        status: 'warning',
        className: 'bg-amber-600 text-white',
      },
      {
        variant: 'solid',
        status: 'info',
        className: 'bg-blue-600 text-white',
      },
      {
        variant: 'solid',
        status: 'pending',
        className: 'bg-gray-600 text-white',
      },
      {
        variant: 'solid',
        status: 'processing',
        className: 'bg-purple-600 text-white',
      },
    ],
    defaultVariants: {
      status: 'neutral',
      size: 'md',
      variant: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
  animate?: boolean;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, variant, icon, pulse, animate, children, ...props }, ref) => {
    const statusIcons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Clock,
      pending: Clock,
      processing: Loader2,
      neutral: Minus,
    };

    const StatusIcon = icon || statusIcons[status || 'neutral'];
    const shouldAnimate = animate || status === 'processing';
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    return (
      <span
        ref={ref}
        className={cn(
          statusBadgeVariants({ status, size, variant }),
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {StatusIcon && (
          <StatusIcon 
            className={cn(
              iconSize,
              shouldAnimate && 'animate-spin'
            )} 
          />
        )}
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

// Status Indicator - minimal dot indicator
const statusIndicatorVariants = cva(
  'inline-block rounded-full',
  {
    variants: {
      status: {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
        pending: 'bg-gray-400',
        processing: 'bg-purple-500',
        neutral: 'bg-gray-300',
      },
      size: {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
      },
    },
    defaultVariants: {
      status: 'neutral',
      size: 'md',
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  pulse?: boolean;
}

export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, status, size, pulse, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        statusIndicatorVariants({ status, size }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    />
  )
);
StatusIndicator.displayName = 'StatusIndicator';

// Progress Status - for multi-step processes
export interface ProgressStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed' | 'error';
  }[];
  orientation?: 'horizontal' | 'vertical';
}

export const ProgressStatus = React.forwardRef<HTMLDivElement, ProgressStatusProps>(
  ({ className, steps, orientation = 'horizontal', ...props }, ref) => {
    const containerClasses = orientation === 'horizontal' 
      ? 'flex items-center space-x-4' 
      : 'flex flex-col space-y-4';

    const stepClasses = orientation === 'horizontal'
      ? 'flex items-center'
      : 'flex items-start';

    return (
      <div
        ref={ref}
        className={cn(containerClasses, className)}
        {...props}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className={stepClasses}>
                <div className="relative">
                  <StatusIndicator
                    status={
                      step.status === 'completed' ? 'success' :
                      step.status === 'current' ? 'info' :
                      step.status === 'error' ? 'error' : 'neutral'
                    }
                    size="lg"
                    pulse={step.status === 'current'}
                  />
                  
                  {step.status === 'completed' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  {step.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <XCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "ml-3",
                  orientation === 'vertical' && "flex-1"
                )}>
                  <p className={cn(
                    "text-sm font-medium",
                    step.status === 'completed' && "text-green-700 dark:text-green-300",
                    step.status === 'current' && "text-blue-700 dark:text-blue-300",
                    step.status === 'error' && "text-red-700 dark:text-red-300",
                    step.status === 'pending' && "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.label}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className={cn(
                  "border-gray-300 dark:border-gray-600",
                  orientation === 'horizontal' 
                    ? "flex-1 border-t" 
                    : "ml-2 w-px h-6 border-l"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);
ProgressStatus.displayName = 'ProgressStatus';

// Status Card - for displaying status with additional context
export interface StatusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusBadgeProps['status'];
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const StatusCard = React.forwardRef<HTMLDivElement, StatusCardProps>(
  ({ className, status, title, description, action, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4 space-y-3 transition-colors',
          status === 'success' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50',
          status === 'error' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50',
          status === 'warning' && 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50',
          status === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50',
          status === 'pending' && 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/50',
          status === 'processing' && 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50',
          !status && 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h4>
              <StatusBadge status={status} size="sm" />
            </div>
            
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatusCard.displayName = 'StatusCard';

export { statusBadgeVariants, statusIndicatorVariants };