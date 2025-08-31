import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconVariants = cva(
  "flex-shrink-0",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-10 w-10",
        "3xl": "h-12 w-12",
      },
      color: {
        default: "text-current",
        primary: "text-blue-600 dark:text-blue-400",
        secondary: "text-gray-600 dark:text-gray-400",
        success: "text-green-600 dark:text-green-400",
        error: "text-red-600 dark:text-red-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        muted: "text-gray-400 dark:text-gray-500",
        white: "text-white",
      },
      variant: {
        default: "",
        contained: "p-2 rounded-lg",
        circle: "p-2 rounded-full",
        square: "p-2 rounded-md",
      },
      background: {
        none: "",
        primary: "bg-blue-100 dark:bg-blue-900/50",
        secondary: "bg-gray-100 dark:bg-gray-800",
        success: "bg-green-100 dark:bg-green-900/50",
        error: "bg-red-100 dark:bg-red-900/50",
        warning: "bg-yellow-100 dark:bg-yellow-900/50",
      }
    },
    defaultVariants: {
      size: "default",
      color: "default",
      variant: "default",
      background: "none",
    }
  }
);

export interface IconProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof iconVariants> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
}

const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ 
    className, 
    size, 
    color, 
    variant, 
    background, 
    icon: IconComponent, 
    label,
    ...props 
  }, ref) => {
    const iconSize = {
      xs: "h-3 w-3",
      sm: "h-4 w-4", 
      default: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
      "2xl": "h-10 w-10",
      "3xl": "h-12 w-12",
    }[size || 'default'];

    return (
      <div
        ref={ref}
        className={cn(iconVariants({ size, color, variant, background }), className)}
        role={label ? "img" : undefined}
        aria-label={label}
        {...props}
      >
        <IconComponent className={iconSize} />
      </div>
    );
  }
);

Icon.displayName = "Icon";

// Convenience components for common icon patterns
interface StatusIconProps extends Omit<IconProps, 'icon' | 'color' | 'background'> {
  status: 'success' | 'error' | 'warning' | 'info';
}

export const StatusIcon: React.FC<StatusIconProps & { icon: IconProps['icon'] }> = ({ 
  status, 
  icon,
  ...props 
}) => {
  const colorMap = {
    success: 'success' as const,
    error: 'error' as const, 
    warning: 'warning' as const,
    info: 'primary' as const,
  };

  const backgroundMap = {
    success: 'success' as const,
    error: 'error' as const,
    warning: 'warning' as const, 
    info: 'primary' as const,
  };

  return (
    <Icon
      icon={icon}
      color={colorMap[status]}
      background={backgroundMap[status]}
      variant="circle"
      {...props}
    />
  );
};

// Avatar-style icon container
export const IconAvatar: React.FC<Omit<IconProps, 'variant'> & { 
  name?: string;
  initials?: string;
}> = ({ 
  icon: IconComponent, 
  name, 
  initials, 
  size = "lg",
  background = "primary",
  color = "primary",
  ...props 
}) => {
  if (initials && !IconComponent) {
    return (
      <div
        className={cn(
          iconVariants({ size, variant: "circle", background }),
          "flex items-center justify-center font-semibold text-sm"
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <Icon
      icon={IconComponent}
      variant="circle"
      size={size}
      background={background}
      color={color}
      label={name}
      {...props}
    />
  );
};

export { Icon, iconVariants };