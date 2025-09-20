import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddStudentForm from './AddStudentForm';

const CreateStudent: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/students');
  };

  const handleSave = (student: any) => {
    // Navigate to students page after successful creation
    navigate('/students');
  };

  return (
    <AddStudentForm 
      onBack={handleBack}
      onSave={handleSave}
    />
  );
};

export default CreateStudent;