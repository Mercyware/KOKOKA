import React from 'react';
import { Clock, Mail, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ActivationPendingScreenProps {
  schoolName: string;
  schoolStatus: string;
  userEmail?: string;
  onRefresh?: () => void;
}

const ActivationPendingScreen: React.FC<ActivationPendingScreenProps> = ({
  schoolName,
  schoolStatus,
  userEmail,
  onRefresh,
}) => {
  const { logout, authState } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleCheckStatus = async () => {
    if (!onRefresh) return;

    setIsChecking(true);
    try {
      console.log('🔍 Checking school status...');
      console.log('Current status before check:', authState.user?.school?.status);

      await onRefresh();

      // Wait a bit for auth state to update after the refresh
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Status after check:', authState.user?.school?.status);
      console.log('Full user object:', authState.user);

      // Check if status changed after refresh
      if (authState.user?.school?.status === 'ACTIVE') {
        console.log('✅ School is now ACTIVE! Redirecting...');
        toast({
          title: '🎉 School Activated!',
          description: 'Your school has been activated. Redirecting...',
        });
        // Give user a moment to see the success message before redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        console.log('⏳ School still not active:', authState.user?.school?.status);
        toast({
          title: 'Status Checked',
          description: `School status is still: ${authState.user?.school?.status || schoolStatus}`,
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('❌ Check status error:', error);
      toast({
        title: 'Check Failed',
        description: 'Unable to check school status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusInfo = () => {
    switch (schoolStatus) {
      case 'PENDING':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          title: 'School Activation Pending',
          description: 'Your school registration is being reviewed by our team.',
          alertType: 'default' as const,
        };
      case 'SUSPENDED':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          title: 'School Account Suspended',
          description: 'Your school account has been temporarily suspended.',
          alertType: 'destructive' as const,
        };
      case 'INACTIVE':
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100 dark:bg-gray-900/30',
          title: 'School Account Inactive',
          description: 'Your school account is currently inactive.',
          alertType: 'default' as const,
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          title: 'Awaiting Activation',
          description: 'Your school account is awaiting activation.',
          alertType: 'default' as const,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 rounded-full ${statusInfo.iconBg} flex items-center justify-center`}>
                <StatusIcon className={`h-12 w-12 ${statusInfo.iconColor}`} />
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {statusInfo.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {schoolName}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {statusInfo.description}
              </p>
            </div>

            {/* Status-specific Alert */}
            <Alert variant={statusInfo.alertType} className="mb-6">
              <AlertDescription>
                {schoolStatus === 'PENDING' && (
                  <div>
                    <p className="font-medium mb-2">What happens next?</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>Our team will review your school registration details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>You'll receive an email notification once approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>Typical review time: 24-48 hours</span>
                      </li>
                    </ul>
                  </div>
                )}
                {schoolStatus === 'SUSPENDED' && (
                  <div>
                    <p className="font-medium mb-2">Account Suspended</p>
                    <p className="text-sm">
                      Please contact our support team for more information about reactivating your
                      school account.
                    </p>
                  </div>
                )}
                {schoolStatus === 'INACTIVE' && (
                  <div>
                    <p className="font-medium mb-2">Account Inactive</p>
                    <p className="text-sm">
                      Your school account needs to be reactivated. Please contact support for
                      assistance.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Contact Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Need help or have questions?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Contact our support team for assistance with your school activation.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a
                      href="mailto:support@kokoka.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      support@kokoka.com
                    </a>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      +1 (555) 123-4567
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            {userEmail && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                Logged in as: <span className="font-medium">{userEmail}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {onRefresh && (
                <Button
                  intent="primary"
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Checking...' : 'Check Status'}
                </Button>
              )}
              <Button
                intent="cancel"
                onClick={handleLogout}
                disabled={isChecking}
                className="flex-1 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                <p>
                  Once your school is activated, you'll have full access to all KOKOKA features
                  including student management, attendance tracking, grade books, and more.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivationPendingScreen;
