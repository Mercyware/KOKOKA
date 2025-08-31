import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { normalizeIcon, IconContainer } from '@/lib/icon-utils';

// Navigation container
const navigationVariants = cva(
  'flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800',
  {
    variants: {
      width: {
        sm: 'w-64',
        md: 'w-72', 
        lg: 'w-80',
      },
    },
    defaultVariants: {
      width: 'md',
    },
  }
);

export interface NavigationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationVariants> {}

export const Navigation = React.forwardRef<HTMLDivElement, NavigationProps>(
  ({ className, width, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(navigationVariants({ width }), 'h-screen', className)}
      {...props}
    />
  )
);
Navigation.displayName = 'Navigation';

// Navigation header
export const NavigationHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-800',
      className
    )}
    {...props}
  />
));
NavigationHeader.displayName = 'NavigationHeader';

// Navigation content (scrollable area)
export const NavigationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto py-4', className)}
    {...props}
  />
));
NavigationContent.displayName = 'NavigationContent';

// Navigation footer
export const NavigationFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-800',
      className
    )}
    {...props}
  />
));
NavigationFooter.displayName = 'NavigationFooter';

// Navigation group (section with optional title)
export const NavigationGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
  }
>(({ className, title, children, ...props }, ref) => (
  <div ref={ref} className={cn('px-3', className)} {...props}>
    {title && (
      <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h4>
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
));
NavigationGroup.displayName = 'NavigationGroup';

// Navigation item variants
const navigationItemVariants = cva(
  [
    'flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md',
    'transition-colors duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'gap-3',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'hover:text-gray-900 dark:hover:text-gray-100',
        ],
        active: [
          'bg-gray-100 dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'font-semibold',
        ],
      },
      size: {
        sm: 'py-2 text-xs',
        md: 'py-2.5 text-sm',
        lg: 'py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Navigation item
export interface NavigationItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof navigationItemVariants> {
  icon?: React.ReactNode;
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
}

export const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon, 
    active, 
    hasSubmenu, 
    expanded, 
    children, 
    ...props 
  }, ref) => {
    const actualVariant = active ? 'active' : variant;

    return (
      <button
        ref={ref}
        className={cn(navigationItemVariants({ variant: actualVariant, size }), className)}
        type="button"
        {...props}
      >
        {icon && (
          <IconContainer icon={icon} size="md" center />
        )}
        
        <span className="flex-1 text-left truncate leading-none">
          {children}
        </span>
        
        {hasSubmenu && (
          <IconContainer 
            icon={expanded ? <ChevronDown /> : <ChevronRight />}
            size="sm" 
            center
          />
        )}
      </button>
    );
  }
);
NavigationItem.displayName = 'NavigationItem';

// Navigation submenu
export const NavigationSubmenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
  }
>(({ className, open, children, ...props }, ref) => {
  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn('ml-8 mt-1 space-y-1', className)}
      {...props}
    >
      {children}
    </div>
  );
});
NavigationSubmenu.displayName = 'NavigationSubmenu';

// Navigation subitem (smaller, indented)
export const NavigationSubitem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ className, size = 'sm', icon, children, ...props }, ref) => (
    <NavigationItem
      ref={ref}
      className={cn('text-gray-600 dark:text-gray-400', className)}
      size={size}
      icon={icon && <IconContainer icon={icon} size="sm" center />}
      {...props}
    >
      {children}
    </NavigationItem>
  )
);
NavigationSubitem.displayName = 'NavigationSubitem';

// User profile section for navigation
export const NavigationProfile = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name: string;
    email?: string;
    role?: string;
    avatar?: React.ReactNode;
  }
>(({ className, name, email, role, avatar, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800',
      className
    )}
    {...props}
  >
    {avatar && (
      <div className="mr-3 flex-shrink-0">
        {avatar}
      </div>
    )}
    
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {name}
      </p>
      {email && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {email}
        </p>
      )}
      {role && (
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {role}
          </span>
        </div>
      )}
    </div>
  </div>
));
NavigationProfile.displayName = 'NavigationProfile';

export { navigationVariants, navigationItemVariants };