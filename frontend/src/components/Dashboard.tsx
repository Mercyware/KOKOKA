import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowUpRight, Users, GraduationCap, BookOpen, Calendar, DollarSign, BarChart2, Activity } from 'lucide-react';

const Dashboard = () => {
  // Mock data for dashboard
  const stats = [
    { 
      title: 'Total Students', 
      value: '1,234', 
      change: '+12%', 
      description: 'from last month', 
      icon: <Users className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: 'Total Teachers', 
      value: '64', 
      change: '+4%', 
      description: 'from last month', 
      icon: <GraduationCap className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: 'Classes', 
      value: '24', 
      change: '0%', 
      description: 'from last month', 
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: 'Attendance Rate', 
      value: '92%', 
      change: '+2%', 
      description: 'from last month', 
      icon: <Calendar className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: 'Fee Collection', 
      value: '$245,000', 
      change: '+18%', 
      description: 'from last month', 
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: 'Exam Pass Rate', 
      value: '87%', 
      change: '+5%', 
      description: 'from last term', 
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" /> 
    },
  ];

  const recentActivities = [
    { id: 1, activity: 'New student John Doe enrolled in Grade 10', time: '2 hours ago' },
    { id: 2, activity: 'Term 2 exam results published', time: '1 day ago' },
    { id: 3, activity: 'Parent-teacher meeting scheduled for next week', time: '2 days ago' },
    { id: 4, activity: 'New curriculum updates for Science subjects', time: '3 days ago' },
    { id: 5, activity: 'Annual sports day preparations started', time: '5 days ago' },
  ];

  const upcomingEvents = [
    { id: 1, event: 'Parent-Teacher Conference', date: 'June 15, 2025', location: 'Main Hall' },
    { id: 2, event: 'End of Term Exams', date: 'July 10-20, 2025', location: 'All Classrooms' },
    { id: 3, event: 'Annual Science Fair', date: 'June 25, 2025', location: 'Science Block' },
    { id: 4, event: 'School Board Meeting', date: 'June 5, 2025', location: 'Conference Room' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current Term: Term 2, 2024-2025</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : ''}`}>
                  {stat.change.startsWith('+') && <ArrowUpRight className="mr-1 h-3 w-3" />}
                  {stat.change}
                </span>
                {' '}{stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates from your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm">{item.activity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming Events
            </CardTitle>
            <CardDescription>School events and important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <p className="font-medium">{event.event}</p>
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
