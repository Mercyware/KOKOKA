import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Book as BookIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import { get } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
    exams: 0,
    fees: {
      collected: 0,
      pending: 0,
      total: 0,
    },
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
    },
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        setStats({
          students: 450,
          teachers: 32,
          classes: 15,
          subjects: 24,
          exams: 8,
          fees: {
            collected: 75000,
            pending: 25000,
            total: 100000,
          },
          attendance: {
            present: 420,
            absent: 15,
            late: 15,
            total: 450,
          },
        });

        setRecentActivities([
          { id: 1, type: 'student', action: 'New student registered', name: 'John Doe', time: '2 hours ago' },
          { id: 2, type: 'exam', action: 'Exam results published', name: 'Mathematics Final', time: '5 hours ago' },
          { id: 3, type: 'fee', action: 'Fee payment received', name: 'Sarah Johnson', time: '1 day ago' },
          { id: 4, type: 'class', action: 'New class added', name: 'Grade 10 Science', time: '2 days ago' },
          { id: 5, type: 'teacher', action: 'New teacher joined', name: 'Prof. Robert Smith', time: '3 days ago' },
        ]);

        setUpcomingEvents([
          { id: 1, title: 'Mathematics Exam', date: '2023-06-15', time: '09:00 AM', location: 'Hall A' },
          { id: 2, title: 'Parent-Teacher Meeting', date: '2023-06-20', time: '02:00 PM', location: 'Conference Room' },
          { id: 3, title: 'Science Fair', date: '2023-06-25', time: '10:00 AM', location: 'School Grounds' },
          { id: 4, title: 'End of Term', date: '2023-06-30', time: 'All Day', location: 'School' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [stats.attendance.present, stats.attendance.absent, stats.attendance.late],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.error.main,
          theme.palette.warning.main,
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.error.dark,
          theme.palette.warning.dark,
        ],
        borderWidth: 1,
      },
    ],
  };

  const feesChartData = {
    labels: ['Collected', 'Pending'],
    datasets: [
      {
        label: 'Fee Status',
        data: [stats.fees.collected, stats.fees.pending],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.grey[400],
        ],
      },
    ],
  };

  // Get avatar icon based on activity type
  const getActivityAvatar = (type: string) => {
    switch (type) {
      case 'student':
        return <PeopleIcon />;
      case 'exam':
        return <AssessmentIcon />;
      case 'fee':
        return <PaymentIcon />;
      case 'class':
        return <ClassIcon />;
      case 'teacher':
        return <SchoolIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get avatar color based on activity type
  const getActivityAvatarColor = (type: string) => {
    switch (type) {
      case 'student':
        return theme.palette.primary.main;
      case 'exam':
        return theme.palette.success.main;
      case 'fee':
        return theme.palette.info.main;
      case 'class':
        return theme.palette.warning.main;
      case 'teacher':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        mt: { xs: 1, sm: 2, md: 3 },
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%'
      }}>
        <Typography variant="h4" gutterBottom>
          {authState.user?.role === 'admin'
            ? 'Admin Dashboard'
            : authState.user?.role === 'teacher'
              ? 'Teacher Dashboard'
              : authState.user?.role === 'student'
                ? 'Student Dashboard'
                : 'Dashboard'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome back, {authState.user?.name}!
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 1, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                  Students
                </Typography>
                <PeopleIcon />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {stats.students}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total enrolled students
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                  Teachers
                </Typography>
                <SchoolIcon />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {stats.teachers}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total faculty members
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                  Classes
                </Typography>
                <ClassIcon />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {stats.classes}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Active classes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                  Subjects
                </Typography>
                <BookIcon />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {stats.subjects}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total subjects offered
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts and Lists */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Attendance Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardHeader title="Attendance Overview" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={attendanceChartData} options={{ maintainAspectRatio: false }} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Present
                    </Typography>
                    <Typography variant="h6">
                      {Math.round((stats.attendance.present / stats.attendance.total) * 100)}%
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Absent
                    </Typography>
                    <Typography variant="h6">
                      {Math.round((stats.attendance.absent / stats.attendance.total) * 100)}%
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Late
                    </Typography>
                    <Typography variant="h6">
                      {Math.round((stats.attendance.late / stats.attendance.total) * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Fees Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardHeader title="Fee Collection Status" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                  <Bar
                    data={feesChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Collected
                    </Typography>
                    <Typography variant="h6">
                      ${stats.fees.collected.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h6">
                      ${stats.fees.pending.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6">
                      ${stats.fees.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardHeader
                title="Upcoming Events"
                action={
                  <Button size="small" color="primary">
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  {upcomingEvents.map((event) => (
                    <React.Fragment key={event.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {new Date(event.date).toLocaleDateString()} • {event.time}
                              </Typography>
                              <br />
                              {event.location}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Recent Activities"
                action={
                  <Button size="small" color="primary">
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  {recentActivities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getActivityAvatarColor(activity.type) }}>
                            {getActivityAvatar(activity.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {activity.name}
                              </Typography>
                              {' — '}
                              {activity.time}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
