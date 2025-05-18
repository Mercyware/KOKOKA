import React, { useState } from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HouseForm from './HouseForm';
import { createHouse } from '../../../services/houseService';
import { House } from '../../../types';
import Layout from '../../../components/layout/Layout';

const CreateHouse: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (houseData: Partial<House>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createHouse(houseData);
      navigate('/academics/houses');
    } catch (err) {
      console.error('Error creating house:', err);
      setError('Failed to create house. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create House
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <HouseForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="House Details"
        />
      </Box>
      </Container>
    </Layout>
  );
};

export default CreateHouse;
