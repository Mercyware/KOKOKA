import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Top Navigation Bar
const topNavigationVariants = cva(
  'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800',
  {
    variants: {
      size: {
        sm: 'px-4 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface TopNavigationProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof topNavigationVariants> {}

export const TopNavigation = React.forwardRef<HTMLElement, TopNavigationProps>(
  ({ className, size, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(topNavigationVariants({ size }), className)}
      {...props}
    />
  )
);
TopNavigation.displayName = 'TopNavigation';

// Top Navigation List (horizontal container)
export const TopNavigationList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center space-x-1', className)}
    {...props}
  />
));
TopNavigationList.displayName = 'TopNavigationList';

// Top Navigation Item variants
const topNavigationItemVariants = cva(
  [
    'relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md',
    'transition-colors duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'gap-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-700 dark:text-gray-300',
          'hover:text-gray-900 dark:hover:text-gray-100',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
        ],
        active: [
          'text-gray-900 dark:text-gray-100',
          'bg-gray-100 dark:bg-gray-800',
          'font-semibold',
        ],
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Top Navigation Item
export interface TopNavigationItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof topNavigationItemVariants> {
  active?: boolean;
  hasDropdown?: boolean;
}

export const TopNavigationItem = React.forwardRef<HTMLButtonElement, TopNavigationItemProps>(
  ({ 
    className, 
    variant, 
    size, 
    active, 
    hasDropdown, 
    children, 
    ...props 
  }, ref) => {
    const actualVariant = active ? 'active' : variant;

    return (
      <button
        ref={ref}
        className={cn(topNavigationItemVariants({ variant: actualVariant, size }), className)}
        type="button"
        {...props}
      >
        <span className="flex items-center">
          {children}
        </span>
        {hasDropdown && (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        )}
      </button>
    );
  }
);
TopNavigationItem.displayName = 'TopNavigationItem';

// Top Navigation Dropdown
export interface TopNavigationDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  trigger?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

export const TopNavigationDropdown = React.forwardRef<HTMLDivElement, TopNavigationDropdownProps>(
  ({ className, open, children, align = 'left', ...props }, ref) => {
    if (!open) return null;

    const alignClasses = {
      left: 'left-0',
      right: 'right-0', 
      center: 'left-1/2 transform -translate-x-1/2',
    }[align];

    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full mt-1 z-50',
          'bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800',
          'min-w-[200px] py-2',
          alignClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TopNavigationDropdown.displayName = 'TopNavigationDropdown';

// Top Navigation Dropdown Item
export const TopNavigationDropdownItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    description?: string;
    active?: boolean;
  }
>(({ className, icon, description, active, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex items-start gap-3 w-full px-4 py-3 text-left rounded-md',
      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      active && 'bg-gray-50 dark:bg-gray-800',
      className
    )}
    {...props}
  >
    {icon && (
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {React.isValidElement(icon) 
            ? React.cloneElement(icon, { className: 'w-5 h-5' })
            : icon
          }
        </div>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {children}
        </p>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </button>
));
TopNavigationDropdownItem.displayName = 'TopNavigationDropdownItem';

// Header Bar (for app header with user info, logout, etc.)
export const HeaderBar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-4 py-3', 
    lg: 'px-6 py-4',
  }[size];

  return (
    <header
      ref={ref}
      className={cn(
        'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800',
        'flex items-center justify-between',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
HeaderBar.displayName = 'HeaderBar';

// Header Content sections
export const HeaderContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'left' | 'center' | 'right';
  }
>(({ className, align = 'left', ...props }, ref) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-4', alignClasses, className)}
      {...props}
    />
  );
});
HeaderContent.displayName = 'HeaderContent';

// Header User Info
export const HeaderUserInfo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name: string;
    role?: string;
    avatar?: React.ReactNode;
  }
>(({ className, name, role, avatar, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3', className)}
    {...props}
  >
    {avatar && (
      <div className="flex-shrink-0">
        {avatar}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
        KOKOKA 
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">AI Powered Schools</p>
    </div>
  </div>
));
HeaderUserInfo.displayName = 'HeaderUserInfo';

// Header Action (for buttons that don't look like buttons)
export const HeaderAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    label?: string;
    showLabel?: boolean;
  }
>(({ className, icon, label, showLabel = true, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium min-h-[36px]',
      'text-gray-600 dark:text-gray-400',
      'hover:text-gray-900 dark:hover:text-gray-100',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  >
    {icon && (
      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        {React.isValidElement(icon) 
          ? React.cloneElement(icon, { className: 'w-4 h-4' })
          : icon
        }
      </span>
    )}
    {showLabel && (label || children) && (
      <span className="hidden sm:inline whitespace-nowrap">
        {label || children}
      </span>
    )}
  </button>
));
HeaderAction.displayName = 'HeaderAction';

export { topNavigationVariants, topNavigationItemVariants };