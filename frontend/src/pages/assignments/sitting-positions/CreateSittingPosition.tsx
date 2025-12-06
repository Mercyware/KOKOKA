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
import sittingPositionService, { SittingPositionRequest } from '../../../services/sittingPositionService';
import * as academicYearService from '../../../services/academicYearService';
import * as termService from '../../../services/termService';
import * as classService from '../../../services/classService';
import * as classArmService from '../../../services/classArmService';
import * as studentService from '../../../services/studentService';

// Define the shape of the API responses
interface AcademicYear {
  _id: string;
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface Term {
  _id: string;
  name: string;
  academicYear: string;
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
  class: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

const CreateSittingPosition: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Data for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<SittingPositionRequest>({
    student: '',
    class: '',
    classArm: '',
    academicYear: '',
    term: '',
    row: 1,
    column: 1,
    positionNumber: 1,
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
          
          // Fetch terms for this academic year
          const termsResponse = await termService.getTermsByAcademicYear(currentYear._id);
          const termsData = termsResponse.data || [];
          setTerms(termsData as unknown as Term[]);
          
          // Find current term
          const currentTerm = termsData.find((term: any) => term.isCurrent) as unknown as Term;
          if (currentTerm) {
            setFormData((prev) => ({ ...prev, term: currentTerm._id }));
          } else if (termsData.length > 0) {
            const firstTerm = termsData[0] as unknown as Term;
            setFormData((prev) => ({ ...prev, term: firstTerm._id }));
          }
        } else if (years.length > 0) {
          const firstYear = years[0] as unknown as AcademicYear;
          setFormData((prev) => ({ ...prev, academicYear: firstYear._id }));
          
          // Fetch terms for this academic year
          const termsResponse = await termService.getTermsByAcademicYear(firstYear._id);
          const termsData = termsResponse.data || [];
          setTerms(termsData as unknown as Term[]);
          
          if (termsData.length > 0) {
            const firstTerm = termsData[0] as unknown as Term;
            setFormData((prev) => ({ ...prev, term: firstTerm._id }));
          }
        }
        
        // Fetch classes
        const classesResponse = await classService.getClasses();
        const classesData = classesResponse.data || [];
        setClasses(classesData as unknown as Class[]);
        
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
        // Since there's no direct method to get class arms by class, we'll get all and filter
        const response = await classArmService.getClassArms();
        const armsData = response.filter((arm: any) => arm.class === formData.class) || [];
        setClassArms(armsData as unknown as ClassArm[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch class arms');
        setLoading(false);
      }
    };
    
    fetchClassArms();
  }, [formData.class]);
  
  useEffect(() => {
    const fetchStudents = async () => {
      if (!formData.class || !formData.classArm) return;
      
      try {
        setLoading(true);
        const response = await studentService.getStudentsByClassAndArm(formData.class, formData.classArm);
        const studentsData = response.data || [];
        setStudents(studentsData as unknown as Student[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch students');
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [formData.class, formData.classArm]);
  
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
    
    // Reset dependent fields
    if (name === 'academicYear') {
      // Fetch terms for the selected academic year
      const fetchTerms = async () => {
        try {
          const termsResponse = await termService.getTermsByAcademicYear(value);
          const termsData = termsResponse.data || [];
          setTerms(termsData as unknown as Term[]);
          
          if (termsData.length > 0) {
            const firstTerm = termsData[0] as unknown as Term;
            setFormData((prev) => ({ ...prev, term: firstTerm._id }));
          } else {
            setFormData((prev) => ({ ...prev, term: '' }));
          }
        } catch (err) {
          setError('Failed to fetch terms');
        }
      };
      
      fetchTerms();
    } else if (name === 'class') {
      setFormData((prev) => ({ ...prev, classArm: '', student: '' }));
      setStudents([]);
    } else if (name === 'classArm') {
      setFormData((prev) => ({ ...prev, student: '' }));
    }
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
    
    if (!formData.student) {
      errors.student = 'Student is required';
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
    
    if (!formData.term) {
      errors.term = 'Term is required';
      isValid = false;
    }
    
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
      
      // Create sitting position
      await sittingPositionService.createSittingPosition(formData);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/assignments/sitting-positions');
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create sitting position');
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
          Assign Sitting Position
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Sitting position assigned successfully!</Alert>}
        
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
                <FormControl fullWidth error={!!formErrors.term} required>
                  <InputLabel id="term-label">Term</InputLabel>
                  <Select
                    labelId="term-label"
                    name="term"
                    value={formData.term}
                    label="Term"
                    onChange={handleSelectChange}
                  >
                    {terms.map((term) => (
                      <MenuItem key={term._id} value={term._id}>
                        {term.name} {term.isCurrent ? '(Current)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.term && <FormHelperText>{formErrors.term}</FormHelperText>}
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
                    disabled={!formData.class || classArms.length === 0}
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
                <FormControl fullWidth error={!!formErrors.student} required>
                  <InputLabel id="student-label">Student</InputLabel>
                  <Select
                    labelId="student-label"
                    name="student"
                    value={formData.student}
                    label="Student"
                    onChange={handleSelectChange}
                    disabled={!formData.classArm || students.length === 0}
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.firstName} {student.lastName} ({student.admissionNumber})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.student && <FormHelperText>{formErrors.student}</FormHelperText>}
                </FormControl>
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
                    {saving ? <CircularProgress size={24} /> : 'Assign Position'}
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

export default CreateSittingPosition;
