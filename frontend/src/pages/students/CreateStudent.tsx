import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider,
  Snackbar,
  Alert,
  FormHelperText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { post, get } from '../../services/api';
import { SelectChangeEvent } from '@mui/material/Select';

// Simple interface for form data
interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  admissionNumber: string;
  admissionDate: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  section: string;
  rollNumber: string;
  house: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    alternativePhone: string;
  };
  guardians: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;
  status: string;
}

// Simple interface for class data
interface ClassData {
  id: string;
  name: string;
}

const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: 'male',
    class: '',
    section: '',
    rollNumber: '',
    house: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contactInfo: {
      phone: '',
      alternativePhone: '',
    },
    guardians: [],
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Guardian form data
  const [guardian, setGuardian] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    email: '',
    phone: '',
    isPrimary: true,
  });

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await get<ClassData[]>('/classes');
        if (response.data) {
          setClasses(response.data);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => {
        const parentObj = prev[parent as keyof typeof prev];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string | boolean>) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setGuardian((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addGuardian = () => {
    // Validate guardian fields
    const guardianErrors: Record<string, string> = {};
    if (!guardian.firstName) guardianErrors.guardianFirstName = 'First name is required';
    if (!guardian.lastName) guardianErrors.guardianLastName = 'Last name is required';
    if (!guardian.relationship) guardianErrors.guardianRelationship = 'Relationship is required';
    if (!guardian.phone) guardianErrors.guardianPhone = 'Phone is required';

    if (Object.keys(guardianErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...guardianErrors,
      }));
      return;
    }

    // Add guardian to the list
    setFormData((prev) => ({
      ...prev,
      guardians: [...prev.guardians, { ...guardian }],
    }));

    // Reset guardian form
    setGuardian({
      firstName: '',
      lastName: '',
      relationship: '',
      email: '',
      phone: '',
      isPrimary: false,
    });
  };

  const removeGuardian = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.admissionNumber) newErrors.admissionNumber = 'Admission number is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Email validation if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      const response = await post('/students', formData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Student created successfully',
          severity: 'success',
        });
        
        // Redirect to student list after successful creation
        setTimeout(() => {
          navigate('/students/list');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create student',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating student:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while creating the student',
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

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Student
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Personal Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Middle Name"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.gender} required>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                      required
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Academic Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Academic Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Admission Number"
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleChange}
                      error={!!errors.admissionNumber}
                      helperText={errors.admissionNumber}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Admission Date"
                      name="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.class} required>
                      <InputLabel>Class</InputLabel>
                      <Select
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        label="Class"
                      >
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.class && <FormHelperText>{errors.class}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Roll Number"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="House"
                      name="house"
                      value={formData.house}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Contact Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Contact Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Address
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Zip/Postal Code"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Alternative Phone"
                      name="contactInfo.alternativePhone"
                      value={formData.contactInfo.alternativePhone}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Guardian Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Guardian Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* List of added guardians */}
                  {formData.guardians.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Added Guardians
                      </Typography>
                      {formData.guardians.map((g, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography>
                              {g.firstName} {g.lastName} ({g.relationship})
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {g.phone} {g.email && `| ${g.email}`}
                            </Typography>
                            {g.isPrimary && (
                              <Typography variant="body2" color="primary">
                                Primary Guardian
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeGuardian(index)}
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  )}

                  {/* Add new guardian form */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Add New Guardian
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={guardian.firstName}
                      onChange={handleGuardianChange}
                      error={!!errors.guardianFirstName}
                      helperText={errors.guardianFirstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={guardian.lastName}
                      onChange={handleGuardianChange}
                      error={!!errors.guardianLastName}
                      helperText={errors.guardianLastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.guardianRelationship}>
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        name="relationship"
                        value={guardian.relationship}
                        onChange={handleGuardianChange}
                        label="Relationship"
                      >
                        <MenuItem value="father">Father</MenuItem>
                        <MenuItem value="mother">Mother</MenuItem>
                        <MenuItem value="grandfather">Grandfather</MenuItem>
                        <MenuItem value="grandmother">Grandmother</MenuItem>
                        <MenuItem value="uncle">Uncle</MenuItem>
                        <MenuItem value="aunt">Aunt</MenuItem>
                        <MenuItem value="sibling">Sibling</MenuItem>
                        <MenuItem value="legal guardian">Legal Guardian</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {errors.guardianRelationship && (
                        <FormHelperText>{errors.guardianRelationship}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={guardian.email}
                      onChange={handleGuardianChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={guardian.phone}
                      onChange={handleGuardianChange}
                      error={!!errors.guardianPhone}
                      helperText={errors.guardianPhone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Primary Guardian</InputLabel>
                      <Select
                        name="isPrimary"
                        value={guardian.isPrimary}
                        onChange={handleGuardianChange}
                        label="Primary Guardian"
                      >
                        <MenuItem value={"true"}>Yes</MenuItem>
                        <MenuItem value={"false"}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={addGuardian}
                      sx={{ mt: 1 }}
                    >
                      Add Guardian
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/students/list')}
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
                {loading ? 'Creating...' : 'Create Student'}
              </Button>
            </Box>
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

export default CreateStudent;
