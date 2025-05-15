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
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import { get } from '../../../services/api';
import {
  getAcademicCalendarById,
  createAcademicCalendar,
  updateAcademicCalendar,
  AcademicCalendar,
  Holiday,
} from '../../../services/academicCalendarService';

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const AcademicCalendarForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [formData, setFormData] = useState<Partial<AcademicCalendar>>({
    academicYear: '',
    term: 'First',
    startDate: '',
    endDate: '',
    holidays: [],
  });
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    if (isEditMode) {
      fetchAcademicCalendar();
    }
  }, [id]);

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

  const fetchAcademicCalendar = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getAcademicCalendarById(id);
      if (response.success && response.data) {
        const calendar = response.data;
        setFormData({
          ...calendar,
          academicYear: typeof calendar.academicYear === 'string' 
            ? calendar.academicYear 
            : calendar.academicYear._id,
        });

        // Find the selected academic year
        if (typeof calendar.academicYear !== 'string') {
          const yearId = calendar.academicYear._id;
          const year = academicYears.find(y => y._id === yearId);
          if (year) {
            setSelectedAcademicYear(year);
          }
        }
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch academic calendar',
          severity: 'error',
        });
        navigate('/academics/academic-calendars');
      }
    } catch (error) {
      console.error('Error fetching academic calendar:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching the academic calendar',
        severity: 'error',
      });
      navigate('/academics/academic-calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));

      // If academic year changes, update the selected academic year
      if (name === 'academicYear') {
        const year = academicYears.find(y => y._id === value);
        setSelectedAcademicYear(year || null);
      }
    }
  };

  const handleHolidayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewHoliday(prev => ({ ...prev, [name]: value }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      setSnackbar({
        open: true,
        message: 'Holiday name and date are required',
        severity: 'error',
      });
      return;
    }

    // Check if the holiday date is within the calendar period
    if (formData.startDate && formData.endDate) {
      const holidayDate = new Date(newHoliday.date);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (holidayDate < startDate || holidayDate > endDate) {
        setSnackbar({
          open: true,
          message: 'Holiday date must be within the calendar period',
          severity: 'error',
        });
        return;
      }
    }

    // Add the new holiday to the form data
    const updatedHolidays = [...(formData.holidays || []), newHoliday as Holiday];
    setFormData(prev => ({ ...prev, holidays: updatedHolidays }));

    // Reset the new holiday form
    setNewHoliday({
      name: '',
      date: '',
      description: '',
    });

    // Close the dialog
    setHolidayDialogOpen(false);
  };

  const handleRemoveHoliday = (index: number) => {
    const updatedHolidays = [...(formData.holidays || [])];
    updatedHolidays.splice(index, 1);
    setFormData(prev => ({ ...prev, holidays: updatedHolidays }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.academicYear || !formData.term || !formData.startDate || !formData.endDate) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      setSnackbar({
        open: true,
        message: 'Start date cannot be after end date',
        severity: 'error',
      });
      return;
    }

    // Validate that dates are within academic year if selected
    if (selectedAcademicYear) {
      const academicYearStartDate = new Date(selectedAcademicYear.startDate);
      const academicYearEndDate = new Date(selectedAcademicYear.endDate);

      if (startDate < academicYearStartDate || endDate > academicYearEndDate) {
        setSnackbar({
          open: true,
          message: 'Calendar dates must be within the academic year period',
          severity: 'error',
        });
        return;
      }
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

      const calendarData = {
        ...formData,
        school: schoolId,
      } as AcademicCalendar;

      let response;
      if (isEditMode && id) {
        response = await updateAcademicCalendar(id, calendarData);
      } else {
        response = await createAcademicCalendar(calendarData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Academic calendar ${isEditMode ? 'updated' : 'created'} successfully`,
          severity: 'success',
        });
        
        // Navigate back to the list after a short delay
        setTimeout(() => {
          navigate('/academics/academic-calendars');
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${isEditMode ? 'update' : 'create'} academic calendar`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} academic calendar:`, error);
      setSnackbar({
        open: true,
        message: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the academic calendar`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format date for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {isEditMode ? 'Edit Academic Calendar' : 'Create Academic Calendar'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/academics/academic-calendars')}
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
                        <MenuItem key={year._id} value={year._id}>
                          {year.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="term-label">Term</InputLabel>
                    <Select
                      labelId="term-label"
                      id="term"
                      name="term"
                      value={formData.term || 'First'}
                      label="Term"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="First">First Term</MenuItem>
                      <MenuItem value="Second">Second Term</MenuItem>
                      <MenuItem value="Third">Third Term</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formatDateForInput(formData.startDate || '')}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formatDateForInput(formData.endDate || '')}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Holidays</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setHolidayDialogOpen(true)}
                    >
                      Add Holiday
                    </Button>
                  </Box>

                  <List>
                    {formData.holidays && formData.holidays.length > 0 ? (
                      formData.holidays.map((holiday, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={holiday.name}
                            secondary={`${formatDate(holiday.date)}${holiday.description ? ` - ${holiday.description}` : ''}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveHoliday(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No holidays added yet" />
                      </ListItem>
                    )}
                  </List>
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
                    {isEditMode ? 'Update' : 'Create'} Academic Calendar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/academics/academic-calendars')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>

        {/* Holiday Dialog */}
        <Dialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)}>
          <DialogTitle>Add Holiday</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Holiday Name"
                  fullWidth
                  required
                  value={newHoliday.name}
                  onChange={handleHolidayInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Holiday Date"
                  name="date"
                  type="date"
                  value={formatDateForInput(newHoliday.date || '')}
                  onChange={handleHolidayInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={newHoliday.description}
                  onChange={handleHolidayInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHolidayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHoliday} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>

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

export default AcademicCalendarForm;
