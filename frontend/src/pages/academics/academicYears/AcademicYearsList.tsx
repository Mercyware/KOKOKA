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
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import { get, del, put } from '../../../services/api';
import { AcademicYear } from '../../../types';

const AcademicYearsList: React.FC = () => {
  const navigate = useNavigate();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [academicYearToDelete, setAcademicYearToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const response = await get<AcademicYear[]>('/academic-years');
      if (response.data) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load academic years',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAcademicYear = () => {
    navigate('/academics/academic-years/create');
  };

  const handleEditAcademicYear = (id: string) => {
    navigate(`/academics/academic-years/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setAcademicYearToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!academicYearToDelete) return;

    try {
      const response = await del(`/academic-years/${academicYearToDelete}`);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Academic year deleted successfully',
          severity: 'success',
        });
        // Remove the deleted academic year from the state
        setAcademicYears(academicYears.filter(year => year.id !== academicYearToDelete));
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete academic year',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting academic year:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the academic year',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAcademicYearToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAcademicYearToDelete(null);
  };

  const handleSetActive = async (id: string) => {
    try {
      const response = await put(`/academic-years/${id}/set-active`, {});
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Academic year set as active successfully',
          severity: 'success',
        });
        // Update the active status in the state
        setAcademicYears(prevYears =>
          prevYears.map(year => ({
            ...year,
            isActive: year.id === id,
          }))
        );
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to set academic year as active',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error setting academic year as active:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while setting the academic year as active',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Academic Years</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateAcademicYear}
          >
            Create Academic Year
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
                    <TableCell>Name</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {academicYears.length > 0 ? (
                    academicYears.map((year) => (
                      <TableRow hover key={year.id}>
                        <TableCell>{year.name}</TableCell>
                        <TableCell>{formatDate(year.startDate)}</TableCell>
                        <TableCell>{formatDate(year.endDate)}</TableCell>
                        <TableCell>
                          {year.isActive ? (
                            <Chip
                              label="Active"
                              color="success"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleSetActive(year.id)}
                            >
                              Set Active
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{year.description || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditAcademicYear(year.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteClick(year.id)}
                              disabled={year.isActive} // Prevent deleting active academic year
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No academic years found
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
              Are you sure you want to delete this academic year? This action cannot be undone.
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

export default AcademicYearsList;
