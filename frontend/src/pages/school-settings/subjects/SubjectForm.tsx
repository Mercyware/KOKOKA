import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import { get } from '../../../services/api';
import {
  getSubjectById,
  createSubject,
  updateSubject,
  getSubjectList,
} from '../../../services/subjectService';
import { Subject, AcademicYear, Class } from '../../../types';

const SubjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    code: '',
    description: '',
    academicYear: '',
    department: '',
    creditHours: 1,
    isElective: false,
    classes: [],
    numberOfTests: 2,
    testPercentage: 30,
    examPercentage: 70,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
    fetchAvailableSubjects();
    if (isEditMode) {
      fetchSubject();
    }
  }, [id]);

  const fetchAvailableSubjects = async () => {
    try {
      const response = await getSubjectList();
      if (response.success && response.data) {
        setAvailableSubjects(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch subjects',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching subjects',
        severity: 'error',
      });
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await get<AcademicYear[]>('/academic-years');
      if (response.success && response.data) {
        setAcademicYears(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch academic years',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching academic years',
        severity: 'error',
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await get<Class[]>('/classes');
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch classes',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching classes',
        severity: 'error',
      });
    }
  };

  const fetchSubject = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getSubjectById(id);
      if (response.success && response.data) {
        const subject = response.data;
        setFormData({
          ...subject,
          academicYear: subject.academicYear,
          classes: subject.classes || [],
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch subject',
          severity: 'error',
        });
        navigate('/academics/subjects');
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching the subject',
        severity: 'error',
      });
      navigate('/academics/subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.code || !formData.academicYear) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return false;
    }

    // Validate that test and exam percentages add up to 100%
    if ((formData.testPercentage || 0) + (formData.examPercentage || 0) !== 100) {
      setSnackbar({
        open: true,
        message: 'Test and exam percentages must add up to 100%',
        severity: 'error',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Get the current user's school from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = user.school;

      if (!schoolId) {
        setSnackbar({
          open: true,
          message: 'School information not found',
          severity: 'error',
        });
        return;
      }

      const subjectData = {
        ...formData,
        school: schoolId,
      } as Subject;

      let response;
      if (isEditMode && id) {
        response = await updateSubject(id, subjectData);
      } else {
        response = await createSubject(subjectData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Subject ${isEditMode ? 'updated' : 'created'} successfully`,
          severity: 'success',
        });
        
        // Navigate back to the list after a short delay
        setTimeout(() => {
          navigate('/academics/subjects');
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${isEditMode ? 'update' : 'create'} subject`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} subject:`, error);
      setSnackbar({
        open: true,
        message: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the subject`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {isEditMode ? 'Edit Subject' : 'Create Subject'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/academics/subjects')}
          >
            Back to List
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={availableSubjects}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={selectedSubject}
                    onChange={(event, newValue) => {
                      setSelectedSubject(newValue);
                      if (newValue) {
                        setFormData({
                          ...formData,
                          name: newValue.name,
                          code: newValue.code,
                          description: newValue.description || '',
                          department: newValue.department || '',
                          creditHours: newValue.creditHours || 1,
                          isElective: newValue.isElective || false,
                          numberOfTests: newValue.numberOfTests || 2,
                          testPercentage: newValue.testPercentage || 30,
                          examPercentage: newValue.examPercentage || 70,
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Subject"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <SearchIcon color="action" />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject Code"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="academic-year-label">Academic Year</InputLabel>
                    <Select
                      labelId="academic-year-label"
                      id="academicYear"
                      name="academicYear"
                      value={formData.academicYear || ''}
                      label="Academic Year"
                      onChange={handleInputChange}
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year.id} value={year.id}>
                          {year.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Credit Hours"
                    name="creditHours"
                    type="number"
                    value={formData.creditHours || 1}
                    onChange={handleNumberInputChange}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isElective || false}
                        onChange={handleSwitchChange}
                        name="isElective"
                        color="primary"
                      />
                    }
                    label="Is Elective"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Assessment Configuration
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Number of Tests"
                    name="numberOfTests"
                    type="number"
                    value={formData.numberOfTests || 2}
                    onChange={handleNumberInputChange}
                    inputProps={{ min: 0, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Test Percentage (%)"
                    name="testPercentage"
                    type="number"
                    value={formData.testPercentage || 30}
                    onChange={handleNumberInputChange}
                    inputProps={{ min: 0, max: 100 }}
                    helperText="Test and exam percentages must add up to 100%"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Exam Percentage (%)"
                    name="examPercentage"
                    type="number"
                    value={formData.examPercentage || 70}
                    onChange={handleNumberInputChange}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Class Assignment
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="classes-label">Classes</InputLabel>
                    <Select
                      labelId="classes-label"
                      id="classes"
                      name="classes"
                      multiple
                      value={formData.classes || []}
                      label="Classes"
                      onChange={handleInputChange}
                      renderValue={(selected) => {
                        const selectedClasses = classes.filter(cls => selected.includes(cls.id));
                        return selectedClasses.map(cls => cls.name).join(', ');
                      }}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {isEditMode ? 'Update' : 'Create'} Subject
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/academics/subjects')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>

        {/* Snackbar for notifications */}
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
      </Box>
    </Layout>
  );
};

export default SubjectForm;
