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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import Layout from '../../../components/layout/Layout';
import * as teacherSubjectService from '../../../services/teacherSubjectService';
import { TeacherSubjectAssignmentRequest } from '../../../services/teacherSubjectService';
import * as academicYearService from '../../../services/academicYearService';
import * as classService from '../../../services/classService';
import * as subjectService from '../../../services/subjectService';
import * as staffService from '../../../services/staffService';
import * as classArmService from '../../../services/classArmService';

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

interface Subject {
  _id: string;
  name: string;
  code: string;
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

interface ClassArm {
  _id: string;
  name: string;
  class: string;
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

const CreateTeacherSubjectAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Data for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<TeacherSubjectAssignmentRequest>({
    teacher: '',
    subject: '',
    classes: [],
    classArms: {},
    academicYear: '',
    isActive: true,
    remarks: '',
  });
  
  // State for class arms
  const [classArmsMap, setClassArmsMap] = useState<Record<string, ClassArm[]>>({});
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years
        const academicYearsResponse = await academicYearService.getAllAcademicYears();
        const years = academicYearsResponse.data || [];
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
        
        // Fetch subjects
        const subjectsResponse = await subjectService.getAllSubjects();
        const subjectsData = subjectsResponse.data || [];
        setSubjects(subjectsData as unknown as Subject[]);
        
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
  };
  
  // Fetch class arms for a class
  const fetchClassArms = async (classId: string) => {
    try {
      const response = await classService.getClassArms(classId);
      const classArms = response.data || [];
      setClassArmsMap(prev => ({
        ...prev,
        [classId]: classArms
      }));
      
      // Initialize empty array for this class in formData.classArms
      setFormData(prev => ({
        ...prev,
        classArms: {
          ...prev.classArms,
          [classId]: []
        }
      }));
      
      return classArms;
    } catch (err) {
      console.error(`Failed to fetch class arms for class ${classId}:`, err);
      return [];
    }
  };
  
  // Handle class arm selection for a specific class
  const handleClassArmChange = (classId: string, selectedArms: string[]) => {
    setFormData(prev => ({
      ...prev,
      classArms: {
        ...prev.classArms,
        [classId]: selectedArms
      }
    }));
  };
  
  const handleMultiSelectChange = async (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    const selectedValues = typeof value === 'string' ? value.split(',') : value;
    
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // If classes are selected, fetch class arms for each class
    if (name === 'classes') {
      // Find newly added classes
      const prevClasses = formData.classes;
      const newClasses = selectedValues.filter(c => !prevClasses.includes(c));
      
      // Fetch class arms for newly added classes
      for (const classId of newClasses) {
        await fetchClassArms(classId);
      }
      
      // Remove class arms for removed classes
      const removedClasses = prevClasses.filter(c => !selectedValues.includes(c));
      if (removedClasses.length > 0) {
        const updatedClassArms = { ...formData.classArms };
        removedClasses.forEach(classId => {
          delete updatedClassArms[classId];
        });
        
        setFormData(prev => ({
          ...prev,
          classArms: updatedClassArms
        }));
      }
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.teacher) {
      errors.teacher = 'Teacher is required';
      isValid = false;
    }
    
    if (!formData.subject) {
      errors.subject = 'Subject is required';
      isValid = false;
    }
    
    if (formData.classes.length === 0) {
      errors.classes = 'At least one class must be selected';
      isValid = false;
    }
    
    if (!formData.academicYear) {
      errors.academicYear = 'Academic Year is required';
      isValid = false;
    }
    
    // Term validation removed as it's not part of the TeacherSubjectAssignmentRequest
    
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
      
      // Create teacher subject assignment
      await teacherSubjectService.createTeacherSubjectAssignment(formData);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/assignments/teacher-subjects');
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create teacher subject assignment');
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
          Assign Subject to Teacher
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Teacher subject assignment created successfully!</Alert>}
        
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
              
              {/* Term selection removed as it's not part of the TeacherSubjectAssignmentRequest */}
              
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
                <FormControl fullWidth error={!!formErrors.subject} required>
                  <InputLabel id="subject-label">Subject</InputLabel>
                  <Select
                    labelId="subject-label"
                    name="subject"
                    value={formData.subject}
                    label="Subject"
                    onChange={handleSelectChange}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.subject && <FormHelperText>{formErrors.subject}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.classes} required>
                  <InputLabel id="classes-label">Classes</InputLabel>
                  <Select
                    labelId="classes-label"
                    name="classes"
                    multiple
                    value={formData.classes}
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
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        <Checkbox checked={formData.classes.indexOf(cls._id) > -1} />
                        <ListItemText primary={cls.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.classes && <FormHelperText>{formErrors.classes}</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Class Arms selection for each selected class */}
              {formData.classes.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Class Arms
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.classes.map((classId) => {
                      const cls = classes.find((c) => c._id === classId);
                      const classArms = classArmsMap[classId] || [];
                      
                      return (
                        <Grid item xs={12} sm={6} key={classId}>
                          <FormControl fullWidth>
                            <InputLabel id={`class-arms-label-${classId}`}>
                              {cls ? `${cls.name} Arms` : 'Class Arms'}
                            </InputLabel>
                            <Select
                              labelId={`class-arms-label-${classId}`}
                              multiple
                              value={formData.classArms[classId] || []}
                              onChange={(e) => handleClassArmChange(
                                classId, 
                                typeof e.target.value === 'string' 
                                  ? e.target.value.split(',') 
                                  : e.target.value
                              )}
                              input={<OutlinedInput label={cls ? `${cls.name} Arms` : 'Class Arms'} />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => {
                                    const arm = classArms.find((a) => a._id === value);
                                    return (
                                      <Chip key={value} label={arm ? arm.name : value} />
                                    );
                                  })}
                                </Box>
                              )}
                              MenuProps={MenuProps}
                            >
                              {classArms.map((arm) => (
                                <MenuItem key={arm._id} value={arm._id}>
                                  <Checkbox 
                                    checked={(formData.classArms[classId] || []).indexOf(arm._id) > -1} 
                                  />
                                  <ListItemText primary={arm.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              )}
              
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
                    {saving ? <CircularProgress size={24} /> : 'Assign Subject'}
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

export default CreateTeacherSubjectAssignment;
