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
      newErrors.schoolName = 'School name is required';
    }
    
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'Subdomain must be at least 3 characters';
    } else if (formData.subdomain.length > 63) {
      newErrors.subdomain = 'Subdomain must be less than 63 characters';
    }
    
    if (!formData.schoolType) {
      newErrors.schoolType = 'School type is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }
    
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Enter a valid email';
    }
    
    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password should be of minimum 6 characters length';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
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
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 2) {
      console.log('Validating step 2...');
      const isValid = validateStep2();
      console.log('Step 2 valid:', isValid);
      
      if (!isValid) {
        console.log('Step 2 validation failed');
        return;
      }
      
      console.log('=== REGISTERING SCHOOL ===');
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

      if (response.success && response.data) {
        // Store subdomain in localStorage for development environment
        localStorage.setItem('dev_subdomain', formData.subdomain);

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
              subdomain: formData.subdomain
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
            value={formData.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Enter your school name"
            required
          />
        </div>
        {errors.schoolName && (
          <p className="text-sm text-red-600">{errors.schoolName}</p>
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
          <p className="text-sm text-red-600">{errors.subdomain}</p>
        )}
        {subdomainAvailable === false && (
          <p className="text-sm text-red-600">This subdomain is already taken</p>
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
          <p className="text-sm text-red-600">{errors.adminEmail}</p>
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
          <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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