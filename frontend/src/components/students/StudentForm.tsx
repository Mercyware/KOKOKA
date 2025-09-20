// StudentForm.tsx
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Calendar, ArrowLeft } from 'lucide-react';

interface Guardian {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string;
  occupation: string;
  isPrimary: boolean;
  [key: string]: any;
}

interface StudentFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  admissionNumber: string;
  admissionDate: string;
  class: string;
  section: string;
  academicYear: string;
  house: string;
  rollNumber: string;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  
  // Additional Personal Information
  placeOfBirth: string;
  nationality: string;
  religion: string;
  motherTongue: string;
  previousSchool: string;
  previousClass: string;
  tcNumber: string;
  tcDate: string;
  
  // Blood group and physical info
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '';
  height: { value: string; unit: 'cm' | 'in' };
  weight: { value: string; unit: 'kg' | 'lb' };
  
  // Comprehensive Medical Information
  medicalInfo: {
    height: string;
    weight: string;
    lastCheckup: string;
    generalHealth: string;
    bloodType: string;
    physicianName: string;
    physicianPhone: string;
  };
  allergies: string[];
  medications: {
    current: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
  medicalConditions: string[];
  immunizations: {
    completed: string[];
    pending: string[];
    lastUpdated: string;
  };
  emergencyMedicalInfo: string;
  doctorName: string;
  doctorPhone: string;
  hospitalPreference: string;
  
  // Health info (legacy compatibility)
  healthInfo: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
    dietaryRestrictions: string[];
    disabilities: string[];
  };
  
  // Emergency Contacts (separate from guardians)
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    isPrimary: boolean;
  }>;
  
  // Contact info
  contactInfo: {
    phone: string;
    alternativePhone: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  
  // Current Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Permanent Address
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Academic Background
  previousAcademicRecord: {
    previousSchool: string;
    previousGrade: string;
    subjects: string[];
    performance: string;
    teacherRecommendations: string;
  };
  specialNeeds: string;
  talents: string[];
  extracurriculars: string[];
  
  // Administrative Information
  applicationDate: string;
  interviewDate: string;
  admissionTestScore: number;
  feesPaid: number;
  scholarshipInfo: {
    type: string;
    amount: number;
    percentage: number;
  } | null;
  transportInfo: {
    mode: string;
    busRoute: string;
    pickupPoint: string;
    dropoffPoint: string;
  };
  
  // Behavioral and Social Information
  behavioralNotes: string;
  socialBackground: string;
  languagesSpoken: string[];
  
  // Documents and Identification
  identificationDocs: {
    birthCertificate: boolean;
    passport: boolean;
    socialSecurityCard: boolean;
  };
  photographs: {
    passport: number;
    school: number;
  };
  documentsSubmitted: string[];
  
  guardians: Guardian[];
}

