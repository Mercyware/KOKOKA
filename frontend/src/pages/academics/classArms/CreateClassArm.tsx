import React, { useState } from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ClassArmForm from './ClassArmForm';
import { createClassArm } from '../../../services/classArmService';
import { ClassArm } from '../../../types';
import Layout from '../../../components/layout/Layout';

const CreateClassArm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (classArmData: Partial<ClassArm>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createClassArm(classArmData);
      navigate('/academics/class-arms');
    } catch (err: any) {
      console.error('Error creating class arm:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create class arm. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Class Arm
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <ClassArmForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="Class Arm Details"
        />
      </Box>
      </Container>
    </Layout>
  );
};

export default CreateClassArm;
