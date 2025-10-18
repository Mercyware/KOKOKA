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
  Share2,
  Link,
  Copy,
  FileJson
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePictureUpload } from '@/components/ui/ProfilePictureUpload';
import Layout from '@/components/layout/Layout';
import {
  getStudentById,
  getStudentAcademicPerformance,
  getStudentAttendanceStatistics,
  getStudentAchievements,
  getStudentActivityLogs
} from '@/services/studentService';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ViewStudentProps {
  studentId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewStudent = ({ studentId, onBack, onEdit }: ViewStudentProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for API data
  const [academicPerformance, setAcademicPerformance] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingAcademic, setLoadingAcademic] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStudentById(studentId)
      .then((res) => {
        setStudent(res.student);
        setLoading(false);
        
        // Load additional data in parallel
        loadAcademicPerformance();
        loadAttendanceStatistics();
        loadAchievements();
        loadActivityLogs();
      })
      .catch((err) => {
        setError('Failed to load student data.');
        setLoading(false);
      });
  }, [studentId]);

  const loadAcademicPerformance = async () => {
    setLoadingAcademic(true);
    try {
      const response = await getStudentAcademicPerformance(studentId);
      if (response.success) {
        setAcademicPerformance(response.data);
      }
    } catch (error) {
      console.error('Failed to load academic performance:', error);
    } finally {
      setLoadingAcademic(false);
    }
  };

  const loadAttendanceStatistics = async () => {
    setLoadingAttendance(true);
    try {
      const response = await getStudentAttendanceStatistics(studentId);
      if (response.success) {
        setAttendanceStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load attendance statistics:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadAchievements = async () => {
    setLoadingAchievements(true);
    try {
      const response = await getStudentAchievements(studentId);
      if (response.success) {
        setAchievements(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const loadActivityLogs = async () => {
    setLoadingActivities(true);
    try {
      const response = await getStudentActivityLogs(studentId, { limit: 10 });
      if (response.success) {
        setActivityLogs(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

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

  // Export functionality
  const handleExportPDF = async () => {
    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we generate the student profile PDF.',
      });

      // Print to PDF using browser's print dialog
      window.print();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        student,
        academicPerformance,
        attendanceStats,
        achievements,
        activityLogs,
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-${formatStudentName(student).replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Student data has been exported as JSON.',
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Share functionality
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Student profile link has been copied to clipboard.',
      });
    }).catch(() => {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link. Please try again.',
        variant: 'destructive',
      });
    });
  };

  const handleShareEmail = () => {
    if (!shareEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }

    const studentName = formatStudentName(student);
    const subject = encodeURIComponent(`Student Profile - ${studentName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm sharing the student profile for ${studentName}.\n\nYou can view the profile here: ${window.location.href}\n\nBest regards`
    );
    const mailtoLink = `mailto:${shareEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;

    setShareDialogOpen(false);
    setShareEmail('');

    toast({
      title: 'Email Client Opened',
      description: 'Your default email client has been opened with the share details.',
    });
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
                    {student.currentClass?.name || 'No Class Assigned'} • 
                    {student.currentSection?.name ? `${student.currentSection.name} • ` : ''}
                    Age {calculateAge(student.dateOfBirth)} •
                    {student.house?.name || 'No House'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Print Button */}
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>

              {/* Share Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
            <h3 className="text-2xl font-bold text-blue-600">
              {loadingAcademic ? '...' : academicPerformance?.overallGPA?.toFixed(1) || student.averageGrade?.toFixed(1) || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall GPA</p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">
              {loadingAttendance ? '...' : attendanceStats?.overallPercentage?.toFixed(0) || student.attendancePercentage?.toFixed(0) || 'N/A'}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-600">
              {loadingAchievements ? '...' : achievements.length || student.achievements?.length || 0}
            </h3>
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
                        setStudent((prev: any) => ({ 
                          ...prev, 
                          profileImageUrl: imageUrl,
                          photo: imageUrl // Also update legacy field
                        }));
                      }}
                      onDeleteSuccess={() => {
                        setStudent((prev: any) => ({ 
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
                          {student.currentClass?.name || 'No Class Assigned'}
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
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Section</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.currentSection?.name || 'No Section Assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Home className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">House</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.house?.name || 'Not assigned'}
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
                    <div className="text-2xl font-bold text-blue-600">
                      {loadingAcademic ? '...' : academicPerformance?.overallGPA?.toFixed(1) || student.averageGrade?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current GPA</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600">
                      {loadingAttendance ? '...' : attendanceStats?.overallPercentage?.toFixed(0) || student.attendancePercentage?.toFixed(0) || 'N/A'}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600">
                      {loadingAchievements ? '...' : achievements.length || student.achievements?.length || 0}
                    </div>
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
                              {student.phone || 'Not provided'}
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

                    {student.emergencyContacts && student.emergencyContacts.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.emergencyContacts[0].name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {student.emergencyContacts[0].relationship} • {student.emergencyContacts[0].phone}
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
                {student.guardianStudents && student.guardianStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.guardianStudents.map((guardianStudent: any, index: number) => {
                      const guardian = guardianStudent.guardian || guardianStudent;
                      const relationship = guardianStudent.relationship || guardian.relationship || 'Guardian';
                      const isPrimary = guardianStudent.isPrimary || guardian.isPrimary || false;
                      
                      return (
                        <div key={index} className={`p-6 rounded-xl border-2 ${isPrimary ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPrimary ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <User className={`h-6 w-6 ${isPrimary ? 'text-blue-600' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {guardian.firstName} {guardian.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase()}
                                </p>
                              </div>
                            </div>
                            {isPrimary && (
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
                              {guardianStudent.emergencyContact && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Emergency Contact
                                </Badge>
                              )}
                              {guardianStudent.authorizedPickup && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Authorized Pickup
                                </Badge>
                              )}
                              {guardianStudent.financialResponsibility && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  Financial Responsibility
                                </Badge>
                              )}
                              {guardianStudent.academicReportsAccess && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Academic Reports
                                </Badge>
                              )}
                              {guardianStudent.disciplinaryReportsAccess && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  Disciplinary Reports
                                </Badge>
                              )}
                              {guardianStudent.medicalInfoAccess && (
                                <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                                  Medical Info
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                    {loadingAcademic ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siohioma-primary"></div>
                      </div>
                    ) : (
                      academicPerformance?.subjects && academicPerformance.subjects.length > 0 ? (
                        academicPerformance.subjects.map((subject: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{subject.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{subject.teacher}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${getGradeColor(subject.grade || subject.averageGrade)}`}>
                                {(subject.grade || subject.averageGrade)?.toFixed(1) || 'N/A'}%
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No subjects assigned</p>
                          <p className="text-gray-400 text-sm">Subject assignments will appear here when available.</p>
                        </div>
                      )
                    )}
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
                    {loadingAchievements ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siohioma-primary"></div>
                      </div>
                    ) : (
                      achievements.length > 0 ? (
                        achievements.map((achievement: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                            <div className="flex-shrink-0">
                              <Award className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{achievement.title}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{achievement.type}</Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.date || achievement.dateAwarded).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No achievements yet</p>
                          <p className="text-gray-400 text-sm">Student achievements and awards will appear here.</p>
                        </div>
                      )
                    )}
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
                  {loadingAcademic ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siohioma-primary"></div>
                    </div>
                  ) : (
                    academicPerformance?.gradeTrends && academicPerformance.gradeTrends.length > 0 ? (
                      academicPerformance.gradeTrends.map((subject: any, index: number) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No grade trends available</p>
                        <p className="text-gray-400 text-sm">Grade performance trends will appear here when sufficient data is available.</p>
                      </div>
                    )
                  )}
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
                  <h3 className="text-2xl font-bold text-green-600">
                    {loadingAttendance ? '...' : attendanceStats?.overallPercentage?.toFixed(0) || student.attendancePercentage?.toFixed(0) || 'N/A'}%
                  </h3>
                  <p className="text-gray-600">Overall Attendance</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {loadingAttendance ? '...' : attendanceStats?.totalPresent || 'N/A'}
                  </h3>
                  <p className="text-gray-600">Days Present</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">
                    {loadingAttendance ? '...' : attendanceStats?.totalAbsent || 'N/A'}
                  </h3>
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
                  {loadingAttendance ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siohioma-primary"></div>
                    </div>
                  ) : (
                    attendanceStats?.monthlyBreakdown && attendanceStats.monthlyBreakdown.length > 0 ? (
                      attendanceStats.monthlyBreakdown.map((month: any, index: number) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No attendance data available</p>
                        <p className="text-gray-400 text-sm">Monthly attendance breakdown will appear here when data is available.</p>
                      </div>
                    )
                  )}
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
                        {student.medicalInfo?.height || 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">
                        {student.medicalInfo?.weight || 'Not recorded'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Allergies</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.allergies && student.allergies.length > 0 ? (
                        student.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                          None reported
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Medical Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.medicalConditions && student.medicalConditions.length > 0 ? (
                        student.medicalConditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                          None reported
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.medications && student.medications.length > 0 ? (
                        student.medications.map((medication: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                            {medication}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                          None
                        </Badge>
                      )}
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
                  {student.emergencyContacts && student.emergencyContacts.length > 0 ? (
                    <div className="space-y-3">
                      {student.emergencyContacts.map((contact: any, index: number) => (
                        <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20">
                          <h4 className="font-medium text-red-900 dark:text-red-100">
                            {index === 0 ? 'Primary Emergency Contact' : `Emergency Contact ${index + 1}`}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-600">
                              Relationship: {contact.relationship}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone: {contact.phone}
                            </p>
                            {contact.email && (
                              <p className="text-sm text-gray-600">
                                Email: {contact.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No emergency contact information</p>
                  )}

                  {student.guardianStudents && student.guardianStudents.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Guardian Contacts</h4>
                      {student.guardianStudents.map((guardianStudent: any, index: number) => {
                        const guardian = guardianStudent.guardian || guardianStudent;
                        const relationship = guardianStudent.relationship || guardian.relationship || 'Guardian';
                        
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2 dark:bg-gray-800">
                            <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                            <p className="text-sm text-gray-600">{relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase()}</p>
                            <p className="text-sm text-gray-600">{guardian.phone}</p>
                          </div>
                        );
                      })}
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
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No documents uploaded</p>
                  <p className="text-gray-400 text-sm">Student documents will appear here when uploaded.</p>
                </div>
                {/* Future: Replace with API call to get student documents */}
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
                {loadingActivities ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siohioma-primary"></div>
                  </div>
                ) : (
                  activityLogs.length > 0 ? (
                    activityLogs.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-siohioma-primary bg-gray-50 dark:bg-gray-800">
                        <div className="flex-shrink-0 mt-1">
                          {(activity.type === 'grade' || activity.type === 'GRADE_UPDATE') && <BookOpen className="h-4 w-4 text-blue-500" />}
                          {(activity.type === 'attendance' || activity.type === 'ATTENDANCE') && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'achievement' && <Trophy className="h-4 w-4 text-yellow-500" />}
                          {(activity.type === 'profile' || activity.type === 'PROFILE_UPDATE') && <User className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.action || activity.description || activity.details}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.time || (activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No recent activity</p>
                      <p className="text-gray-400 text-sm">Student activity logs will appear here when available.</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Student Profile</DialogTitle>
            <DialogDescription>
              Share {formatStudentName(student)}'s profile via email. An email will be opened with the profile link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">Recipient Email</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleShareEmail();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              intent="cancel"
              onClick={() => {
                setShareDialogOpen(false);
                setShareEmail('');
              }}
            >
              Cancel
            </Button>
            <Button intent="primary" onClick={handleShareEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide non-essential elements when printing */
          nav,
          .no-print,
          button:not(.print-button),
          [role="dialog"],
          header > div:first-child,
          .bg-gradient-to-r > div > div:last-child {
            display: none !important;
          }

          /* Optimize layout for printing */
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }

          /* Ensure proper page breaks */
          .space-y-6 > * {
            page-break-inside: avoid;
          }

          /* Adjust header for print */
          .bg-gradient-to-r {
            background: #2563eb !important;
            color: white !important;
            padding: 1rem !important;
          }

          /* Remove shadows and borders for cleaner print */
          .shadow-lg,
          .shadow-sm,
          .shadow {
            box-shadow: none !important;
          }

          /* Make cards more compact */
          .space-y-6 {
            gap: 0.5rem !important;
          }

          /* Ensure tabs content is visible */
          [role="tabpanel"] {
            display: block !important;
          }

          /* Hide tab navigation */
          nav[role="tablist"],
          .border-b.border-gray-200 {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ViewStudent;