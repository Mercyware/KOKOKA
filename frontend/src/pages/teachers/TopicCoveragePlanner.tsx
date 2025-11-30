import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea
} from '@/components/ui';
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  Calendar,
  Save,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface Concept {
  id: string;
  name: string;
  bloomsLevel: string;
  displayOrder: number;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  estimatedHours: number;
  difficultyLevel: string;
  concepts: Concept[];
  classTopicCoverage: TopicCoverage[];
}

interface TopicCoverage {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  plannedHours: number | null;
  actualHours: number | null;
  notes: string | null;
}

const statusConfig = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export default function TopicCoveragePlanner() {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [coverageForm, setCoverageForm] = useState({
    status: 'NOT_STARTED',
    startDate: '',
    endDate: '',
    plannedHours: '',
    actualHours: '',
    notes: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, [classId]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    }
  }, [selectedSubject, classId]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTopics = async () => {
    if (!selectedSubject || !classId) return;

    setLoading(true);
    try {
      const academicYearId = localStorage.getItem('currentAcademicYearId');
      const response = await api.get(
        `/api/topic-tracking/class/${classId}/subject/${selectedSubject}/topics`,
        { params: { academicYearId } }
      );
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoverage = (topic: Topic) => {
    const coverage = topic.classTopicCoverage[0];
    setEditingTopic(topic);
    setCoverageForm({
      status: coverage?.status || 'NOT_STARTED',
      startDate: coverage?.startDate?.split('T')[0] || '',
      endDate: coverage?.endDate?.split('T')[0] || '',
      plannedHours: coverage?.plannedHours?.toString() || '',
      actualHours: coverage?.actualHours?.toString() || '',
      notes: coverage?.notes || ''
    });
  };

  const handleSaveCoverage = async () => {
    if (!editingTopic || !classId || !selectedSubject) return;

    try {
      const academicYearId = localStorage.getItem('currentAcademicYearId');
      await api.put(
        `/api/topic-tracking/class/${classId}/topic/${editingTopic.id}/coverage`,
        {
          ...coverageForm,
          plannedHours: coverageForm.plannedHours ? parseInt(coverageForm.plannedHours) : null,
          actualHours: coverageForm.actualHours ? parseFloat(coverageForm.actualHours) : null,
          subjectId: selectedSubject,
          academicYearId
        }
      );

      toast({
        title: 'Success',
        description: 'Topic coverage updated successfully'
      });

      setEditingTopic(null);
      fetchTopics();
    } catch (error) {
      console.error('Error saving coverage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update topic coverage',
        variant: 'destructive'
      });
    }
  };

  const getCoverageStats = () => {
    const notStarted = topics.filter(t => !t.classTopicCoverage.length || t.classTopicCoverage[0].status === 'NOT_STARTED').length;
    const inProgress = topics.filter(t => t.classTopicCoverage.length && t.classTopicCoverage[0].status === 'IN_PROGRESS').length;
    const completed = topics.filter(t => t.classTopicCoverage.length && t.classTopicCoverage[0].status === 'COMPLETED').length;
    const totalPlanned = topics.reduce((sum, t) => sum + (t.classTopicCoverage[0]?.plannedHours || 0), 0);
    const totalActual = topics.reduce((sum, t) => sum + (t.classTopicCoverage[0]?.actualHours || 0), 0);

    return { notStarted, inProgress, completed, totalPlanned, totalActual };
  };

  const stats = getCoverageStats();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Topic Coverage Planner</h1>
          <p className="text-gray-600 mt-2">Plan and track curriculum topic coverage for your class</p>
        </div>

        {/* Subject Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedSubject && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{topics.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Not Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-500">{stats.notStarted}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {topics.length > 0 ? Math.round((stats.completed / topics.length) * 100) : 0}% complete
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Hours Logged</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalActual}</div>
                  <div className="text-xs text-gray-500 mt-1">of {stats.totalPlanned} planned</div>
                </CardContent>
              </Card>
            </div>

            {/* Topics List */}
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
                <CardDescription>Manage coverage for each topic in the curriculum</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading topics...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No topics found for this subject</p>
                    <p className="text-sm mt-1">Contact admin to set up curriculum</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic) => {
                      const coverage = topic.classTopicCoverage[0];
                      const config = statusConfig[coverage?.status as keyof typeof statusConfig] || statusConfig.NOT_STARTED;
                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={topic.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                                <Badge className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                                {topic.difficultyLevel && (
                                  <Badge variant="outline" className="text-xs">
                                    {topic.difficultyLevel}
                                  </Badge>
                                )}
                              </div>

                              {topic.description && (
                                <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{topic.estimatedHours || 0}h estimated</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{topic.concepts.length} concepts</span>
                                </div>
                                {coverage?.startDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Started {new Date(coverage.startDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>

                              {coverage?.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">{coverage.notes}</p>
                              )}
                            </div>

                            <Button
                              intent="action"
                              size="sm"
                              onClick={() => handleEditCoverage(topic)}
                            >
                              Manage
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Edit Coverage Dialog */}
        <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Topic Coverage</DialogTitle>
              <DialogDescription>
                Update coverage details for {editingTopic?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={coverageForm.status}
                    onValueChange={(value) => setCoverageForm({ ...coverageForm, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plannedHours">Planned Hours</Label>
                  <Input
                    id="plannedHours"
                    type="number"
                    value={coverageForm.plannedHours}
                    onChange={(e) => setCoverageForm({ ...coverageForm, plannedHours: e.target.value })}
                    placeholder={editingTopic?.estimatedHours?.toString() || '0'}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={coverageForm.startDate}
                    onChange={(e) => setCoverageForm({ ...coverageForm, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={coverageForm.endDate}
                    onChange={(e) => setCoverageForm({ ...coverageForm, endDate: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="actualHours">Actual Hours Spent</Label>
                  <Input
                    id="actualHours"
                    type="number"
                    step="0.5"
                    value={coverageForm.actualHours}
                    onChange={(e) => setCoverageForm({ ...coverageForm, actualHours: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={coverageForm.notes}
                    onChange={(e) => setCoverageForm({ ...coverageForm, notes: e.target.value })}
                    placeholder="Add teaching notes, resources used, observations..."
                    rows={3}
                  />
                </div>
              </div>

              {editingTopic && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Concepts in this topic:</h4>
                  <div className="flex flex-wrap gap-2">
                    {editingTopic.concepts.map((concept) => (
                      <Badge key={concept.id} variant="outline" className="text-xs">
                        {concept.name}
                        {concept.bloomsLevel && ` (${concept.bloomsLevel})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button intent="cancel" onClick={() => setEditingTopic(null)}>
                Cancel
              </Button>
              <Button intent="primary" onClick={handleSaveCoverage}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
