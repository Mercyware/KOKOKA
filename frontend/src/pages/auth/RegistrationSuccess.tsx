import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Mail, Phone, Globe, School, ArrowRight, Home, LogIn, Shield, Zap, Users, BookOpen, Calendar, BarChart3 } from 'lucide-react';
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
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                🎉 Welcome to KOKOKA!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Your school <strong>{schoolData?.name || 'registration'}</strong> has been successfully submitted! 
                We're excited to have you join our community of innovative educational institutions.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Alert */}
            <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-800 dark:bg-gradient-to-r dark:from-amber-900/20 dark:to-yellow-900/20">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">Registration Under Review</div>
                    <div className="text-sm">Our team is reviewing your application. You'll hear from us within 24-48 hours!</div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1">
                    ⏳ Pending
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
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">School Name</span>
                        <span className="text-base text-gray-900 dark:text-white font-medium">{schoolData.name}</span>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subdomain</span>
                        <Badge variant="outline" className="text-sm w-fit">
                          {schoolData.subdomain}.kokoka.com
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-base text-gray-900 dark:text-white">{formatSchoolType(schoolData.type)}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                        <span className="text-base text-gray-900 dark:text-white break-all">{schoolData.email}</span>
                      </div>

                      {schoolData.phone && (
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Phone
                          </span>
                          <span className="text-base text-gray-900 dark:text-white">{schoolData.phone}</span>
                        </div>
                      )}

                      {schoolData.website && (
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Website
                          </span>
                          <span className="text-base text-gray-900 dark:text-white break-all">{schoolData.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Account</span>
                      <div className="space-y-1">
                        <div className="text-base text-gray-900 dark:text-white font-medium">{schoolData.adminName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 break-all">{schoolData.adminEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                What Happens Next?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Quick Review (24-48 hours)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Our team will verify your school information and approve your account. We make this process as quick as possible!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Instant Notification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      You'll receive an email at <strong>{schoolData?.adminEmail}</strong> the moment your school is approved.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Start Your Journey!</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Access your personalized dashboard at <strong>{schoolData?.subdomain}.kokoka.com</strong> and begin transforming your school management.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                What You'll Get Access To
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Student Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete student records & enrollment</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Smart Scheduling</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automated timetables & class management</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Analytics Dashboard</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time insights & performance tracking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Secure Platform</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-grade security & privacy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to explore? You can try logging in now, or return to our homepage.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleGoToLogin} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3">
                  <LogIn className="w-4 h-4 mr-2" />
                  Try Logging In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button variant="outline" onClick={handleGoHome} className="flex-1 py-3">
                  <Home className="w-4 h-4 mr-2" />
                  Explore Homepage
                </Button>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Your subdomain: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400">{schoolData?.subdomain}.kokoka.com</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Support Card */}
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Need Help?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our support team is here to help you get started. We typically respond within 2 hours.
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:support@kokoka.com" 
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    support@kokoka.com
                  </a>
                  <br />
                  <Link 
                    to="/help" 
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Visit Help Center
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Tip!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  While waiting for approval, bookmark your subdomain and prepare your school data for a smooth onboarding experience.
                </p>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  💡 Get Ready to Launch
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
