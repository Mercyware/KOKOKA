import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import DashboardComponent from '../../components/Dashboard';
import {
  Card,
  CardContent,
  Button,
  PageContainer,
  PageContent
} from '@/components/ui';
import { RefreshCw, MessageCircle, AlertTriangle, Clock } from 'lucide-react';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';

import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { authState, checkAuth } = useAuth();
  const user = authState.user;
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    console.log('Onboarding check:', {
      hasUser: !!user,
      onboardingCompleted: user?.onboardingCompleted,
      role: user?.role,
      isAdmin,
      shouldShow: user && !user.onboardingCompleted && isAdmin
    });

    if (user && !user.onboardingCompleted && isAdmin) {
      console.log('Setting showOnboarding to true');
      setShowOnboarding(true);
    }
  }, [user]);

  // Temporary debug logging to see current state
  console.log('Current user school status:', user?.school?.status);
  console.log('Current timestamp:', new Date().toISOString());

  const isSchoolApproved = user?.school?.status === 'ACTIVE';

  const handleRefreshUserData = async () => {
    console.log('Refreshing user data...');
    // Clear localStorage to force fresh data fetch
    localStorage.removeItem('user');
    await checkAuth();
    console.log('User data refreshed. New status:', authState.user?.school?.status);
  };



  // Show loading state while auth is loading
  if (authState.loading) {
    return (
      <Layout>
        <PageContainer maxWidth="container" padding="md">
          <PageContent spacing="lg">
            <div className="min-h-[70vh] flex items-center justify-center">
              <Card variant="default" padding="lg" className="text-center">
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Dashboard</h2>
                      <p className="text-gray-600 dark:text-gray-400">Please wait while we load your data...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  // Show error if no user is loaded
  if (!user) {
    return (
      <Layout>
        <PageContainer maxWidth="container" padding="md">
          <PageContent spacing="lg">
            <div className="min-h-[70vh] flex items-center justify-center">
              <Card variant="outlined" padding="lg" className="text-center border-amber-300 dark:border-amber-700">
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No User Data</h2>
                      <p className="text-gray-600 dark:text-gray-400">Unable to load user information. Please try refreshing the page.</p>
                    </div>
                    <Button intent="primary" onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <OnboardingWizard
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <PageContainer maxWidth="container" padding="md">
        <PageContent spacing="lg">
          {!isSchoolApproved ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <Card variant="elevated" padding="none" className="text-center">
                  <CardContent size="lg">
                    <div className="space-y-6">
                      {/* Icon and Status */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            School Approval Pending
                          </h1>
                          <p className="text-lg text-gray-600 dark:text-gray-400">
                            Your school is not approved yet.
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          Please wait for an administrator to approve your school. 
                          No menu is available until approval.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        <Button 
                          intent="primary" 
                          onClick={handleRefreshUserData}
                          leftIcon={<RefreshCw />}
                          className="w-full sm:w-auto"
                        >
                          Refresh Status
                        </Button>
                        <Button 
                          intent="action" 
                          leftIcon={<MessageCircle />}
                          className="w-full sm:w-auto"
                        >
                          Contact Support
                        </Button>
                      </div>

                      {/* Additional Info */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          If you've been waiting for more than 24 hours, please contact our support team.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <DashboardComponent user={user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              emailVerified: user.emailVerified,
            } : null} />
          )}
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default Dashboard;
