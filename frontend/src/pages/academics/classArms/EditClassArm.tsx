import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ClassArmForm from './ClassArmForm';
import { getClassArm, updateClassArm } from '../../../services/classArmService';
import { ClassArm } from '../../../types';
import Layout from '../../../components/layout/Layout';

const EditClassArm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classArm, setClassArm] = useState<ClassArm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassArm = async () => {
      if (!id) {
        setError('Class Arm ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const classArmData = await getClassArm(id);
        setClassArm(classArmData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching class arm:', err);
        setError('Failed to load class arm data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchClassArm();
  }, [id]);

  const handleSubmit = async (classArmData: Partial<ClassArm>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await updateClassArm(id, classArmData);
      navigate('/academics/class-arms');
    } catch (err: any) {
      console.error('Error updating class arm:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update class arm. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error && !classArm) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Class Arm
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {classArm && (
          <ClassArmForm
            initialData={classArm}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            title="Edit Class Arm Details"
          />
        )}
      </Box>
      </Container>
    </Layout>
  );
};

export default EditClassArm;
