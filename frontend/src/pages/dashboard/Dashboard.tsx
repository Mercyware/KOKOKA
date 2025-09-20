import React from 'react';
import Layout from '../../components/layout/Layout';
import DashboardComponent from '../../components/Dashboard';

import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { authState, checkAuth } = useAuth();
  const user = authState.user;

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

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Show loading state while auth is loading
  if (authState.loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if no user is loaded
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-yellow-300">
            <p className="text-lg text-gray-700 dark:text-gray-200">No user data available</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {!isSchoolApproved ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-red-300 dark:border-red-700">
            <div className="flex items-center mb-4">
              <svg className="w-10 h-10 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2" className="dark:fill-red-900"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
              <span className="text-2xl font-semibold text-red-600 dark:text-red-400">School Approval Pending</span>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">Your school is not approved yet.</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mb-6">Please wait for an administrator to approve your school. No menu is available until approval.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleRefreshUserData}
                className="px-6 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded shadow hover:bg-blue-600 dark:hover:bg-blue-800 transition">
                Refresh Status
              </button>
              <button 
                onClick={handleClearCache}
                className="px-4 py-2 bg-yellow-500 dark:bg-yellow-700 text-white rounded shadow hover:bg-yellow-600 dark:hover:bg-yellow-800 transition text-sm">
                Clear Cache
              </button>
              <button className="px-6 py-2 bg-red-500 dark:bg-red-700 text-white rounded shadow hover:bg-red-600 dark:hover:bg-red-800 transition">
                Contact Support
              </button>
            </div>
          </div>
        ) : (
          <DashboardComponent user={user} />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
