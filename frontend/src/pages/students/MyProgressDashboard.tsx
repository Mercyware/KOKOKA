import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress
} from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Circle,
  Award,
  Target
} from 'lucide-react';
import api from '@/services/api';

interface TopicProgress {
  id: string;
  status: string;
  progressPercent: number;
  topic: {
    name: string;
    curriculumSubject: {
      subject: {
        name: string;
      };
    };
  };
  conceptMastery: ConceptMastery[];
}

interface ConceptMastery {
  id: string;
  masteryLevel: number;
  status: string;
  trend: string | null;
  concept: {
    name: string;
    bloomsLevel: string;
  };
}

const statusColors = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  MASTERED: 'bg-green-100 text-green-800',
  STRUGGLING: 'bg-red-100 text-red-800'
};

const masteryColors = {
  NOVICE: 'bg-gray-100 text-gray-800',
  DEVELOPING: 'bg-yellow-100 text-yellow-800',
  PROFICIENT: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
  MASTERED: 'bg-green-100 text-green-800'
};

export default function MyProgressDashboard() {
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const studentId = user?.student?.id;

      if (!studentId) return;

      const response = await api.get(`/api/topic-tracking/student/${studentId}/progress`);
      setProgress(response.data.data.progress || []);
      setStats(response.data.data.statistics || {});
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string | null) => {
    if (trend === 'IMPROVING') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'DECLINING') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Progress</h1>
          <p className="text-gray-600 mt-2">Track your mastery across all topics and concepts</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Topics Mastered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.mastered || 0}</div>
                <p className="text-xs text-gray-500">of {stats.totalTopics} topics</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Need Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.struggling || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.averageProgress || 0)}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Topics Progress</CardTitle>
            <CardDescription>Your progress across all curriculum topics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : progress.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No progress recorded yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {progress.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{item.topic.name}</h3>
                        <p className="text-sm text-gray-500">{item.topic.curriculumSubject.subject.name}</p>
                      </div>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{Math.round(item.progressPercent)}%</span>
                      </div>
                      <Progress value={item.progressPercent} className="h-2" />
                    </div>

                    {item.conceptMastery.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Concept Mastery:</h4>
                        <div className="space-y-2">
                          {item.conceptMastery.map((cm) => (
                            <div key={cm.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {getTrendIcon(cm.trend)}
                                <span>{cm.concept.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{Math.round(cm.masteryLevel)}%</span>
                                <Badge variant="outline" className={masteryColors[cm.status as keyof typeof masteryColors]}>
                                  {cm.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
