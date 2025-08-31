import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

// Modern Card variants
const cardVariants = cva(
  [
    'rounded-lg border bg-white dark:bg-gray-900',
    'shadow-sm transition-all duration-200',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-200 dark:border-gray-800',
        elevated: [
          'border-gray-200 dark:border-gray-800',
          'shadow-lg shadow-gray-200/50 dark:shadow-black/20',
        ],
        interactive: [
          'border-gray-200 dark:border-gray-800',
          'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700',
          'cursor-pointer active:scale-[0.98] active:transition-transform active:duration-75',
        ],
        outlined: 'border-2 border-gray-300 dark:border-gray-600 shadow-none',
        ghost: 'border-0 shadow-none bg-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[size];

  return (
    <div
      ref={ref}
      className={cn(
        'border-b border-gray-200 dark:border-gray-800',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[size];

  return (
    <div
      ref={ref}
      className={cn(sizeClasses, className)}
      {...props}
    />
  );
});
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[size];

  return (
    <div
      ref={ref}
      className={cn(
        'border-t border-gray-200 dark:border-gray-800',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';

// Card Title
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, as = 'h3', size = 'md', ...props }, ref) => {
  const Component = as;
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
  }[size];

  return (
    <Component
      ref={ref}
      className={cn(
        'text-gray-900 dark:text-gray-100 tracking-tight',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <p
      ref={ref}
      className={cn(
        'text-gray-600 dark:text-gray-400 mt-1',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

// Card Actions (for action buttons)
const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: 'start' | 'end' | 'center' | 'between';
    align?: 'start' | 'end' | 'center';
  }
>(({ className, justify = 'end', align = 'center', ...props }, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }[justify];

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
  }[align];

  return (
    <div
      ref={ref}
      className={cn(
        'flex gap-2',
        justifyClasses,
        alignClasses,
        className
      )}
      {...props}
    />
  );
});
CardActions.displayName = 'CardActions';

// Stats Card - for displaying metrics
export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  variant?: CardProps['variant'];
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, description, trend, icon, variant = 'default', ...props }, ref) => {
    const trendColors = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    };

    const trendIcons = {
      up: '↗',
      down: '↘',
      neutral: '→',
    };

    return (
      <Card ref={ref} variant={variant} className={className} {...props}>
        <CardContent size="md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
              {description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
              {trend && (
                <div className={cn('mt-2 flex items-center text-sm', trendColors[trend.direction])}>
                  <span className="mr-1">{trendIcons[trend.direction]}</span>
                  <span className="font-medium">{trend.value}</span>
                  {trend.label && <span className="ml-1">{trend.label}</span>}
                </div>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
StatsCard.displayName = 'StatsCard';

// Feature Card - for highlighting features/services
export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: CardProps['variant'];
  featured?: boolean;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, icon, action, variant = 'default', featured, ...props }, ref) => (
    <Card
      ref={ref}
      variant={featured ? 'elevated' : variant}
      className={cn(
        featured && 'ring-2 ring-blue-500 dark:ring-blue-400',
        className
      )}
      {...props}
    >
      <CardContent size="lg">
        <div className="text-center space-y-4">
          {icon && (
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
          <div>
            <CardTitle size="md" className="text-center">
              {title}
            </CardTitle>
            <CardDescription className="text-center mt-2">
              {description}
            </CardDescription>
          </div>
          {action && (
            <div className="pt-2">
              {action}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
FeatureCard.displayName = 'FeatureCard';

// Action Card - for displaying items with actions
export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  meta?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  image?: string;
  variant?: CardProps['variant'];
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ className, title, description, meta, status, actions, image, variant = 'interactive', ...props }, ref) => (
    <Card ref={ref} variant={variant} padding="none" className={className} {...props}>
      {image && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent size="md">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle size="sm" className="truncate">
                {title}
              </CardTitle>
              {status}
            </div>
            {description && (
              <CardDescription size="sm" className="line-clamp-2">
                {description}
              </CardDescription>
            )}
            {meta && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {meta}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 ml-2">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
ActionCard.displayName = 'ActionCard';

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardActions,
  StatsCard,
  FeatureCard,
  ActionCard,
  cardVariants,
};