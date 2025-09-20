import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, User, GraduationCap, Users, CheckCircle } from 'lucide-react';

interface QuickFormData {
  // Step 1: Basic Info (Required)
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';

  // Step 2: Academic Info (Required)
  admissionNumber: string;
  class: string;
  section: string;
  academicYear: string;

  // Step 3: Guardian Info (Required)
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
}

interface QuickEnrollmentWizardProps {
  onSubmit: (formData: QuickFormData) => void;
  onBack: () => void;
  onSwitchToFull: () => void;
  loading: boolean;
  classes: any[];
  sections: any[];
  academicYears: any[];
}

const QuickEnrollmentWizard: React.FC<QuickEnrollmentWizardProps> = ({
  onSubmit,
  onBack,
  onSwitchToFull,
  loading,
  classes,
  sections,
  academicYears,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuickFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    admissionNumber: '',
    class: '',
    section: '',
    academicYear: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleChange = (field: keyof QuickFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender);
      case 2:
        return !!(formData.admissionNumber && formData.class && formData.section && formData.academicYear);
      case 3:
        return !!(formData.guardianFirstName && formData.guardianLastName &&
                 formData.guardianRelationship && formData.guardianPhone);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const stepIcons = [
    { icon: User, label: 'Student Info', color: 'blue' },
    { icon: GraduationCap, label: 'Academic Info', color: 'green' },
    { icon: Users, label: 'Guardian Info', color: 'purple' },
  ];

  const isStepComplete = (step: number) => currentStep > step || (currentStep === step && validateStep(step));
  const isCurrentStep = (step: number) => currentStep === step;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Quick Student Enrollment</h2>
          <p className="text-blue-100">Get students enrolled in just 3 simple steps</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {stepIcons.map((step, index) => {
            const stepNumber = index + 1;
            const IconComponent = step.icon;
            const completed = isStepComplete(stepNumber);
            const current = isCurrentStep(stepNumber);

            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${
                  completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : current
                      ? `bg-${step.color}-500 border-${step.color}-500 text-white`
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {completed && stepNumber < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <IconComponent className="h-6 w-6" />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  current ? 'text-gray-900' : completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-center mt-2 text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Form Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(stepIcons[currentStep - 1].icon, { className: "h-5 w-5" })}
            {stepIcons[currentStep - 1].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={e => handleChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={value => handleChange('gender', value)}
                    required
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
            </div>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number *</Label>
                  <Input
                    id="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={e => handleChange('admissionNumber', e.target.value)}
                    placeholder="e.g., ADM2024001"
                    required
                  />
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
                        <SelectItem key={section._id || section.id} value={section._id || section.id}>
                          Section {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Guardian Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianFirstName">Guardian First Name *</Label>
                  <Input
                    id="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={e => handleChange('guardianFirstName', e.target.value)}
                    placeholder="Enter guardian's first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianLastName">Guardian Last Name *</Label>
                  <Input
                    id="guardianLastName"
                    value={formData.guardianLastName}
                    onChange={e => handleChange('guardianLastName', e.target.value)}
                    placeholder="Enter guardian's last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianRelationship">Relationship *</Label>
                  <Select
                    value={formData.guardianRelationship}
                    onValueChange={value => handleChange('guardianRelationship', value)}
                    required
                  >
                    <SelectTrigger id="guardianRelationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone Number *</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={e => handleChange('guardianPhone', e.target.value)}
                    placeholder="+1 234-567-8900"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianEmail">Email Address</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardianEmail}
                    onChange={e => handleChange('guardianEmail', e.target.value)}
                    placeholder="guardian@example.com"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-3">
          <Button
            intent="cancel"
            onClick={onBack}
            className="w-full sm:w-auto bg-white border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cancel
          </Button>
          <Button
            intent="secondary"
            onClick={onSwitchToFull}
            className="w-full sm:w-auto"
          >
            Use Full Form
          </Button>
        </div>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              intent="secondary"
              onClick={handlePrev}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              intent="primary"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="w-full sm:w-auto"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              intent="primary"
              onClick={handleSubmit}
              disabled={loading || !validateStep(currentStep)}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enroll Student
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickEnrollmentWizard;