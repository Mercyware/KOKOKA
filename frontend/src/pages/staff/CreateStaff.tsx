import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// Removed date picker imports to fix dependency issues
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { createStaffMember } from '../../services/staffService';
import { getDepartments, Department } from '../../services/departmentService';

interface UserFormData {
  name: string;
  email: string;
  role: string;
}

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
}

const CreateStaff: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'teacher',
  });
  const [staffFormData, setStaffFormData] = useState<StaffFormData>({
    employeeId: '',
    staffType: 'teacher',
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
  });
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [staffErrors, setStaffErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Function to generate a random password
  const generatePassword = (): string => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

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
    
    // Generate password when component mounts
    const password = generatePassword();
    setGeneratedPassword(password);
  }, []);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (userErrors[name]) {
      setUserErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleUserSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (userErrors[name]) {
      setUserErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

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

  const validateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!userFormData.name) newErrors.name = 'Name is required';
    if (!userFormData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(userFormData.email)) newErrors.email = 'Invalid email format';
    
    if (!userFormData.role) newErrors.role = 'Role is required';

    setUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateUserForm()) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        setSnackbar({
          open: true,
          message: 'Please fix the errors in the form',
          severity: 'error',
        });
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/staff/list');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
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

    setLoading(true);

    try {
      // Combine user and staff data
      const staffData = {
        user: {
          name: userFormData.name,
          email: userFormData.email,
          password: generatedPassword,
          role: userFormData.role,
        },
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
      };

      // Create the staff member using the API
      const response = await createStaffMember(staffData);

      setSnackbar({
        open: true,
        message: 'Staff member created successfully',
        severity: 'success',
      });

      // Redirect to staff list after successful creation
      setTimeout(() => {
        navigate('/staff/list');
      }, 1500);
    } catch (error) {
      console.error('Error creating staff member:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while creating the staff member',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const steps = ['User Account Information', 'Staff Details'];

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
              Create Staff Member
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 3, mb: 3 }}>
            {activeStep === 0 ? (
              // User Account Information Form
              <form>
                <Typography variant="h6" gutterBottom>
                  User Account Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create a user account for the staff member. This account will be used for login.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={userFormData.name}
                      onChange={handleUserInputChange}
                      error={!!userErrors.name}
                      helperText={userErrors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={userFormData.email}
                      onChange={handleUserInputChange}
                      error={!!userErrors.email}
                      helperText={userErrors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">
                      A password will be automatically generated for this staff member.
                    </Typography>
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Generated Password:</strong> {generatedPassword}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Please save this password. It will be needed for the staff member's first login.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!!userErrors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        name="role"
                        value={userFormData.role}
                        onChange={handleUserSelectChange}
                        label="Role"
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
                      {userErrors.role && <FormHelperText>{userErrors.role}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              // Staff Details Form
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  Staff Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Enter the staff member's personal and employment details.
                </Typography>
                <Divider sx={{ mb: 3 }} />

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
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                      >
                        {loading ? 'Creating...' : 'Create Staff Member'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
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

export default CreateStaff;
