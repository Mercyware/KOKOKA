import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Form,
  FormField,
  Textarea,
  Badge,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  Alert,
  AlertDescription,
} from '@/components/ui';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Upload,
} from 'lucide-react';
import assignmentService, { Assignment } from '@/services/assignmentService';
import { useToast } from '@/components/ui/use-toast';

export const SubmitAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getAssignment(assignmentId!, false);
      setAssignment(response.data);

      // Load existing submission if any
      if (response.data.submission) {
        setContent(response.data.submission.content || '');
        setAttachments(response.data.submission.attachments || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load assignment',
        variant: 'destructive',
      });
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!assignmentId) return;

    if (!isDraft && !content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your submission content',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      await assignmentService.submitAssignment(assignmentId, {
        content,
        attachments,
        isDraft,
      });

      toast({
        title: 'Success',
        description: isDraft
          ? 'Assignment draft saved successfully'
          : 'Assignment submitted successfully',
      });

      navigate('/assignments');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assignment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = assignment
    ? new Date(assignment.dueDate) < new Date()
    : false;

  const hoursRemaining = assignment
    ? Math.floor(
        (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60)
      )
    : 0;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading assignment...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assignments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <PageTitle>Submit Assignment</PageTitle>
            <PageDescription>{assignment.title}</PageDescription>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Submission Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent>
              {isOverdue && (
                <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    This assignment is overdue.
                    {assignment.allowLateSubmissions
                      ? ` A ${assignment.latePenaltyPercentage}% penalty will be applied.`
                      : ' Late submissions are not allowed.'}
                  </AlertDescription>
                </Alert>
              )}

              {!isOverdue && hoursRemaining <= 24 && (
                <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Due in {hoursRemaining} hours. Submit soon!
                  </AlertDescription>
                </Alert>
              )}

              <Form>
                <FormField
                  label="Your Answer"
                  description="Enter your submission content below"
                  required
                >
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={12}
                    className="font-mono"
                  />
                </FormField>

                <FormField
                  label="Attachments"
                  description="Upload supporting files (optional)"
                >
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </FormField>

                {attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Attached Files:</p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{file}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setAttachments(attachments.filter((_, i) => i !== index))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <Button
                    intent="cancel"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/assignments')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    intent="primary"
                    className="w-full sm:w-auto"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || (isOverdue && !assignment.allowLateSubmissions)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Assignment Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Subject</span>
                </div>
                <p className="font-medium">{assignment.subject?.name || 'N/A'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <p className="font-medium">
                  {new Date(assignment.dueDate).toLocaleString()}
                </p>
                {isOverdue && (
                  <Badge className="mt-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Overdue
                  </Badge>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Maximum Points</span>
                </div>
                <p className="font-medium">{assignment.maxPoints}</p>
              </div>

              {assignment.instructions && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Instructions
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                    {assignment.instructions}
                  </div>
                </div>
              )}

              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Assignment Files
                  </div>
                  <div className="space-y-2">
                    {assignment.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm"
                      >
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="flex-1">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Submission Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Review the instructions carefully before submitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Save your work as a draft while working</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Check your submission for errors before final submit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Submit before the deadline to avoid penalties</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default SubmitAssignment;
