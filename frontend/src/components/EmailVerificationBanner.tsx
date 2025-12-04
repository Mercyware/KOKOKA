import React, { useState } from 'react';
import { X, Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { resendVerificationEmail } from '@/services/emailVerificationService';

interface EmailVerificationBannerProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
  };
  onDismiss?: () => void;
  isDismissible?: boolean;
  className?: string;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  user,
  onDismiss,
  isDismissible = true,
  className = '',
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if email is verified or banner is dismissed
  if (user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(user.email);

      if (result.success) {
        setIsResent(true);
        toast({
          title: 'Verification email sent!',
          description: 'Please check your email and click the verification link.',
          variant: 'default',
        });
        
        // Reset the "resent" state after 30 seconds
        setTimeout(() => setIsResent(false), 30000);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to send verification email',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 ${className}`}>
      <div className="flex items-start gap-3 w-full">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Email Verification Required
                </h4>
              </div>
              
              <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                Please verify your email address <strong>{user.email}</strong> to access all features and receive important notifications.
              </AlertDescription>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  intent="primary"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={isResending || isResent}
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : isResent ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Email Sent!
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-1" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {isResent && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 self-center">
                    Check your email and click the verification link
                  </p>
                )}
              </div>
            </div>

            {/* Dismiss Button */}
            {isDismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-shrink-0 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-200 dark:hover:bg-yellow-800/20"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default EmailVerificationBanner;