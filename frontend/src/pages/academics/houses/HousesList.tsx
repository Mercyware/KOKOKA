import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { House } from '../../../types';
import { getHouses, deleteHouse } from '../../../services/houseService';
import Layout from '../../../components/layout/Layout';

const HousesList: React.FC = () => {
  const navigate = useNavigate();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const housesData = await getHouses();
        setHouses(housesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteClick = (house: House) => {
    setHouseToDelete(house);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!houseToDelete) return;
    
    try {
      setLoading(true);
      await deleteHouse(houseToDelete.id);
      setHouses(houses.filter(house => house.id !== houseToDelete.id));
      setSnackbar({
        open: true,
        message: 'House deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setHouseToDelete(null);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting house:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete house. It may have students assigned to it.',
        severity: 'error',
      });
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setHouseToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Houses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/academics/houses/create"
        >
          Add House
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : houses.length === 0 ? (
          <Alert severity="info">
            No houses found. Click "Add House" to create one.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {houses.map((house) => (
                  <TableRow key={house.id}>
                    <TableCell>{house.name}</TableCell>
                    <TableCell>
                      {house.color && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: house.color,
                              borderRadius: '50%',
                              border: '1px solid #ddd',
                            }}
                          />
                          {house.color}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{house.description}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => navigate(`/academics/houses/edit/${house.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteClick(house)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
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
            Are you sure you want to delete the house "{houseToDelete?.name}"? This action cannot be undone.
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

export default HousesList;
