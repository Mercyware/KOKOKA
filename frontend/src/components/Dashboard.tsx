import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
      icon: Users, 
      change: '+12%', 
      changeType: 'positive',
      description: 'Active enrolled students',
      color: 'bg-siohioma-primary' 
    },
    { 
      title: 'Teaching Staff', 
      value: '78', 
      icon: GraduationCap, 
      change: '+3%', 
      changeType: 'positive',
      description: 'Active faculty members',
      color: 'bg-siohioma-accent' 
    },
    { 
      title: 'Course Offerings', 
      value: '45', 
      icon: BookOpen, 
      change: '+8%', 
      changeType: 'positive',
      description: 'Available courses',
      color: 'bg-siohioma-secondary' 
    },
    { 
      title: 'Attendance Rate', 
      value: '94.2%', 
      icon: TrendingUp, 
      change: '+2.1%', 
      changeType: 'positive',
      description: 'Average daily attendance',
      color: 'bg-siohioma-light-green' 
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="px-siohioma-2xl py-siohioma-xl space-y-siohioma-xl">
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-siohioma-lg">
          {stats.map((stat, index) => (
            <div key={index} className="siohioma-metric-card group hover:shadow-siohioma-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="siohioma-body-sm text-gray-500 mb-2">{stat.title}</p>
                  <p className="siohioma-heading-1 mb-1">{stat.value}</p>
                  <div className="siohioma-trend-up">
                    <TrendingUp size={14} />
                    <span>{stat.change} vs last month</span>
                  </div>
                  <p className="siohioma-caption text-gray-400 mt-2">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-siohioma-xl text-white group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-siohioma-xl">
          {/* AI Performance Insights */}
          <div className="lg:col-span-2">
            <div className="siohioma-card">
              <div className="flex items-center gap-3 p-siohioma-xl pb-siohioma-lg border-b border-gray-100">
                <div className="bg-siohioma-primary/10 p-2 rounded-siohioma-lg">
                  <TrendingUp className="h-5 w-5 text-siohioma-primary" />
                </div>
                <div>
                  <h3 className="siohioma-heading-3">Performance Analytics</h3>
                  <p className="siohioma-body-sm text-gray-500">AI-powered insights and recommendations</p>
                </div>
              </div>
              <div className="p-siohioma-xl space-y-siohioma-lg">
                {insights.map((insight, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="siohioma-body font-siohioma-medium text-gray-700">{insight.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="siohioma-body-sm text-gray-600">{insight.value}%</span>
                        <div className={`flex items-center gap-1 ${
                          insight.trend === 'up' ? 'text-siohioma-light-green' : 
                          insight.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <TrendingUp size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-siohioma-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${insight.value}%` }}
                      ></div>
                    </div>
                    <p className="siohioma-body-sm text-gray-500">{insight.description}</p>
                  </div>
                ))}
                
                <div className="bg-siohioma-primary/5 border border-siohioma-primary/20 rounded-siohioma-xl p-siohioma-lg mt-siohioma-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-siohioma-primary/10 p-2 rounded-siohioma-lg">
                      <TrendingUp className="h-4 w-4 text-siohioma-primary" />
                    </div>
                    <div>
                      <h4 className="siohioma-body font-siohioma-semibold text-siohioma-primary mb-2">
                        AI Recommendation
                      </h4>
                      <p className="siohioma-body-sm text-gray-700">
                        Consider implementing additional support for Mathematics courses. 
                        Analysis shows 15% lower engagement in afternoon sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="siohioma-card">
            <div className="flex items-center gap-3 p-siohioma-xl pb-siohioma-lg border-b border-gray-100">
              <div className="bg-siohioma-accent/10 p-2 rounded-siohioma-lg">
                <Calendar className="h-5 w-5 text-siohioma-accent" />
              </div>
              <div>
                <h3 className="siohioma-heading-3">Upcoming Events</h3>
                <p className="siohioma-body-sm text-gray-500">Important dates and deadlines</p>
              </div>
            </div>
            <div className="p-siohioma-xl space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-siohioma-md rounded-siohioma-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className={`p-2 rounded-siohioma-lg ${
                    event.priority === 'high' ? 'bg-red-100' :
                    event.priority === 'medium' ? 'bg-siohioma-accent/10' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`h-4 w-4 ${
                      event.priority === 'high' ? 'text-red-600' :
                      event.priority === 'medium' ? 'text-siohioma-accent' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="siohioma-body font-siohioma-medium text-gray-900">{event.title}</p>
                    <p className="siohioma-body-sm text-gray-600">{event.date}</p>
                    <p className="siohioma-caption text-gray-500">{event.time}</p>
                  </div>
                  {event.priority === 'high' && (
                    <div className="siohioma-status-pending">
                      High Priority
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="siohioma-card">
          <div className="flex items-center gap-3 p-siohioma-xl pb-siohioma-lg border-b border-gray-100">
            <div className="bg-siohioma-primary/10 p-2 rounded-siohioma-lg">
              <Clock className="h-5 w-5 text-siohioma-primary" />
            </div>
            <div>
              <h3 className="siohioma-heading-3">Recent Activities</h3>
              <p className="siohioma-body-sm text-gray-500">Latest updates and notifications</p>
            </div>
          </div>
          <div className="p-siohioma-xl">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-siohioma-md rounded-siohioma-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className={`p-2 rounded-siohioma-lg ${
                    activity.type === 'success' ? 'bg-siohioma-light-green/20' :
                    activity.type === 'warning' ? 'bg-siohioma-accent/10' :
                    activity.type === 'info' ? 'bg-siohioma-primary/10' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'success' ? <CheckCircle className="h-4 w-4 text-siohioma-light-green" /> :
                     activity.type === 'warning' ? <AlertCircle className="h-4 w-4 text-siohioma-accent" /> :
                     activity.type === 'info' ? <Calendar className="h-4 w-4 text-siohioma-primary" /> :
                     <Clock className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="siohioma-body font-siohioma-medium text-gray-900">{activity.action}</p>
                    <p className="siohioma-body-sm text-gray-600">{activity.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="siohioma-caption text-gray-400">{activity.time}</p>
                    {activity.type === 'success' && (
                      <div className="siohioma-status-completed mt-1">Completed</div>
                    )}
                    {activity.type === 'warning' && (
                      <div className="siohioma-status-pending mt-1">Action Needed</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
