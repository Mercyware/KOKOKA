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
import classTeacherService, { ClassTeacherRequest, ClassTeacherResponse } from '../../../services/classTeacherService';
import * as academicYearService from '../../../services/academicYearService';

// Define the shape of the API responses
interface AcademicYear {
  _id: string;
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
}

const EditClassTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Data for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  
  // Original data for reference
  const [originalData, setOriginalData] = useState<ClassTeacherResponse | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<ClassTeacherRequest>>({
    isActive: true,
    remarks: '',
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years
        const academicYearsResponse = await academicYearService.getAllAcademicYears();
        const years = academicYearsResponse.data?.academicYears || [];
        setAcademicYears(years as unknown as AcademicYear[]);
        
        // Fetch class teacher assignment
        if (id) {
          const classTeacherResponse = await classTeacherService.getClassTeacher(id);
          setOriginalData(classTeacherResponse);
          
          setFormData({
            isActive: classTeacherResponse.isActive,
            remarks: classTeacherResponse.remarks || '',
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
  
  const validateForm = (): boolean => {
    // No required fields to validate in edit mode
    return true;
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
        await classTeacherService.updateClassTeacher(id, formData);
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/assignments/class-teachers');
        }, 1500);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update class teacher assignment');
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
          <Alert severity="error">Class teacher assignment not found</Alert>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Class Teacher Assignment
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Class teacher assignment updated successfully!</Alert>}
        
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
                  label="Teacher"
                  value={`${originalData.teacher.user.name} (${originalData.teacher.employeeId})`}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assigned Date"
                  value={new Date(originalData.assignedDate).toLocaleDateString()}
                  InputProps={{ readOnly: true }}
                  disabled
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
                    onClick={() => navigate('/assignments/class-teachers')}
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
                    {saving ? <CircularProgress size={24} /> : 'Update Assignment'}
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

export default EditClassTeacher;
