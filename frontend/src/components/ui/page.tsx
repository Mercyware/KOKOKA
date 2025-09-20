import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Page Container Variants
const pageContainerVariants = cva(
  'min-h-screen bg-gray-50 dark:bg-gray-900',
  {
    variants: {
      maxWidth: {
        full: 'w-full',
        screen: 'max-w-screen-2xl mx-auto',
        container: 'container mx-auto',
        narrow: 'max-w-4xl mx-auto',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      maxWidth: 'container',
      padding: 'md',
    },
  }
);

// Page Header Variants
const pageHeaderVariants = cva(
  'bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6',
  {
    variants: {
      variant: {
        default: 'border border-gray-200 dark:border-gray-700',
        minimal: 'border-b border-gray-200 dark:border-gray-700 rounded-none shadow-none',
        elevated: 'shadow-lg',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

// Page Title Variants
const pageTitleVariants = cva(
  'font-bold text-gray-900 dark:text-white',
  {
    variants: {
      size: {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

// Page Description Variants
const pageDescriptionVariants = cva(
  'text-gray-600 dark:text-gray-400',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

// Page Content Variants
const pageContentVariants = cva(
  'space-y-6',
  {
    variants: {
      spacing: {
        sm: 'space-y-4',
        md: 'space-y-6',
        lg: 'space-y-8',
        xl: 'space-y-10',
      },
    },
    defaultVariants: {
      spacing: 'md',
    },
  }
);

// Component Interfaces
export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {}

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {}

export interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageTitleVariants> {}

export interface PageDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof pageDescriptionVariants> {}

export interface PageActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface PageContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContentVariants> {}

// Page Container Component
const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageContainerVariants({ maxWidth, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';

// Page Header Component
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageHeaderVariants({ variant, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

// Page Title Component
const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(pageTitleVariants({ size }), className)}
        {...props}
      >
        {children}
      </h1>
    );
  }
);
PageTitle.displayName = 'PageTitle';

// Page Description Component
const PageDescription = React.forwardRef<HTMLParagraphElement, PageDescriptionProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(pageDescriptionVariants({ size }), className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
PageDescription.displayName = 'PageDescription';

// Page Actions Component
const PageActions = React.forwardRef<HTMLDivElement, PageActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageActions.displayName = 'PageActions';

// Page Content Component
const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, spacing, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageContentVariants({ spacing }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContent.displayName = 'PageContent';

// Tab Components for Detail Pages
const TabContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {children}
    </div>
  );
});
TabContainer.displayName = 'TabContainer';

const TabList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {children}
      </nav>
    </div>
  );
});
TabList.displayName = 'TabList';

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, active, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
          active
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);
Tab.displayName = 'Tab';

const TabContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('pt-6', className)} {...props}>
      {children}
    </div>
  );
});
TabContent.displayName = 'TabContent';

// Export all components
export {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
  TabContainer,
  TabList,
  Tab,
  TabContent,
  pageContainerVariants,
  pageHeaderVariants,
  pageTitleVariants,
  pageDescriptionVariants,
  pageContentVariants,
};