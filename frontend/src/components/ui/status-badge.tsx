import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium",
  {
    variants: {
      status: {
        active: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
        inactive: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
        pending: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
        success: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
        error: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
        warning: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
        info: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
      },
      variant: {
        default: "",
        outline: "bg-transparent border",
        solid: "",
        dot: "relative pl-4"
      }
    },
    defaultVariants: {
      status: "active",
      size: "default",
      variant: "default",
    },
  }
);

export interface StatusBadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, variant, showDot = false, children, ...props }, ref) => {
    const dotColor = {
      active: 'bg-green-500',
      success: 'bg-green-500',
      inactive: 'bg-gray-400',
      pending: 'bg-yellow-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    }[status || 'active'];

    return (
      <Badge
        ref={ref}
        className={cn(statusBadgeVariants({ status, size, variant }), className)}
        {...props}
      >
        {(showDot || variant === 'dot') && (
          <span className={cn(
            "absolute left-1.5 top-1/2 h-2 w-2 rounded-full transform -translate-y-1/2",
            dotColor
          )} />
        )}
        {children}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };