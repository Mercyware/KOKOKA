import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Visibility, VisibilityOff, School as SchoolIcon, Domain } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as authService from '../../services/authService';

const schoolTypes = [
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'college', label: 'College' },
  { value: 'university', label: 'University' },
  { value: 'vocational', label: 'Vocational School' },
  { value: 'other', label: 'Other' },
];

const RegisterSchool: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [reviewValid, setReviewValid] = useState(false);

  const steps = ['School Information', 'Admin Account', 'Review', 'Submit'];

  // School information validation schema
  const schoolInfoValidationSchema = Yup.object({
    schoolName: Yup.string().required('School name is required'),
    subdomain: Yup.string()
      .required('Subdomain is required')
      .matches(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Subdomain can only contain lowercase letters, numbers, and hyphens'
      )
      .min(3, 'Subdomain must be at least 3 characters')
      .max(63, 'Subdomain must be less than 63 characters'),
    schoolType: Yup.string().required('School type is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    phone: Yup.string(),
    website: Yup.string().url('Enter a valid URL'),
  });

  // Admin account validation schema
  const adminValidationSchema = Yup.object({
    adminName: Yup.string().required('Admin name is required'),
    adminEmail: Yup.string()
      .email('Enter a valid email')
      .required('Admin email is required'),
    adminPassword: Yup.string()
      .min(6, 'Password should be of minimum 6 characters length')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('adminPassword'), ""], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Combined validation schema based on active step
  const getValidationSchema = () => {
    if (activeStep === 0) return schoolInfoValidationSchema;
    if (activeStep === 1) return adminValidationSchema;
    return Yup.object({}); // No validation for review step
  };

  const isReviewValid = async () => {
    const combinedValidationSchema = schoolInfoValidationSchema.concat(adminValidationSchema);
    try {
      await combinedValidationSchema.validate(formik.values, { abortEarly: false });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      schoolName: '',
      subdomain: '',
      schoolType: 'secondary',
      email: '',
      phone: '',
      website: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
    },
    validationSchema: getValidationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (activeStep < steps.length - 1) {
        handleNext();
        return;
      }

      // For the final step, show confirmation dialog
      if (activeStep === steps.length - 1) {
        setConfirmDialogOpen(true);
        return;
      }
    },
  });

  useEffect(() => {
    const validateReview = async () => {
      const valid = await isReviewValid();
      setReviewValid(valid);
    };
    validateReview();
  }, [formik.values]);

  // Check subdomain availability when subdomain changes
  useEffect(() => {
    const checkSubdomain = async () => {
      const subdomain = formik.values.subdomain;
      if (subdomain && subdomain.length >= 3 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)) {
        setSubdomainChecking(true);
        try {
          const response = await authService.checkSubdomainAvailability(subdomain);
          // Handle both possible response structures
          const isAvailable = 'available' in response 
            ? response.available !== false 
            : response.data?.available !== false || response.data?.available === null;
          setSubdomainAvailable(isAvailable);
        } catch (error) {
          setSubdomainAvailable(false);
        } finally {
          setSubdomainChecking(false);
        }
      } else {
        setSubdomainAvailable(null);
      }
    };

    const debounceTimer = setTimeout(checkSubdomain, 500);
    return () => clearTimeout(debounceTimer);
  }, [formik.values.subdomain]);

  // Generate subdomain from school name
  useEffect(() => {
    if (formik.values.schoolName && !formik.values.subdomain) {
      const generatedSubdomain = formik.values.schoolName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .substring(0, 63);

      formik.setFieldValue('subdomain', generatedSubdomain);
    }
  }, [formik.values.schoolName]);

  // Handle next step
  const handleNext = async () => {
    const currentValidationSchema = getValidationSchema();
    try {
      await currentValidationSchema.validate(formik.values, { abortEarly: false });
      
      // If moving from Review to Submit, validate all fields
      if (activeStep === 2) {
        const combinedValidationSchema = schoolInfoValidationSchema.concat(adminValidationSchema);
        await combinedValidationSchema.validate(formik.values, { abortEarly: false });
      }
      
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      // Validation failed, formik will handle the errors
      formik.validateForm();
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  // Handle confirmation dialog confirm
  const handleConfirmSubmit = async () => {
    setConfirmDialogOpen(false);
    await registerSchool(formik.values);
  };

  // Register school
  const registerSchool = async (values: any) => {
    setRegistrationLoading(true);
    setRegistrationError(null);

    try {
      const schoolData = {
        name: values.schoolName,
        subdomain: values.subdomain,
        type: values.schoolType,
        contactInfo: {
          email: values.email,
          phone: values.phone,
          website: values.website,
        },
        adminInfo: {
          name: values.adminName,
          email: values.adminEmail,
          password: values.adminPassword,
        },
      };

      const response = await authService.registerSchool(schoolData);

      if (response.success && response.data) {
        // Store subdomain in localStorage for development environment
        localStorage.setItem('dev_subdomain', values.subdomain);

        // If token is provided, set it
        if (response.data.token) {
          authService.setAuthToken(response.data.token);
          if (response.data.admin) {
            authService.setUser({
              id: response.data.admin.id,
              name: response.data.admin.name,
              email: response.data.admin.email,
              role: 'admin',
              school: response.data.school.id,
              isActive: true,
            });
          }
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          // Redirect to login with success message
          navigate('/login', {
            state: {
              message: 'School registered successfully! You can now login using your admin credentials.',
              subdomain: values.subdomain
            }
          });
        }
      } else {
        setRegistrationError(response.message || 'Failed to register school');
      }
    } catch (error: any) {
      setRegistrationError(error.message || 'An error occurred during registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Render school information form
  const renderSchoolInfoForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="schoolName"
          name="schoolName"
          label="School Name"
          required
          value={formik.values.schoolName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.schoolName && Boolean(formik.errors.schoolName)}
          helperText={formik.touched.schoolName && formik.errors.schoolName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="subdomain"
          name="subdomain"
          label="Subdomain"
          required
          value={formik.values.subdomain}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.subdomain && Boolean(formik.errors.subdomain)}
          helperText={
            (formik.touched.subdomain && formik.errors.subdomain) ||
            (subdomainAvailable === false && 'This subdomain is already taken')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {subdomainChecking ? (
                  <CircularProgress size={20} />
                ) : subdomainAvailable === true ? (
                  <Box color="success.main">Available</Box>
                ) : subdomainAvailable === false ? (
                  <Box color="error.main">Unavailable</Box>
                ) : null}
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <Domain fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Your school will be accessible at: {formik.values.subdomain}.schoolmanagement.com
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel id="school-type-label">School Type</InputLabel>
          <Select
            labelId="school-type-label"
            id="schoolType"
            name="schoolType"
            value={formik.values.schoolType}
            label="School Type"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.schoolType && Boolean(formik.errors.schoolType)}
          >
            {schoolTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Contact Information
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="School Email"
          required
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="phone"
          name="phone"
          label="Phone Number"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="website"
          name="website"
          label="Website"
          value={formik.values.website}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.website && Boolean(formik.errors.website)}
          helperText={formik.touched.website && formik.errors.website}
        />
      </Grid>
    </Grid>
  );

  // Render admin account form
  const renderAdminForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Admin Account Information
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This account will be used to manage your school
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="adminName"
          name="adminName"
          label="Admin Name"
          required
          value={formik.values.adminName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.adminName && Boolean(formik.errors.adminName)}
          helperText={formik.touched.adminName && formik.errors.adminName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="adminEmail"
          name="adminEmail"
          label="Admin Email"
          required
          value={formik.values.adminEmail}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.adminEmail && Boolean(formik.errors.adminEmail)}
          helperText={formik.touched.adminEmail && formik.errors.adminEmail}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="adminPassword"
          name="adminPassword"
          label="Password"
          required
          type={showPassword ? 'text' : 'password'}
          value={formik.values.adminPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.adminPassword && Boolean(formik.errors.adminPassword)}
          helperText={formik.touched.adminPassword && formik.errors.adminPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          required
          type={showPassword ? 'text' : 'password'}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
      </Grid>
    </Grid>
  );

  // Render review form
  const renderReviewForm = () => {
    const isSubmitStep = activeStep === 3;
    
    return (
      <Grid container spacing={2}>
        {isSubmitStep && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review your information one last time before submitting. Click the "Submit Registration" button below when you're ready to complete your registration.
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            School Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {formik.values.schoolName}
            </Typography>
            <Typography variant="body1">
              <strong>Subdomain:</strong> {formik.values.subdomain}.schoolmanagement.com
            </Typography>
            <Typography variant="body1">
              <strong>Type:</strong> {schoolTypes.find(t => t.value === formik.values.schoolType)?.label}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {formik.values.email}
            </Typography>
            {formik.values.phone && (
              <Typography variant="body1">
                <strong>Phone:</strong> {formik.values.phone}
              </Typography>
            )}
            {formik.values.website && (
              <Typography variant="body1">
                <strong>Website:</strong> {formik.values.website}
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Admin Account
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {formik.values.adminName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {formik.values.adminEmail}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // Render form based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderSchoolInfoForm();
      case 1:
        return renderAdminForm();
      case 2:
      case 3:
        return renderReviewForm();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography component="h1" variant="h5" fontWeight="bold">
            Register Your School
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Create your school account to get started with the School Management System
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {registrationError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {registrationError}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              variant="contained"
              type={activeStep === steps.length - 1 ? 'submit' : 'button'}
              onClick={activeStep === steps.length - 1 ? undefined : handleNext}
              disabled={
                (activeStep === 0 && subdomainAvailable === false) ||
                registrationLoading ||
                (activeStep === steps.length - 1 && !reviewValid)
              }
            >
              {registrationLoading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Submit Registration'
              ) : (
                'Next'
              )}
            </Button>
          </Box>

          {/* Confirmation Dialog */}
          <Dialog
            open={confirmDialogOpen}
            onClose={handleConfirmDialogClose}
            aria-labelledby="confirm-registration-dialog-title"
            aria-describedby="confirm-registration-dialog-description"
          >
            <DialogTitle id="confirm-registration-dialog-title">
              Confirm School Registration
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-registration-dialog-description">
                You are about to register a new school with the following details:
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">School Information:</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formik.values.schoolName}
                </Typography>
                <Typography variant="body2">
                  <strong>Subdomain:</strong> {formik.values.subdomain}.schoolmanagement.com
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {schoolTypes.find(t => t.value === formik.values.schoolType)?.label}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {formik.values.email}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Admin Account:</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formik.values.adminName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {formik.values.adminEmail}
                </Typography>
              </Box>
              <DialogContentText sx={{ mt: 2 }}>
                Please review the information carefully. Once registered, your school will be in pending status until approved.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleConfirmDialogClose}>Cancel</Button>
              <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                Confirm Registration
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Box mt={3}>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have a school account? Sign in
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterSchool;
