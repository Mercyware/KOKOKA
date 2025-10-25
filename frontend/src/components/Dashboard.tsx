import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  StatsCard,
  Button,
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  StatusBadge
} from '@/components/ui';
import EmailVerificationCard from './EmailVerificationCard';

interface DashboardProps {
  user?: { 
    id: string;
    name: string; 
    email: string; 
    role: string;
    emailVerified?: boolean;
  } | null;
  onMenuToggle?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onMenuToggle }) => {
  const stats = [
    { 
      title: 'Total Students', 
      value: '1,247', 
      icon: <Users className="w-6 h-6" />, 
      trend: { value: '+12%', direction: 'up' as const, label: 'vs last month' },
      description: 'Active enrolled students',
    },
    { 
      title: 'Teaching Staff', 
      value: '78', 
      icon: <GraduationCap className="w-6 h-6" />, 
      trend: { value: '+3%', direction: 'up' as const, label: 'vs last month' },
      description: 'Active faculty members',
    },
    { 
      title: 'Course Offerings', 
      value: '45', 
      icon: <BookOpen className="w-6 h-6" />, 
      trend: { value: '+8%', direction: 'up' as const, label: 'vs last month' },
      description: 'Available courses',
    },
    { 
      title: 'Attendance Rate', 
      value: '94.2%', 
      icon: <BarChart3 className="w-6 h-6" />, 
      trend: { value: '+2.1%', direction: 'up' as const, label: 'vs last month' },
      description: 'Average daily attendance',
    },
  ];

  const recentActivities = [
    { action: 'New student enrollment', name: 'Emma Wilson', time: '2 hours ago', type: 'success' },
    { action: 'Grade submission completed', name: 'Mathematics 10A', time: '4 hours ago', type: 'info' },
    { action: 'Low attendance alert', name: 'John Smith - Class 9B', time: '6 hours ago', type: 'warning' },
    { action: 'Assignment deadline approaching', name: 'Science Project Due', time: '1 day ago', type: 'pending' },
  ];

  const upcomingEvents = [
    { title: 'Parent-Teacher Conference', date: 'Nov 15', time: '2:00 PM', priority: 'high' },
    { title: 'Science Exhibition', date: 'Nov 20', time: '10:00 AM', priority: 'medium' },
    { title: 'Annual Sports Day', date: 'Nov 25', time: '9:00 AM', priority: 'high' },
    { title: 'Winter Break Begins', date: 'Dec 20', time: 'All Day', priority: 'low' },
  ];

  const insights = [
    { label: 'Student Engagement', value: 87, trend: 'up', description: 'Above average participation' },
    { label: 'Academic Performance', value: 78, trend: 'stable', description: 'Maintaining standards' },
    { label: 'Attendance Prediction', value: 92, trend: 'up', description: 'Expected improvement' },
  ];

  return (
    <PageContainer maxWidth="full" padding="none" className="bg-gray-50/50 dark:bg-gray-900/50">
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8">
        {/* Email Verification Card - Show if user email not verified */}
        {user && !user.emailVerified && (
          <EmailVerificationCard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
            }}
          />
        )}

        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening at your school today.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              trend={stat.trend}
              icon={stat.icon}
              variant="elevated"
              className="hover:shadow-lg transition-shadow duration-200"
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Performance Insights */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>AI-powered insights and recommendations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insights.map((insight, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{insight.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{insight.value}%</span>
                          <div className="flex items-center">
                            {insight.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : insight.trend === 'down' ? (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            insight.trend === 'up' ? 'bg-green-600' :
                            insight.trend === 'down' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${insight.value}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                        <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          AI Recommendation
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Consider implementing additional support for Mathematics courses. 
                          Analysis shows 15% lower engagement in afternoon sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Important dates and deadlines</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                      <div className={`p-2 rounded-lg ${
                        event.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                        event.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Calendar className={`h-4 w-4 ${
                          event.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                          event.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{event.time}</p>
                      </div>
                      {event.priority === 'high' && (
                        <StatusBadge status="error" variant="solid" size="sm">High Priority</StatusBadge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/20' :
                    activity.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {activity.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : activity.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    ) : activity.type === 'info' ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{activity.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                    {activity.type === 'success' && (
                      <StatusBadge status="success" size="sm" className="mt-1">Completed</StatusBadge>
                    )}
                    {activity.type === 'warning' && (
                      <StatusBadge status="warning" size="sm" className="mt-1">Action Needed</StatusBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
