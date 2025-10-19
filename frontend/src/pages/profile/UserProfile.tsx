import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Building, Shield, CheckCircle, AlertCircle, Clock, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationBanner from '../../components/EmailVerificationBanner';
import Layout from '../../components/layout/Layout';

const UserProfile: React.FC = () => {
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const user = authState.user;

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <p className="text-lg text-gray-600">No user data available</p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'TEACHER': 'bg-blue-100 text-blue-800',
      'STUDENT': 'bg-green-100 text-green-800',
      'STAFF': 'bg-purple-100 text-purple-800',
      'PARENT': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account information and settings</p>
          </div>
          <Button
            intent="primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Email Verification Banner - Only show if email not verified */}
        {!user.emailVerified && (
          <EmailVerificationBanner
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
            }}
            isDismissible={false}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="text-xl font-semibold bg-blue-500 text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        intent="primary"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Account Status</h4>
                  
                  {/* Email Verification Status */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email Verified</span>
                    </div>
                    {user.emailVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    )}
                  </div>

                  {/* Account Active Status */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Account Status</span>
                    </div>
                    {user.isActive ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Inactive</span>
                      </div>
                    )}
                  </div>

                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Last Login</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(user.lastLogin)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                      {user.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Information */}
            {user.school && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    School Information
                  </CardTitle>
                  <CardDescription>
                    Your school affiliation details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{user.school.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">School Type</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">
                        {user.school.type?.toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">School Status</label>
                      <Badge className={
                        user.school.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        user.school.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {user.school.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subdomain</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                        {user.school.subdomain}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Verification</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Verify your email to access all features
                      </p>
                    </div>
                    {user.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;