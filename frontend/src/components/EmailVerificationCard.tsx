import React, { useState } from 'react';
import { AlertCircle, Mail, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { resendVerificationEmail } from '@/services/emailVerificationService';

interface EmailVerificationCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
  };
  onDismiss?: () => void;
}

const EmailVerificationCard: React.FC<EmailVerificationCardProps> = ({
  user,
  onDismiss,
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if email is verified or card is dismissed
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
    <div className="siohioma-card border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <div className="p-siohioma-lg">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  <h3 className="siohioma-heading-4 text-yellow-800 dark:text-yellow-200">
                    Verify Your Email Address
                  </h3>
                </div>
                
                <p className="siohioma-body-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Please verify <strong>{user.email}</strong> to access all features and receive important notifications.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <Button
                    intent="primary"
                    size="sm"
                    onClick={handleResendEmail}
                    disabled={isResending || isResent}
                    className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : isResent ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Email Sent!
                      </>
                    ) : (
                      <>
                        <Mail className="h-3 w-3 mr-2" />
                        Resend Email
                      </>
                    )}
                  </Button>

                  {isResent && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 self-center">
                      Check your inbox and click the verification link
                    </p>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-shrink-0 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-200 dark:hover:bg-yellow-800/20"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationCard;