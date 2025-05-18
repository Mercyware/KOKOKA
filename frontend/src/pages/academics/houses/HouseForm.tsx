import React, { useState, useEffect } from 'react';
import { getStaffMembers } from '../../../services/staffService';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { House } from '../../../types';

interface HouseFormProps {
  initialData?: Partial<House>;
  onSubmit: (data: Partial<House>) => Promise<void>;
  isSubmitting: boolean;
  title: string;
}

const HouseForm: React.FC<HouseFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  title,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<House>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [staffMembers, setStaffMembers] = useState<Array<{id: string, firstName: string, lastName: string}>>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  
  // Fetch staff members for the dropdown
  useEffect(() => {
    const fetchStaffMembers = async () => {
      setIsLoadingStaff(true);
      try {
        const staffData = await getStaffMembers();
        setStaffMembers(staffData || []);
      } catch (error) {
        console.error('Error fetching staff members:', error);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    
    fetchStaffMembers();
  }, []);
  
  // List of 50 colors for the color picker
  const colorOptions = [
    { name: 'Red', value: '#FF0000' },
    { name: 'Dark Red', value: '#8B0000' },
    { name: 'Crimson', value: '#DC143C' },
    { name: 'Tomato', value: '#FF6347' },
    { name: 'Coral', value: '#FF7F50' },
    { name: 'Indian Red', value: '#CD5C5C' },
    { name: 'Orange Red', value: '#FF4500' },
    { name: 'Firebrick', value: '#B22222' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Dark Orange', value: '#FF8C00' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Khaki', value: '#F0E68C' },
    { name: 'Olive', value: '#808000' },
    { name: 'Yellow Green', value: '#9ACD32' },
    { name: 'Lime Green', value: '#32CD32' },
    { name: 'Green', value: '#008000' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Sea Green', value: '#2E8B57' },
    { name: 'Teal', value: '#008080' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Light Blue', value: '#ADD8E6' },
    { name: 'Sky Blue', value: '#87CEEB' },
    { name: 'Dodger Blue', value: '#1E90FF' },
    { name: 'Royal Blue', value: '#4169E1' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Medium Blue', value: '#0000CD' },
    { name: 'Navy', value: '#000080' },
    { name: 'Indigo', value: '#4B0082' },
    { name: 'Purple', value: '#800080' },
    { name: 'Dark Violet', value: '#9400D3' },
    { name: 'Magenta', value: '#FF00FF' },
    { name: 'Orchid', value: '#DA70D6' },
    { name: 'Medium Orchid', value: '#BA55D3' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Hot Pink', value: '#FF69B4' },
    { name: 'Deep Pink', value: '#FF1493' },
    { name: 'Brown', value: '#A52A2A' },
    { name: 'Saddle Brown', value: '#8B4513' },
    { name: 'Sienna', value: '#A0522D' },
    { name: 'Chocolate', value: '#D2691E' },
    { name: 'Peru', value: '#CD853F' },
    { name: 'Sandy Brown', value: '#F4A460' },
    { name: 'Tan', value: '#D2B48C' },
    { name: 'Beige', value: '#F5F5DC' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Gray', value: '#808080' },
    { name: 'Dark Gray', value: '#A9A9A9' },
    { name: 'Black', value: '#000000' }
  ];

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
    // Do not reset formData if initialData is empty to avoid clearing user input
    // eslint-disable-next-line
  }, [JSON.stringify(initialData)]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Separate handler for text fields to ensure they work properly
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'House name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };


  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="House Name"
              name="name"
              value={formData.name || ''}
              onChange={handleTextChange}
              required
              error={!!errors.name}
              helperText={errors.name}
              inputProps={{ 'data-testid': 'house-name-input' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>House Head</InputLabel>
              <Select
                name="houseHead"
                value={formData.houseHead || ''}
                onChange={handleChange}
                label="House Head"
                displayEmpty
                disabled={isLoadingStaff}
                inputProps={{ 'data-testid': 'house-head-input' }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {staffMembers.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </MenuItem>
                ))}
              </Select>
              {isLoadingStaff && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="caption">Loading staff members...</Typography>
                </Box>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                name="color"
                value={formData.color || ''}
                onChange={handleChange}
                label="Color"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: selected as string,
                        borderRadius: '50%',
                        border: '1px solid #ddd',
                        marginRight: 1,
                      }}
                    />
                    {colorOptions.find(color => color.value === selected)?.name || selected}
                  </Box>
                )}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: color.value,
                          borderRadius: '50%',
                          border: '1px solid #ddd',
                          marginRight: 1,
                        }}
                      />
                      {color.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleTextChange}
              multiline
              rows={4}
              inputProps={{ 'data-testid': 'house-description-input' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/academics/houses')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default HouseForm;
