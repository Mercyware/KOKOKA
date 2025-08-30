import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import ClassesVisualization from '../../../components/classes/ClassesVisualization';
import { get, del, post, put } from '../../../services/api';
import { Class } from '../../../types';

interface FormData {
  name: string;
  level: number;
  description: string;
  school?: string;
}

const ClassesList: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'visualization'>('table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    level: 1,
    description: '',
    school: authState.user?.school,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await get<Class[]>('/classes');
      if (response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load classes',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      level: 1,
      description: '',
      school: authState.user?.school,
    });
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      level: cls.level,
      description: cls.description || '',
      school: authState.user?.school,
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setEditingClass(null);
    setFormData({
      name: '',
      level: 1,
      description: '',
      school: authState.user?.school,
    });
    setFormErrors({});
  };

  const handleFormFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name) newErrors.name = 'Class name is required';
    if (!formData.level || formData.level < 1) newErrors.level = 'Valid class level is required';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }

    // Check for duplicate class names (except when editing the same class)
    const isDuplicate = classes.some(cls => 
      cls.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      cls.id !== editingClass?.id
    );

    if (isDuplicate) {
      setSnackbar({
        open: true,
        message: 'A class with this name already exists',
        severity: 'error',
      });
      return;
    }

    setFormLoading(true);

    try {
      // Ensure school ID is included in the request
      const dataToSubmit = {
        ...formData,
        school: authState.user?.school,
      };
      
      let response;
      if (editingClass) {
        response = await put(`/classes/${editingClass.id}`, dataToSubmit);
      } else {
        response = await post('/classes', dataToSubmit);
      }
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Class ${editingClass ? 'updated' : 'created'} successfully`,
          severity: 'success',
        });
        
        // Refresh classes list and close modal
        fetchClasses();
        handleCloseModal();
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${editingClass ? 'update' : 'create'} class`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error(`Error ${editingClass ? 'updating' : 'creating'} class:`, error);
      setSnackbar({
        open: true,
        message: `An error occurred while ${editingClass ? 'updating' : 'creating'} the class`,
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setClassToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    try {
      const response = await del(`/classes/${classToDelete}`);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Class deleted successfully',
          severity: 'success',
        });
        // Remove the deleted class from the state
        setClasses(classes.filter(cls => cls.id !== classToDelete));
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete class',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the class',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'table' | 'visualization') => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleEditFromVisualization = (classItem: Class) => {
    handleEditClass(classItem);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Classes</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Table View">
                  <ViewListIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="visualization" aria-label="visualization view">
                <Tooltip title="Grade Visualization">
                  <AccountTreeIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClass}
            >
              Create Class
            </Button>
          </Box>
        </Box>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
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
                      <TableCell>Level</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <TableRow hover key={cls.id}>
                          <TableCell>{cls.name}</TableCell>
                          <TableCell>{cls.level}</TableCell>
                          <TableCell>{cls.description || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditClass(cls)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteClick(cls.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No classes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        ) : (
          <ClassesVisualization onClassEdit={handleEditFromVisualization} />
        )}

        {/* Add Class Modal */}
        <Dialog
          open={addModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="add-class-dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="add-class-dialog-title">Create New Class</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  fullWidth
                  label="Class Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormFieldChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="Class Level"
                    name="level"
                    type="number"
                    value={formData.level}
                    onChange={handleFormFieldChange}
                    error={!!formErrors.level}
                    helperText={formErrors.level}
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </div>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormFieldChange}
                  multiline
                  rows={4}
                />
              </div>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              color="primary"
              disabled={formLoading}
              startIcon={formLoading && <CircularProgress size={20} />}
            >
              {formLoading ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Class Modal */}
        <Dialog
          open={editModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="edit-class-dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="edit-class-dialog-title">Edit Class</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  fullWidth
                  label="Class Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormFieldChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="Class Level"
                    name="level"
                    type="number"
                    value={formData.level}
                    onChange={handleFormFieldChange}
                    error={!!formErrors.level}
                    helperText={formErrors.level}
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </div>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormFieldChange}
                  multiline
                  rows={4}
                />
              </div>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              color="primary"
              disabled={formLoading}
              startIcon={formLoading && <CircularProgress size={20} />}
            >
              {formLoading ? 'Updating...' : 'Update Class'}
            </Button>
          </DialogActions>
        </Dialog>

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
              Are you sure you want to delete this class? This action cannot be undone.
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

export default ClassesList;
