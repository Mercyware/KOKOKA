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

  const handleEditStudent = (studentId: string) => {
    window.location.href = `/students/${studentId}/edit`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StudentsManagerComponent
            onAddStudent={handleAddStudent}
            onViewStudent={handleViewStudent}
            onEditStudent={handleEditStudent}
          />
        </div>
      </div>
    </Layout>
  );
};

export default StudentsManager;
