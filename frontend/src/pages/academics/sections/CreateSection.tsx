import React, { useState } from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SectionForm from './SectionForm';
import { createSection } from '../../../services/sectionService';
import { Section } from '../../../types';
import Layout from '../../../components/layout/Layout';

const CreateSection: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (sectionData: Partial<Section>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createSection(sectionData);
      navigate('/academics/sections');
    } catch (err: any) {
      console.error('Error creating section:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create section. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Section
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <SectionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="Section Details"
        />
      </Box>
      </Container>
    </Layout>
  );
};

export default CreateSection;
