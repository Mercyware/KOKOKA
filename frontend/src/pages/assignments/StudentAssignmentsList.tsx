import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import assignmentService, { Assignment, StudentAssignments } from '@/services/assignmentService';
import { useToast } from '@/components/ui/use-toast';

export const StudentAssignmentsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<StudentAssignments | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadAssignments();
    loadStats();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getMyAssignments();
      setAssignments(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await assignmentService.getStudentSubmissionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (hoursRemaining < 24) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (hoursRemaining < 72) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const isOverdue = new Date(assignment.dueDate) < new Date();
    const submission = assignment.submission;

    return (
      <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {assignment.subject?.name || 'Subject'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {assignment.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {assignment.description}
              </p>
            </div>
            <Badge className={getStatusColor(assignment)}>
              {formatDate(assignment.dueDate)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{assignment.maxPoints} points</span>
            </div>
          </div>

          {submission && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Status: {submission.status}
                </span>
                {submission.grade !== null && (
                  <span className="text-sm font-bold text-primary">
                    Grade: {submission.grade}/{assignment.maxPoints}
                  </span>
                )}
              </div>
              {submission.feedback && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {submission.feedback}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              intent="action"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/assignments/${assignment.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {!submission && (
              <Button
                intent="primary"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/assignments/${assignment.id}/submit`)}
              >
                Submit Assignment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>My Assignments</PageTitle>
        </PageHeader>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading assignments...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!assignments) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>My Assignments</PageTitle>
        </PageHeader>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Failed to load assignments</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const totalCount =
    assignments.upcoming.length +
    assignments.overdue.length +
    assignments.submitted.length +
    assignments.graded.length;

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>My Assignments</PageTitle>
          <PageDescription>View and submit your assignments</PageDescription>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                  <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completion</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Grade</p>
                  <p className="text-2xl font-bold">{stats.averageGrade || 'N/A'}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">On Time</p>
                  <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({assignments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({assignments.overdue.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({assignments.submitted.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Graded ({assignments.graded.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {assignments.upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No upcoming assignments
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.upcoming.map(renderAssignmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue">
          {assignments.overdue.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No overdue assignments
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.overdue.map((assignment) => (
                <div key={assignment.id} className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-red-500 text-white">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  </div>
                  {renderAssignmentCard(assignment)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted">
          {assignments.submitted.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No submitted assignments pending grading
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.submitted.map(renderAssignmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded">
          {assignments.graded.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No graded assignments yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.graded.map(renderAssignmentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default StudentAssignmentsList;
