import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/Dashboard';
import ViewStudent from '../components/ViewStudent';

// Import other page components as needed
import ClassArmsList from './academics/classArms/ClassArmsList';
import NotFound from './NotFound';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    navigate('/dashboard/students/view');
  };

  const handleEditStudent = () => {
    if (selectedStudentId) {
      navigate(`/dashboard/students/edit/${selectedStudentId}`);
    }
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Student Routes */}
        <Route 
          path="/students/view" 
          element={
            selectedStudentId ? (
              <ViewStudent 
                studentId={selectedStudentId} 
                onBack={() => navigate('/dashboard/students')} 
                onEdit={handleEditStudent}
              />
            ) : (
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">No Student Selected</h2>
                <p className="mb-4">Please select a student from the list to view their details.</p>
                <button 
                  onClick={() => navigate('/dashboard/students')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Go to Students List
                </button>
              </div>
            )
          } 
        />
        
        {/* Academic Routes */}
        <Route path="/academics/class-arms" element={<ClassArmsList />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
