import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Camera,
  User,
  Briefcase,
  Building2,
  GraduationCap,
  Shield,
  Heart,
  FileText,
  Activity,
  Target,
  CheckCircle,
  Award,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  UserCheck,
  Loader2,
  Copy,
  FileJson
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StaffProfilePictureUpload } from '@/components/ui/StaffProfilePictureUpload';
import Layout from '@/components/layout/Layout';
import { getStaffMember } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

interface ViewStaffProps {
  staffId?: string;
  onBack?: () => void;
  onEdit?: () => void;
}

const ViewStaff: React.FC<ViewStaffProps> = ({ staffId: propStaffId, onBack, onEdit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const staffId = propStaffId || id;

  const [activeTab, setActiveTab] = useState('overview');
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    if (!staffId) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStaffMember(staffId);
        setStaff(response.data);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [staffId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'employment', label: 'Employment Details', icon: Briefcase },
    { id: 'subjects', label: 'Subjects & Classes', icon: GraduationCap },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'retired': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStaffTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'administrator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'librarian': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'accountant': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'nurse': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatStaffName = (staff: any) => {
    if (!staff) return 'Unknown Staff';
    if (staff.user?.name) return staff.user.name;
    const name = [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(' ');
    return name || staff.employeeId || 'Unknown Staff';
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

  const calculateYearsOfService = (joinDate: string) => {
    if (!joinDate) return 'N/A';
    const today = new Date();
    const startDate = new Date(joinDate);
    let years = today.getFullYear() - startDate.getFullYear();
    const monthDiff = today.getMonth() - startDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
      years--;
    }
    return years;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/staff');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/staff/edit/${staffId}`);
    }
  };

  // Export functionality
  const handleExportPDF = async () => {
    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we generate the staff profile PDF.',
      });
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
        staff,
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `staff-${formatStaffName(staff).replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Staff data has been exported as JSON.',
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
        description: 'Staff profile link has been copied to clipboard.',
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

    const staffName = formatStaffName(staff);
    const subject = encodeURIComponent(`Staff Profile - ${staffName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm sharing the staff profile for ${staffName}.\n\nYou can view the profile here: ${window.location.href}\n\nBest regards`
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
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <span className="ml-3 text-lg">Loading staff profile...</span>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Staff Member</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button intent="primary" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Staff Member Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The requested staff profile could not be found.</p>
            <Button intent="primary" onClick={handleBack}>Back to Staff List</Button>
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
                    <AvatarImage src={staff.user?.profileImage || staff.photo || ''} alt={formatStaffName(staff)} />
                    <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                      {formatStaffName(staff).split(' ').map((n: string) => n?.[0] || '').join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{formatStaffName(staff)}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      ID: {staff.employeeId || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(staff.status)}>
                      {staff.status?.replace('_', ' ') || 'Active'}
                    </Badge>
                  </div>
                  <p className="text-white/80 mt-1">
                    {staff.position || 'Staff Member'} •
                    {staff.department?.name ? ` ${staff.department.name} • ` : ' '}
                    {staff.staffType || 'General Staff'}
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
                onClick={handleEdit}
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
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">{calculateYearsOfService(staff.joiningDate || staff.createdAt)}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Years of Service</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{Array.isArray(staff.teacherSubjects) ? staff.teacherSubjects.length : 0}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subjects Teaching</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600">{Array.isArray(staff.classTeachers) ? staff.classTeachers.length : 0}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Classes Assigned</p>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-600">{staff.qualification ? '1' : '0'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Qualifications</p>
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
                  {/* Profile Picture Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-6 w-6 text-blue-600" />
                        <span className="text-xl">Profile Picture</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                        <div className="flex-shrink-0">
                          <StaffProfilePictureUpload
                            staffId={staffId}
                            currentImageUrl={staff.user?.profileImage || staff.photo}
                            staffName={formatStaffName(staff)}
                            size="lg"
                            onUploadSuccess={(imageUrl) => {
                              setStaff((prev: any) => ({ 
                                ...prev, 
                                user: {
                                  ...prev.user,
                                  profileImage: imageUrl
                                },
                                photo: imageUrl // Also update legacy field
                              }));
                            }}
                            onDeleteSuccess={() => {
                              setStaff((prev: any) => ({ 
                                ...prev, 
                                user: {
                                  ...prev.user,
                                  profileImage: null
                                },
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
                            Upload a clear, high-quality photo of the staff member. The image will be automatically 
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

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-6 w-6 text-blue-600" />
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
                          {staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                        <p className="text-xs text-gray-400">Age: {calculateAge(staff.dateOfBirth)}</p>
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
                          {staff.gender || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {staff.user?.email || staff.email || 'Not provided'}
                          </p>
                          {staff.user?.emailVerified !== undefined && (
                            <Badge variant="secondary" className={
                              staff.user.emailVerified 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }>
                              {staff.user.emailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                        <Badge variant="secondary" className={`text-sm ${getStatusColor(staff.status)}`}>
                          {staff.status?.replace('_', ' ') || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <span className="text-xl">Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Home Address</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                          {staff.streetAddress || staff.address?.street || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {(staff.city || staff.address?.city) && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.city || staff.address?.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">State/Province</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.state || staff.address?.state || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Postal Code</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.zipCode || staff.address?.zipCode || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.country || staff.address?.country || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {staff.emergencyContact && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {staff.emergencyContact.name || 'Not provided'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {staff.emergencyContact.relationship || 'N/A'} • {staff.emergencyContact.phone || 'No phone'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

              {activeTab === 'employment' && (
                <div className="space-y-6">
            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span className="text-xl">Employment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.employeeId || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.department?.name || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.position || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Staff Type</p>
                        <Badge variant="secondary" className={`text-sm ${getStaffTypeColor(staff.staffType)}`}>
                          {staff.staffType || 'Staff'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Years of Service</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {calculateYearsOfService(staff.joiningDate || staff.createdAt)} years
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h3>
                  {staff.qualification ? (
                    <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                      <div className="flex items-start space-x-3">
                        <Award className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{staff.qualification}</p>
                          {staff.experience && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{staff.experience} years experience</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No qualifications recorded</p>
                      <p className="text-gray-400 text-sm">Qualification details will be displayed here when added.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

              {activeTab === 'subjects' && (
                <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span>Subjects Teaching</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(staff.teacherSubjects) && staff.teacherSubjects.length > 0 ? (
                    <div className="space-y-3">
                      {staff.teacherSubjects.map((teacherSubject: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <p className="font-medium text-gray-900 dark:text-white">
                              {teacherSubject.subject?.name || teacherSubject.subjectId || 'Unknown Subject'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No subjects assigned</p>
                      <p className="text-gray-400 text-sm">Subject assignments will be displayed here when added.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Classes Assigned</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(staff.classTeachers) && staff.classTeachers.length > 0 ? (
                    <div className="space-y-3">
                      {staff.classTeachers.map((classTeacher: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-purple-600" />
                            <p className="font-medium text-gray-900 dark:text-white">
                              {classTeacher.class?.name || classTeacher.classId || 'Unknown Class'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No classes assigned</p>
                      <p className="text-gray-400 text-sm">Class assignments will be displayed here when added.</p>
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
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Staff Documents</span>
                </div>
                <Button intent="action" size="sm" leftIcon={<Download />}>
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No documents uploaded</p>
                <p className="text-gray-400 text-sm">Staff documents will appear here when uploaded.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No recent activity</p>
                <p className="text-gray-400 text-sm">Staff activity logs will appear here when available.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Staff Profile</DialogTitle>
              <DialogDescription>
                Share {formatStaffName(staff)}'s profile via email. An email will be opened with the profile link.
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
            nav,
            .no-print,
            button:not(.print-button),
            [role="dialog"],
            header > div:first-child,
            .bg-gradient-to-r > div > div:last-child {
              display: none !important;
            }

            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .container {
              max-width: 100% !important;
              padding: 0 !important;
            }

            .space-y-6 > * {
              page-break-inside: avoid;
            }

            .bg-gradient-to-r {
              background: #2563eb !important;
              color: white !important;
              padding: 1rem !important;
            }

            .shadow-lg,
            .shadow-sm,
            .shadow {
              box-shadow: none !important;
            }

            .space-y-6 {
              gap: 0.5rem !important;
            }

            nav[role="tablist"],
            .border-b.border-gray-200 {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ViewStaff;