import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  toast
} from '@/components/ui';
import { Plus, Edit, Trash2, Eye, Target, Heart, CheckSquare } from 'lucide-react';
import { getAllBehavioralAssessments, deleteBehavioralAssessment, BehavioralAssessment } from '../../services/behavioralAssessmentService';

const BehavioralAssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<BehavioralAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AFFECTIVE' | 'PSYCHOMOTOR'>('ALL');

  useEffect(() => {
    fetchAssessments();
  }, [filter]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'ALL' ? { type: filter } : undefined;
      const response = await getAllBehavioralAssessments(params);

      if (response.success && response.data) {
        setAssessments(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch behavioral assessments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching behavioral assessments:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching behavioral assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this behavioral assessment?')) {
      return;
    }

    try {
      const response = await deleteBehavioralAssessment(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Behavioral assessment deleted successfully",
        });
        fetchAssessments();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete behavioral assessment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting behavioral assessment:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the behavioral assessment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'AFFECTIVE' ? <Heart className="h-4 w-4" /> : <Target className="h-4 w-4" />;
  };

  const filteredAssessments = filter === 'ALL'
    ? assessments
    : assessments.filter(a => a.type === filter);

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <PageTitle>Behavioral Assessments</PageTitle>
              <PageDescription>
                Manage affective and psychomotor domain assessments
              </PageDescription>
            </div>
            <Button
              intent="primary"
              onClick={() => navigate('/behavioral-assessments/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        </PageHeader>

        <PageContent>
          <Card>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-2 mb-6">
                <Button
                  intent={filter === 'ALL' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter('ALL')}
                >
                  All Assessments
                </Button>
                <Button
                  intent={filter === 'AFFECTIVE' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter('AFFECTIVE')}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Affective Domain
                </Button>
                <Button
                  intent={filter === 'PSYCHOMOTOR' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter('PSYCHOMOTOR')}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Psychomotor Domain
                </Button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading assessments...</p>
                </div>
              ) : filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No behavioral assessments found</p>
                  <Button
                    intent="primary"
                    className="mt-4"
                    onClick={() => navigate('/behavioral-assessments/create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Assessment
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(assessment.type)}
                              <span className="text-xs">
                                {assessment.type === 'AFFECTIVE' ? 'Affective' : 'Psychomotor'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{assessment.title}</TableCell>
                          <TableCell>{assessment.class?.name || 'N/A'}</TableCell>
                          <TableCell>{assessment.subject?.name || 'N/A'}</TableCell>
                          <TableCell>{assessment.totalMarks}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(assessment.status)}>
                              {assessment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assessment._count?.grades || 0} graded
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                intent="primary"
                                size="sm"
                                onClick={() => navigate(`/behavioral-assessments/${assessment.id}/grade`)}
                                title="Grade Students"
                              >
                                <CheckSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="secondary"
                                size="sm"
                                onClick={() => navigate(`/behavioral-assessments/${assessment.id}`)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => navigate(`/behavioral-assessments/${assessment.id}/edit`)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="danger"
                                size="sm"
                                onClick={() => handleDelete(assessment.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default BehavioralAssessmentsList;
