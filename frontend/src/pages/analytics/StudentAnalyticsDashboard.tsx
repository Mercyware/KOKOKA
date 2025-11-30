import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';
import { Card, Button, PageContainer, PageHeader, PageTitle, PageDescription } from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Brain,
  Activity,
  Loader2,
} from 'lucide-react';

export const StudentAnalyticsDashboard: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [studentId]);

  const loadAnalytics = async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getComprehensiveAnalytics(studentId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-slate-600">{error}</p>
          <Button onClick={loadAnalytics} intent="primary" className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!analytics) return null;

  const { attendance, predictions, risk } = analytics;

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Student Analytics</PageTitle>
          <PageDescription>AI-powered insights and predictions</PageDescription>
        </div>
        <Button onClick={loadAnalytics} intent="action" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      {/* Overall Risk Assessment */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Overall Risk Assessment</h2>
            <RiskBadge level={risk.overallRisk.level} score={risk.overallRisk.score} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {risk.assessments.map((assessment: any, idx: number) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {assessment.riskType.replace(/_/g, ' ')}
                  </span>
                  <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} small />
                </div>
                <div className="space-y-1">
                  {assessment.indicators.map((indicator: string, i: number) => (
                    <p key={i} className="text-xs text-slate-600 flex items-start">
                      <span className="text-red-500 mr-1">•</span>
                      {indicator}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Attendance Analysis */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Attendance Analysis
            </h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {attendance.summary.attendanceRate}%
              </div>
              <div className="text-xs text-slate-500">Attendance Rate</div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-slate-900">
                {attendance.summary.totalDays}
              </div>
              <div className="text-xs text-slate-600">Total Days</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-700">
                {attendance.summary.presentDays}
              </div>
              <div className="text-xs text-green-600">Present</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-red-700">
                {attendance.summary.absentDays}
              </div>
              <div className="text-xs text-red-600">Absent</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-amber-700">
                {attendance.summary.lateDays || 0}
              </div>
              <div className="text-xs text-amber-600">Late</div>
            </div>
          </div>

          {/* Detected Patterns */}
          {attendance.patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Detected Patterns</h3>
              <div className="space-y-2">
                {attendance.patterns.map((pattern: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      pattern.severity === 'CRITICAL'
                        ? 'bg-red-50 border-red-200'
                        : pattern.severity === 'HIGH'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-slate-900">
                            {pattern.patternType.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              pattern.severity === 'CRITICAL'
                                ? 'bg-red-100 text-red-700'
                                : pattern.severity === 'HIGH'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {pattern.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{pattern.description}</p>
                        {pattern.recommendations && pattern.recommendations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-700">Recommendations:</p>
                            {pattern.recommendations.map((rec: string, i: number) => (
                              <p key={i} className="text-xs text-slate-600 ml-3">
                                • {rec}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Performance Predictions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center mb-4">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            Performance Predictions
          </h2>

          <div className="space-y-3">
            {predictions.predictions.map((pred: any, idx: number) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">{pred.subjectName}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Current</div>
                      <div className="text-sm font-semibold text-slate-700">
                        {pred.currentValue}%
                      </div>
                    </div>
                    <div className="text-slate-400">→</div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Predicted</div>
                      <div className="text-lg font-bold text-primary">{pred.predictedValue}%</div>
                    </div>
                    <div>
                      {pred.predictedValue > pred.currentValue ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : pred.predictedValue < pred.currentValue ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600">
                    {(pred.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                {/* Factors */}
                {pred.factors && pred.factors.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {pred.factors.slice(0, 4).map((factor: any, i: number) => (
                      <div key={i} className="text-xs">
                        <span className="text-slate-600">{factor.factor}:</span>
                        <span className="font-medium text-slate-900 ml-1">{factor.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {pred.recommendations && pred.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-2">Recommendations:</p>
                    <div className="space-y-1">
                      {pred.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="flex items-start space-x-2">
                          <Target className="h-3 w-3 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-slate-700">{rec.action}</p>
                            <p className="text-xs text-slate-500">{rec.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

// Risk Badge Component
const RiskBadge: React.FC<{ level: string; score: number; small?: boolean }> = ({
  level,
  score,
  small,
}) => {
  const colors = {
    LOW: 'bg-green-100 text-green-700 border-green-200',
    MODERATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  };

  const sizeClasses = small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <div
      className={`inline-flex items-center space-x-2 ${sizeClasses} rounded-full border ${
        colors[level as keyof typeof colors]
      }`}
    >
      {!small && level === 'CRITICAL' && <AlertTriangle className="h-4 w-4" />}
      {!small && level === 'LOW' && <CheckCircle className="h-4 w-4" />}
      <span className="font-medium">{level}</span>
      <span className="opacity-75">({score})</span>
    </div>
  );
};

export default StudentAnalyticsDashboard;
