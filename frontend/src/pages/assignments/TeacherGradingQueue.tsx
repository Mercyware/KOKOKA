import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Input,
  Textarea,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import assignmentService, { Submission } from '@/services/assignmentService';
import { useToast } from '@/hooks/use-toast';

export const TeacherGradingQueue: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [commentTemplates, setCommentTemplates] = useState<any>(null);

  useEffect(() => {
    loadQueue();
    loadTemplates();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getPendingGradingQueue();
      setSubmissions(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load grading queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await assignmentService.getCommentTemplates();
      setCommentTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade('');
    setFeedback('');
    setGradingDialogOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > selectedSubmission.assignment!.maxPoints) {
      toast({
        title: 'Validation Error',
        description: `Grade must be between 0 and ${selectedSubmission.assignment!.maxPoints}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setGrading(true);

      await assignmentService.gradeSubmission(selectedSubmission.id, {
        grade: gradeNum,
        feedback: feedback.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: 'Submission graded successfully',
      });

      setGradingDialogOpen(false);
      loadQueue(); // Reload queue
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to grade submission',
        variant: 'destructive',
      });
    } finally {
      setGrading(false);
    }
  };

  const applyTemplate = (template: string) => {
    setFeedback(template);
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.isLate) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Late
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        On Time
      </Badge>
    );
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === 'late') return sub.isLate;
    if (filterStatus === 'ontime') return !sub.isLate;
    return true;
  });

  const prioritizedSubmissions = [...filteredSubmissions].sort((a, b) => {
    // Prioritize late submissions
    if (a.isLate && !b.isLate) return -1;
    if (!a.isLate && b.isLate) return 1;
    // Then oldest first
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Grading Queue</PageTitle>
        </PageHeader>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading submissions...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Grading Queue</PageTitle>
          <PageDescription>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} pending grading
          </PageDescription>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Pending</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Late Submissions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {submissions.filter((s) => s.isLate).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Oldest Waiting</p>
                <p className="text-2xl font-bold">
                  {submissions.length > 0
                    ? `${getDaysAgo(
                        Math.min(
                          ...submissions.map((s) => new Date(s.submittedAt).getTime())
                        ).toString()
                      )} days`
                    : '0 days'}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter submissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="late">Late Only</SelectItem>
            <SelectItem value="ontime">On Time Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table */}
      {prioritizedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
              All caught up!
            </p>
            <p className="text-slate-500 text-sm">No submissions pending grading</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Max Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prioritizedSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">
                          {submission.student?.user?.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {submission.assignment?.title || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {submission.assignment?.subject?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission)}</TableCell>
                    <TableCell>{submission.assignment?.maxPoints || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        intent="primary"
                        size="sm"
                        onClick={() => handleGradeClick(submission)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Grading Dialog */}
      <Dialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.student?.user?.name} -{' '}
              {selectedSubmission?.assignment?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Submission Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Student's Submission
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedSubmission.content}
                  </pre>
                </div>
              </div>

              {/* Grade Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Grade (out of {selectedSubmission.assignment?.maxPoints})
                </label>
                <Input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Enter grade"
                  min="0"
                  max={selectedSubmission.assignment?.maxPoints}
                  step="0.5"
                />
              </div>

              {/* Feedback Templates */}
              {commentTemplates && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Feedback</label>
                  <div className="grid grid-cols-2 gap-2">
                    {commentTemplates.excellent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(commentTemplates.excellent[0])}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Excellent
                      </Button>
                    )}
                    {commentTemplates.good && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(commentTemplates.good[0])}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Good
                      </Button>
                    )}
                    {commentTemplates.needsImprovement && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(commentTemplates.needsImprovement[0])}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Needs Work
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div>
                <label className="text-sm font-medium mb-2 block">Feedback (Optional)</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the student..."
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              intent="cancel"
              onClick={() => setGradingDialogOpen(false)}
              disabled={grading}
            >
              Cancel
            </Button>
            <Button intent="primary" onClick={handleSubmitGrade} disabled={grading}>
              {grading ? 'Grading...' : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default TeacherGradingQueue;
