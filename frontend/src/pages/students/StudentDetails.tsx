import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getStudentById } from '../../services/studentService';
import { Student } from '../../types';
import StudentClassHistory from '../../components/students/StudentClassHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `student-tab-${index}`,
    'aria-controls': `student-tabpanel-${index}`,
  };
}

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await getStudentById(id);
          setStudent(response.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'graduated':
        return 'primary';
      case 'transferred':
        return 'warning';
      case 'suspended':
      case 'expelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Student not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/students/list')}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Typography variant="h4" component="h1">
            Student Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {student.photo ? (
                  <Box sx={{ width: 120, height: 120, mx: 'auto', mb: 2, borderRadius: '50%', overflow: 'hidden' }}>
                    <img 
                      src={student.photo} 
                      alt={`${student.firstName} ${student.lastName}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  >
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </Avatar>
                )}
                <Typography variant="h5" gutterBottom>
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  {student.admissionNumber}
                </Typography>
                <Chip
                  label={student.status}
                  color={getStatusColor(student.status) as any}
                  sx={{ mt: 1 }}
                />
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                    onClick={() => navigate(`/students/edit/${student.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Date of Birth:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {formatDate(student.dateOfBirth)}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Gender:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {student.gender}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Blood Group:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.bloodGroup || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Nationality:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.nationality || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Religion:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.religion || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Academic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Admission Date:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {formatDate(student.admissionDate)}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Current Class:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.class ? student.class : 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Class Arm:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.classArm || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="textSecondary">
                      Roll Number:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">
                      {student.rollNumber || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="student details tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Class History" {...a11yProps(0)} />
                <Tab label="Attendance" {...a11yProps(1)} />
                <Tab label="Grades" {...a11yProps(2)} />
                <Tab label="Documents" {...a11yProps(3)} />
                <Tab label="Guardians" {...a11yProps(4)} />
                <Tab label="Notes" {...a11yProps(5)} />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <StudentClassHistory studentId={student.id} />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Attendance information will be displayed here.
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Grades information will be displayed here.
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Documents will be displayed here.
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Guardian information will be displayed here.
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={tabValue} index={5}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Notes will be displayed here.
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentDetails;
