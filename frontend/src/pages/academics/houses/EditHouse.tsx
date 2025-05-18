import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import HouseForm from './HouseForm';
import { getHouse, updateHouse } from '../../../services/houseService';
import { House } from '../../../types';
import Layout from '../../../components/layout/Layout';

const EditHouse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [house, setHouse] = useState<House | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouse = async () => {
      if (!id) {
        setError('House ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const houseData = await getHouse(id);
        setHouse(houseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching house:', err);
        setError('Failed to load house data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchHouse();
  }, [id]);

  const handleSubmit = async (houseData: Partial<House>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await updateHouse(id, houseData);
      navigate('/academics/houses');
    } catch (err) {
      console.error('Error updating house:', err);
      setError('Failed to update house. Please try again.');
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

  if (error && !house) {
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
          Edit House
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {house && (
          <HouseForm
            initialData={house}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            title="Edit House Details"
          />
        )}
      </Box>
      </Container>
    </Layout>
  );
};

export default EditHouse;
