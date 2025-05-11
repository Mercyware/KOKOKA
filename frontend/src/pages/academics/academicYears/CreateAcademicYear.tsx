import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import { post } from '../../../services/api';

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
  school?: string;
}

const CreateAcademicYear: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
    description: '',
    school: authState.user?.school,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name) newErrors.name = 'Academic year name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Ensure school ID is included in the request
      const dataToSubmit = {
        ...formData,
        school: authState.user?.school,
      };
      
      const response = await post('/academic-years', dataToSubmit);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Academic year created successfully',
          severity: 'success',
        });
        
        // Redirect to academic years list after successful creation
        setTimeout(() => {
          navigate('/academics/academic-years');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create academic year',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating academic year:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while creating the academic year',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Academic Year
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Academic Year Name"
                  name="name"
                  value={formData.name}
                  onChange={handleTextFieldChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  placeholder="e.g., 2023-2024"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleTextFieldChange}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleTextFieldChange}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Set as Active Academic Year"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleTextFieldChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/academics/academic-years')}
                    sx={{ mr: 2 }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Creating...' : 'Create Academic Year'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default CreateAcademicYear;
