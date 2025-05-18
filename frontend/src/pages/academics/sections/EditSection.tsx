import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import SectionForm from './SectionForm';
import { getSection, updateSection } from '../../../services/sectionService';
import { Section } from '../../../types';
import Layout from '../../../components/layout/Layout';

const EditSection: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSection = async () => {
      if (!id) {
        setError('Section ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const sectionData = await getSection(id);
        setSection(sectionData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching section:', err);
        setError('Failed to load section data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSection();
  }, [id]);

  const handleSubmit = async (sectionData: Partial<Section>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await updateSection(id, sectionData);
      navigate('/academics/sections');
    } catch (err: any) {
      console.error('Error updating section:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update section. Please try again.');
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

  if (error && !section) {
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
          Edit Section
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {section && (
          <SectionForm
            initialData={section}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            title="Edit Section Details"
          />
        )}
      </Box>
      </Container>
    </Layout>
  );
};

export default EditSection;
