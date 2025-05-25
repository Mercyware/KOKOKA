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
  Divider,
  Stepper,
  Step,
  StepLabel,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { getStaffMember, updateStaffMember } from '../../services/staffService';
import { getDepartments, Department } from '../../services/departmentService';

interface StaffFormData {
  employeeId: string;
  staffType: string;
  dateOfBirth: Date | null;
  gender: string;
  nationalId: string;
  department: string;
  position: string;
  phone: string;
  alternatePhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  status: string;
}

const EditStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staffFormData, setStaffFormData] = useState<StaffFormData>({
    employeeId: '',
    staffType: '',
    dateOfBirth: null,
    gender: '',
    nationalId: '',
    department: '',
    position: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    status: 'active',
  });
  const [staffErrors, setStaffErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [staffName, setStaffName] = useState<string>('');
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffRole, setStaffRole] = useState<string>('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        setDepartments(response.departments || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load departments',
          severity: 'error',
        });
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        setLoading(true);
        const response = await getStaffMember(id || '');
        const staffMember = response.staff;
        
        if (staffMember) {
          setStaffName(staffMember.user.name);
          setStaffEmail(staffMember.user.email);
          setStaffRole(staffMember.user.role);
          
          setStaffFormData({
            employeeId: staffMember.employeeId,
            staffType: staffMember.staffType,
            dateOfBirth: staffMember.dateOfBirth ? new Date(staffMember.dateOfBirth) : null,
            gender: staffMember.gender,
            nationalId: staffMember.nationalId,
            department: staffMember.department.id,
            position: staffMember.position,
            phone: staffMember.contactInfo?.phone || '',
            alternatePhone: staffMember.contactInfo?.alternatePhone || '',
            street: staffMember.address?.street || '',
            city: staffMember.address?.city || '',
            state: staffMember.address?.state || '',
            zipCode: staffMember.address?.zipCode || '',
            country: staffMember.address?.country || '',
            emergencyContactName: staffMember.contactInfo?.emergencyContact?.name || '',
            emergencyContactRelationship: staffMember.contactInfo?.emergencyContact?.relationship || '',
            emergencyContactPhone: staffMember.contactInfo?.emergencyContact?.phone || '',
            status: staffMember.status,
          });
        } else {
          // Staff member not found
          setSnackbar({
            open: true,
            message: 'Staff member not found',
            severity: 'error',
          });
          navigate('/staff/list');
        }
      } catch (error) {
        console.error('Error fetching staff member:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching staff member',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffMember();
    }
  }, [id, navigate]);

  const handleStaffInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setStaffFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (staffErrors[name]) {
      setStaffErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleStaffSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setStaffFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (staffErrors[name]) {
      setStaffErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    setStaffFormData((prev) => ({
      ...prev,
      dateOfBirth: value ? new Date(value) : null,
    }));

    // Clear error when field is edited
    if (staffErrors.dateOfBirth) {
      setStaffErrors((prev) => ({
        ...prev,
        dateOfBirth: '',
      }));
    }
  };

  const validateStaffForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!staffFormData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!staffFormData.staffType) newErrors.staffType = 'Staff type is required';
    if (!staffFormData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!staffFormData.gender) newErrors.gender = 'Gender is required';
    if (!staffFormData.nationalId) newErrors.nationalId = 'National ID is required';
    if (!staffFormData.department) newErrors.department = 'Department is required';
    if (!staffFormData.position) newErrors.position = 'Position is required';
    if (!staffFormData.phone) newErrors.phone = 'Phone number is required';

    setStaffErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate(`/staff/${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStaffForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      // Prepare staff data for update
      const staffData = {
        employeeId: staffFormData.employeeId,
        staffType: staffFormData.staffType,
        dateOfBirth: staffFormData.dateOfBirth,
        gender: staffFormData.gender,
        nationalId: staffFormData.nationalId,
        department: staffFormData.department,
        position: staffFormData.position,
        contactInfo: {
          phone: staffFormData.phone,
          alternatePhone: staffFormData.alternatePhone,
          emergencyContact: {
            name: staffFormData.emergencyContactName,
            relationship: staffFormData.emergencyContactRelationship,
            phone: staffFormData.emergencyContactPhone,
          },
        },
        address: {
          street: staffFormData.street,
          city: staffFormData.city,
          state: staffFormData.state,
          zipCode: staffFormData.zipCode,
          country: staffFormData.country,
        },
        status: staffFormData.status,
      };

      // Update the staff member using the API
      const response = await updateStaffMember(id || '', staffData);

      setSnackbar({
        open: true,
        message: 'Staff member updated successfully',
        severity: 'success',
      });

      // Redirect to staff details after successful update
      setTimeout(() => {
        navigate(`/staff/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating staff member:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating the staff member',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
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
              Edit Staff Member
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                User Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                These account details cannot be modified here. Contact the system administrator for account changes.
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={staffName}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={staffEmail}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={staffRole.charAt(0).toUpperCase() + staffRole.slice(1)}
                    disabled
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Staff Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update the staff member's personal and employment details.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="employeeId"
                    value={staffFormData.employeeId}
                    onChange={handleStaffInputChange}
                    error={!!staffErrors.employeeId}
                    helperText={staffErrors.employeeId}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!staffErrors.staffType}>
                    <InputLabel>Staff Type</InputLabel>
                    <Select
                      name="staffType"
                      value={staffFormData.staffType}
                      onChange={handleStaffSelectChange}
                      label="Staff Type"
                    >
                      <MenuItem value="teacher">Teacher</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="cashier">Cashier</MenuItem>
                      <MenuItem value="librarian">Librarian</MenuItem>
                      <MenuItem value="counselor">Counselor</MenuItem>
                      <MenuItem value="nurse">Nurse</MenuItem>
                      <MenuItem value="security">Security</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {staffErrors.staffType && <FormHelperText>{staffErrors.staffType}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={staffFormData.dateOfBirth ? new Date(staffFormData.dateOfBirth.getTime() - staffFormData.dateOfBirth.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                    onChange={handleDateChange}
                    error={!!staffErrors.dateOfBirth}
                    helperText={staffErrors.dateOfBirth}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!staffErrors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={staffFormData.gender}
                      onChange={handleStaffSelectChange}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {staffErrors.gender && <FormHelperText>{staffErrors.gender}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="National ID"
                    name="nationalId"
                    value={staffFormData.nationalId}
                    onChange={handleStaffInputChange}
                    error={!!staffErrors.nationalId}
                    helperText={staffErrors.nationalId}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Employment Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={departments}
                    getOptionLabel={(option) => option.name}
                    value={departments.find(d => d.id === staffFormData.department) || null}
                    onChange={(event, value) => {
                      setStaffFormData((prev) => ({
                        ...prev,
                        department: value ? value.id : '',
                      }));
                      
                      // Clear error when field is edited
                      if (staffErrors.department) {
                        setStaffErrors((prev) => ({
                          ...prev,
                          department: '',
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        error={!!staffErrors.department}
                        helperText={staffErrors.department}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={staffFormData.position}
                    onChange={handleStaffInputChange}
                    error={!!staffErrors.position}
                    helperText={staffErrors.position}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={staffFormData.status}
                      onChange={handleStaffSelectChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="on_leave">On Leave</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={staffFormData.phone}
                    onChange={handleStaffInputChange}
                    error={!!staffErrors.phone}
                    helperText={staffErrors.phone}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Alternative Phone Number"
                    name="alternatePhone"
                    value={staffFormData.alternatePhone}
                    onChange={handleStaffInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={staffFormData.street}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={staffFormData.city}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    name="state"
                    value={staffFormData.state}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Zip/Postal Code"
                    name="zipCode"
                    value={staffFormData.zipCode}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={staffFormData.country}
                    onChange={handleStaffInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Emergency Contact
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="emergencyContactName"
                    value={staffFormData.emergencyContactName}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    name="emergencyContactRelationship"
                    value={staffFormData.emergencyContactRelationship}
                    onChange={handleStaffInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="emergencyContactPhone"
                    value={staffFormData.emergencyContactPhone}
                    onChange={handleStaffInputChange}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
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

export default EditStaff;
