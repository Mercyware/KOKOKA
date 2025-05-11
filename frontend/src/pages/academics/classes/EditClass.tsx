import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import { get, put } from '../../../services/api';
import { AcademicYear, Class } from '../../../types';

interface FormData {
  name: string;
  level: number;
  academicYear: string;
  description: string;
  school?: string;
}

const EditClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    level: 1,
    academicYear: '',
    description: '',
    school: authState.user?.school,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch class data and academic years on component mount
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        // Fetch class data
        const classResponse = await get<Class>(`/classes/${id}`);
        if (classResponse.data) {
          const classData = classResponse.data;
          setFormData({
            name: classData.name,
            level: classData.level,
            academicYear: typeof classData.academicYear === 'object' && classData.academicYear !== null
              ? (classData.academicYear as any).id
              : classData.academicYear,
            description: classData.description || '',
            school: classData.school || authState.user?.school,
          });
        }

        // Fetch academic years
        const academicYearsResponse = await get<AcademicYear[]>('/academic-years');
        if (academicYearsResponse.data) {
          setAcademicYears(academicYearsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load data',
          severity: 'error',
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (!name) return;

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

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (!name) return;

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name) newErrors.name = 'Class name is required';
    if (!formData.level || formData.level < 1) newErrors.level = 'Valid class level is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';

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
      
      const response = await put(`/classes/${id}`, dataToSubmit);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Class updated successfully',
          severity: 'success',
        });
        
        // Redirect to classes list after successful update
        setTimeout(() => {
          navigate('/academics/classes');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update class',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating class:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating the class',
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

  if (fetchingData) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Class
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Class Name"
                  name="name"
                  value={formData.name}
                  onChange={handleTextFieldChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Class Level"
                  name="level"
                  type="number"
                  value={formData.level}
                  onChange={handleTextFieldChange}
                  error={!!errors.level}
                  helperText={errors.level}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.academicYear} required>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleSelectChange}
                    label="Academic Year"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name} {year.isActive && '(Active)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.academicYear && <FormHelperText>{errors.academicYear}</FormHelperText>}
                </FormControl>
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
                    onClick={() => navigate('/academics/classes')}
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
                    {loading ? 'Updating...' : 'Update Class'}
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

export default EditClass;
