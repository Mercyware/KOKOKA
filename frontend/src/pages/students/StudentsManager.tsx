import React from 'react';
import Layout from '../../components/layout/Layout';
import StudentsManagerComponent from '../../components/students/StudentsManager';

const StudentsManager: React.FC = () => {
  const handleAddStudent = () => {
    window.location.href = '/students/add';
  };

  const handleViewStudent = (studentId: string) => {
    window.location.href = `/students/${studentId}`;
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
