import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const getToastIcon = () => {
          switch (variant) {
            case 'success':
              return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
            case 'warning':
              return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
            case 'info':
              return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
            case 'destructive':
              return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
            default:
              return null;
          }
        };

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {getToastIcon()}
              <div className="grid gap-1 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
