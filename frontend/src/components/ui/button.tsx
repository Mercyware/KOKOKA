import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { normalizeIcon, iconPatterns, type IconSize } from "@/lib/icon-utils";

const buttonVariants = cva(
  [
    "group relative inline-flex items-center justify-center",
    "font-medium transition-colors duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-blue-600 text-white border border-blue-600",
          "hover:bg-blue-700 hover:border-blue-700 hover:text-white",
          "focus-visible:ring-blue-500",
          "dark:bg-blue-600 dark:text-white dark:hover:text-white",
          "!text-white hover:!text-white dark:!text-white dark:hover:!text-white",
        ],
        outline: [
          "bg-transparent border border-gray-300 text-gray-700",
          "hover:bg-gray-50 hover:border-gray-400",
          "dark:border-gray-600 dark:text-gray-200",
          "dark:hover:bg-gray-800 dark:hover:border-gray-500",
        ],
        ghost: [
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        ],
        link: [
          "text-blue-600 underline-offset-4 hover:underline",
          "dark:text-blue-400",
        ],
      },
      intent: {
        primary: [
          "bg-blue-600 text-white border border-blue-600",
          "hover:bg-blue-700 hover:border-blue-700 hover:text-white",
          "focus-visible:ring-blue-500",
          "dark:bg-blue-600 dark:text-white dark:hover:text-white",
          "!text-white hover:!text-white dark:!text-white dark:hover:!text-white",
        ],
        secondary: [
          "bg-white border border-gray-300 text-gray-700",
          "hover:bg-gray-50 hover:border-gray-400",
          "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200",
          "dark:hover:bg-gray-700 dark:hover:border-gray-500",
        ],
        cancel: [
          "bg-gray-200 border border-gray-300 text-gray-700",
          "hover:bg-gray-300 hover:border-gray-400 hover:text-gray-800",
          "dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200",
          "dark:hover:bg-gray-500 dark:hover:border-gray-400 dark:hover:text-gray-100",
        ],
        action: [
          "bg-indigo-600 border border-indigo-600 !text-white",
          "hover:bg-indigo-700 hover:border-indigo-700 hover:!text-white",
          "dark:bg-indigo-500 dark:border-indigo-500 dark:!text-white",
          "dark:hover:bg-indigo-600 dark:hover:border-indigo-600 dark:hover:!text-white",
        ],
        success: [
          "bg-green-600 !text-white border border-green-600",
          "hover:bg-green-700 hover:border-green-700 hover:!text-white",
          "focus-visible:ring-green-500",
          "dark:!text-white dark:hover:!text-white",
        ],
        danger: [
          "bg-red-600 !text-white border border-red-600",
          "hover:bg-red-700 hover:border-red-700 hover:!text-white",
          "focus-visible:ring-red-500",
          "dark:!text-white dark:hover:!text-white",
        ],
        warning: [
          "bg-amber-600 !text-white border border-amber-600",
          "hover:bg-amber-700 hover:border-amber-700 hover:!text-white",
          "focus-visible:ring-amber-500",
          "dark:!text-white dark:hover:!text-white",
        ],
        ghost: [
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        ],
        link: [
          "text-blue-600 underline-offset-4 hover:underline",
          "dark:text-blue-400",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-lg",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        fit: "w-fit",
      },
      iconOnly: {
        true: "px-0 aspect-square",
        false: "",
      },
    },
    compoundVariants: [
      {
        size: "sm",
        iconOnly: true,
        className: "w-8 h-8",
      },
      {
        size: "md",
        iconOnly: true,
        className: "w-10 h-10",
      },
      {
        size: "lg",
        iconOnly: true,
        className: "w-12 h-12",
      },
      {
        size: "xl",
        iconOnly: true,
        className: "w-14 h-14",
      },
    ],
    defaultVariants: {
      variant: "default",
      intent: "secondary",
      size: "md", 
      width: "auto",
      iconOnly: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'iconOnly'> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: React.ReactNode;
  pulse?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant,
    intent, 
    size, 
    width,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    iconOnly,
    pulse = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const isIconOnly = Boolean(iconOnly);
    
    // Get icon configuration based on button size
    const iconConfig = iconPatterns.button[size || 'md'];
    const iconSize: IconSize = iconConfig.size;
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant,
            intent, 
            size, 
            width,
            iconOnly: isIconOnly 
          }),
          pulse && "animate-pulse",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        <div className={cn(
          "flex items-center justify-center",
          !isIconOnly && "gap-2"
        )}>
          {loading && normalizeIcon(<Loader2 className="animate-spin" />, iconSize)}
          
          {!loading && !isIconOnly && leftIcon && normalizeIcon(leftIcon, iconSize)}
          
          {!loading && isIconOnly && iconOnly && normalizeIcon(iconOnly, iconSize)}
          
          {!isIconOnly && (
            <span className={cn(
              "flex items-center leading-none",
              loading && "opacity-70"
            )}>
              {loading ? loadingText : children}
            </span>
          )}
          
          {!loading && !isIconOnly && rightIcon && normalizeIcon(rightIcon, iconSize)}
        </div>
      </Comp>
    );
  }
);
Button.displayName = "Button";

// Button group for related actions
export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    size?: ButtonProps['size'];
  }
>(({ className, orientation = 'horizontal', size, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientation === 'horizontal' 
          ? "flex-row [&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none" 
          : "flex-col [&>*:not(:first-child)]:mt-0 [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        className
      )}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === Button
          ? React.cloneElement(child as React.ReactElement<ButtonProps>, {
              size: size || child.props.size,
            })
          : child
      )}
    </div>
  );
});
ButtonGroup.displayName = "ButtonGroup";

export { Button, buttonVariants };
