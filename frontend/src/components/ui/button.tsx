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
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border border-[hsl(var(--primary))] shadow-sm",
          "hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--primary))] active:border-[hsl(var(--primary))]",
          "focus-visible:ring-[hsl(var(--primary))]",
          "transition-all duration-200 ease-in-out",
        ],
        outline: [
          "bg-[hsl(var(--cancel))] text-[hsl(var(--cancel-foreground))] border border-[hsl(var(--cancel))] shadow-sm",
          "hover:bg-[hsl(var(--cancel))] hover:border-[hsl(var(--cancel))] hover:text-[hsl(var(--cancel-foreground))] hover:shadow-sm",
          "active:bg-[hsl(var(--cancel))] active:border-[hsl(var(--cancel))]",
          "focus-visible:ring-[hsl(var(--cancel))]",
          "transition-all duration-200 ease-in-out",
        ],
        ghost: [
          "bg-transparent text-[hsl(var(--muted-foreground))] border-transparent shadow-none",
          "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] hover:shadow-sm",
          "active:bg-[hsl(var(--muted))]",
          "transition-all duration-200 ease-in-out",
        ],
        destructive: [
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border border-[hsl(var(--destructive))] shadow-sm",
          "hover:bg-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--destructive))] active:border-[hsl(var(--destructive))]",
          "focus-visible:ring-[hsl(var(--destructive))]",
          "transition-all duration-200 ease-in-out",
        ],
        secondary: [
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--secondary))] shadow-sm",
          "hover:bg-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))] hover:shadow-sm",
          "active:bg-[hsl(var(--secondary))] active:border-[hsl(var(--secondary))]",
          "transition-all duration-200 ease-in-out",
        ],
        link: [
          "text-[hsl(var(--link))] underline-offset-4 hover:underline",
          "hover:text-[hsl(var(--link-foreground))]",
        ],
      },
      intent: {
        primary: [
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border border-[hsl(var(--primary))] shadow-sm",
          "hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--primary))] active:border-[hsl(var(--primary))]",
          "focus-visible:ring-[hsl(var(--primary))]",
          "transition-all duration-200 ease-in-out",
        ],
        secondary: [
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--secondary))] shadow-sm",
          "hover:bg-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))] hover:shadow-sm",
          "active:bg-[hsl(var(--secondary))] active:border-[hsl(var(--secondary))]",
          "transition-all duration-200 ease-in-out",
        ],
        cancel: [
          "bg-[hsl(var(--cancel))] text-[hsl(var(--cancel-foreground))] border border-[hsl(var(--cancel))] shadow-sm",
          "hover:bg-[hsl(var(--cancel))] hover:border-[hsl(var(--cancel))] hover:text-[hsl(var(--cancel-foreground))] hover:shadow-sm",
          "active:bg-[hsl(var(--cancel))] active:border-[hsl(var(--cancel))]",
          "transition-all duration-200 ease-in-out",
        ],
        action: [
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))] shadow-sm",
          "hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--accent))] active:border-[hsl(var(--accent))]",
          "focus-visible:ring-[hsl(var(--accent))]",
          "transition-all duration-200 ease-in-out",
        ],
        success: [
          "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--muted))] shadow-sm",
          "hover:bg-[hsl(var(--muted))] hover:border-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--muted))] active:border-[hsl(var(--muted))]",
          "focus-visible:ring-[hsl(var(--muted))]",
          "transition-all duration-200 ease-in-out",
        ],
        danger: [
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border border-[hsl(var(--destructive))] shadow-sm",
          "hover:bg-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--destructive))] active:border-[hsl(var(--destructive))]",
          "focus-visible:ring-[hsl(var(--destructive))]",
          "transition-all duration-200 ease-in-out",
        ],
        warning: [
          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent))] shadow-sm",
          "hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] hover:shadow-md",
          "active:bg-[hsl(var(--accent))] active:border-[hsl(var(--accent))]",
          "focus-visible:ring-[hsl(var(--accent))]",
          "transition-all duration-200 ease-in-out",
        ],
        ghost: [
          "bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]",
        ],
        link: [
          "text-[hsl(var(--link))] underline-offset-4 hover:underline",
          "hover:text-[hsl(var(--link-foreground))]",
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
