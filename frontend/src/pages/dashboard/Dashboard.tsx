import React from 'react';
import Layout from '../../components/layout/Layout';
import DashboardComponent from '../../components/Dashboard';

import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const user = authState.user;

  // School is a string id, need to check approval via user.schoolStatus or similar
  // For now, fallback to user.schoolStatus === 'active'
  const isSchoolApproved = user?.schoolStatus === 'active';

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
            <button className="px-6 py-2 bg-red-500 dark:bg-red-700 text-white rounded shadow hover:bg-red-600 dark:hover:bg-red-800 transition">Contact Support</button>
          </div>
        ) : (
          <DashboardComponent />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
