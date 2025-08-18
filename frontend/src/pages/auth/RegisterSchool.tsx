import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, GraduationCap, School, User, Mail, Lock, Phone, Globe, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface RegisterSchoolProps {
  onSwitchToLogin?: () => void;
}

const RegisterSchool: React.FC<RegisterSchoolProps> = ({ onSwitchToLogin }) => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const totalSteps = 2;

  // Validation schema
  const validationSchema = Yup.object({
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
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (currentStep === 1) {
        // Validate step 1 fields before proceeding
        const step1Fields = ['schoolName', 'subdomain', 'schoolType', 'email'];
        const step1Errors = await formik.validateForm();
        const hasStep1Errors = step1Fields.some(field => step1Errors[field]);
        
        if (hasStep1Errors || subdomainAvailable === false) {
          // Mark all step 1 fields as touched to show validation errors
          const touchedFields = step1Fields.reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {} as Record<string, boolean>);
          formik.setTouched(touchedFields);
          return;
        }
        
        setCurrentStep(2);
        return;
      }
      
      if (currentStep === 2) {
        await registerSchool(values);
      }
    },
  });


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

  // Handle back step
  const handleBack = () => {
    setCurrentStep(1);
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
navigate('/auth/welcome');
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schoolName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          School Name
        </Label>
        <div className="relative">
          <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="schoolName"
            name="schoolName"
            type="text"
            value={formik.values.schoolName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter your school name"
            required
          />
        </div>
        {formik.touched.schoolName && formik.errors.schoolName && (
          <p className="text-sm text-red-600">{formik.errors.schoolName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Subdomain
        </Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="subdomain"
            name="subdomain"
            type="text"
            value={formik.values.subdomain}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 pr-20 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="your-school"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs">
            {subdomainChecking ? (
              <span className="text-gray-400">Checking...</span>
            ) : subdomainAvailable === true ? (
              <span className="text-green-600">Available</span>
            ) : subdomainAvailable === false ? (
              <span className="text-red-600">Unavailable</span>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Your school will be accessible at: {formik.values.subdomain}.schoolmanagement.com
        </p>
        {formik.touched.subdomain && formik.errors.subdomain && (
          <p className="text-sm text-red-600">{formik.errors.subdomain}</p>
        )}
        {subdomainAvailable === false && (
          <p className="text-sm text-red-600">This subdomain is already taken</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          School Type
        </Label>
        <Select value={formik.values.schoolType} onValueChange={(value) => formik.setFieldValue('schoolType', value)}>
          <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
            <SelectValue placeholder="Select school type" />
          </SelectTrigger>
          <SelectContent>
            {schoolTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.schoolType && formik.errors.schoolType && (
          <p className="text-sm text-red-600">{formik.errors.schoolType}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          School Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="school@example.com"
            required
          />
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="text-sm text-red-600">{formik.errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-sm text-red-600">{formik.errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Website
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="website"
              name="website"
              type="url"
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="https://school.com"
            />
          </div>
          {formik.touched.website && formik.errors.website && (
            <p className="text-sm text-red-600">{formik.errors.website}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render admin account form
  const renderAdminForm = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Admin Account Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This account will be used to manage your school
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Admin Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="adminName"
            name="adminName"
            type="text"
            value={formik.values.adminName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter admin full name"
            required
          />
        </div>
        {formik.touched.adminName && formik.errors.adminName && (
          <p className="text-sm text-red-600">{formik.errors.adminName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Admin Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="adminEmail"
            name="adminEmail"
            type="email"
            value={formik.values.adminEmail}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="admin@school.com"
            required
          />
        </div>
        {formik.touched.adminEmail && formik.errors.adminEmail && (
          <p className="text-sm text-red-600">{formik.errors.adminEmail}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="adminPassword"
            name="adminPassword"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.adminPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            onClick={handleClickShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formik.touched.adminPassword && formik.errors.adminPassword && (
          <p className="text-sm text-red-600">{formik.errors.adminPassword}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pl-10 pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Confirm password"
            required
          />
          <button
            type="button"
            onClick={handleClickShowConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-sm text-red-600">{formik.errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 dark:from-blue-950 dark:via-purple-950 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Register Your School
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {currentStep === 1 
              ? "Create your school account to get started with EduManage AI"
              : "Set up your admin account to manage your school"
            }
          </CardDescription>
          
          {/* Step indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          {registrationError && (
            <Alert className="mb-4">
              <AlertDescription>
                {registrationError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {currentStep === 1 ? renderSchoolInfoForm() : renderAdminForm()}
            
            <div className="flex justify-between mt-6">
              {currentStep === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
              ) : <div />}
              
              <Button
                type="submit"
                disabled={
                  registrationLoading ||
                  (currentStep === 1 && (
                    subdomainAvailable === false ||
                    !formik.values.schoolName ||
                    !formik.values.subdomain ||
                    !formik.values.email ||
                    !!formik.errors.schoolName ||
                    !!formik.errors.subdomain ||
                    !!formik.errors.email ||
                    !!formik.errors.schoolType
                  ))
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
              >
                {registrationLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </div>
                ) : currentStep === 1 ? (
                  'Next'
                ) : (
                  'Register School'
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have a school account?{' '}
              {onSwitchToLogin ? (
                <button
                  onClick={onSwitchToLogin}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Sign in
                </button>
              ) : (
                <RouterLink
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Sign in
                </RouterLink>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterSchool;
