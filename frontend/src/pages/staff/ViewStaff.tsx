import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
  TabContainer,
  TabList,
  Tab,
  TabContent
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
  Loader2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import { getStaffMember } from '@/services/staffService';

interface ViewStaffProps {
  staffId?: string;
  onBack?: () => void;
  onEdit?: () => void;
}

const ViewStaff: React.FC<ViewStaffProps> = ({ staffId: propStaffId, onBack, onEdit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = propStaffId || id;

  const [activeTab, setActiveTab] = useState('overview');
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <PageContainer>
        <PageHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={staff.user?.profileImage || staff.photo || ''} alt={formatStaffName(staff)} />
                <AvatarFallback className="text-lg font-bold">
                  {formatStaffName(staff).split(' ').map((n: string) => n?.[0] || '').join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <PageTitle>{formatStaffName(staff)}</PageTitle>
                <PageDescription>
                  Employee ID: {staff.employeeId || 'N/A'} • {staff.position || 'Staff Member'} • {staff.department?.name || 'No Department'}
                </PageDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className={getStatusColor(staff.status)}>
                    {staff.status?.replace('_', ' ') || 'Active'}
                  </Badge>
                  <Badge variant="secondary" className={getStaffTypeColor(staff.staffType)}>
                    {staff.staffType || 'Staff'}
                  </Badge>
                </div>
              </div>
            </div>
            <PageActions>
              <Button intent="secondary" onClick={handleBack} leftIcon={<ArrowLeft />}>
                Back to Staff
              </Button>
              <Button intent="action" leftIcon={<Download />}>
                Export
              </Button>
              <Button intent="primary" onClick={handleEdit} leftIcon={<Edit />}>
                Edit Profile
              </Button>
            </PageActions>
          </div>
        </PageHeader>

        <PageContent>
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
          <TabContainer>
            <TabList>
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  active={activeTab === tab.id}
                  icon={<tab.icon className="h-4 w-4" />}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            {/* Tab Content */}
            <TabContent>
              {activeTab === 'overview' && (
                <div className="space-y-6">
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
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {staff.user?.email || staff.email || 'Not provided'}
                        </p>
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
              <div className="space-y-3">
                {[
                  { name: 'Resume/CV', type: 'PDF', size: '2.4 MB', date: '2024-01-15' },
                  { name: 'Employment Contract', type: 'PDF', size: '1.8 MB', date: '2024-01-10' },
                  { name: 'Qualifications Certificate', type: 'PDF', size: '3.2 MB', date: '2023-12-20' },
                  { name: 'Background Check', type: 'PDF', size: '1.1 MB', date: '2023-12-15' }
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
                      <Button intent="action" size="sm" leftIcon={<Download />}>
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
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Profile updated by admin', time: '2 hours ago', type: 'profile' },
                  { action: 'Subject assignment updated', time: '1 day ago', type: 'assignment' },
                  { action: 'Schedule published', time: '3 days ago', type: 'schedule' },
                  { action: 'Department meeting attended', time: '1 week ago', type: 'meeting' },
                  { action: 'Annual review completed', time: '2 weeks ago', type: 'review' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-blue-600 bg-gray-50 dark:bg-gray-800">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'profile' && <User className="h-4 w-4 text-gray-500" />}
                      {activity.type === 'assignment' && <GraduationCap className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'schedule' && <Calendar className="h-4 w-4 text-green-500" />}
                      {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-500" />}
                      {activity.type === 'review' && <CheckCircle className="h-4 w-4 text-yellow-500" />}
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
            </TabContent>
          </TabContainer>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default ViewStaff;