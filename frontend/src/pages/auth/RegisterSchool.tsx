import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, GraduationCap, School, User, Mail, Lock, Phone, Globe, Building, AlertCircle } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormSection,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription
} from '@/components/ui';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

const schoolTypes = [
  { value: 'PRIMARY', label: 'Primary School' },
  { value: 'SECONDARY', label: 'Secondary School' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'VOCATIONAL', label: 'Vocational School' },
  { value: 'OTHER', label: 'Other' },
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

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authState.loading && authState.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authState.isAuthenticated, authState.loading, navigate]);

  // Form data state
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    schoolType: 'SECONDARY',
    email: '',
    phone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'Please enter your school name';
    } else if (formData.schoolName.trim().length < 3) {
      newErrors.schoolName = 'School name must be at least 3 characters long';
    }
    
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Please choose a subdomain for your school';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens (no spaces or special characters)';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'Subdomain must be at least 3 characters long';
    } else if (formData.subdomain.length > 63) {
      newErrors.subdomain = 'Subdomain must be less than 63 characters';
    } else if (subdomainAvailable === false) {
      newErrors.subdomain = 'This subdomain is already taken. Please choose another one';
    }
    
    if (!formData.schoolType) {
      newErrors.schoolType = 'Please select your school type';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your school email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., contact@yourschool.com)';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://www.yourschool.com)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Please enter the admin\'s full name';
    } else if (formData.adminName.trim().length < 2) {
      newErrors.adminName = 'Admin name must be at least 2 characters long';
    }
    
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Please enter the admin email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address for the admin account';
    }
    
    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Please create a password for the admin account';
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters long for security';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.adminPassword)) {
      newErrors.adminPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please make sure both passwords are the same';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle next button click
  const handleNext = async () => {
    console.log('=== NEXT BUTTON CLICKED ===');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    
    if (currentStep === 1) {
      console.log('Validating step 1...');
      const isValid = validateStep1();
      console.log('Step 1 valid:', isValid);
      console.log('Subdomain available:', subdomainAvailable);
      console.log('Subdomain checking:', subdomainChecking);
      
      if (!isValid) {
        console.log('Step 1 validation failed');
        return;
      }
      
      if (subdomainAvailable === false) {
        console.log('Subdomain not available');
        return;
      }
      
      if (subdomainChecking) {
        console.log('Still checking subdomain');
        return;
      }
      
      console.log('=== MOVING TO STEP 2 ===');
      // Only move to step 2, don't save data yet
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 2) {
      console.log('Validating step 2...');
      const isValid2 = validateStep2();
      console.log('Step 2 valid:', isValid2);
      
      if (!isValid2) {
        console.log('Step 2 validation failed');
        return;
      }
      
      // Re-validate step 1 to ensure all data is still valid
      console.log('Re-validating step 1...');
      const isValid1 = validateStep1();
      console.log('Step 1 re-validation:', isValid1);
      
      if (!isValid1) {
        console.log('Step 1 re-validation failed - returning to step 1');
        setCurrentStep(1);
        return;
      }
      
      if (subdomainAvailable === false) {
        console.log('Subdomain no longer available - returning to step 1');
        setCurrentStep(1);
        return;
      }
      
      console.log('=== BOTH STEPS VALID - REGISTERING SCHOOL ===');
      await registerSchool();
    }
  };

  // Check subdomain availability when subdomain changes
  useEffect(() => {
    const checkSubdomain = async () => {
      const subdomain = formData.subdomain;
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
  }, [formData.subdomain]);

  // Generate subdomain from school name
  useEffect(() => {
    if (formData.schoolName && !formData.subdomain) {
      const generatedSubdomain = formData.schoolName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .substring(0, 63);

      handleInputChange('subdomain', generatedSubdomain);
    }
  }, [formData.schoolName]);

  // Debug currentStep changes
  useEffect(() => {
    console.log('=== CURRENT STEP CHANGED ===');
    console.log('New currentStep:', currentStep);
  }, [currentStep]);

  // Handle back step
  const handleBack = () => {
    setCurrentStep(1);
    setRegistrationError(null); // Clear any registration errors when going back
  };

  // Get submit button disabled reason
  const getSubmitDisabledReason = () => {
    if (currentStep === 1) {
      if (!formData.schoolName?.trim()) return "Please enter your school name";
      if (!formData.subdomain?.trim()) return "Please choose a subdomain for your school";
      if (!formData.email?.trim()) return "Please enter your school email address";
      if (subdomainAvailable === false) return "The chosen subdomain is not available";
      if (subdomainChecking) return "Checking subdomain availability...";
      return null;
    }
    
    if (currentStep === 2) {
      if (!formData.adminName?.trim()) return "Please enter the admin's full name";
      if (!formData.adminEmail?.trim()) return "Please enter the admin email address";
      if (!formData.adminPassword) return "Please create a password for the admin account";
      if (!formData.confirmPassword) return "Please confirm your password";
      if (formData.adminPassword !== formData.confirmPassword) return "Passwords do not match";
      return null;
    }
    
    return null;
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Register school
  const registerSchool = async () => {
    setRegistrationLoading(true);
    setRegistrationError(null);

    try {
      const schoolData = {
        name: formData.schoolName,
        subdomain: formData.subdomain,
        type: formData.schoolType,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
        },
        adminInfo: {
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword,
        },
      };

      const response = await authService.registerSchool(schoolData);

      console.log('Registration response:', response);

      if (response.success) {
        // Store subdomain in localStorage for development environment
        localStorage.setItem('dev_subdomain', formData.subdomain);

        // Get school data from response for success page
        const responseData = response as any;

        // Prepare school data for the success page
        const successData = {
          name: formData.schoolName,
          subdomain: formData.subdomain,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          type: formData.schoolType,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          schoolId: responseData.school?.id,
          status: responseData.school?.status || 'PENDING',
        };

        // Redirect to success page only - no auto login
        navigate('/registration-success', {
          state: {
            schoolData: successData
          }
        });
      } else {
        // Extract and display error message from response
        const errorMsg = response.message || response.error || 'Registration failed';
        console.log('Registration error message:', errorMsg);

        // More descriptive error message
        if (errorMsg?.includes('already in use') || errorMsg?.includes('already exists') || errorMsg?.includes('already taken')) {
          if (errorMsg?.includes('email') || errorMsg?.includes('Email')) {
            setRegistrationError('This email address is already registered. Please use a different email or try logging in instead.');
            // Go back to step 2 to fix the email
            setCurrentStep(2);
          } else if (errorMsg?.includes('subdomain') || errorMsg?.includes('Subdomain')) {
            setRegistrationError('This subdomain is already taken. Please choose a different subdomain for your school.');
            // Go back to step 1 to fix the subdomain
            setCurrentStep(1);
          } else {
            setRegistrationError(errorMsg || 'Some of the information you provided is already in use. Please check and try again.');
          }
        } else {
          // Display the exact error message from the backend
          setRegistrationError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setRegistrationError('Network error: Please check your internet connection and try again.');
      } else {
        setRegistrationError('An unexpected error occurred. Please try again in a few moments or contact support if the issue continues.');
      }
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Render school information form
  const renderSchoolInfoForm = () => (
    <FormSection className="space-y-5">
      <FormField>
        <FormLabel htmlFor="schoolName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          School Name <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <School className={`h-5 w-5 ${formData.schoolName ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="schoolName"
            name="schoolName"
            type="text"
            value={formData.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
            className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="e.g., Greenwood High School"
            required
          />
        </div>
        {errors.schoolName && <FormMessage variant="error">{errors.schoolName}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="subdomain" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Subdomain <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <Building className={`h-5 w-5 ${formData.subdomain ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="subdomain"
            name="subdomain"
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleInputChange('subdomain', e.target.value)}
            className="pl-11 pr-28 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="your-school"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {subdomainChecking ? (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </span>
            ) : subdomainAvailable === true ? (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Available
              </span>
            ) : subdomainAvailable === false ? (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Taken
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1 flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <span className="font-mono">{formData.subdomain || 'yourschool'}.schoolmanagement.com</span>
        </p>
        {errors.subdomain && <FormMessage variant="error">{errors.subdomain}</FormMessage>}
        {subdomainAvailable === false && !errors.subdomain && (
          <FormMessage variant="error">This subdomain is already taken</FormMessage>
        )}
      </FormField>

      <FormField>
        <FormLabel htmlFor="schoolType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          School Type <span className="text-red-500">*</span>
        </FormLabel>
        <Select value={formData.schoolType} onValueChange={(value) => handleInputChange('schoolType', value)}>
          <SelectTrigger className="h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg">
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
        {errors.schoolType && <FormMessage variant="error">{errors.schoolType}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          School Email <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <Mail className={`h-5 w-5 ${formData.email ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="contact@school.com"
            required
          />
        </div>
        {errors.email && <FormMessage variant="error">{errors.email}</FormMessage>}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField>
          <FormLabel htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
          </FormLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
              <Phone className={`h-5 w-5 ${formData.phone ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && <FormMessage variant="error">{errors.phone}</FormMessage>}
        </FormField>

        <FormField>
          <FormLabel htmlFor="website" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Website <span className="text-gray-400 text-xs">(Optional)</span>
          </FormLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
              <Globe className={`h-5 w-5 ${formData.website ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
            </div>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
              placeholder="https://school.com"
            />
          </div>
          {errors.website && <FormMessage variant="error">{errors.website}</FormMessage>}
        </FormField>
      </div>
    </FormSection>
  );

  // Render admin account form
  const renderAdminForm = () => (
    <FormSection className="space-y-5">
      <div className="text-center space-y-2 mb-2 pb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Account Setup
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create credentials to manage your school system
        </p>
      </div>

      <FormField>
        <FormLabel htmlFor="adminName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Full Name <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <User className={`h-5 w-5 ${formData.adminName ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="adminName"
            name="adminName"
            type="text"
            value={formData.adminName}
            onChange={(e) => handleInputChange('adminName', e.target.value)}
            className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="John Doe"
            required
          />
        </div>
        {errors.adminName && <FormMessage variant="error">{errors.adminName}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="adminEmail" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Email Address <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <Mail className={`h-5 w-5 ${formData.adminEmail ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="adminEmail"
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className="pl-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="admin@school.com"
            required
          />
        </div>
        {errors.adminEmail && <FormMessage variant="error">{errors.adminEmail}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="adminPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Password <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <Lock className={`h-5 w-5 ${formData.adminPassword ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="adminPassword"
            name="adminPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.adminPassword}
            onChange={(e) => handleInputChange('adminPassword', e.target.value)}
            className="pl-11 pr-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={handleClickShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
        {errors.adminPassword && <FormMessage variant="error">{errors.adminPassword}</FormMessage>}
      </FormField>

      <FormField>
        <FormLabel htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Confirm Password <span className="text-red-500">*</span>
        </FormLabel>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
            <Lock className={`h-5 w-5 ${formData.confirmPassword ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-11 pr-11 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={handleClickShowConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && <FormMessage variant="error">{errors.confirmPassword}</FormMessage>}
      </FormField>
    </FormSection>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        {/* Animated circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6TTQgNHYyaDJ2LTJINHR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Main Card */}
      <Card className="relative w-full max-w-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent-orange to-accent-green"></div>

        <CardHeader className="text-center space-y-6 pt-8 pb-6 relative">
          {/* Floating icon with glow effect */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
            </div>
            <div className="relative bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
              Register Your School
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              {currentStep === 1
                ? "Let's start with your school information"
                : "Set up your administrator account"
              }
            </CardDescription>
          </div>

          {/* Enhanced Step indicator */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <div className={`relative ${currentStep === 1 ? 'w-8 h-8' : 'w-6 h-6'} transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-full ${currentStep === 1 ? 'bg-primary/20 animate-ping' : ''}`}></div>
                <div className={`relative w-full h-full rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-primary text-white shadow-lg'
                    : currentStep > 1
                    ? 'bg-primary text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
              </div>
              <span className={`text-sm font-medium transition-colors ${currentStep === 1 ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-500'}`}>
                School Info
              </span>
            </div>

            <div className={`h-0.5 w-12 transition-colors duration-500 ${currentStep === 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>

            <div className="flex items-center gap-2">
              <div className={`relative ${currentStep === 2 ? 'w-8 h-8' : 'w-6 h-6'} transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-full ${currentStep === 2 ? 'bg-primary/20 animate-ping' : ''}`}></div>
                <div className={`relative w-full h-full rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  currentStep === 2
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  2
                </div>
              </div>
              <span className={`text-sm font-medium transition-colors ${currentStep === 2 ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-500'}`}>
                Admin Account
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {registrationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{registrationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {currentStep === 1 ? renderSchoolInfoForm() : renderAdminForm()}

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              {currentStep === 2 && (
                <Button
                  type="button"
                  intent="cancel"
                  onClick={handleBack}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Back
                </Button>
              )}

              <div className={`flex flex-col ${currentStep === 1 ? 'w-full sm:ml-auto' : ''} order-1 sm:order-2`}>
                <Button
                  type="button"
                  intent="primary"
                  onClick={handleNext}
                  disabled={
                    registrationLoading ||
                    (currentStep === 1 && (
                      subdomainAvailable === false ||
                      !formData.schoolName?.trim() ||
                      !formData.subdomain?.trim() ||
                      !formData.email?.trim() ||
                      subdomainChecking
                    )) ||
                    (currentStep === 2 && (
                      !formData.adminName?.trim() ||
                      !formData.adminEmail?.trim() ||
                      !formData.adminPassword ||
                      !formData.confirmPassword ||
                      formData.adminPassword !== formData.confirmPassword
                    ))
                  }
                  className="w-full sm:w-auto"
                >
                  {registrationLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </div>
                  ) : currentStep === 1 ? (
                    'Next'
                  ) : (
                    'Register School'
                  )}
                </Button>

                {/* Show disabled reason if button is disabled */}
                {getSubmitDisabledReason() && (
                  <FormMessage variant="error" className="mt-2 text-xs">
                    {getSubmitDisabledReason()}
                  </FormMessage>
                )}
              </div>
            </div>
          </div>
          
          {/* Sign in link with decorative element */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have a school account?{' '}
              {onSwitchToLogin ? (
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  Sign in
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ) : (
                <RouterLink
                  to="/login"
                  className="text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  Sign in
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </RouterLink>
              )}
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-8 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure Registration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-accent-green rounded-full"></div>
              <span>Quick Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
              <span>Free Trial</span>
            </div>
          </div>
        </CardContent>

        {/* Decorative bottom accent */}
        <div className="h-2 bg-gradient-to-r from-primary/20 via-accent-orange/20 to-accent-green/20"></div>
      </Card>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/10 rounded-lg rotate-12 hidden lg:block"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white/10 rounded-full hidden lg:block"></div>
      <div className="absolute top-1/2 right-20 w-12 h-12 border-2 border-white/10 rounded-lg -rotate-12 hidden lg:block"></div>
    </div>
  );
};

export default RegisterSchool;