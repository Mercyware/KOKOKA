import React from 'react';
import Layout from '../../../components/layout/Layout';

const TestClassSubjectHistory: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Class-Subject History Test
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          If you can see this message, the basic component structure is working.
        </p>
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            This is a simplified test version to verify the component loads correctly.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TestClassSubjectHistory;