interface StudentFormProps {
  initialValues: StudentFormData;
  onSubmit: (formData: StudentFormData) => void;
  onBack: () => void;
  loading: boolean;
  submitLabel: string;
  sections: any[];
  classes: any[];
  academicYears: any[];
  houses: any[];
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialValues,
  onSubmit,
  onBack,
  loading,
  submitLabel,
  sections,
  classes,
  academicYears,
  houses,
}) => {
  const [formData, setFormData] = useState<StudentFormData>(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (field: string, value: string) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(formData);
        }}
        className="p-6"
      >
      {/* Form Progress Indicator */}
      <div className="mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Complete Student Information</h3>
              <p className="text-xs text-blue-700 mt-1">Fill out all sections to create a comprehensive student profile</p>
            </div>
          </div>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["personal-info"]} className="space-y-4">
        {/* Personal Information */}
        <AccordionItem value="personal-info" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500">Basic student details and contact information</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={e => handleChange('middleName', e.target.value)}
                  placeholder="Enter middle name (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
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
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="student@school.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.contactInfo.phone}
                  onChange={e => handleChange('contactInfo.phone', e.target.value)}
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
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
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
                  onValueChange={value => handleChange('gender', value)}
                  required
                  value={formData.gender || ''}
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
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={e => handleChange('placeOfBirth', e.target.value)}
                  placeholder="Enter place of birth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={e => handleChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={e => handleChange('religion', e.target.value)}
                  placeholder="Enter religion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherTongue">Mother Tongue</Label>
                <Input
                  id="motherTongue"
                  value={formData.motherTongue}
                  onChange={e => handleChange('motherTongue', e.target.value)}
                  placeholder="Enter mother tongue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languagesSpoken">Languages Spoken</Label>
                <Input
                  id="languagesSpoken"
                  value={(formData.languagesSpoken || []).join(', ')}
                  onChange={e => {
                    const languagesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, languagesSpoken: languagesArray }));
                  }}
                  placeholder="List languages, separated by commas"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Academic Information */}
        <AccordionItem value="academic-info" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Academic Information</h3>
                <p className="text-sm text-gray-500">Class assignment and academic details</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number *</Label>
                <Input
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={e => handleChange('admissionNumber', e.target.value)}
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
                    onChange={e => handleChange('admissionDate', e.target.value)}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={formData.academicYear || ''}
                  onValueChange={value => handleChange('academicYear', value)}
                  required
                >
                  <SelectTrigger id="academicYear">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {(academicYears || []).map(year => (
                      <SelectItem key={year._id || year.id} value={year._id || year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={formData.class || ''}
                  onValueChange={value => handleChange('class', value)}
                  required
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes || []).map(classItem => (
                      <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={formData.section || ''}
                  onValueChange={value => handleChange('section', value)}
                  required
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sections || []).map(section => {
                      // Find the selected class name
                      const selectedClass = (classes || []).find(c => (c._id || c.id) === formData.class);
                      const classPrefix = selectedClass ? `${selectedClass.name} - ` : '';
                      
                      return (
                        <SelectItem key={section._id || section.id} value={section._id || section.id}>
                          {classPrefix}Section {section.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="house">House</Label>
                <Select
                  value={formData.house || ''}
                  onValueChange={value => handleChange('house', value)}
                >
                  <SelectTrigger id="house">
                    <SelectValue placeholder="Select house" />
                  </SelectTrigger>
                  <SelectContent>
                    {(houses || []).map(house => (
                      <SelectItem key={house.id} value={house.id}>
                        {house.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input
                  id="previousSchool"
                  value={formData.previousSchool}
                  onChange={e => handleChange('previousSchool', e.target.value)}
                  placeholder="Previous school name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousClass">Previous Class</Label>
                <Input
                  id="previousClass"
                  value={formData.previousClass}
                  onChange={e => handleChange('previousClass', e.target.value)}
                  placeholder="Previous class/grade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tcNumber">Transfer Certificate Number</Label>
                <Input
                  id="tcNumber"
                  value={formData.tcNumber}
                  onChange={e => handleChange('tcNumber', e.target.value)}
                  placeholder="TC Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tcDate">Transfer Certificate Date</Label>
                <Input
                  id="tcDate"
                  type="date"
                  value={formData.tcDate}
                  onChange={e => handleChange('tcDate', e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Academic Background */}
        <AccordionItem value="academic-background" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Academic Background</h3>
                <p className="text-sm text-gray-500">Previous education and performance history</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="previousAcademicSchool">Previous School Name</Label>
                  <Input
                    id="previousAcademicSchool"
                    value={formData.previousAcademicRecord.previousSchool}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        previousAcademicRecord: {
                          ...prev.previousAcademicRecord,
                          previousSchool: e.target.value
                        }
                      }));
                    }}
                    placeholder="Name of previous school"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousGrade">Previous Grade/Class</Label>
                  <Input
                    id="previousGrade"
                    value={formData.previousAcademicRecord.previousGrade}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        previousAcademicRecord: {
                          ...prev.previousAcademicRecord,
                          previousGrade: e.target.value
                        }
                      }));
                    }}
                    placeholder="Previous grade or class"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="previousSubjects">Previous Subjects</Label>
                  <Input
                    id="previousSubjects"
                    value={(formData.previousAcademicRecord.subjects || []).join(', ')}
                    onChange={e => {
                      const subjectsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                      setFormData(prev => ({
                        ...prev,
                        previousAcademicRecord: {
                          ...prev.previousAcademicRecord,
                          subjects: subjectsArray
                        }
                      }));
                    }}
                    placeholder="List subjects, separated by commas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicPerformance">Academic Performance</Label>
                  <Select
                    value={formData.previousAcademicRecord.performance || ''}
                    onValueChange={value => {
                      setFormData(prev => ({
                        ...prev,
                        previousAcademicRecord: {
                          ...prev.previousAcademicRecord,
                          performance: value
                        }
                      }));
                    }}
                  >
                    <SelectTrigger id="academicPerformance">
                      <SelectValue placeholder="Select performance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Very Good">Very Good</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Below Average">Below Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherRecommendations">Teacher Recommendations</Label>
                <Input
                  id="teacherRecommendations"
                  value={formData.previousAcademicRecord.teacherRecommendations}
                  onChange={e => {
                    setFormData(prev => ({
                      ...prev,
                      previousAcademicRecord: {
                        ...prev.previousAcademicRecord,
                        teacherRecommendations: e.target.value
                      }
                    }));
                  }}
                  placeholder="Teacher recommendations or comments"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="talents">Special Talents</Label>
                  <Input
                    id="talents"
                    value={(formData.talents || []).join(', ')}
                    onChange={e => {
                      const talentsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, talents: talentsArray }));
                    }}
                    placeholder="List talents, separated by commas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extracurriculars">Extracurricular Activities</Label>
                  <Input
                    id="extracurriculars"
                    value={(formData.extracurriculars || []).join(', ')}
                    onChange={e => {
                      const activitiesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, extracurriculars: activitiesArray }));
                    }}
                    placeholder="List activities, separated by commas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Special Educational Needs</Label>
                <Input
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={e => handleChange('specialNeeds', e.target.value)}
                  placeholder="Describe any special educational needs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Guardian Information */}
        <AccordionItem value="parent-info" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Parent/Guardian Information</h3>
                <p className="text-sm text-gray-500">Contact details for parents and guardians</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {(formData.guardians || []).map((guardian, index) => (
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
                        onChange={e => {
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
                        onChange={e => {
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
                        value={guardian.relationship || ''}
                        onValueChange={value => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        relationship: '',
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
        {/* Comprehensive Medical Information */}
        <AccordionItem value="medical-info">
          <AccordionTrigger>Comprehensive Medical Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Basic Medical Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalHeight">Height (Medical Record)</Label>
                  <Input
                    id="medicalHeight"
                    value={formData.medicalInfo.height}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, height: e.target.value }
                      }));
                    }}
                    placeholder="e.g., 140cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalWeight">Weight (Medical Record)</Label>
                  <Input
                    id="medicalWeight"
                    value={formData.medicalInfo.weight}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, weight: e.target.value }
                      }));
                    }}
                    placeholder="e.g., 35kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastCheckup">Last Medical Checkup</Label>
                  <Input
                    id="lastCheckup"
                    type="date"
                    value={formData.medicalInfo.lastCheckup}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, lastCheckup: e.target.value }
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="generalHealth">General Health Status</Label>
                  <Select
                    value={formData.medicalInfo.generalHealth || ''}
                    onValueChange={value => {
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, generalHealth: value }
                      }));
                    }}
                  >
                    <SelectTrigger id="generalHealth">
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Very Good">Very Good</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalBloodType">Blood Type</Label>
                  <Input
                    id="medicalBloodType"
                    value={formData.medicalInfo.bloodType}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, bloodType: e.target.value }
                      }));
                    }}
                    placeholder="e.g., O+"
                  />
                </div>
              </div>

              {/* Doctor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Primary Care Physician</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="physicianName">Physician Name</Label>
                    <Input
                      id="physicianName"
                      value={formData.medicalInfo.physicianName}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          medicalInfo: { ...prev.medicalInfo, physicianName: e.target.value }
                        }));
                      }}
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physicianPhone">Physician Phone</Label>
                    <Input
                      id="physicianPhone"
                      value={formData.medicalInfo.physicianPhone}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          medicalInfo: { ...prev.medicalInfo, physicianPhone: e.target.value }
                        }));
                      }}
                      placeholder="+1-555-DOCTOR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalPreference">Preferred Hospital</Label>
                    <Input
                      id="hospitalPreference"
                      value={formData.hospitalPreference}
                      onChange={e => handleChange('hospitalPreference', e.target.value)}
                      placeholder="General Hospital"
                    />
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Medications</h3>
                {(formData.medications.current || []).map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      {(formData.medications.current || []).length > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newMedications = [...formData.medications.current];
                            newMedications.splice(index, 1);
                            setFormData(prev => ({
                              ...prev,
                              medications: { ...prev.medications, current: newMedications }
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`medication-${index}-name`}>Medication Name</Label>
                        <Input
                          id={`medication-${index}-name`}
                          value={medication.name}
                          onChange={e => {
                            const newMedications = [...formData.medications.current];
                            newMedications[index].name = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              medications: { ...prev.medications, current: newMedications }
                            }));
                          }}
                          placeholder="Medication name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`medication-${index}-dosage`}>Dosage</Label>
                        <Input
                          id={`medication-${index}-dosage`}
                          value={medication.dosage}
                          onChange={e => {
                            const newMedications = [...formData.medications.current];
                            newMedications[index].dosage = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              medications: { ...prev.medications, current: newMedications }
                            }));
                          }}
                          placeholder="e.g., 10mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`medication-${index}-frequency`}>Frequency</Label>
                        <Input
                          id={`medication-${index}-frequency`}
                          value={medication.frequency}
                          onChange={e => {
                            const newMedications = [...formData.medications.current];
                            newMedications[index].frequency = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              medications: { ...prev.medications, current: newMedications }
                            }));
                          }}
                          placeholder="e.g., Twice daily"
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
                      medications: {
                        ...prev.medications,
                        current: [
                          ...prev.medications.current,
                          { name: '', dosage: '', frequency: '' }
                        ]
                      }
                    }));
                  }}
                >
                  Add Medication
                </Button>
              </div>

              {/* Immunizations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Immunization Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="completedImmunizations">Completed Immunizations</Label>
                    <Input
                      id="completedImmunizations"
                      value={(formData.immunizations.completed || []).join(', ')}
                      onChange={e => {
                        const immunizationsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                        setFormData(prev => ({
                          ...prev,
                          immunizations: {
                            ...prev.immunizations,
                            completed: immunizationsArray
                          }
                        }));
                      }}
                      placeholder="List completed immunizations, separated by commas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pendingImmunizations">Pending Immunizations</Label>
                    <Input
                      id="pendingImmunizations"
                      value={(formData.immunizations.pending || []).join(', ')}
                      onChange={e => {
                        const pendingArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                        setFormData(prev => ({
                          ...prev,
                          immunizations: {
                            ...prev.immunizations,
                            pending: pendingArray
                          }
                        }));
                      }}
                      placeholder="List pending immunizations, separated by commas"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="immunizationLastUpdated">Last Updated</Label>
                  <Input
                    id="immunizationLastUpdated"
                    type="date"
                    value={formData.immunizations.lastUpdated}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        immunizations: {
                          ...prev.immunizations,
                          lastUpdated: e.target.value
                        }
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Emergency Medical Information */}
              <div className="space-y-2">
                <Label htmlFor="emergencyMedicalInfo">Emergency Medical Information</Label>
                <Input
                  id="emergencyMedicalInfo"
                  value={formData.emergencyMedicalInfo}
                  onChange={e => handleChange('emergencyMedicalInfo', e.target.value)}
                  placeholder="Critical medical information for emergencies"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Emergency Contacts */}
        <AccordionItem value="emergency-contacts">
          <AccordionTrigger>Emergency Contacts</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {(formData.emergencyContacts || []).map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Emergency Contact {index + 1} {contact.isPrimary && <span className="text-sm text-blue-600">(Primary)</span>}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].isPrimary = true;
                          newContacts.forEach((c, i) => {
                            if (i !== index) c.isPrimary = false;
                          });
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        disabled={contact.isPrimary}
                      >
                        Set as Primary
                      </Button>
                      {formData.emergencyContacts.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newContacts = [...formData.emergencyContacts];
                            newContacts.splice(index, 1);
                            if (contact.isPrimary && newContacts.length > 0) {
                              newContacts[0].isPrimary = true;
                            }
                            setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`emergency-${index}-name`}>Full Name *</Label>
                      <Input
                        id={`emergency-${index}-name`}
                        value={contact.name}
                        onChange={e => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        placeholder="Emergency contact's full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergency-${index}-relationship`}>Relationship *</Label>
                      <Select
                        value={contact.relationship || ''}
                        onValueChange={value => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].relationship = value;
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        required
                      >
                        <SelectTrigger id={`emergency-${index}-relationship`}>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Relative">Relative</SelectItem>
                          <SelectItem value="Family Friend">Family Friend</SelectItem>
                          <SelectItem value="Neighbor">Neighbor</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergency-${index}-phone`}>Phone Number *</Label>
                      <Input
                        id={`emergency-${index}-phone`}
                        value={contact.phone}
                        onChange={e => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].phone = e.target.value;
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        placeholder="+1-555-EMERGENCY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergency-${index}-email`}>Email Address</Label>
                      <Input
                        id={`emergency-${index}-email`}
                        type="email"
                        value={contact.email}
                        onChange={e => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].email = e.target.value;
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        placeholder="emergency@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`emergency-${index}-address`}>Address</Label>
                    <Input
                      id={`emergency-${index}-address`}
                      value={contact.address}
                      onChange={e => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index].address = e.target.value;
                        setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                      }}
                      placeholder="Full address"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    emergencyContacts: [
                      ...prev.emergencyContacts,
                      {
                        name: '',
                        relationship: '',
                        phone: '',
                        email: '',
                        address: '',
                        isPrimary: false
                      }
                    ]
                  }));
                }}
              >
                Add Another Emergency Contact
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Physical & Medical Information (Legacy) */}
        <AccordionItem value="physical-info">
          <AccordionTrigger>Physical & Medical Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup || ''}
                    onValueChange={value => handleChange('bloodGroup', value)}
                  >
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
                      onChange={e => handleChange('height.value', e.target.value)}
                      placeholder="Height"
                      className="flex-1"
                    />
                    <Select
                      value={formData.height.unit || ''}
                      onValueChange={value => handleChange('height.unit', value)}
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
                      onChange={e => handleChange('weight.value', e.target.value)}
                      placeholder="Weight"
                      className="flex-1"
                    />
                    <Select
                      value={formData.weight.unit || ''}
                      onValueChange={value => handleChange('weight.unit', value)}
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
                      value={(formData.healthInfo.allergies || []).join(', ')}
                      onChange={e => {
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
                      value={(formData.healthInfo.medicalConditions || []).join(', ')}
                      onChange={e => {
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
                      value={(formData.healthInfo.medications || []).join(', ')}
                      onChange={e => {
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
                      value={(formData.healthInfo.dietaryRestrictions || []).join(', ')}
                      onChange={e => {
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
                      value={(formData.healthInfo.disabilities || []).join(', ')}
                      onChange={e => {
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
        {/* Address Information */}
        <AccordionItem value="address-info">
          <AccordionTrigger>Address Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Current Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={e => handleChange('address.street', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={e => handleChange('address.city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={e => handleChange('address.state', e.target.value)}
                      placeholder="State/Province"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={e => handleChange('address.zipCode', e.target.value)}
                      placeholder="Zip/Postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={e => handleChange('address.country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permanentStreet">Street Address</Label>
                    <Input
                      id="permanentStreet"
                      value={formData.permanentAddress.street}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, street: e.target.value }
                        }));
                      }}
                      placeholder="Permanent street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentCity">City</Label>
                    <Input
                      id="permanentCity"
                      value={formData.permanentAddress.city}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, city: e.target.value }
                        }));
                      }}
                      placeholder="Permanent city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentState">State/Province</Label>
                    <Input
                      id="permanentState"
                      value={formData.permanentAddress.state}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, state: e.target.value }
                        }));
                      }}
                      placeholder="Permanent state/province"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentZipCode">Zip/Postal Code</Label>
                    <Input
                      id="permanentZipCode"
                      value={formData.permanentAddress.zipCode}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, zipCode: e.target.value }
                        }));
                      }}
                      placeholder="Permanent zip/postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentCountry">Country</Label>
                    <Input
                      id="permanentCountry"
                      value={formData.permanentAddress.country}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, country: e.target.value }
                        }));
                      }}
                      placeholder="Permanent country"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Administrative Information */}
        <AccordionItem value="administrative-info">
          <AccordionTrigger>Administrative Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Application and Interview Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicationDate">Application Date</Label>
                  <Input
                    id="applicationDate"
                    type="date"
                    value={formData.applicationDate}
                    onChange={e => handleChange('applicationDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewDate">Interview Date</Label>
                  <Input
                    id="interviewDate"
                    type="date"
                    value={formData.interviewDate}
                    onChange={e => handleChange('interviewDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionTestScore">Admission Test Score</Label>
                  <Input
                    id="admissionTestScore"
                    type="number"
                    step="0.1"
                    value={formData.admissionTestScore}
                    onChange={e => handleChange('admissionTestScore', e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="feesPaid">Fees Paid</Label>
                    <Input
                      id="feesPaid"
                      type="number"
                      step="0.01"
                      value={formData.feesPaid}
                      onChange={e => handleChange('feesPaid', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Scholarship Information */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.scholarshipInfo !== null}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          scholarshipInfo: e.target.checked 
                            ? { type: '', amount: 0, percentage: 0 }
                            : null
                        }));
                      }}
                    />
                    <span>Student has scholarship</span>
                  </Label>
                  
                  {formData.scholarshipInfo && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scholarshipType">Scholarship Type</Label>
                          <Input
                            id="scholarshipType"
                            value={formData.scholarshipInfo.type}
                            onChange={e => {
                              setFormData(prev => ({
                                ...prev,
                                scholarshipInfo: prev.scholarshipInfo ? {
                                  ...prev.scholarshipInfo,
                                  type: e.target.value
                                } : null
                              }));
                            }}
                            placeholder="Merit, Need-based, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scholarshipAmount">Scholarship Amount</Label>
                          <Input
                            id="scholarshipAmount"
                            type="number"
                            step="0.01"
                            value={formData.scholarshipInfo.amount}
                            onChange={e => {
                              setFormData(prev => ({
                                ...prev,
                                scholarshipInfo: prev.scholarshipInfo ? {
                                  ...prev.scholarshipInfo,
                                  amount: parseFloat(e.target.value) || 0
                                } : null
                              }));
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scholarshipPercentage">Percentage (%)</Label>
                          <Input
                            id="scholarshipPercentage"
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={formData.scholarshipInfo.percentage}
                            onChange={e => {
                              setFormData(prev => ({
                                ...prev,
                                scholarshipInfo: prev.scholarshipInfo ? {
                                  ...prev.scholarshipInfo,
                                  percentage: parseFloat(e.target.value) || 0
                                } : null
                              }));
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transportation Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Transportation Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="transportMode">Transportation Mode</Label>
                    <Select
                      value={formData.transportInfo.mode || ''}
                      onValueChange={value => {
                        setFormData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, mode: value }
                        }));
                      }}
                    >
                      <SelectTrigger id="transportMode">
                        <SelectValue placeholder="Select transportation mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bus">School Bus</SelectItem>
                        <SelectItem value="Car">Private Car</SelectItem>
                        <SelectItem value="Walk">Walking</SelectItem>
                        <SelectItem value="Bike">Bicycle</SelectItem>
                        <SelectItem value="Public Transport">Public Transport</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="busRoute">Bus Route</Label>
                    <Input
                      id="busRoute"
                      value={formData.transportInfo.busRoute}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, busRoute: e.target.value }
                        }));
                      }}
                      placeholder="Route A, Route B, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupPoint">Pickup Point</Label>
                    <Input
                      id="pickupPoint"
                      value={formData.transportInfo.pickupPoint}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, pickupPoint: e.target.value }
                        }));
                      }}
                      placeholder="Bus stop or pickup location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoffPoint">Dropoff Point</Label>
                    <Input
                      id="dropoffPoint"
                      value={formData.transportInfo.dropoffPoint}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          transportInfo: { ...prev.transportInfo, dropoffPoint: e.target.value }
                        }));
                      }}
                      placeholder="School gate or dropoff location"
                    />
                  </div>
                </div>
              </div>

              {/* Behavioral and Social Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Behavioral & Social Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
                    <Input
                      id="behavioralNotes"
                      value={formData.behavioralNotes}
                      onChange={e => handleChange('behavioralNotes', e.target.value)}
                      placeholder="Behavioral observations or notes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialBackground">Social Background</Label>
                    <Input
                      id="socialBackground"
                      value={formData.socialBackground}
                      onChange={e => handleChange('socialBackground', e.target.value)}
                      placeholder="Social or economic background information"
                    />
                  </div>
                </div>
              </div>

              {/* Documents and Identification */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Documents & Identification</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Identification Documents</Label>
                    <div className="flex flex-wrap gap-4">
                      <Label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.identificationDocs.birthCertificate}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              identificationDocs: {
                                ...prev.identificationDocs,
                                birthCertificate: e.target.checked
                              }
                            }));
                          }}
                        />
                        <span>Birth Certificate</span>
                      </Label>
                      <Label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.identificationDocs.passport}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              identificationDocs: {
                                ...prev.identificationDocs,
                                passport: e.target.checked
                              }
                            }));
                          }}
                        />
                        <span>Passport</span>
                      </Label>
                      <Label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.identificationDocs.socialSecurityCard}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              identificationDocs: {
                                ...prev.identificationDocs,
                                socialSecurityCard: e.target.checked
                              }
                            }));
                          }}
                        />
                        <span>Social Security Card</span>
                      </Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="passportPhotos">Passport Photos</Label>
                      <Input
                        id="passportPhotos"
                        type="number"
                        min="0"
                        value={formData.photographs.passport}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            photographs: {
                              ...prev.photographs,
                              passport: parseInt(e.target.value) || 0
                            }
                          }));
                        }}
                        placeholder="Number of passport photos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolPhotos">School Photos</Label>
                      <Input
                        id="schoolPhotos"
                        type="number"
                        min="0"
                        value={formData.photographs.school}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            photographs: {
                              ...prev.photographs,
                              school: parseInt(e.target.value) || 0
                            }
                          }));
                        }}
                        placeholder="Number of school photos"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentsSubmitted">Documents Submitted</Label>
                    <Input
                      id="documentsSubmitted"
                      value={(formData.documentsSubmitted || []).join(', ')}
                      onChange={e => {
                        const documentsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                        setFormData(prev => ({ ...prev, documentsSubmitted: documentsArray }));
                      }}
                      placeholder="List submitted documents, separated by commas"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Address Information (Legacy) */}
        <AccordionItem value="additional-details">
          <AccordionTrigger>Additional Details</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">This section contains legacy address fields for backward compatibility.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={e => handleChange('address.street', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={e => handleChange('address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={e => handleChange('address.state', e.target.value)}
                    placeholder="State/Province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={e => handleChange('address.zipCode', e.target.value)}
                    placeholder="Zip/Postal code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={e => handleChange('address.country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* Form Actions - Following UI Constitution standards */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
        <Button
          type="button"
          intent="cancel"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto bg-white border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          intent="primary"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span>{submitLabel}</span>
            </>
          )}
        </Button>
      </div>
      </form>
    </div>
  );
};

export default StudentForm;
