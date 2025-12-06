import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import classTeacherService, { ClassTeacherRequest } from '../../../services/classTeacherService';
import * as academicYearService from '../../../services/academicYearService';
import * as classService from '../../../services/classService';
import * as classArmService from '../../../services/classArmService';
import * as staffService from '../../../services/staffService';
import * as studentService from '../../../services/studentService';

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

interface ClassArm {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  employeeId: string;
}

const CreateClassTeacher: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Data for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<ClassTeacherRequest>({
    teacher: '',
    class: '',
    classArm: '',
    academicYear: '',
    isActive: true,
    remarks: '',
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years
        const academicYearsResponse = await academicYearService.getAllAcademicYears();
        const years = academicYearsResponse.data?.academicYears || [];
        setAcademicYears(years as unknown as AcademicYear[]);
        
        // Find current academic year
        const currentYear = years.find((year) => year.isCurrent) as unknown as AcademicYear;
        if (currentYear) {
          setFormData((prev) => ({ ...prev, academicYear: currentYear._id }));
        } else if (years.length > 0) {
          const firstYear = years[0] as unknown as AcademicYear;
          setFormData((prev) => ({ ...prev, academicYear: firstYear._id }));
        }
        
        // Fetch classes
        const classesResponse = await classService.getClasses();
        const classesData = classesResponse.data || [];
        setClasses(classesData as unknown as Class[]);
        
        // Fetch teachers
        const teachersResponse = await staffService.getTeachers();
        const teachersData = teachersResponse.data || [];
        setTeachers(teachersData as unknown as Teacher[]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch initial data');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    const fetchClassArms = async () => {
      if (!formData.class) return;
      
      try {
        setLoading(true);
        // Get all class arms
        const armsData = await classArmService.getClassArms();
        setClassArms(armsData as unknown as ClassArm[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch class arms');
        setLoading(false);
      }
    };
    
    fetchClassArms();
  }, [formData.class]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Reset class arm when class changes
    if (name === 'class') {
      setFormData((prev) => ({ ...prev, classArm: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.teacher) {
      errors.teacher = 'Teacher is required';
      isValid = false;
    }
    
    if (!formData.class) {
      errors.class = 'Class is required';
      isValid = false;
    }
    
    if (!formData.classArm) {
      errors.classArm = 'Class Arm/Section is required';
      isValid = false;
    }
    
    if (!formData.academicYear) {
      errors.academicYear = 'Academic Year is required';
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
      
      // Check if this class and arm already has a class teacher assigned
      const exists = await classTeacherService.checkClassTeacherExists(
        formData.class,
        formData.classArm,
        formData.academicYear
      );
      
      if (exists) {
        setError('This class and section already has a class teacher assigned for the selected academic year');
        setSaving(false);
        return;
      }
      
      // Create class teacher assignment
      await classTeacherService.createClassTeacher(formData);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/assignments/class-teachers');
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create class teacher assignment');
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
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Assign Class Teacher
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Class teacher assigned successfully!</Alert>}
        
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
                <FormControl fullWidth error={!!formErrors.academicYear} required>
                  <InputLabel id="academic-year-label">Academic Year</InputLabel>
                  <Select
                    labelId="academic-year-label"
                    name="academicYear"
                    value={formData.academicYear}
                    label="Academic Year"
                    onChange={handleSelectChange}
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year._id} value={year._id}>
                        {year.name} {year.isCurrent ? '(Current)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.academicYear && <FormHelperText>{formErrors.academicYear}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.teacher} required>
                  <InputLabel id="teacher-label">Teacher</InputLabel>
                  <Select
                    labelId="teacher-label"
                    name="teacher"
                    value={formData.teacher}
                    label="Teacher"
                    onChange={handleSelectChange}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {teacher.user.name} ({teacher.employeeId})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.teacher && <FormHelperText>{formErrors.teacher}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.class} required>
                  <InputLabel id="class-label">Class</InputLabel>
                  <Select
                    labelId="class-label"
                    name="class"
                    value={formData.class}
                    label="Class"
                    onChange={handleSelectChange}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.class && <FormHelperText>{formErrors.class}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.classArm} required>
                  <InputLabel id="class-arm-label">Section/Arm</InputLabel>
                  <Select
                    labelId="class-arm-label"
                    name="classArm"
                    value={formData.classArm}
                    label="Section/Arm"
                    onChange={handleSelectChange}
                    disabled={!formData.class}
                  >
                    {classArms.map((arm) => (
                      <MenuItem key={arm._id} value={arm._id}>
                        {arm.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.classArm && <FormHelperText>{formErrors.classArm}</FormHelperText>}
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
                    {saving ? <CircularProgress size={24} /> : 'Assign Class Teacher'}
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

export default CreateClassTeacher;
