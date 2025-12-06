import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Form,
  FormField,
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast
} from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Heart, Target } from 'lucide-react';
import { getAllClasses } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllAcademicYears } from '../../services/academicYearService';
import { getAllTerms } from '../../services/termService';
import { createBehavioralAssessment } from '../../services/behavioralAssessmentService';
import { Class, Subject, AcademicYear } from '../../types';
import { getDefaultCriteria, AFFECTIVE_DOMAIN_CRITERIA, PSYCHOMOTOR_DOMAIN_CRITERIA } from '../../constants/behavioralCriteria';

interface Term {
  id?: string;
  _id?: string;
  name: string;
}

const CreateBehavioralAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'AFFECTIVE' as 'AFFECTIVE' | 'PSYCHOMOTOR',
    totalMarks: '100',
    passingMarks: '50',
    weight: '1.0',
    scheduledDate: '',
    dueDate: '',
    instructions: '',
    subjectId: '',
    classId: '',
    academicYearId: '',
    termId: '',
    status: 'DRAFT'
  });

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [subjectsRes, classesRes, academicYearsRes, termsRes] = await Promise.all([
        getAllSubjects().catch(() => null),
        getAllClasses().catch(() => null),
        getAllAcademicYears().catch(() => null),
        getAllTerms().catch(() => null)
      ]);

      if (subjectsRes?.success && subjectsRes.data) {
        setSubjects(subjectsRes.data);
      }

      if (classesRes?.success && classesRes.data) {
        setClasses(classesRes.data);
      }

      if (academicYearsRes?.success && academicYearsRes.data?.academicYears) {
        setAcademicYears(academicYearsRes.data.academicYears);
      }

      if (termsRes) {
        const termsData = Array.isArray(termsRes) ? termsRes : termsRes.data;
        if (termsData) {
          const mappedTerms = termsData.map((term: any) => ({
            ...term,
            id: term.id || term._id
          }));
          setTerms(mappedTerms);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When type changes, reset selected criteria
    if (field === 'type') {
      setSelectedCriteria([]);
    }
  };

  const handleCriteriaToggle = (criteriaId: string) => {
    setSelectedCriteria(prev =>
      prev.includes(criteriaId)
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  const handleSelectAllCriteria = () => {
    const allCriteria = getDefaultCriteria(formData.type).map(c => c.id);
    setSelectedCriteria(allCriteria);
  };

  const handleDeselectAllCriteria = () => {
    setSelectedCriteria([]);
  };

  const currentCriteria = getDefaultCriteria(formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.subjectId || !formData.classId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedCriteria.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one assessment criteria",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Build criteria rubric
      const criteria = selectedCriteria.map(criteriaId => {
        const criteriaInfo = currentCriteria.find(c => c.id === criteriaId);
        return {
          id: criteriaId,
          label: criteriaInfo?.label || criteriaId,
          description: criteriaInfo?.description || '',
          maxGrade: 'A'
        };
      });

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        totalMarks: selectedCriteria.length * 5, // 5 points per criteria (A=5, B=4, C=3, D=2, E=1)
        passingMarks: Math.floor(selectedCriteria.length * 5 * 0.5),
        weight: parseFloat(formData.weight),
        scheduledDate: formData.scheduledDate || undefined,
        dueDate: formData.dueDate || undefined,
        instructions: formData.instructions,
        subjectId: formData.subjectId,
        classId: formData.classId,
        academicYearId: formData.academicYearId,
        termId: formData.termId || undefined,
        status: formData.status,
        criteria
      };

      const response = await createBehavioralAssessment(payload);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Behavioral assessment created successfully",
        });
        navigate('/behavioral-assessments');
      } else {
        toast({
          title: "Error",
          description: `Failed to create behavioral assessment: ${response.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating behavioral assessment:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the behavioral assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center gap-4">
            <Button
              intent="secondary"
              size="sm"
              onClick={() => navigate('/behavioral-assessments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <PageTitle>Create Behavioral Assessment</PageTitle>
              <PageDescription>
                Create a new affective or psychomotor domain assessment
              </PageDescription>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Assessment Type" required>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AFFECTIVE">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Affective Domain (Attitudes, Values, Emotions)
                        </div>
                      </SelectItem>
                      <SelectItem value="PSYCHOMOTOR">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Psychomotor Domain (Physical Skills, Motor Skills)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Assessment Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Social Skills Assessment, Physical Education Skills"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter assessment description"
                    rows={3}
                  />
                </FormField>

                <FormField label="Status">
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </CardContent>
            </Card>

            {/* Assessment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Total Marks" required>
                    <Input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      placeholder="100"
                      required
                      min="1"
                    />
                  </FormField>

                  <FormField label="Passing Marks">
                    <Input
                      type="number"
                      value={formData.passingMarks}
                      onChange={(e) => handleInputChange('passingMarks', e.target.value)}
                      placeholder="50"
                      min="1"
                    />
                  </FormField>

                  <FormField label="Weight">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="1.0"
                      min="0.1"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Scheduled Date">
                    <Input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Due Date">
                    <Input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Subject" required>
                    <Select value={formData.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                        ) : (
                          <>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                            {subjects.length === 0 && (
                              <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Class" required>
                    <Select value={formData.classId} onValueChange={(value) => handleInputChange('classId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                        ) : (
                          <>
                            {classes.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} - Grade {classItem.grade}
                              </SelectItem>
                            ))}
                            {classes.length === 0 && (
                              <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Academic Year">
                    <Select value={formData.academicYearId} onValueChange={(value) => handleInputChange('academicYearId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Term">
                    <Select value={formData.termId} onValueChange={(value) => handleInputChange('termId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.filter(term => term.id || term._id).map((term) => (
                          <SelectItem key={term.id || term._id} value={term.id || term._id || ''}>
                            {term.name}
                          </SelectItem>
                        ))}
                        {terms.length === 0 && (
                          <SelectItem value="no-terms" disabled>No terms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Selection */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {formData.type === 'AFFECTIVE' ? 'Affective Domain' : 'Psychomotor Domain'} Criteria
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      onClick={handleSelectAllCriteria}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      onClick={handleDeselectAllCriteria}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Select the criteria you want to assess. Each criterion will be graded from A to E.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentCriteria.map((criteria) => (
                      <div
                        key={criteria.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedCriteria.includes(criteria.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCriteriaToggle(criteria.id)}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCriteria.includes(criteria.id)}
                            onChange={() => handleCriteriaToggle(criteria.id)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{criteria.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{criteria.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCriteria.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedCriteria.length} criteria selected • Total Marks: {selectedCriteria.length * 5} points
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Grading Scale: A=5, B=4, C=3, D=2, E=1 points per criterion
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField label="Assessment Instructions">
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Enter detailed instructions for students"
                    rows={4}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <Button
                type="button"
                intent="cancel"
                className="w-full sm:w-auto"
                onClick={() => navigate('/behavioral-assessments')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                intent="primary"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Assessment'}
              </Button>
            </div>
          </form>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default CreateBehavioralAssessment;
