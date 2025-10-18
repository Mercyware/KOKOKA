import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import api from '../../services/api';
import { getEffectiveSubdomain } from '../../utils/devSubdomain';
import { getOAuthURL } from '../../config/env';

interface SchoolBranding {
  id: string;
  name: string;
  subdomain: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string | null;
}

const Login: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [schoolBranding, setSchoolBranding] = useState<SchoolBranding | null>(null);
  const [loadingBranding, setLoadingBranding] = useState(true);

  // Extract subdomain from various sources
  useEffect(() => {
    const extractSubdomain = () => {
      // 1. Check location state (from registration) - highest priority
      if (location.state) {
        const state = location.state as any;
        if (state.subdomain) {
          console.log('🔵 Subdomain from location state:', state.subdomain);
          return state.subdomain;
        }
      }

      // 2. Use getEffectiveSubdomain utility (handles dev and production)
      const effectiveSubdomain = getEffectiveSubdomain();
      if (effectiveSubdomain) {
        console.log('🟢 Subdomain from getEffectiveSubdomain:', effectiveSubdomain);
        return effectiveSubdomain;
      }

      console.log('⚪ No subdomain detected');
      return null;
    };

    const detectedSubdomain = extractSubdomain();
    setSubdomain(detectedSubdomain);

    // Fetch school branding if subdomain exists
    if (detectedSubdomain) {
      console.log('🎨 Fetching branding for subdomain:', detectedSubdomain);
      fetchSchoolBranding(detectedSubdomain);
    } else {
      setLoadingBranding(false);
    }
  }, [location]);

  // Check for success message from registration
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.message) {
        setSuccessMessage(state.message);
      }
    }
  }, [location]);

  const fetchSchoolBranding = async (subdomain: string) => {
    try {
      setLoadingBranding(true);
      console.log('📡 Fetching branding from:', `/schools/branding/${subdomain}`);
      const response = await api.get(`/schools/branding/${subdomain}`);
      console.log('✅ Branding response:', response.data);
      if (response.data.success) {
        setSchoolBranding(response.data.school);
        console.log('🎨 School branding loaded:', response.data.school.name);
      } else {
        console.warn('⚠️ Branding fetch unsuccessful:', response.data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching school branding:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Dynamic colors based on school branding
  const primaryColor = schoolBranding?.primaryColor || '#3B82F6';
  const secondaryColor = schoolBranding?.secondaryColor || '#8B5CF6';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: primaryColor }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: secondaryColor }}
        ></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center space-y-4 pb-4">
          {/* School Logo or Default Icon */}
          <div className="flex justify-center">
            {loadingBranding ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl w-16 h-16"></div>
            ) : schoolBranding?.logo ? (
              <div className="relative">
                <img
                  src={schoolBranding.logo}
                  alt={`${schoolBranding.name} Logo`}
                  className="h-16 w-16 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="hidden items-center justify-center rounded-lg p-3 w-16 h-16"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center rounded-lg p-3"
                style={{
                  backgroundColor: schoolBranding ? primaryColor : undefined
                }}
              >
                <Building2 className="h-10 w-10 text-white" />
              </div>
            )}
          </div>

          {/* School Name or Generic Title */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {loadingBranding ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-7 w-48 mx-auto rounded"></div>
              ) : schoolBranding ? (
                schoolBranding.name
              ) : (
                'Welcome to KOKOKA'
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              {loadingBranding ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-56 mx-auto rounded"></div>
              ) : schoolBranding ? (
                `Sign in to access your ${schoolBranding.name} account`
              ) : (
                'Sign in to your school management account'
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {authState.error && (
            <Alert variant="destructive">
              <AlertDescription>{authState.error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                {successMessage}
                {subdomain && (
                  <p className="mt-1 text-xs">
                    School subdomain: <strong>{subdomain}</strong>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                  disabled={loadingBranding}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  disabled={loadingBranding}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={authState.loading || loadingBranding}
              intent="primary"
              className="w-full group"
            >
              {authState.loading ? (
                'Signing in...'
              ) : loadingBranding ? (
                'Loading...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = getOAuthURL('google')}
              disabled={loadingBranding}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = getOAuthURL('linkedin')}
              disabled={loadingBranding}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </Button>
          </div>

          {/* Footer Links */}
          {!schoolBranding && (
            <>
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Create account
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link
                  to="/register-school"
                  className="text-sm font-medium hover:underline inline-flex items-center"
                  style={{ color: primaryColor }}
                >
                  Register a new school
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </>
          )}

          {/* School Contact */}
          {schoolBranding?.contactEmail && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help?{' '}
                <a
                  href={`mailto:${schoolBranding.contactEmail}`}
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Contact support
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Powered by <span className="font-semibold">KOKOKA</span> School Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
