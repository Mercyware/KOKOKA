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
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import { getAllSubjects, deleteSubject } from '../../../services/subjectService';
import { Subject } from '../../../types';

const SubjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await getAllSubjects();
      if (response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load subjects',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    navigate('/academics/subjects/create');
  };

  const handleEditSubject = (id: string) => {
    navigate(`/academics/subjects/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSubjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      const response = await deleteSubject(subjectToDelete);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Subject deleted successfully',
          severity: 'success',
        });
        // Remove the deleted subject from the state
        setSubjects(subjects.filter(subject => subject.id !== subjectToDelete));
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete subject',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the subject',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

 
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Subjects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSubject}
          >
            Create Subject
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
                    <TableCell>Code</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Credit Hours</TableCell>
                    <TableCell>Tests</TableCell>
                    <TableCell>Test %</TableCell>
                    <TableCell>Exam %</TableCell>
                    <TableCell>Elective</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <TableRow hover key={subject.id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>
                          {typeof subject.academicYear === 'string' 
                            ? subject.academicYear 
                            : subject.academicYear?.name || '-'}
                        </TableCell>
                        <TableCell>{subject.department || '-'}</TableCell>
                        <TableCell>{subject.creditHours}</TableCell>
                        <TableCell>{subject.numberOfTests}</TableCell>
                        <TableCell>{subject.testPercentage}%</TableCell>
                        <TableCell>{subject.examPercentage}%</TableCell>
                        <TableCell>
                          {subject.isElective ? (
                            <Chip label="Yes" color="primary" size="small" />
                          ) : (
                            <Chip label="No" size="small" />
                          )}
                        </TableCell>                      
                        <TableCell align="right">
                         
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditSubject(subject.id)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton onClick={() => handleDeleteClick(subject.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                           
                         
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No subjects found
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
              Are you sure you want to delete this subject? This action cannot be undone.
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

export default SubjectsList;
