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
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const stats = [
    { title: 'Total Students', value: '1,247', icon: Users, change: '+12%', color: 'bg-blue-500' },
    { title: 'Teachers', value: '78', icon: GraduationCap, change: '+3%', color: 'bg-green-500' },
    { title: 'Courses', value: '45', icon: BookOpen, change: '+8%', color: 'bg-purple-500' },
    { title: 'Attendance Rate', value: '94.2%', icon: TrendingUp, change: '+2.1%', color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { action: 'New student enrollment', name: 'Emma Wilson', time: '2 hours ago', type: 'success' },
    { action: 'Grade submission', name: 'Math Class 10A', time: '4 hours ago', type: 'info' },
    { action: 'Low attendance alert', name: 'John Smith', time: '6 hours ago', type: 'warning' },
    { action: 'Assignment due reminder', name: 'Science Project', time: '1 day ago', type: 'pending' },
  ];

  const upcomingEvents = [
    { title: 'Parent-Teacher Meeting', date: 'Nov 15, 2024', time: '2:00 PM' },
    { title: 'Science Fair', date: 'Nov 20, 2024', time: '10:00 AM' },
    { title: 'Annual Sports Day', date: 'Nov 25, 2024', time: '9:00 AM' },
    { title: 'Winter Break Begins', date: 'Dec 20, 2024', time: 'All Day' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your school.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">November 10, 2024</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>AI Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Student Engagement</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Average Grade Performance</span>
                  <span className="text-sm text-gray-600">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Attendance Prediction</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">AI Recommendation</h4>
              <p className="text-sm text-blue-800">
                Based on current trends, consider implementing additional support for Math courses. 
                Students show 15% lower engagement in afternoon sessions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' :
                  activity.type === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   activity.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                   activity.type === 'info' ? <Calendar className="h-4 w-4 text-blue-600" /> :
                   <Clock className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.name}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
