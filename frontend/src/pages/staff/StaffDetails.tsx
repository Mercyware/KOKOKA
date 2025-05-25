import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { getStaffMember, StaffMember } from '../../services/staffService';

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
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const StaffDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        setLoading(true);
        const response = await getStaffMember(id || '');
        
        if (response.staff) {
          setStaff(response.staff);
        } else {
          // Staff member not found
          setSnackbar({
            open: true,
            message: 'Staff member not found',
            severity: 'error',
          });
          navigate('/staff/list');
        }
      } catch (error) {
        console.error('Error fetching staff member:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching staff member',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffMember();
    }
  }, [id, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/staff/list');
  };

  const handleEdit = () => {
    navigate(`/staff/edit/${id}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" color="error">
              Staff member not found
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Back to Staff List
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Staff Details
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    bgcolor: staff.gender === 'female' ? 'primary.light' : 'secondary.light',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 80 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {staff.user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {staff.position}
                </Typography>
                <Chip
                  label={staff.staffType.charAt(0).toUpperCase() + staff.staffType.slice(1)}
                  color={
                    staff.staffType === 'teacher' ? 'primary' :
                    staff.staffType === 'admin' ? 'secondary' :
                    'default'
                  }
                  sx={{ mb: 1 }}
                />
                <Chip
                  label={staff.status === 'active' ? 'Active' : 'Inactive'}
                  color={staff.status === 'active' ? 'success' : 'default'}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    size="small"
                  >
                    Edit
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="staff details tabs">
                    <Tab label="Personal Info" />
                    <Tab label="Employment" />
                    <Tab label="Contact" />
                    {staff.staffType === 'teacher' && <Tab label="Teaching" />}
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Basic Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Full Name"
                                secondary={staff.user.name}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Gender"
                                secondary={staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Date of Birth"
                                secondary={staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="National ID"
                                secondary={staff.nationalId}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Account Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Email"
                                secondary={staff.user.email}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Role"
                                secondary={staff.user.role.charAt(0).toUpperCase() + staff.user.role.slice(1)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Status"
                                secondary={staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Employment Details
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Employee ID"
                                secondary={staff.employeeId}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Department"
                                secondary={staff.department.name}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Position"
                                secondary={staff.position}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Join Date"
                                secondary={staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'Not specified'}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Qualifications
                          </Typography>
                          {staff.qualifications && staff.qualifications.length > 0 ? (
                            <List dense>
                              {staff.qualifications.map((qualification: any, index: number) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={qualification.degree}
                                    secondary={`${qualification.institution}, ${qualification.year}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No qualifications recorded
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Contact Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Phone"
                                secondary={staff.phone}
                              />
                            </ListItem>
                            {staff.alternatePhone && (
                              <ListItem>
                                <ListItemText
                                  primary="Alternative Phone"
                                  secondary={staff.alternatePhone}
                                />
                              </ListItem>
                            )}
                            <ListItem>
                              <ListItemText
                                primary="Email"
                                secondary={staff.user.email}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Address
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Street"
                                secondary={staff.address?.street || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="City"
                                secondary={staff.address?.city || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="State/Province"
                                secondary={staff.address?.state || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Zip/Postal Code"
                                secondary={staff.address?.zipCode || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Country"
                                secondary={staff.address?.country || 'Not specified'}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Emergency Contact
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Name"
                                secondary={staff.emergencyContact?.name || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Relationship"
                                secondary={staff.emergencyContact?.relationship || 'Not specified'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Phone"
                                secondary={staff.emergencyContact?.phone || 'Not specified'}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                {staff.staffType === 'teacher' && (
                  <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Subjects
                            </Typography>
                            {staff.subjects && staff.subjects.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {staff.subjects.map((subject: string, index: number) => (
                                  <Chip key={index} label={subject} color="primary" variant="outlined" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No subjects assigned
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Classes
                            </Typography>
                            {staff.classes && staff.classes.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {staff.classes.map((className: string, index: number) => (
                                  <Chip key={index} label={className} color="secondary" variant="outlined" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No classes assigned
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </TabPanel>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default StaffDetails;
