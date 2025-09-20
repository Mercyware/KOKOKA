import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  TrendingUp,
  Camera,
  Upload,
  Eye,
  User,
  Users,
  Heart,
  Shield,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Star,
  Activity,
  Target,
  Award,
  Briefcase,
  FileText,
  UserCheck,
  Download,
  Printer,
  Share2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePictureUpload } from '@/components/ui/ProfilePictureUpload';
import Layout from '@/components/layout/Layout';
import { getStudentById } from '@/services/studentService';

interface ViewStudentProps {
  studentId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewStudent = ({ studentId, onBack, onEdit }: ViewStudentProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStudentById(studentId)
      .then((res) => {
        setStudent(res.student);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load student data.');
        setLoading(false);
      });
  }, [studentId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GraduationCap },
    { id: 'academic', label: 'Academic Records', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'health', label: 'Health & Safety', icon: Heart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'graduated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'transferred': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatStudentName = (student: any) => {
    return student.name || [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (!address) return 'Not provided';
    return [address.street, address.city, address.state, address.zipCode, address.country]
      .filter(Boolean)
      .join(', ');
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-siohioma-primary"></div>
            <span className="ml-3 text-lg">Loading student profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Student</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The requested student profile could not be found.</p>
            <Button onClick={onBack}>Back to Students</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-siohioma-primary to-blue-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white/30">
                    <AvatarImage src={student.profileImageUrl || student.photo || ''} alt={formatStudentName(student)} />
                    <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                      {formatStudentName(student).split(' ').map((n: string) => n?.[0] || '').join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{formatStudentName(student)}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      ID: {student.admissionNumber || student.studentId || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(student.status)}>
                      {student.status || 'Active'}
                    </Badge>
                  </div>
                  <p className="text-white/80 mt-1">
                    {typeof student.class === 'object' ? student.class?.name : student.class || 'No Class Assigned'} •
                    Age {calculateAge(student.dateOfBirth)} •
                    {student.house ? (typeof student.house === 'object' ? student.house?.name : student.house) : 'No House'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={onEdit}
                className="bg-white text-siohioma-primary hover:bg-gray-100"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-600">{student.averageGrade?.toFixed(1) || 'N/A'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall GPA</p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">{student.attendancePercentage?.toFixed(0) || 'N/A'}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-600">{student.achievements?.length || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-600">
              {student.admissionDate ?
                Math.floor((new Date().getTime() - new Date(student.admissionDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                : 'N/A'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Years Enrolled</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-siohioma-primary text-siohioma-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Profile Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-siohioma-primary" />
                  <span className="text-xl">Profile Picture</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                  <div className="flex-shrink-0">
                    <ProfilePictureUpload
                      studentId={studentId}
                      currentImageUrl={student.profileImageUrl || student.photo}
                      studentName={formatStudentName(student)}
                      size="lg"
                      onUploadSuccess={(imageUrl) => {
                        setStudent(prev => ({ 
                          ...prev, 
                          profileImageUrl: imageUrl,
                          photo: imageUrl // Also update legacy field
                        }));
                      }}
                      onDeleteSuccess={() => {
                        setStudent(prev => ({ 
                          ...prev, 
                          profileImageUrl: null,
                          photo: null 
                        }));
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Manage Profile Picture
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a clear, high-quality photo of the student. The image will be automatically 
                      resized and optimized for the best display across the system.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        <strong>Requirements:</strong>
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• File formats: JPEG, PNG, or WebP</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Recommended dimensions: 400x400 pixels or larger</li>
                        <li>• Square images work best</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-6 w-6 text-siohioma-primary" />
                  <span className="text-xl">Academic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Admission Number</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.admissionNumber || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Admission Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Class</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {typeof student.class === 'object' ? student.class?.name : student.class || 'No Class Assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Academic Year</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {typeof student.academicYear === 'object' ? student.academicYear?.name : student.academicYear || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Home className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">House</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.house ? (typeof student.house === 'object' ? student.house?.name : student.house) : 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Student Status</p>
                        <Badge variant="secondary" className={`text-sm ${getStatusColor(student.status)}`}>
                          {student.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Performance Summary */}
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600">{student.averageGrade?.toFixed(1) || 'N/A'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current GPA</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600">{student.attendancePercentage?.toFixed(0) || 'N/A'}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600">{student.achievements?.length || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Awards & Achievements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-siohioma-primary" />
                  <span className="text-xl">Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Home className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Home Address</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                          {formatAddress(student.address)}
                        </p>
                      </div>
                    </div>

                    {student.address && typeof student.address === 'object' && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {student.address.city && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.address.city}</p>
                          </div>
                        )}
                        {student.address.state && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">State/Province</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.address.state}</p>
                          </div>
                        )}
                        {student.address.zipCode && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Postal Code</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.address.zipCode}</p>
                          </div>
                        )}
                        {student.address.country && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.address.country}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contact Information</p>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.contactInfo?.phone || 'Not provided'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.email || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {student.contactInfo?.emergencyContact && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.contactInfo.emergencyContact.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {student.contactInfo.emergencyContact.relationship} • {student.contactInfo.emergencyContact.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-siohioma-primary" />
                  <span className="text-xl">Guardian Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.guardians && student.guardians.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.guardians.map((guardian: any, index: number) => (
                      <div key={index} className={`p-6 rounded-xl border-2 ${guardian.isPrimary ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${guardian.isPrimary ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <User className={`h-6 w-6 ${guardian.isPrimary ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {guardian.firstName} {guardian.lastName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {guardian.relationship || 'Guardian'}
                              </p>
                            </div>
                          </div>
                          {guardian.isPrimary && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-medium">
                              Primary Guardian
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {guardian.phone || 'Not provided'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {guardian.email || 'Not provided'}
                              </p>
                            </div>
                          </div>

                          {guardian.occupation && (
                            <div className="flex items-center space-x-3">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Occupation</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {guardian.occupation}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Guardian Permissions */}
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permissions</p>
                          <div className="flex flex-wrap gap-2">
                            {guardian.emergencyContact && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Emergency Contact
                              </Badge>
                            )}
                            {guardian.authorizedPickup && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Authorized Pickup
                              </Badge>
                            )}
                            {guardian.financialResponsibility && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Financial Responsibility
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No guardian information available</p>
                    <p className="text-gray-400 text-sm">Guardian details will be displayed here when added.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-siohioma-primary" />
                  <span className="text-xl">Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                        <p className="text-xs text-gray-400">Age: {calculateAge(student.dateOfBirth)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.gender || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.bloodGroup || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6">
            {/* Academic Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-siohioma-primary" />
                    <span>Current Subjects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(student.subjects || [
                      { name: 'Mathematics', grade: 92, teacher: 'Mr. Johnson' },
                      { name: 'English Literature', grade: 88, teacher: 'Ms. Smith' },
                      { name: 'Science', grade: 85, teacher: 'Dr. Brown' },
                      { name: 'History', grade: 90, teacher: 'Mrs. Davis' },
                      { name: 'Physical Education', grade: 94, teacher: 'Coach Wilson' }
                    ]).map((subject: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{subject.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{subject.teacher}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getGradeColor(subject.grade)}`}>
                            {subject.grade}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-siohioma-primary" />
                    <span>Achievements & Awards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(student.achievements || [
                      { title: 'Honor Roll', date: '2024-01-15', type: 'Academic' },
                      { title: 'Mathematics Competition Winner', date: '2023-11-20', type: 'Competition' },
                      { title: 'Perfect Attendance', date: '2023-10-30', type: 'Attendance' },
                      { title: 'Science Fair First Place', date: '2023-09-15', type: 'Competition' }
                    ]).map((achievement: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                        <div className="flex-shrink-0">
                          <Award className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{achievement.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{achievement.type}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grade Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-siohioma-primary" />
                  <span>Grade Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { subject: 'Mathematics', currentGrade: 92, previousGrade: 88, trend: 'up' },
                    { subject: 'English', currentGrade: 88, previousGrade: 90, trend: 'down' },
                    { subject: 'Science', currentGrade: 85, previousGrade: 85, trend: 'stable' },
                    { subject: 'History', currentGrade: 90, previousGrade: 85, trend: 'up' }
                  ].map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{subject.subject}</h4>
                        <div className="flex items-center space-x-2">
                          {subject.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {subject.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                          {subject.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getGradeColor(subject.currentGrade)}`}>
                          {subject.currentGrade}%
                        </p>
                        <p className="text-sm text-gray-500">
                          Previous: {subject.previousGrade}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">{student.attendancePercentage?.toFixed(0) || '95'}%</h3>
                  <p className="text-gray-600">Overall Attendance</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600">142</h3>
                  <p className="text-gray-600">Days Present</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">8</h3>
                  <p className="text-gray-600">Days Absent</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'January 2024', present: 20, absent: 2, percentage: 91 },
                    { month: 'February 2024', present: 19, absent: 1, percentage: 95 },
                    { month: 'March 2024', present: 22, absent: 0, percentage: 100 },
                    { month: 'April 2024', present: 18, absent: 3, percentage: 86 }
                  ].map((month, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{month.month}</h4>
                        <Badge variant={month.percentage >= 95 ? "default" : month.percentage >= 85 ? "secondary" : "destructive"}>
                          {month.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Present: {month.present} days</span>
                        <span>Absent: {month.absent} days</span>
                      </div>
                      <Progress value={month.percentage} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Health Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{student.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">
                        {student.height ? `${student.height.value} ${student.height.unit}` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">
                        {student.weight ? `${student.weight.value} ${student.weight.unit}` : 'Not recorded'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Allergies</h4>
                    <div className="flex flex-wrap gap-2">
                      {(student.healthInfo?.allergies || ['None reported']).map((allergy: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Medical Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {(student.healthInfo?.medicalConditions || ['None reported']).map((condition: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {(student.healthInfo?.medications || ['None']).map((medication: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>Emergency Contacts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.contactInfo?.emergencyContact ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20">
                      <h4 className="font-medium text-red-900 dark:text-red-100">Primary Emergency Contact</h4>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{student.contactInfo.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600">
                          Relationship: {student.contactInfo.emergencyContact.relationship}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {student.contactInfo.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No emergency contact information</p>
                  )}

                  {student.guardians && student.guardians.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Additional Contacts</h4>
                      {student.guardians.map((guardian: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2 dark:bg-gray-800">
                          <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                          <p className="text-sm text-gray-600">{guardian.relationship}</p>
                          <p className="text-sm text-gray-600">{guardian.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-siohioma-primary" />
                  <span>Student Documents</span>
                </div>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Birth Certificate', type: 'PDF', size: '2.4 MB', date: '2024-01-15' },
                  { name: 'Medical Records', type: 'PDF', size: '1.8 MB', date: '2024-01-10' },
                  { name: 'Previous School Records', type: 'PDF', size: '3.2 MB', date: '2023-12-20' },
                  { name: 'Immunization Records', type: 'PDF', size: '1.1 MB', date: '2023-12-15' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-siohioma-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Grade updated for Mathematics', time: '2 hours ago', type: 'grade' },
                  { action: 'Attendance marked present', time: '1 day ago', type: 'attendance' },
                  { action: 'Parent meeting scheduled', time: '3 days ago', type: 'meeting' },
                  { action: 'Achievement: Honor Roll', time: '1 week ago', type: 'achievement' },
                  { action: 'Profile updated by admin', time: '2 weeks ago', type: 'profile' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-siohioma-primary bg-gray-50 dark:bg-gray-800">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'grade' && <BookOpen className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'attendance' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-500" />}
                      {activity.type === 'achievement' && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {activity.type === 'profile' && <User className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ViewStudent;