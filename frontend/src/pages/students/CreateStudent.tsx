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
import { getAllAcademicYears } from '../../services/academicYearService';
import { getClassArms } from '../../services/classArmService';
import { getHouses } from '../../services/houseService';
import { SelectChangeEvent } from '@mui/material/Select';

// Simple interface for form data
interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  admissionNumber: string;
  admissionDate: string;
  academicYear: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  classArm: string;
  rollNumber: string;
  house: string;
  photo: string;
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

// Interface for academic year data
interface AcademicYearData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Interface for class arm data
interface ClassArmData {
  id: string;
  name: string;
  description?: string;
}

// Interface for house data
interface HouseData {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearData[]>([]);
  const [classArms, setClassArms] = useState<ClassArmData[]>([]);
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    academicYear: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: 'male',
    class: '',
    classArm: '',
    rollNumber: '',
    house: '',
    photo: '',
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

  // Fetch classes, academic years, class arms, and houses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await get<ClassData[]>('/classes');
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }

        // Fetch academic years
        const academicYearsResponse = await getAllAcademicYears();
        if (academicYearsResponse.data) {
          // Map the response data to AcademicYearData format
          const mappedAcademicYears = academicYearsResponse.data.map(year => ({
            id: year.id,
            name: year.name,
            startDate: new Date(year.startDate).toISOString().split('T')[0],
            endDate: new Date(year.endDate).toISOString().split('T')[0],
            isActive: year.isActive
          }));
          setAcademicYears(mappedAcademicYears);
        }

        // Fetch class arms
        const classArmsData = await getClassArms();
        setClassArms(classArmsData);

        // Fetch houses
        const housesData = await getHouses();
        setHouses(housesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
                  <Grid item xs={12}>
                    <Box sx={{ 
                      border: '1px dashed #ccc', 
                      borderRadius: 1, 
                      p: 3, 
                      textAlign: 'center',
                      mb: 2,
                      backgroundColor: '#f9f9f9'
                    }}>
                      {formData.photo ? (
                        <Box sx={{ mb: 2 }}>
                          <img 
                            src={formData.photo} 
                            alt="Student preview" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              borderRadius: '4px' 
                            }} 
                          />
                        </Box>
                      ) : (
                        <Box sx={{ 
                          width: '100%', 
                          height: '150px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#eee',
                          borderRadius: '4px',
                          mb: 2
                        }}>
                          <Typography variant="body2" color="textSecondary">
                            No photo selected
                          </Typography>
                        </Box>
                      )}
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({
                                ...prev,
                                photo: reader.result as string
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          variant="contained"
                          component="span"
                          sx={{ mt: 1 }}
                        >
                          Upload Photo
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Upload a clear photo of the student (JPG, PNG)
                      </Typography>
                    </Box>
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
                    <FormControl fullWidth>
                      <InputLabel>Academic Year</InputLabel>
                      <Select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        label="Academic Year"
                      >
                      {academicYears && Array.isArray(academicYears) && academicYears.length > 0 ? (
                        academicYears.map((year) => (
                          <MenuItem key={year.id} value={year.id}>
                            {year.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="">
                          <em>No academic years available</em>
                        </MenuItem>
                      )}
                      </Select>
                    </FormControl>
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
                        {classes && Array.isArray(classes) && classes.length > 0 ? (
                          classes.map((cls) => (
                            <MenuItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">
                            <em>No classes available</em>
                          </MenuItem>
                        )}
                      </Select>
                      {errors.class && <FormHelperText>{errors.class}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Class Arm</InputLabel>
                      <Select
                        name="classArm"
                        value={formData.classArm}
                        onChange={handleChange}
                        label="Class Arm"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {classArms && Array.isArray(classArms) && classArms.length > 0 ? (
                          classArms.map((classArm) => (
                            <MenuItem key={classArm.id} value={classArm.id}>
                              {classArm.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">
                            <em>No class arms available</em>
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
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
                    <FormControl fullWidth>
                      <InputLabel>House</InputLabel>
                      <Select
                        name="house"
                        value={formData.house}
                        onChange={handleChange}
                        label="House"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {houses && Array.isArray(houses) && houses.length > 0 ? (
                          houses.map((house) => (
                            <MenuItem key={house.id} value={house.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {house.color && (
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      backgroundColor: house.color,
                                      borderRadius: '50%',
                                      mr: 1,
                                      border: '1px solid #ddd'
                                    }}
                                  />
                                )}
                                {house.name}
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">
                            <em>No houses available</em>
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
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
                      {formData.guardians && Array.isArray(formData.guardians) && formData.guardians.map((g, index) => (
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
