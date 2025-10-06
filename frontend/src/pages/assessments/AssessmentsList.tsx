import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent
} from '@/components/ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: string;
  totalMarks: number;
  scheduledDate?: string;
  dueDate?: string;
  status: string;
  subject: {
    name: string;
    code: string;
  };
  class: {
    name: string;
    grade: string;
  };
  staff: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const AssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessments', {
        headers: {
          'X-School-Subdomain': 'greenwood' // This should come from auth context
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssessments(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'test': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (filter === 'all') return true;
    return assessment.status.toLowerCase() === filter;
  });

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center justify-between">
            <div>
              <PageTitle>Assessments</PageTitle>
              <PageDescription>
                Create, manage, and track all assessments across your school
              </PageDescription>
            </div>
            <div className="flex gap-3">
              <Button
                intent="primary"
                onClick={() => navigate('/assessments/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assessments</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Assessments Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Assessments ({filteredAssessments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading assessments...</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assessment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject & Class</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assessment.title}</p>
                              {assessment.description && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {assessment.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(assessment.type)}>
                              {assessment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assessment.subject.name}</p>
                              <p className="text-sm text-gray-500">
                                {assessment.class.name} - {assessment.class.grade}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{assessment.totalMarks} pts</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {assessment.scheduledDate && (
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(assessment.scheduledDate).toLocaleDateString()}
                                </div>
                              )}
                              {assessment.dueDate && (
                                <div className="flex items-center text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Due: {new Date(assessment.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(assessment.status)}>
                              {assessment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {assessment.staff.firstName} {assessment.staff.lastName}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                intent="secondary"
                                onClick={() => navigate(`/assessments/${assessment.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                intent="secondary"
                                onClick={() => navigate(`/assessments/${assessment.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {!loading && filteredAssessments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                    <p className="text-gray-500 mb-4">
                      {filter === 'all'
                        ? "Get started by creating your first assessment."
                        : `No assessments found with status "${filter}".`
                      }
                    </p>
                    <Button
                      intent="primary"
                      onClick={() => navigate('/assessments/create')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default AssessmentsList;