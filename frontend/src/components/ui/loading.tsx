import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const loadingVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4", 
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      color: {
        default: "text-gray-500 dark:text-gray-400",
        primary: "text-blue-600 dark:text-blue-400",
        white: "text-white",
        muted: "text-gray-400 dark:text-gray-600",
      }
    },
    defaultVariants: {
      size: "default",
      color: "default",
    }
  }
);

const containerVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      variant: {
        inline: "",
        overlay: "absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50",
        page: "min-h-screen",
        card: "h-64",
        button: "h-9 px-4",
      },
      gap: {
        none: "",
        sm: "gap-2",
        default: "gap-3",
        lg: "gap-4",
      }
    },
    defaultVariants: {
      variant: "inline",
      gap: "default",
    }
  }
);

interface LoadingSpinnerProps 
  extends Omit<React.SVGProps<SVGSVGElement>, 'size'>,
    VariantProps<typeof loadingVariants> {
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size, color, ...props }, ref) => (
    <Loader2 
      ref={ref}
      className={cn(loadingVariants({ size, color }), className)}
      {...props}
    />
  )
);
LoadingSpinner.displayName = "LoadingSpinner";

interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants>,
    Pick<VariantProps<typeof loadingVariants>, 'size' | 'color'> {
  text?: string;
  showSpinner?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    className, 
    variant, 
    gap, 
    size, 
    color, 
    text, 
    showSpinner = true, 
    children,
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ variant, gap }), className)}
      {...props}
    >
      {showSpinner && <LoadingSpinner size={size} color={color} />}
      {(text || children) && (
        <div className={cn(
          "text-gray-600 dark:text-gray-400",
          size === "xs" || size === "sm" ? "text-sm" : "text-base"
        )}>
          {text || children}
        </div>
      )}
    </div>
  )
);
Loading.displayName = "Loading";

// Preset loading states
export const PageLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <Loading variant="page" size="xl" text={text} />
);

export const CardLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <Loading variant="card" size="lg" text={text} />
);

export const OverlayLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <Loading variant="overlay" size="lg" text={text} />
);

export const ButtonLoading: React.FC<{ text?: string }> = ({ text }) => (
  <Loading variant="button" size="sm" color="white" text={text} gap="sm" />
);

export const InlineLoading: React.FC<{ size?: LoadingProps['size']; text?: string }> = ({ 
  size = "sm", 
  text 
}) => (
  <Loading variant="inline" size={size} text={text} gap="sm" />
);

export { Loading, LoadingSpinner, loadingVariants, containerVariants };