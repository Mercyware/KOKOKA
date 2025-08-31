import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva(
  "",
  {
    variants: {
      variant: {
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100",
        h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
        h5: "scroll-m-20 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100",
        h6: "scroll-m-20 text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100",
        p: "leading-7 text-gray-700 dark:text-gray-300",
        blockquote: "mt-6 border-l-2 pl-6 italic text-gray-700 dark:text-gray-300",
        code: "relative rounded bg-gray-100 dark:bg-gray-800 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-gray-900 dark:text-gray-100",
        lead: "text-xl text-gray-600 dark:text-gray-400",
        large: "text-lg font-semibold text-gray-900 dark:text-gray-100",
        small: "text-sm font-medium leading-none text-gray-700 dark:text-gray-300",
        muted: "text-sm text-gray-500 dark:text-gray-400",
        caption: "text-xs text-gray-500 dark:text-gray-400",
        label: "text-sm font-medium text-gray-700 dark:text-gray-300",
      },
      color: {
        default: "",
        primary: "text-blue-600 dark:text-blue-400",
        secondary: "text-gray-600 dark:text-gray-400", 
        success: "text-green-600 dark:text-green-400",
        error: "text-red-600 dark:text-red-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        muted: "text-gray-500 dark:text-gray-500",
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      }
    },
    defaultVariants: {
      variant: "p",
      color: "default",
      weight: "normal",
      align: "left",
    },
  }
);

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'blockquote' | 'code' | 'pre';
  gradient?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant, 
    color, 
    weight, 
    align, 
    as, 
    gradient = false, 
    children, 
    ...props 
  }, ref) => {
    // Auto-determine component if not specified
    const Component = as || (
      variant?.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' :
      variant === 'blockquote' ? 'blockquote' :
      variant === 'code' ? 'code' :
      'p'
    );

    return (
      <Component
        ref={ref as any}
        className={cn(
          typographyVariants({ variant, color, weight, align }),
          gradient && "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

// Convenience components for common patterns
export const Heading = React.forwardRef<HTMLHeadingElement, TypographyProps & { level: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level, ...props }, ref) => (
    <Typography 
      ref={ref}
      variant={`h${level}` as TypographyProps['variant']}
      as={`h${level}` as TypographyProps['as']}
      {...props}
    />
  )
);
Heading.displayName = "Heading";

export const Text = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="p" {...props} />
  )
);
Text.displayName = "Text";

export const Label = React.forwardRef<HTMLLabelElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => (
    <Typography ref={ref} variant="label" as="span" {...props} />
  )
);
Label.displayName = "Label";

export const Caption = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="caption" as="span" {...props} />
  )
);
Caption.displayName = "Caption";

export { Typography, typographyVariants };