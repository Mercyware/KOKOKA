import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { normalizeIcon, iconPatterns, type IconSize } from "@/lib/icon-utils";

const buttonVariants = cva(
  [
    "group relative inline-flex items-center justify-center",
    "font-medium transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none",
    "active:scale-[0.98] active:transition-transform active:duration-75",
  ],
  {
    variants: {
      intent: {
        primary: [
          "bg-gradient-to-b from-blue-500 to-blue-600",
          "text-white shadow-md shadow-blue-500/25",
          "hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/30",
          "border border-blue-600/20",
        ],
        secondary: [
          "bg-white border border-gray-200 text-gray-900",
          "shadow-sm hover:bg-gray-50 hover:border-gray-300",
          "dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100",
          "dark:hover:bg-gray-800 dark:hover:border-gray-700",
        ],
        success: [
          "bg-gradient-to-b from-green-500 to-green-600",
          "text-white shadow-md shadow-green-500/25",
          "hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/30",
          "border border-green-600/20",
        ],
        danger: [
          "bg-gradient-to-b from-red-500 to-red-600",
          "text-white shadow-md shadow-red-500/25",
          "hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30",
          "border border-red-600/20",
        ],
        warning: [
          "bg-gradient-to-b from-amber-500 to-amber-600",
          "text-white shadow-md shadow-amber-500/25",
          "hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/30",
          "border border-amber-600/20",
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
      intent: "primary",
      size: "md",
      width: "auto",
      iconOnly: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
