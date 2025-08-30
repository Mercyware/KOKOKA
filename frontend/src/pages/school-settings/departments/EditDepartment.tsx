import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import { getStaffMembers } from '../../../services/staffService';
import { getDepartment, updateDepartment } from '../../../services/departmentService';

interface FormData {
  name: string;
  description: string;
  head: string;
  status: string;
}

const EditDepartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    head: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        const response = await getDepartment(id || '');
        const department = response.department;
        
        if (department) {
          setFormData({
            name: department.name,
            description: department.description,
            head: department.head?.id || '',
            status: department.status,
          });
          
          if (department.head) {
            setSelectedStaff({
              id: department.head.id,
              name: department.head.name,
              position: department.head.position
            });
          }
        } else {
          // Department not found
          setSnackbar({
            open: true,
            message: 'Department not found',
            severity: 'error',
          });
          navigate('/academics/departments');
        }
      } catch (error) {
        console.error('Error fetching department:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching department',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchStaffMembers = async () => {
      try {
        const response = await getStaffMembers({});
        setStaffMembers(response.data || []);
      } catch (error) {
        console.error('Error fetching staff members:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load staff members',
          severity: 'error',
        });
      }
    };

    if (id) {
      fetchDepartment();
      fetchStaffMembers();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleHeadChange = (event: React.SyntheticEvent, value: any) => {
    setSelectedStaff(value);
    setFormData((prev) => ({
      ...prev,
      head: value ? value.id : '',
    }));

    // Clear error when field is edited
    if (errors.head) {
      setErrors((prev) => ({
        ...prev,
        head: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Department name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    // Department head is optional

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

    setSaving(true);

    try {
      // Update the department using the API
      const departmentData = {
        name: formData.name,
        description: formData.description,
        headId: formData.head || undefined,
        status: formData.status
      };
      
      await updateDepartment(id || '', departmentData);

      setSnackbar({
        open: true,
        message: 'Department updated successfully',
        severity: 'success',
      });

      // Redirect to departments list after successful update
      setTimeout(() => {
        navigate('/academics/departments');
      }, 2000);
    } catch (error) {
      console.error('Error updating department:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating the department',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/academics/departments');
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Edit Department
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={staffMembers}
                    getOptionLabel={(option) => `${option.name} (${option.position})`}
                    value={selectedStaff}
                    onChange={handleHeadChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department Head"
                        error={!!errors.head}
                        helperText={errors.head}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleSelectChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{ mr: 2 }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      startIcon={saving && <CircularProgress size={20} />}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>

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
      </Container>
    </Layout>
  );
};

export default EditDepartment;
