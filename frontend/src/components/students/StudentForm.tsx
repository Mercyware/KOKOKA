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
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '';
  height: { value: string; unit: 'cm' | 'in' };
  weight: { value: string; unit: 'kg' | 'lb' };
  healthInfo: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
    dietaryRestrictions: string[];
    disabilities: string[];
  };
  contactInfo: {
    phone: string;
    alternativePhone: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-6"
    >
      <Accordion type="multiple" defaultValue={["personal-info"]}>
        {/* Personal Information */}
        <AccordionItem value="personal-info">
          <AccordionTrigger>Personal Information</AccordionTrigger>
          <AccordionContent>
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
        {/* Academic Information */}
        <AccordionItem value="academic-info">
          <AccordionTrigger>Academic Information</AccordionTrigger>
          <AccordionContent>
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
                  value={formData.academicYear}
                  onValueChange={value => handleChange('academicYear', value)}
                  required
                >
                  <SelectTrigger id="academicYear">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(year => (
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
                  value={formData.class}
                  onValueChange={value => handleChange('class', value)}
                  required
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classItem => (
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
                  value={formData.section}
                  onValueChange={value => handleChange('section', value)}
                  required
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="house">House</Label>
                <Select
                  value={formData.house}
                  onValueChange={value => handleChange('house', value)}
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
          </AccordionContent>
        </AccordionItem>
        {/* Guardian Information */}
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
                        value={guardian.relationship}
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
        {/* Physical & Medical Information */}
        <AccordionItem value="physical-info">
          <AccordionTrigger>Physical & Medical Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
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
                      value={formData.height.unit}
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
                      value={formData.weight.unit}
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
                      value={formData.healthInfo.allergies.join(', ')}
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
                      value={formData.healthInfo.medicalConditions.join(', ')}
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
                      value={formData.healthInfo.medications.join(', ')}
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
                      value={formData.healthInfo.dietaryRestrictions.join(', ')}
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
                      value={formData.healthInfo.disabilities.join(', ')}
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
              <span>{submitLabel}</span>
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
