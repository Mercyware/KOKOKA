import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Briefcase,
  Building2,
  MapPin,
  UserCheck,
  Loader2,
  Edit3
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormSection } from '@/components/ui/form-error';
import { useStandardForm } from '@/hooks/useStandardForm';
import { createStaffValidationRules } from '@/utils/formValidation';
import { useToast } from '@/hooks/use-toast';
import * as staffService from '../../services/staffService';
import * as departmentService from '../../services/departmentService';

interface Department {
  id: string;
  name: string;
}

interface StaffFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  staffType: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  department: string;
  position: string;
  status: string;
}

const EditStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<StaffFormData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    staffType: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    department: '',
    position: '',
    status: '',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff details
        if (id) {
          const staffResponse = await staffService.getStaffMember(id);
          const staffData = staffResponse.data;
          
          setFormData({
            employeeId: staffData.employeeId || '',
            firstName: staffData.firstName || '',
            lastName: staffData.lastName || '',
            middleName: staffData.middleName || '',
            staffType: staffData.staffType || '',
            dateOfBirth: staffData.dateOfBirth ? new Date(staffData.dateOfBirth).toISOString().split('T')[0] : '',
            gender: staffData.gender || '',
            phone: staffData.phone || '',
            streetAddress: staffData.streetAddress || '',
            city: staffData.city || '',
            state: staffData.state || '',
            zipCode: staffData.zipCode || '',
            country: staffData.country || '',
            department: staffData.department?.id || '',
            position: staffData.position || '',
            status: staffData.status || '',
          });
        }
        
        // Fetch departments
        const departmentsResponse = await departmentService.getDepartments();
        setDepartments(departmentsResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error",
          description: "Failed to fetch staff data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const validateForm = (): boolean => {
    if (!formData.employeeId.trim()) {
      toast({
        title: "Error",
        description: "Employee ID is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.firstName.trim()) {
      toast({
        title: "Error", 
        description: "First name is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "Last name is required", 
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.staffType) {
      toast({
        title: "Error",
        description: "Staff type is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.dateOfBirth) {
      toast({
        title: "Error",
        description: "Date of birth is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.gender) {
      toast({
        title: "Error",
        description: "Gender is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.department) {
      toast({
        title: "Error",
        description: "Department is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.position.trim()) {
      toast({
        title: "Error",
        description: "Position is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      if (id) {
        // Convert formData to StaffUpdateData format
        const updateData: staffService.StaffUpdateData = {
          employeeId: formData.employeeId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          staffType: formData.staffType as any,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as any,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          departmentId: formData.department,
          position: formData.position,
          status: formData.status as any,
        };
        
        await staffService.updateStaffMember(id, updateData);
        
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/staff/${id}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error updating staff:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to update staff member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading staff details...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="h-8 w-8 text-blue-600" />
              Edit Staff Member
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update staff member information
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/staff/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    placeholder="Enter middle name (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="e.g., EMP2024001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234-567-8900"
                    required
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="staffType">Staff Type *</Label>
                  <Select
                    value={formData.staffType}
                    onValueChange={(value) => handleInputChange('staffType', value)}
                    required
                  >
                    <SelectTrigger id="staffType">
                      <SelectValue placeholder="Select staff type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                      <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                      <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="COUNSELOR">Counselor</SelectItem>
                      <SelectItem value="NURSE">Nurse</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="e.g., Math Teacher, Principal"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State/Province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Zip/Postal code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/staff/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Staff Member...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Staff Member
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditStaff;
