import React from 'react';
import Layout from '../../components/layout/Layout';
import DashboardComponent from '../../components/Dashboard';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <DashboardComponent />
      </div>
    </Layout>
  );
};

export default Dashboard;
