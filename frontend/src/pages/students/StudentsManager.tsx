import React from 'react';
import Layout from '../../components/layout/Layout';
import StudentsManagerComponent from '../../components/students/StudentsManager';

const StudentsManager: React.FC = () => {
  const handleAddStudent = () => {
    console.log('Add student clicked');
    // Implement navigation to add student page
  };

  const handleViewStudent = (studentId: string) => {
    console.log('View student clicked', studentId);
    // Implement navigation to view student page
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <StudentsManagerComponent 
          onAddStudent={handleAddStudent}
          onViewStudent={handleViewStudent}
        />
      </div>
    </Layout>
  );
};

export default StudentsManager;
