import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Mail, Phone, Globe, School, ArrowRight, Home, LogIn } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';

interface SchoolData {
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  website?: string;
  type: string;
  adminName: string;
  adminEmail: string;
  schoolId?: string;
  status?: string;
}

interface LocationState {
  schoolData: SchoolData;
}

const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);

  useEffect(() => {
    // Get school data from navigation state
    const state = location.state as LocationState;
    if (state && state.schoolData) {
      setSchoolData(state.schoolData);
    }
  }, [location.state]);

  const handleGoToLogin = () => {
    navigate('/login', {
      state: {
        message: 'Your school registration is pending approval. Please login with your admin credentials.',
        subdomain: schoolData?.subdomain
      }
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatSchoolType = (type: string) => {
    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Card */}
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <School className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                School Registered Successfully!
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                Your school registration has been submitted and is now pending approval.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Alert */}
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <span>Your registration is pending approval by our team.</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Pending
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {/* School Information Summary */}
            {schoolData && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Registration Details
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">School Name</span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{schoolData.name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subdomain</span>
                        <Badge variant="outline" className="text-xs">
                          {schoolData.subdomain}.kokoka.com
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-sm text-gray-900 dark:text-white">{formatSchoolType(schoolData.type)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">{schoolData.email}</span>
                      </div>

                      {schoolData.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Phone
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">{schoolData.phone}</span>
                        </div>
                      )}

                      {schoolData.website && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Website
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white truncate">{schoolData.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Account</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{schoolData.adminName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{schoolData.adminEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What's Next?</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Review Process</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Our team will review your registration within 24-48 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notification</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">You'll receive an email once your school is approved.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Start Using KOKOKA</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Login with your admin credentials and start managing your school.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleGoToLogin} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button variant="outline" onClick={handleGoHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Need Help?</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Contact our support team at{' '}
                <a href="mailto:support@kokoka.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@kokoka.com
                </a>
                {' '}or visit our{' '}
                <Link to="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
                  help center
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
