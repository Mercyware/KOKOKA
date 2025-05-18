import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { getDevSubdomain, setDevSubdomain } from '../utils/devSubdomain';

/**
 * A component that allows developers to select and change the development subdomain
 * This is only shown in development environments
 */
const DevSubdomainSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Check if we're in development environment
  const isDevelopment = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
  };

  // Use effect to initialize the subdomain
  useEffect(() => {
    if (isDevelopment()) {
      const currentSubdomain = getDevSubdomain();
      if (currentSubdomain) {
        setSubdomain(currentSubdomain);
      }
    }
  }, []);

  // If not in development, don't render anything
  if (!isDevelopment()) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
    const currentSubdomain = getDevSubdomain();
    if (currentSubdomain) {
      setSubdomain(currentSubdomain);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!subdomain.trim()) {
      setSnackbarMessage('Subdomain cannot be empty');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setDevSubdomain(subdomain.trim());
    setOpen(false);
    setSnackbarMessage(`Development subdomain set to: ${subdomain.trim()}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Reload the page to apply the new subdomain
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Tooltip title="Set Development School">
        <IconButton 
          color="primary" 
          onClick={handleOpen}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'primary.light',
            }
          }}
        >
          <SchoolIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Set Development School</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set the school subdomain for local development. This will be used to identify the school in API requests.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="School Subdomain"
            fullWidth
            variant="outlined"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            helperText="Enter the subdomain of the school you want to work with"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Current subdomain: {getDevSubdomain() || 'None'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DevSubdomainSelector;
