import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Users, 
  User, 
  GraduationCap, 
  MapPin, 
  Phone,
  Mail,
  Calendar,
  UserCheck,
  Loader2
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createStudent } from '@/services/studentService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { fetchHouses } from '@/services/api';

interface Guardian {
  firstName: string;
  lastName: string;
  middleName?: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
  isPrimary: boolean;
  emergencyContact?: boolean;
  authorizedPickup?: boolean;
  financialResponsibility?: boolean;
}

const CreateStudent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    
    // Academic Information
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    academicYear: '',
    class: '',
    house: '',
    status: 'ACTIVE',
    
    // Address Information
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Guardian Information
    guardians: [{
      firstName: '',
      lastName: '',
      middleName: '',
      relationship: '',
      phone: '',
      email: '',
      occupation: '',
      isPrimary: true,
      emergencyContact: true,
      authorizedPickup: true,
      financialResponsibility: true
    }] as Guardian[]
  });

  // Options state
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const fetchFormOptions = async () => {
    try {
      const [classesResponse, academicYearsResponse, housesResponse] = await Promise.all([
        getAllClasses(),
        getAllAcademicYears(),
        fetchHouses()
      ]);

      if (classesResponse.data) {
        setClasses(classesResponse.data);
      }

      if (academicYearsResponse.data) {
        setAcademicYears(academicYearsResponse.data);
      }

      if (housesResponse.success && housesResponse.data) {
        setHouses(housesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching form options:', error);
      toast({
        title: "Error",
        description: "Failed to load form options",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuardianChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.map((guardian, i) => 
        i === index ? { ...guardian, [field]: value } : guardian
      )
    }));
  };

  const addGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          firstName: '',
          lastName: '',
          middleName: '',
          relationship: '',
          phone: '',
          email: '',
          occupation: '',
          isPrimary: false,
          emergencyContact: false,
          authorizedPickup: false,
          financialResponsibility: false
        }
      ]
    }));
  };

  const removeGuardian = (index: number) => {
    if (formData.guardians.length > 1) {
      setFormData(prev => ({
        ...prev,
        guardians: prev.guardians.filter((_, i) => i !== index)
      }));
    }
  };

  const setPrimaryGuardian = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.map((guardian, i) => ({
        ...guardian,
        isPrimary: i === index
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.admissionNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one guardian
    const validGuardians = formData.guardians.filter(guardian =>
      guardian.firstName.trim() &&
      guardian.lastName.trim() &&
      guardian.relationship.trim() &&
      guardian.phone.trim()
    );

    if (validGuardians.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one guardian with complete information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        ...formData,
        guardians: validGuardians
      };

      const response = await createStudent(studentData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Student created successfully",
        });
        navigate('/students');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create student",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-siohioma-primary" />
              Add New Student
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new student profile with complete information
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-siohioma-primary" />
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="student@school.edu"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234-567-8900"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-siohioma-primary" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number *</Label>
                  <Input
                    id="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                    placeholder="e.g., ADM2023001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <div className="relative">
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) => handleInputChange('academicYear', value)}
                    required
                  >
                    <SelectTrigger id="academicYear">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => handleInputChange('class', value)}
                    required
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(classItem => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="house">House</Label>
                  <Select
                    value={formData.house}
                    onValueChange={(value) => handleInputChange('house', value)}
                  >
                    <SelectTrigger id="house">
                      <SelectValue placeholder="Select house" />
                    </SelectTrigger>
                    <SelectContent>
                      {houses.map(house => (
                        <SelectItem key={house.id} value={house.id}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-siohioma-primary" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State/Province"
                  />
                </div>
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

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-siohioma-primary" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.guardians.map((guardian, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Guardian {index + 1} {guardian.isPrimary && <span className="text-sm text-siohioma-primary">(Primary)</span>}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryGuardian(index)}
                        disabled={guardian.isPrimary}
                      >
                        Set as Primary
                      </Button>
                      {formData.guardians.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGuardian(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-firstName`}>First Name *</Label>
                      <Input
                        id={`guardian-${index}-firstName`}
                        value={guardian.firstName}
                        onChange={(e) => handleGuardianChange(index, 'firstName', e.target.value)}
                        placeholder="Guardian's first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-lastName`}>Last Name *</Label>
                      <Input
                        id={`guardian-${index}-lastName`}
                        value={guardian.lastName}
                        onChange={(e) => handleGuardianChange(index, 'lastName', e.target.value)}
                        placeholder="Guardian's last name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-relationship`}>Relationship *</Label>
                      <Select
                        value={guardian.relationship}
                        onValueChange={(value) => handleGuardianChange(index, 'relationship', value)}
                        required
                      >
                        <SelectTrigger id={`guardian-${index}-relationship`}>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FATHER">Father</SelectItem>
                          <SelectItem value="MOTHER">Mother</SelectItem>
                          <SelectItem value="GRANDFATHER">Grandfather</SelectItem>
                          <SelectItem value="GRANDMOTHER">Grandmother</SelectItem>
                          <SelectItem value="UNCLE">Uncle</SelectItem>
                          <SelectItem value="AUNT">Aunt</SelectItem>
                          <SelectItem value="SIBLING">Sibling</SelectItem>
                          <SelectItem value="LEGAL_GUARDIAN">Legal Guardian</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-phone`}>Phone Number *</Label>
                      <Input
                        id={`guardian-${index}-phone`}
                        value={guardian.phone}
                        onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}
                        placeholder="+1 234-567-8900"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-email`}>Email Address</Label>
                      <Input
                        id={`guardian-${index}-email`}
                        type="email"
                        value={guardian.email}
                        onChange={(e) => handleGuardianChange(index, 'email', e.target.value)}
                        placeholder="guardian@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-occupation`}>Occupation</Label>
                      <Input
                        id={`guardian-${index}-occupation`}
                        value={guardian.occupation}
                        onChange={(e) => handleGuardianChange(index, 'occupation', e.target.value)}
                        placeholder="Guardian's occupation"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addGuardian}
              >
                Add Another Guardian
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/students')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-siohioma-primary hover:bg-siohioma-primary/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Student...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Student
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateStudent;