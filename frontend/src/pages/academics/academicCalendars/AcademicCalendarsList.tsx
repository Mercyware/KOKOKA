import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import { 
  getAllAcademicCalendars, 
  deleteAcademicCalendar,
  AcademicCalendar
} from '../../../services/academicCalendarService';

const AcademicCalendarsList: React.FC = () => {
  const navigate = useNavigate();
  const [academicCalendars, setAcademicCalendars] = useState<AcademicCalendar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchAcademicCalendars();
  }, []);

  const fetchAcademicCalendars = async () => {
    setLoading(true);
    try {
      const response = await getAllAcademicCalendars();
      if (response.success && response.data) {
        setAcademicCalendars(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch academic calendars',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching academic calendars:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while fetching academic calendars',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = () => {
    navigate('/academics/academic-calendars/create');
  };

  const handleEditCalendar = (id: string) => {
    navigate(`/academics/academic-calendars/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setCalendarToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!calendarToDelete) return;

    try {
      const response = await deleteAcademicCalendar(calendarToDelete);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Academic calendar deleted successfully',
          severity: 'success',
        });
        fetchAcademicCalendars();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete academic calendar',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting academic calendar:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the academic calendar',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCalendarToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCalendarToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const getAcademicYearName = (academicYear: string | { _id: string; name: string }) => {
    if (typeof academicYear === 'string') {
      return academicYear;
    }
    return academicYear.name;
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Academic Calendars
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCalendar}
          >
            Add Academic Calendar
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Holidays</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {academicCalendars.length > 0 ? (
                    academicCalendars.map((calendar) => (
                      <TableRow hover key={calendar._id}>
                        <TableCell>{getAcademicYearName(calendar.academicYear)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={calendar.term} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{formatDate(calendar.startDate)}</TableCell>
                        <TableCell>{formatDate(calendar.endDate)}</TableCell>
                        <TableCell>
                          <Tooltip title={calendar.holidays.map(h => `${h.name} (${formatDate(h.date)})`).join(', ')}>
                            <Chip 
                              label={`${calendar.holidays.length} holidays`} 
                              color="warning" 
                              size="small" 
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditCalendar(calendar._id || '')}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteClick(calendar._id || '')}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No academic calendars found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this academic calendar? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
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

export default AcademicCalendarsList;
