
import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Users, BookOpen, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const AIInsights = () => {
  const insights = [
    {
      title: 'Performance Prediction',
      description: 'Students in Math Class 10-A are showing declining engagement patterns',
      impact: 'High',
      recommendation: 'Consider implementing interactive learning modules',
      confidence: 87
    },
    {
      title: 'Attendance Pattern',
      description: 'Friday attendance rates are 12% lower than average',
      impact: 'Medium',
      recommendation: 'Schedule engaging activities on Fridays',
      confidence: 92
    },
    {
      title: 'Grade Distribution',
      description: 'Science subjects show highest improvement potential',
      impact: 'Medium',
      recommendation: 'Increase lab-based learning sessions',
      confidence: 78
    }
  ];

  const predictiveMetrics = [
    { label: 'Dropout Risk Students', value: 23, total: 1247, color: 'text-red-600' },
    { label: 'High Achievers', value: 156, total: 1247, color: 'text-green-600' },
    { label: 'Need Support', value: 89, total: 1247, color: 'text-orange-600' },
    { label: 'On Track', value: 979, total: 1247, color: 'text-blue-600' }
  ];

  const aiRecommendations = [
    {
      category: 'Curriculum',
      title: 'Adaptive Learning Paths',
      description: 'Implement personalized learning routes based on student performance data',
      priority: 'High',
      impact: 'Improve learning outcomes by 25%'
    },
    {
      category: 'Attendance',
      title: 'Early Warning System',
      description: 'Set up automated alerts for attendance patterns indicating risk',
      priority: 'Medium',
      impact: 'Reduce dropout rates by 15%'
    },
    {
      category: 'Resource Allocation',
      title: 'Teacher Assignment Optimization',
      description: 'Match teachers with classes based on expertise and student needs',
      priority: 'Medium',
      impact: 'Increase student satisfaction by 20%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">Intelligent analytics and predictive insights for better decision making</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-800">AI Engine Active</span>
        </div>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Predictive Student Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {predictiveMetrics.map((metric, index) => (
              <div key={index} className="text-center space-y-2">
                <div className={`text-3xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.color.includes('red') ? 'bg-red-500' :
                      metric.color.includes('green') ? 'bg-green-500' :
                      metric.color.includes('orange') ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(metric.value / metric.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {((metric.value / metric.total) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Key Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <Badge variant={insight.impact === 'High' ? 'destructive' : 'secondary'}>
                    {insight.impact} Impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Confidence Level</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Recommendation:</p>
                  <p className="text-sm text-blue-800">{insight.recommendation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-500">{rec.category}</p>
                  </div>
                  <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">Expected Impact:</p>
                  <p className="text-sm text-green-800">{rec.impact}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-blue-100 p-4 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">+15%</p>
                <p className="text-sm text-gray-600">Student Engagement</p>
              </div>
              <p className="text-xs text-gray-500">Compared to last semester</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-green-100 p-4 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">+8%</p>
                <p className="text-sm text-gray-600">Average Grades</p>
              </div>
              <p className="text-xs text-gray-500">Year over year improvement</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-purple-100 p-4 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">+22%</p>
                <p className="text-sm text-gray-600">Course Completion</p>
              </div>
              <p className="text-xs text-gray-500">Since AI implementation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
