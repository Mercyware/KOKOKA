import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchSections, fetchHouses } from '@/services/api';
import { House } from '@/types';
import { Section } from '@/types/Section';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import api from '@/services/api';
import { createStudent } from '@/services/studentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { getClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useNavigate } from 'react-router-dom';

interface AddStudentFormProps {
  onBack: () => void;
  onSave?: (student: any) => void;
}

const AddStudentForm = ({ onBack, onSave }: AddStudentFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',

    // Academic Information
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    class: '',
    section: '',
    academicYear: '',
    house: '',
    rollNumber: '',
    status: 'active' as 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled',

    // Physical & Medical Information
    bloodGroup: '' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '',
    height: {
      value: '',
      unit: 'cm' as 'cm' | 'in'
    },
    weight: {
      value: '',
      unit: 'kg' as 'kg' | 'lb'
    },
    healthInfo: {
      allergies: [] as string[],
      medicalConditions: [] as string[],
      medications: [] as string[],
      dietaryRestrictions: [] as string[],
      disabilities: [] as string[]
    },

    // Contact Information
    contactInfo: {
      phone: '',
      alternativePhone: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },

    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },

    // Guardian Information
    guardians: [{
      firstName: '',
      lastName: '',
      relationship: '' as 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'sibling' | 'legal guardian' | 'other' | '',
      phone: '',
      email: '',
      occupation: '',
      isPrimary: true
    }]
  });

  // Fetch classes and academic years on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsResponse = await fetchSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
      try {
        const classesResponse = await getClasses();
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }

        const academicYearsResponse = await getAllAcademicYears();
        if (academicYearsResponse.data) {
          setAcademicYears(academicYearsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();

    const fetchHousesData = async () => {
      try {
        const housesResponse = await fetchHouses();
        if (housesResponse.success && housesResponse.data) {
          setHouses(housesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching houses:', error);
      }
    };

    fetchHousesData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter guardians to only include those with required fields filled
      const validGuardians = formData.guardians.filter(guardian =>
        guardian.firstName &&
        guardian.lastName &&
        guardian.relationship &&
        guardian.phone
      );

      // Convert string dates to Date objects and ensure proper types
      const studentData = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        email: formData.email || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: (formData.gender === 'male' || formData.gender === 'female' || formData.gender === 'other')
          ? formData.gender
          : undefined,

        // Academic Information
        admissionNumber: formData.admissionNumber,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : undefined,
        class: formData.class,
        section: formData.section || undefined,
        academicYear: formData.academicYear || undefined,
        house: formData.house || undefined,
        rollNumber: formData.rollNumber || undefined,
        status: formData.status,

        // Physical & Medical Information
        bloodGroup: formData.bloodGroup || undefined,
        height: formData.height.value ? {
          value: parseFloat(formData.height.value as string),
          unit: formData.height.unit
        } : undefined,
        weight: formData.weight.value ? {
          value: parseFloat(formData.weight.value as string),
          unit: formData.weight.unit
        } : undefined,
        healthInfo: (
          formData.healthInfo.allergies.length > 0 ||
          formData.healthInfo.medicalConditions.length > 0 ||
          formData.healthInfo.medications.length > 0 ||
          formData.healthInfo.dietaryRestrictions.length > 0 ||
          formData.healthInfo.disabilities.length > 0
        ) ? formData.healthInfo : undefined,

        // Contact Information
        contactInfo: {
          phone: formData.contactInfo.phone || undefined,
          alternativePhone: formData.contactInfo.alternativePhone || undefined,
          emergencyContact: (
            formData.contactInfo.emergencyContact.name ||
            formData.contactInfo.emergencyContact.relationship ||
            formData.contactInfo.emergencyContact.phone
          ) ? formData.contactInfo.emergencyContact : undefined
        },

        // Address Information
        address: (
          formData.address.street ||
          formData.address.city ||
          formData.address.state ||
          formData.address.zipCode ||
          formData.address.country
        ) ? formData.address : undefined,

        // Guardian Information
        guardiansData: validGuardians.length > 0 ? validGuardians : undefined
      };

      const response = await createStudent(studentData);

      if (response.success) {
        toast({
          title: 'Student added successfully!',
          description: 'The student profile has been created.',
          variant: 'default',
        });
        setTimeout(() => {
          navigate('/students');
        }, 500); // Give the toast a moment to show
        if (onSave && response.data) {
          onSave(response.data);
        }
      } else {
        console.error('Failed to save student:', response.error);
        toast({
          title: 'Failed to save student',
          description: response.message || response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the student. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof typeof prev];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGuardianChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      guardians: [
        {
          ...prev.guardians[0],
          [field]: value
        }
      ]
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new student profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Accordion type="multiple" defaultValue={["personal-info"]}>
              <AccordionItem value="personal-info">
                <AccordionTrigger>Personal Information</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={formData.middleName}
                        onChange={(e) => handleChange('middleName', e.target.value)}
                        placeholder="Enter middle name (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="student@school.edu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                        placeholder="+1 234-567-8900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <div className="relative">
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        onValueChange={(value: 'male' | 'female' | 'other') => handleChange('gender', value)}
                        required
                        value={formData.gender}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="academic-info">
                <AccordionTrigger>Academic Information</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="admissionNumber">Admission Number *</Label>
                      <Input
                        id="admissionNumber"
                        value={formData.admissionNumber}
                        onChange={(e) => handleChange('admissionNumber', e.target.value)}
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
                          onChange={(e) => handleChange('admissionDate', e.target.value)}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year *</Label>
                      <Select onValueChange={(value) => handleChange('academicYear', value)} required>
                        <SelectTrigger id="academicYear">
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year._id || year.id} value={year._id || year.id}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select onValueChange={(value) => handleChange('class', value)} required>
                        <SelectTrigger id="class">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section">Section *</Label>
                      <Select onValueChange={(value) => handleChange('section', value)} required>
                        <SelectTrigger id="section">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section._id} value={section._id}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="house">House</Label>
                      <Select onValueChange={(value) => handleChange('house', value)}>
                        <SelectTrigger id="house">
                          <SelectValue placeholder="Select house" />
                        </SelectTrigger>
                        <SelectContent>
                          {houses.map((house) => (
                            <SelectItem key={house.id} value={house.id}>
                              {house.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parent-info">
                <AccordionTrigger>Parent/Guardian Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {formData.guardians.map((guardian, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">
                            Guardian {index + 1} {guardian.isPrimary && <span className="text-sm text-blue-600">(Primary)</span>}
                          </h3>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].isPrimary = true;
                                newGuardians.forEach((g, i) => {
                                  if (i !== index) g.isPrimary = false;
                                });
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              disabled={guardian.isPrimary}
                            >
                              Set as Primary
                            </Button>
                            {formData.guardians.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newGuardians = [...formData.guardians];
                                  newGuardians.splice(index, 1);

                                  // If we removed the primary guardian, make the first one primary
                                  if (guardian.isPrimary && newGuardians.length > 0) {
                                    newGuardians[0].isPrimary = true;
                                  }

                                  setFormData(prev => ({ ...prev, guardians: newGuardians }));
                                }}
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
                              onChange={(e) => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].firstName = e.target.value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              placeholder="Guardian's first name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-lastName`}>Last Name *</Label>
                            <Input
                              id={`guardian-${index}-lastName`}
                              value={guardian.lastName}
                              onChange={(e) => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].lastName = e.target.value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              placeholder="Guardian's last name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-relationship`}>Relationship *</Label>
                            <Select
                              value={guardian.relationship}
                              onValueChange={(value: 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'sibling' | 'legal guardian' | 'other') => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].relationship = value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              required
                            >
                              <SelectTrigger id={`guardian-${index}-relationship`}>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="grandfather">Grandfather</SelectItem>
                                <SelectItem value="grandmother">Grandmother</SelectItem>
                                <SelectItem value="uncle">Uncle</SelectItem>
                                <SelectItem value="aunt">Aunt</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="legal guardian">Legal Guardian</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-phone`}>Phone Number *</Label>
                            <Input
                              id={`guardian-${index}-phone`}
                              value={guardian.phone}
                              onChange={(e) => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].phone = e.target.value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
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
                              onChange={(e) => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].email = e.target.value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              placeholder="guardian@example.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-occupation`}>Occupation</Label>
                            <Input
                              id={`guardian-${index}-occupation`}
                              value={guardian.occupation}
                              onChange={(e) => {
                                const newGuardians = [...formData.guardians];
                                newGuardians[index].occupation = e.target.value;
                                setFormData(prev => ({ ...prev, guardians: newGuardians }));
                              }}
                              placeholder="Guardian's occupation"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          guardians: [
                            ...prev.guardians,
                            {
                              firstName: '',
                              lastName: '',
                              relationship: '' as 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'sibling' | 'legal guardian' | 'other' | '',
                              phone: '',
                              email: '',
                              occupation: '',
                              isPrimary: false
                            }
                          ]
                        }));
                      }}
                    >
                      Add Another Guardian
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="physical-info">
                <AccordionTrigger>Physical & Medical Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Select onValueChange={(value) => handleChange('bloodGroup', value)}>
                          <SelectTrigger id="bloodGroup">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="height"
                            type="number"
                            value={formData.height.value}
                            onChange={(e) => handleChange('height.value', e.target.value)}
                            placeholder="Height"
                            className="flex-1"
                          />
                          <Select
                            value={formData.height.unit}
                            onValueChange={(value: 'cm' | 'in') => handleChange('height.unit', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="weight"
                            type="number"
                            value={formData.weight.value}
                            onChange={(e) => handleChange('weight.value', e.target.value)}
                            placeholder="Weight"
                            className="flex-1"
                          />
                          <Select
                            value={formData.weight.unit}
                            onValueChange={(value: 'kg' | 'lb') => handleChange('weight.unit', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Medical Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Input
                            id="allergies"
                            value={formData.healthInfo.allergies.join(', ')}
                            onChange={(e) => {
                              const allergiesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                              setFormData(prev => ({
                                ...prev,
                                healthInfo: {
                                  ...prev.healthInfo,
                                  allergies: allergiesArray
                                }
                              }));
                            }}
                            placeholder="List allergies, separated by commas"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medicalConditions">Medical Conditions</Label>
                          <Input
                            id="medicalConditions"
                            value={formData.healthInfo.medicalConditions.join(', ')}
                            onChange={(e) => {
                              const conditionsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                              setFormData(prev => ({
                                ...prev,
                                healthInfo: {
                                  ...prev.healthInfo,
                                  medicalConditions: conditionsArray
                                }
                              }));
                            }}
                            placeholder="List medical conditions, separated by commas"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medications">Medications</Label>
                          <Input
                            id="medications"
                            value={formData.healthInfo.medications.join(', ')}
                            onChange={(e) => {
                              const medicationsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                              setFormData(prev => ({
                                ...prev,
                                healthInfo: {
                                  ...prev.healthInfo,
                                  medications: medicationsArray
                                }
                              }));
                            }}
                            placeholder="List medications, separated by commas"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                          <Input
                            id="dietaryRestrictions"
                            value={formData.healthInfo.dietaryRestrictions.join(', ')}
                            onChange={(e) => {
                              const restrictionsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                              setFormData(prev => ({
                                ...prev,
                                healthInfo: {
                                  ...prev.healthInfo,
                                  dietaryRestrictions: restrictionsArray
                                }
                              }));
                            }}
                            placeholder="List dietary restrictions, separated by commas"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="disabilities">Disabilities</Label>
                          <Input
                            id="disabilities"
                            value={formData.healthInfo.disabilities.join(', ')}
                            onChange={(e) => {
                              const disabilitiesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                              setFormData(prev => ({
                                ...prev,
                                healthInfo: {
                                  ...prev.healthInfo,
                                  disabilities: disabilitiesArray
                                }
                              }));
                            }}
                            placeholder="List disabilities, separated by commas"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="additional-details">
                <AccordionTrigger>Address Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => handleChange('address.street', e.target.value)}
                          placeholder="Street address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => handleChange('address.city', e.target.value)}
                          placeholder="City"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={formData.address.state}
                          onChange={(e) => handleChange('address.state', e.target.value)}
                          placeholder="State/Province"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip/Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.address.zipCode}
                          onChange={(e) => handleChange('address.zipCode', e.target.value)}
                          placeholder="Zip/Postal code"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.address.country}
                          onChange={(e) => handleChange('address.country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span>Save Student</span>
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddStudentForm;
