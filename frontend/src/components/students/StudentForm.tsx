// StudentForm.tsx
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SearchableSelect } from '@/components/ui';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, Calendar, ArrowLeft } from 'lucide-react';
import { NATIONALITIES, RELIGIONS, RELATIONSHIPS, COUNTRIES, ALL_STATES } from '@/constants';

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
  // Basic Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  phone: string;
  alternativePhone: string;

  // Additional Personal Information
  placeOfBirth: string;
  nationality: string;
  religion: string;
  motherTongue: string;
  languagesSpoken: string[];

  // Academic Information
  admissionNumber: string;
  admissionDate: string;
  class: string;
  section: string;
  academicYear: string;
  house: string;
  rollNumber: string;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  previousSchool: string;
  previousClass: string;
  tcNumber: string;
  tcDate: string;
  talents: string;
  extracurriculars: string;

  // Medical Information
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '';
  healthInfo: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
  };
  specialNeeds: string;
  emergencyMedicalInfo: string;
  doctorName: string;
  doctorPhone: string;
  hospitalPreference: string;

  // Emergency Contacts
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    isPrimary: boolean;
  }>;

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

  // Guardians
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
                <Label htmlFor="firstName">
                  First Name <span className="text-red-600">*</span>
                </Label>
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
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-600">*</span>
                </Label>
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
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+1 234-567-8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-red-600">*</span>
                </Label>
                <DatePicker
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                  onChange={(date) => handleChange('dateOfBirth', date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Select date of birth"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-red-600">*</span>
                </Label>
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
                <SearchableSelect
                  options={NATIONALITIES}
                  value={formData.nationality}
                  onValueChange={(value) => handleChange('nationality', value)}
                  placeholder="Select nationality"
                  searchPlaceholder="Search nationalities..."
                  emptyMessage="No nationality found."
                  clearable
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <SearchableSelect
                  options={RELIGIONS}
                  value={formData.religion}
                  onValueChange={(value) => handleChange('religion', value)}
                  placeholder="Select religion"
                  searchPlaceholder="Search religions..."
                  emptyMessage="No religion found."
                  clearable
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
                    const languagesArray = e.target.value.split(',').map(item => item.trim());
                    setFormData(prev => ({ ...prev, languagesSpoken: languagesArray }));
                  }}
                  placeholder="List languages, separated by commas (e.g., English, Spanish, French)"
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
                <Label htmlFor="admissionNumber">
                  Admission Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={e => handleChange('admissionNumber', e.target.value)}
                  placeholder="e.g., ADM2023001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionDate">
                  Admission Date <span className="text-red-600">*</span>
                </Label>
                <DatePicker
                  value={formData.admissionDate ? new Date(formData.admissionDate) : undefined}
                  onChange={(date) => handleChange('admissionDate', date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Select admission date"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">
                  Academic Year <span className="text-red-600">*</span>
                </Label>
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
                <Label htmlFor="class">
                  Class <span className="text-red-600">*</span>
                </Label>
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
                <Label htmlFor="section">
                  Section <span className="text-red-600">*</span>
                </Label>
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
                <DatePicker
                  value={formData.tcDate ? new Date(formData.tcDate) : undefined}
                  onChange={(date) => handleChange('tcDate', date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Select TC date"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="talents">Special Talents</Label>
                <Input
                  id="talents"
                  value={formData.talents || ''}
                  onChange={e => handleChange('talents', e.target.value)}
                  placeholder="List talents, separated by commas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extracurriculars">Extracurricular Activities</Label>
                <Input
                  id="extracurriculars"
                  value={formData.extracurriculars || ''}
                  onChange={e => handleChange('extracurriculars', e.target.value)}
                  placeholder="e.g., Football, Drama Club, Music"
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
                3
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
                      <Label htmlFor={`guardian-${index}-firstName`}>
                        First Name <span className="text-red-600">*</span>
                      </Label>
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
                      <Label htmlFor={`guardian-${index}-lastName`}>
                        Last Name <span className="text-red-600">*</span>
                      </Label>
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
                      <Label htmlFor={`guardian-${index}-relationship`}>
                        Relationship <span className="text-red-600">*</span>
                      </Label>
                      <SearchableSelect
                        value={guardian.relationship || ''}
                        onValueChange={value => {
                          const newGuardians = [...formData.guardians];
                          newGuardians[index].relationship = value;
                          setFormData(prev => ({ ...prev, guardians: newGuardians }));
                        }}
                        options={RELATIONSHIPS}
                        placeholder="Select relationship"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`guardian-${index}-phone`}>
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
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
        {/* Emergency Contacts */}
        <AccordionItem value="emergency-contacts" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Emergency Contacts</h3>
                <p className="text-sm text-gray-500">Emergency contact persons and their details</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
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
                      <Label htmlFor={`emergency-${index}-name`}>
                        Full Name <span className="text-red-600">*</span>
                      </Label>
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
                      <Label htmlFor={`emergency-${index}-relationship`}>
                        Relationship <span className="text-red-600">*</span>
                      </Label>
                      <SearchableSelect
                        value={contact.relationship || ''}
                        onValueChange={value => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts[index].relationship = value;
                          setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                        }}
                        options={RELATIONSHIPS}
                        placeholder="Select relationship"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`emergency-${index}-phone`}>
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
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

        {/* Medical Information */}
        <AccordionItem value="medical-info" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">
                5
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Medical Information</h3>
                <p className="text-sm text-gray-500">Health details and emergency medical information</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="medications">Current Medications</Label>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialNeeds">Special Educational/Medical Needs</Label>
                  <Textarea
                    id="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={e => handleChange('specialNeeds', e.target.value)}
                    placeholder="Describe any special needs, disabilities, or dietary restrictions"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyMedicalInfo">Emergency Medical Information</Label>
                  <Textarea
                    id="emergencyMedicalInfo"
                    value={formData.emergencyMedicalInfo}
                    onChange={e => handleChange('emergencyMedicalInfo', e.target.value)}
                    placeholder="Important medical information for emergencies"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={e => handleChange('doctorName', e.target.value)}
                    placeholder="Primary doctor or pediatrician"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorPhone">Doctor Phone</Label>
                  <Input
                    id="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={e => handleChange('doctorPhone', e.target.value)}
                    placeholder="Doctor's contact number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalPreference">Preferred Hospital</Label>
                <Input
                  id="hospitalPreference"
                  value={formData.hospitalPreference}
                  onChange={e => handleChange('hospitalPreference', e.target.value)}
                  placeholder="Preferred hospital or medical facility"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Address Information */}
        <AccordionItem value="address-info" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                6
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Address Information</h3>
                <p className="text-sm text-gray-500">Current and permanent address details</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
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
                    <SearchableSelect
                      value={formData.address.state}
                      onValueChange={value => handleChange('address.state', value)}
                      options={ALL_STATES}
                      placeholder="Select state/province"
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
                    <SearchableSelect
                      value={formData.address.country}
                      onValueChange={value => handleChange('address.country', value)}
                      options={COUNTRIES}
                      placeholder="Select country"
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
                    <SearchableSelect
                      value={formData.permanentAddress.state}
                      onValueChange={value => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, state: value }
                        }));
                      }}
                      options={ALL_STATES}
                      placeholder="Select state/province"
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
                    <SearchableSelect
                      value={formData.permanentAddress.country}
                      onValueChange={value => {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { ...prev.permanentAddress, country: value }
                        }));
                      }}
                      options={COUNTRIES}
                      placeholder="Select country"
                    />
                  </div>
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
