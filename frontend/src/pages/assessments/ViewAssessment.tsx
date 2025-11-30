import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent
} from '@/components/ui/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  StatusBadge
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  FileText,
  Users,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { getAssessmentById } from '../../services/assessmentService';
import { Assessment } from '../../services/assessmentService';
import { toast } from 'react-hot-toast';

const ViewAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await getAssessmentById(id!);

      if (response.success && response.data) {
        setAssessment(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch assessment');
        navigate('/assessments');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Error loading assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'success' as const;
      case 'draft': return 'default' as const;
      case 'scheduled': return 'default' as const;
      case 'completed': return 'success' as const;
      case 'archived': return 'default' as const;
      default: return 'default' as const;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'test': return 'bg-purple-100 text-purple-800';
      case 'project': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading assessment...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!assessment) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Not Found</h3>
            <p className="text-gray-600">The requested assessment could not be found.</p>
            <Button intent="primary" className="mt-4" onClick={() => navigate('/assessments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
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
              <Button intent="action" size="sm" onClick={() => navigate('/assessments')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <PageTitle>{assessment.title}</PageTitle>
                <PageDescription>
                  View assessment details and information
                </PageDescription>
              </div>
            </div>
            <div className="flex gap-3">
              <Button intent="primary" size="sm" onClick={() => navigate(`/assessments/${assessment.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Assessment
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Status and Type Badges */}
          <div className="flex gap-3 mb-6">
            <StatusBadge variant={getStatusColor(assessment.status)}>
              {assessment.status}
            </StatusBadge>
            <Badge className={getTypeColor(assessment.type)}>
              {assessment.type}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {assessment.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <p className="mt-1 text-slate-900">{assessment.description}</p>
                  </div>
                )}

                {assessment.instructions && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Instructions</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{assessment.instructions}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Total Marks
                    </label>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{assessment.totalMarks}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Passing Marks
                    </label>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{assessment.passingMarks || '-'}</p>
                  </div>
                </div>

                {assessment.duration && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </label>
                    <p className="mt-1 text-slate-900">{assessment.duration} minutes</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {assessment.scheduledDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Scheduled Date
                      </label>
                      <p className="mt-1 text-slate-900">
                        {new Date(assessment.scheduledDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {assessment.dueDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Due Date
                      </label>
                      <p className="mt-1 text-slate-900">
                        {new Date(assessment.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Side Information */}
            <div className="space-y-6">
              {/* Subject & Class */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject & Class
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Subject</label>
                    <p className="mt-1 text-slate-900 font-medium">
                      {assessment.subject?.name} ({assessment.subject?.code})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Class</label>
                    <p className="mt-1 text-slate-900 font-medium">
                      {assessment.class?.name} - Grade {assessment.class?.grade}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Academic Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.academicYear && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Academic Year</label>
                      <p className="mt-1 text-slate-900 font-medium">{assessment.academicYear.name}</p>
                    </div>
                  )}
                  {assessment.term && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Term</label>
                      <p className="mt-1 text-slate-900 font-medium">{assessment.term.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Created By */}
              {(assessment.staff || (assessment as any).teacher) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Created By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-900 font-medium">
                      {assessment.staff?.firstName || (assessment as any).teacher?.firstName}{' '}
                      {assessment.staff?.lastName || (assessment as any).teacher?.lastName}
                    </p>
                    {assessment.createdAt && (
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Weight */}
              {assessment.weight !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-slate-900">{assessment.weight}</p>
                    <p className="text-sm text-slate-600 mt-1">Assessment weightage</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default ViewAssessment;
