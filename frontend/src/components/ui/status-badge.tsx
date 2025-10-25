import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium",
  {
    variants: {
      status: {
        active: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        inactive: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        pending: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        success: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        error: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        warning: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        info: "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
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
      active: 'bg-emerald-500',
      success: 'bg-emerald-500',
      inactive: 'bg-slate-400',
      pending: 'bg-amber-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-cyan-500',
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