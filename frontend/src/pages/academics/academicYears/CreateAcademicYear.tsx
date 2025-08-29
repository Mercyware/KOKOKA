import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  FormHelperText,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import { post } from '../../../services/api';

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  schoolId?: string;
}

const CreateAcademicYear: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showActiveWarning, setShowActiveWarning] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    schoolId: authState.user?.school,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Auto-generate academic year name when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startYear = new Date(formData.startDate).getFullYear();
      const endYear = new Date(formData.endDate).getFullYear();
      
      if (startYear === endYear) {
        setFormData(prev => ({
          ...prev,
          name: `${startYear}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          name: `${startYear}-${endYear}`
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const checkDuplicateName = async (name: string): Promise<boolean> => {
    if (!name.trim()) return false;
    
    try {
      const token = localStorage.getItem('token');
      const school = authState.user?.school;
      const response = await fetch(
        `/api/academic-years/check-name?name=${encodeURIComponent(name)}&school=${encodeURIComponent(school || '')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking duplicate name:', error);
      return false;
    }
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      name: value,
    }));

    if (value.trim()) {
      const isDuplicate = await checkDuplicateName(value);
      setIsDuplicate(isDuplicate);
      
      if (isDuplicate) {
        setErrors(prev => ({
          ...prev,
          name: 'Academic year name already exists',
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          name: '',
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        name: '',
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-set end date when start date is selected (1 year later)
    if (name === 'startDate' && value && !formData.endDate) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
      }));
    }

    // Clear date-related errors
    setErrors(prev => ({
      ...prev,
      [name]: '',
      dateRange: '',
    }));
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Show warning if user is trying to set as current
    if (name === 'isCurrent' && checked) {
      setShowActiveWarning(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleActiveConfirm = () => {
    setFormData(prev => ({
      ...prev,
      isCurrent: true,
    }));
    setShowActiveWarning(false);
  };

  const calculateDurationInMonths = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name?.trim()) newErrors.name = 'Academic year name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check duration
      const durationInMonths = calculateDurationInMonths(formData.startDate, formData.endDate);
      if (durationInMonths < 6) {
        newErrors.dateRange = 'Academic year must be at least 6 months long';
      } else if (durationInMonths > 24) {
        newErrors.dateRange = 'Academic year cannot be longer than 2 years';
      }

      // Check if dates are reasonable (not too far in the past or future)
      const now = new Date();
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

      if (startDate < twoYearsAgo) {
        newErrors.startDate = 'Start date cannot be more than 2 years in the past';
      }
      
      if (endDate > fiveYearsFromNow) {
        newErrors.endDate = 'End date cannot be more than 5 years in the future';
      }
    }

    // Name validation
    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Academic year name cannot exceed 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
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

    if (isDuplicate) {
      setSnackbar({
        open: true,
        message: 'Please choose a different academic year name',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        name: formData.name?.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        description: formData.description?.trim() || '',
        schoolId: authState.user?.school,
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

  const getDurationInfo = () => {
    if (formData.startDate && formData.endDate) {
      const months = calculateDurationInMonths(formData.startDate, formData.endDate);
      return `Duration: ${months} months`;
    }
    return '';
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
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
                  onChange={handleNameChange}
                  error={!!errors.name || isDuplicate}
                  helperText={errors.name || (isDuplicate && 'This name already exists')}
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
                  onChange={handleDateChange}
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
                  onChange={handleDateChange}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: formData.startDate || undefined
                  }}
                />
              </Grid>

              {(formData.startDate && formData.endDate) && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={getDurationInfo()} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={`${formatDateForDisplay(formData.startDate)} - ${formatDateForDisplay(formData.endDate)}`}
                      color="secondary" 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                  {errors.dateRange && (
                    <FormHelperText error>{errors.dateRange}</FormHelperText>
                  )}
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isCurrent}
                      onChange={handleSwitchChange}
                      name="isCurrent"
                      color="primary"
                    />
                  }
                  label="Set as Current Academic Year"
                />
                <FormHelperText>
                  Setting this as current will deactivate all other academic years for your school
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleTextFieldChange}
                  error={!!errors.description}
                  helperText={errors.description || `${formData.description.length}/500 characters`}
                  multiline
                  rows={4}
                  placeholder="Optional description for this academic year..."
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
                    disabled={loading || isDuplicate}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Academic Year'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Active Academic Year Warning Dialog */}
        <Dialog open={showActiveWarning} onClose={() => setShowActiveWarning(false)}>
          <DialogTitle>Set as Current Academic Year?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Setting this academic year as current will automatically deactivate all other academic years for your school. 
              Only one academic year can be current at a time. Are you sure you want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowActiveWarning(false)}>Cancel</Button>
            <Button onClick={handleActiveConfirm} variant="contained" color="primary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>

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
