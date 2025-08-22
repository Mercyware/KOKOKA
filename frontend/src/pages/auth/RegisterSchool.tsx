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
        // More descriptive error message
        const errorMsg = response.message;
        if (errorMsg?.includes('already in use') || errorMsg?.includes('already exists')) {
          if (errorMsg?.includes('email')) {
            setRegistrationError('This email address is already registered. Please use a different email or try logging in instead.');
          } else if (errorMsg?.includes('subdomain')) {
            setRegistrationError('This subdomain is already taken. Please choose a different subdomain for your school.');
          } else {
            setRegistrationError('Some of the information you provided is already in use. Please check and try again.');
          }
        } else {
          setRegistrationError(errorMsg || 'We encountered an issue while registering your school. Please try again or contact support if the problem persists.');
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
            value={formData.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter your school name"
            required
          />
        </div>
        {errors.schoolName && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errors.schoolName}</p>
          </div>
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
            value={formData.subdomain}
            onChange={(e) => handleInputChange('subdomain', e.target.value)}
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
          Your school will be accessible at: {formData.subdomain}.schoolmanagement.com
        </p>
        {errors.subdomain && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errors.subdomain}</p>
          </div>
        )}
        {subdomainAvailable === false && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">This subdomain is already taken</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          School Type
        </Label>
        <Select value={formData.schoolType} onValueChange={(value) => handleInputChange('schoolType', value)}>
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
        {errors.schoolType && (
          <p className="text-sm text-red-600">{errors.schoolType}</p>
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
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="school@example.com"
            required
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
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
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
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
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="https://school.com"
            />
          </div>
          {errors.website && (
            <p className="text-sm text-red-600">{errors.website}</p>
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
            value={formData.adminName}
            onChange={(e) => handleInputChange('adminName', e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter admin full name"
            required
          />
        </div>
        {errors.adminName && (
          <p className="text-sm text-red-600">{errors.adminName}</p>
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
            value={formData.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="admin@school.com"
            required
          />
        </div>
        {errors.adminEmail && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errors.adminEmail}</p>
          </div>
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
            value={formData.adminPassword}
            onChange={(e) => handleInputChange('adminPassword', e.target.value)}
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
        {errors.adminPassword && (
          <p className="text-sm text-red-600">{errors.adminPassword}</p>
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
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
        {errors.confirmPassword && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errors.confirmPassword}</p>
          </div>
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
              ? "Enter your school information "
              : "Create your admin account"
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
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                    {registrationError}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="space-y-4">
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
                type="button"
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have a school account?{' '}
              {onSwitchToLogin ? (
                <button
                  type="button"
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