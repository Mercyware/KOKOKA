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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import * as teacherSubjectService from '../../../services/teacherSubjectService';
import { TeacherSubjectAssignmentRequest, TeacherSubjectAssignmentResponse } from '../../../services/teacherSubjectService';
import * as academicYearService from '../../../services/academicYearService';
import * as classService from '../../../services/classService';

// Define the shape of the API responses
interface AcademicYear {
  _id: string;
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface Class {
  _id: string;
  name: string;
  level: number;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const EditTeacherSubjectAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Data for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Original data for reference
  const [originalData, setOriginalData] = useState<TeacherSubjectAssignmentResponse | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<TeacherSubjectAssignmentRequest>>({
    classes: [],
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
        
        // Fetch classes
        const classesResponse = await classService.getClasses();
        const classesData = classesResponse.data || [];
        setClasses(classesData as unknown as Class[]);
        
        // Fetch teacher subject assignment
        if (id) {
          const assignmentResponse = await teacherSubjectService.getTeacherSubjectAssignment(id);
          setOriginalData(assignmentResponse);
          
          setFormData({
            classes: assignmentResponse.classes.map((cls: { _id: string; name: string; level: number }) => cls._id),
            isActive: assignmentResponse.isActive,
            remarks: assignmentResponse.remarks || '',
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
  
  const handleMultiSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: typeof value === 'string' ? value.split(',') : value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.classes || formData.classes.length === 0) {
      errors.classes = 'At least one class must be selected';
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
        await teacherSubjectService.updateTeacherSubjectAssignment(id, formData);
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/assignments/teacher-subjects');
        }, 1500);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update teacher subject assignment');
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
          <Alert severity="error">Teacher subject assignment not found</Alert>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Teacher Subject Assignment
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Teacher subject assignment updated successfully!</Alert>}
        
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
                  label="Subject"
                  value={`${originalData.subject.name} (${originalData.subject.code})`}
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
                <FormControl fullWidth error={!!formErrors.classes} required>
                  <InputLabel id="classes-label">Classes</InputLabel>
                  <Select
                    labelId="classes-label"
                    name="classes"
                    multiple
                    value={formData.classes || []}
                    onChange={handleMultiSelectChange}
                    input={<OutlinedInput label="Classes" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const cls = classes.find((c) => c._id === value);
                          return (
                            <Chip key={value} label={cls ? cls.name : value} />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                  {classes.map((cls: { _id: string; name: string }) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        <Checkbox checked={(formData.classes || []).indexOf(cls._id) > -1} />
                        <ListItemText primary={cls.name} />
                      </MenuItem>
                  ))}
                  </Select>
                  {formErrors.classes && <FormHelperText>{formErrors.classes}</FormHelperText>}
                </FormControl>
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
                    onClick={() => navigate('/assignments/teacher-subjects')}
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

export default EditTeacherSubjectAssignment;
