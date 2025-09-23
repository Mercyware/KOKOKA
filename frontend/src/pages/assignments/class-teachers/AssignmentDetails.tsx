import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  StatusBadge,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription
} from '@/components/ui';
import {
  Edit,
  ArrowLeft,
  User,
  School,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  BookOpen,
  Users,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';
import classTeacherService, { ClassTeacherAssignment } from '@/services/classTeacherService';

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<ClassTeacherAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAssignment(id);
    }
  }, [id]);

  const loadAssignment = async (assignmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await classTeacherService.getAssignment(assignmentId);
      setAssignment(data);
    } catch (err) {
      console.error('Error loading assignment:', err);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'COMPLETED': return 'info';
      case 'TRANSFERRED': return 'secondary';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getPermissionIcon = (permission: boolean) => {
    return permission ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600">Loading assignment details...</p>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (error || !assignment) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The assignment you are looking for does not exist.'}</p>
            <Button intent="primary" leftIcon={<ArrowLeft />} onClick={() => navigate('/teachers/class-assignments')}>
              Back to Assignments
            </Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                intent="secondary"
                size="sm"
                leftIcon={<ArrowLeft />}
                onClick={() => navigate('/teachers/class-assignments')}
              >
                Back
              </Button>
              <div>
                <PageTitle>Assignment Details</PageTitle>
                <PageDescription>
                  Detailed view of teacher-class assignment
                </PageDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                intent="secondary"
                leftIcon={<Edit />}
                onClick={() => navigate(`/teachers/class-assignments/${assignment.id}/edit`)}
              >
                Edit Assignment
              </Button>
            </div>
          </div>
        </PageHeader>

        <div className="space-y-6">
          {/* Status and Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assignment Overview</h3>
                <StatusBadge variant={getStatusColor(assignment.status)}>
                  {assignment.status}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assignment Type</p>
                    <p className="font-medium">{classTeacherService.getAssignmentTypeLabel(assignment)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Academic Year</p>
                    <p className="font-medium">{assignment.academicYear.name}</p>
                    {assignment.academicYear.isCurrent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assignment Duration</p>
                    <p className="font-medium">
                      {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Staff Member
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {assignment.staff.firstName.charAt(0)}{assignment.staff.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {assignment.staff.firstName} {assignment.staff.lastName}
                      </h4>
                      <p className="text-gray-600">{assignment.staff.position}</p>
                      <p className="text-sm text-gray-500">Employee ID: {assignment.staff.employeeId}</p>
                    </div>
                  </div>

                  {assignment.staff.user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{assignment.staff.user.email}</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Assignment History</h5>
                    <div className="text-sm text-gray-600">
                      <p>Assigned: {formatDate(assignment.createdAt)}</p>
                      <p>Last Updated: {formatDate(assignment.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <School className="w-5 h-5" />
                  Class Information
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{assignment.class.name}</h4>
                    <p className="text-gray-600">Grade {assignment.class.grade}</p>
                  </div>

                  {assignment.isSubjectTeacher && assignment.subjects && assignment.subjects.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Teaching Subjects ({assignment.subjects.length})
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {assignment.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Academic Year Details</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Start Date: {formatDate(assignment.academicYear.startDate)}</p>
                      <p>End Date: {formatDate(assignment.academicYear.endDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions and Responsibilities */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissions & Responsibilities
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  {getPermissionIcon(assignment.canMarkAttendance)}
                  <div>
                    <p className="font-medium text-gray-900">Mark Attendance</p>
                    <p className="text-sm text-gray-500">
                      {assignment.canMarkAttendance
                        ? 'Authorized to record student attendance'
                        : 'Not authorized to mark attendance'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  {getPermissionIcon(assignment.canGradeAssignments)}
                  <div>
                    <p className="font-medium text-gray-900">Grade Assignments</p>
                    <p className="text-sm text-gray-500">
                      {assignment.canGradeAssignments
                        ? 'Authorized to grade student work'
                        : 'Not authorized to grade assignments'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  {getPermissionIcon(assignment.canManageClassroom)}
                  <div>
                    <p className="font-medium text-gray-900">Manage Classroom</p>
                    <p className="text-sm text-gray-500">
                      {assignment.canManageClassroom
                        ? 'Full classroom management access'
                        : 'Limited classroom access'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Additional Information */}
          {assignment.notes && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h3>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Assignment Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {assignment.isClassTeacher ? '1' : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Class Teacher Role</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {assignment.isSubjectTeacher ? assignment.subjects?.length || 0 : 0}
                  </div>
                  <div className="text-sm text-gray-600">Subjects Teaching</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {[assignment.canMarkAttendance, assignment.canGradeAssignments, assignment.canManageClassroom]
                      .filter(Boolean).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Permissions</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.ceil((new Date().getTime() - new Date(assignment.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Since Assigned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default AssignmentDetails;