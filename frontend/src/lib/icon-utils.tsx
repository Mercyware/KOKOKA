import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Icon sizing utilities for consistent icon alignment across components
 */

export const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
} as const;

export type IconSize = keyof typeof iconSizes;

/**
 * Ensures consistent icon sizing and alignment
 */
export const normalizeIcon = (
  icon: React.ReactNode, 
  size: IconSize = 'sm',
  className?: string
): React.ReactNode => {
  if (!icon) return null;
  
  const sizeClass = iconSizes[size];
  const combinedClassName = cn(sizeClass, className);
  
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      className: combinedClassName,
      ...icon.props,
    });
  }
  
  return icon;
};

/**
 * Icon container for consistent spacing and alignment
 */
export const IconContainer: React.FC<{
  icon: React.ReactNode;
  size?: IconSize;
  className?: string;
  center?: boolean;
}> = ({ icon, size = 'sm', className, center = true }) => {
  const sizeClass = iconSizes[size];
  
  return (
    <span className={cn(
      'flex-shrink-0',
      center && 'flex items-center justify-center',
      sizeClass,
      className
    )}>
      {normalizeIcon(icon, size)}
    </span>
  );
};

/**
 * Common icon patterns for different components
 */
export const iconPatterns = {
  // Button icons
  button: {
    sm: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    md: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    lg: { size: 'md' as IconSize, className: 'flex-shrink-0' },
    xl: { size: 'lg' as IconSize, className: 'flex-shrink-0' },
  },
  
  // Navigation icons
  navigation: {
    main: { size: 'md' as IconSize, className: 'flex-shrink-0' },
    sub: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    chevron: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
  },
  
  // Form icons
  form: {
    input: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    label: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    message: { size: 'sm' as IconSize, className: 'flex-shrink-0 mt-0.5' },
  },
  
  // Card icons
  card: {
    header: { size: 'lg' as IconSize, className: 'flex-shrink-0' },
    stat: { size: 'xl' as IconSize, className: 'flex-shrink-0' },
    action: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
  },
  
  // Status icons
  status: {
    badge: { size: 'sm' as IconSize, className: 'flex-shrink-0' },
    indicator: { size: 'xs' as IconSize, className: 'flex-shrink-0' },
    card: { size: 'md' as IconSize, className: 'flex-shrink-0' },
  },
} as const;

/**
 * Get icon configuration for a specific component and size
 */
export const getIconConfig = (
  component: keyof typeof iconPatterns,
  variant: string,
  customSize?: IconSize
) => {
  const pattern = iconPatterns[component]?.[variant as keyof typeof iconPatterns[typeof component]];
  
  if (!pattern) {
    return { size: 'sm' as IconSize, className: 'flex-shrink-0' };
  }
  
  return {
    ...pattern,
    size: customSize || pattern.size,
  };
};

/**
 * Utility for creating properly aligned icon components
 */
export const createIconComponent = (
  IconComponent: React.ComponentType<any>,
  size: IconSize = 'sm',
  className?: string
) => {
  const Component = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <IconComponent
        ref={ref}
        className={cn(iconSizes[size], className)}
        {...props}
      />
    )
  );
  
  Component.displayName = `Icon(${IconComponent.displayName || IconComponent.name || 'Unknown'})`;
  
  return Component;
};