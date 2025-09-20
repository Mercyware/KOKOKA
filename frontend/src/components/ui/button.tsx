import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { normalizeIcon, iconPatterns, type IconSize } from "@/lib/icon-utils";

const buttonVariants = cva(
  [
    "group relative inline-flex items-center justify-center",
    "font-siohioma-medium transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-siohioma-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
    "border border-transparent",
  ],
  {
    variants: {
      variant: {
        default: "siohioma-button-primary shadow-siohioma-sm hover:shadow-siohioma-md",
        outline: "siohioma-button-secondary shadow-siohioma-sm hover:shadow-siohioma-md",
        ghost: [
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "border-transparent shadow-none hover:shadow-siohioma-sm",
        ],
        destructive: [
          "bg-red-600 hover:bg-red-700 text-white",
          "border-red-600 hover:border-red-700",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        secondary: [
          "bg-gray-100 hover:bg-gray-200 text-gray-900",
          "border-gray-200 hover:border-gray-300",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        link: [
          "text-siohioma-primary underline-offset-4 hover:underline bg-transparent",
          "border-transparent shadow-none",
        ],
      },
      intent: {
        primary: "siohioma-button-primary shadow-siohioma-sm hover:shadow-siohioma-md",
        secondary: "siohioma-button-secondary shadow-siohioma-sm hover:shadow-siohioma-md",
        cancel: [
          "bg-gray-100 hover:bg-gray-200 text-gray-700",
          "border-gray-200 hover:border-gray-300",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        action: [
          "bg-siohioma-accent hover:bg-siohioma-accent/90 text-white",
          "border-siohioma-accent hover:border-siohioma-accent",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        success: [
          "bg-green-600 hover:bg-green-700 text-white",
          "border-green-600 hover:border-green-700",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        danger: [
          "bg-red-600 hover:bg-red-700 text-white",
          "border-red-600 hover:border-red-700",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        warning: [
          "bg-siohioma-accent hover:bg-siohioma-accent/90 text-white",
          "border-siohioma-accent hover:border-siohioma-accent",
          "shadow-siohioma-sm hover:shadow-siohioma-md",
        ],
        ghost: [
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "border-transparent shadow-none hover:shadow-siohioma-sm",
        ],
        link: [
          "text-siohioma-primary underline-offset-4 hover:underline bg-transparent",
          "border-transparent shadow-none",
        ],
      },
      size: {
        sm: "h-siohioma-2xl px-siohioma-sm text-siohioma-sm rounded-siohioma-lg",
        md: "h-10 px-siohioma-md text-siohioma-base rounded-siohioma-lg",
        lg: "h-12 px-siohioma-lg text-siohioma-lg rounded-siohioma-xl",
        xl: "h-14 px-siohioma-xl text-siohioma-xl rounded-siohioma-xl",
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
        className: "w-siohioma-2xl h-siohioma-2xl",
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
