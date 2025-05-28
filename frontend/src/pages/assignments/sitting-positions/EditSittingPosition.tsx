import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import sittingPositionService, { SittingPositionRequest, SittingPositionResponse } from '../../../services/sittingPositionService';

const EditSittingPosition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Original data for reference
  const [originalData, setOriginalData] = useState<SittingPositionResponse | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<SittingPositionRequest>>({
    row: 1,
    column: 1,
    positionNumber: 1,
    isActive: true,
    remarks: '',
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch sitting position
        if (id) {
          const response = await sittingPositionService.getSittingPosition(id);
          setOriginalData(response);
          
          setFormData({
            row: response.row,
            column: response.column,
            positionNumber: response.positionNumber,
            isActive: response.isActive,
            remarks: response.remarks || '',
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.row || formData.row < 1) {
      errors.row = 'Row must be a positive number';
      isValid = false;
    }
    
    if (!formData.column || formData.column < 1) {
      errors.column = 'Column must be a positive number';
      isValid = false;
    }
    
    if (!formData.positionNumber || formData.positionNumber < 1) {
      errors.positionNumber = 'Position Number must be a positive number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      if (id) {
        await sittingPositionService.updateSittingPosition(id, formData);
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/assignments/sitting-positions');
        }, 1500);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update sitting position');
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (!originalData) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Sitting position not found</Alert>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Sitting Position
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Sitting position updated successfully!</Alert>}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Assignment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={originalData.academicYear.name}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Term"
                  value={originalData.term.name}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Class"
                  value={originalData.class.name}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Section/Arm"
                  value={originalData.classArm.name}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student"
                  value={`${originalData.student.firstName} ${originalData.student.lastName} (${originalData.student.admissionNumber})`}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Position Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Row"
                  name="row"
                  type="number"
                  value={formData.row}
                  onChange={handleNumberChange}
                  inputProps={{ min: 1 }}
                  error={!!formErrors.row}
                  helperText={formErrors.row}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Column"
                  name="column"
                  type="number"
                  value={formData.column}
                  onChange={handleNumberChange}
                  inputProps={{ min: 1 }}
                  error={!!formErrors.column}
                  helperText={formErrors.column}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Position Number"
                  name="positionNumber"
                  type="number"
                  value={formData.positionNumber}
                  onChange={handleNumberChange}
                  inputProps={{ min: 1 }}
                  error={!!formErrors.positionNumber}
                  helperText={formErrors.positionNumber}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/assignments/sitting-positions')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Update Position'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default EditSittingPosition;
