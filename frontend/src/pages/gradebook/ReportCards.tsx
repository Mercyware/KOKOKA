import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Button
} from '../../components/ui/button';
import {
  Badge
} from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '../../components/ui/alert';
import {
  Input
} from '../../components/ui/input';
import {
  Label
} from '../../components/ui/label';
import {
  Textarea
} from '../../components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Printer,
  BarChart3,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    name: string;
  };
  _count: {
    reportCards: number;
  };
}

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface Term {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
}

interface BatchStatus {
  id: string;
  name: string;
  status: string;
  totalStudents: number;
  processedStudents: number;
  successfulReports: number;
  failedReports: number;
  startedAt: string | null;
  completedAt: string | null;
}

const ReportCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'templates' | 'generate' | 'reports' | 'batches'>('templates');
  
  // State for templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // State for generation
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('all-terms');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTemplateForGeneration, setSelectedTemplateForGeneration] = useState<string>('');
  const [reportType, setReportType] = useState<string>('TERM_REPORT');
  const [reportPeriod, setReportPeriod] = useState<string>('');
  
  // State for batch processing
  const [batches, setBatches] = useState<BatchStatus[]>([]);
  
  // State for form handling
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'TERM_REPORT',
    includeAttendance: true,
    includeConduct: true,
    includeGPA: true,
    includeClassRank: false,
    includeComments: true,
    includeSignatures: true,
    pageSize: 'A4',
    orientation: 'portrait',
    isDefault: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchAcademicYears();
    fetchClasses();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTerms(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/report-cards/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/academic-years', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAcademicYears(data.data);
        // Auto-select current academic year
        const current = data.data.find((year: AcademicYear) => year.isCurrent);
        if (current) {
          setSelectedAcademicYear(current.id);
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchTerms = async (academicYearId: string) => {
    try {
      const response = await fetch(`/api/academic-years/${academicYearId}/terms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTerms(data.data);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/report-cards/batches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/report-cards/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newTemplate,
          layout: {
            sections: ['header', 'student-info', 'subject-grades', 'overall-summary', 'attendance', 'comments', 'signatures']
          },
          gradingScale: {
            type: 'PERCENTAGE',
            scale: {
              A: { min: 90, max: 100, gpa: 4.0 },
              B: { min: 80, max: 89, gpa: 3.0 },
              C: { min: 70, max: 79, gpa: 2.0 },
              D: { min: 60, max: 69, gpa: 1.0 },
              F: { min: 0, max: 59, gpa: 0.0 }
            }
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTemplates();
        setShowCreateTemplateDialog(false);
        resetTemplateForm();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClassReports = async () => {
    if (!selectedClass || !selectedTemplateForGeneration || !reportPeriod) {
      setError('Please select all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/report-cards/generate/class/${selectedClass}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId: selectedTemplateForGeneration,
          academicYearId: selectedAcademicYear,
          termId: selectedTerm === 'all-terms' ? undefined : selectedTerm,
          reportType,
          reportPeriod
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Switch to batches tab to show progress
        setActiveTab('batches');
        await fetchBatches();
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      setError('Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  const resetTemplateForm = () => {
    setNewTemplate({
      name: '',
      description: '',
      type: 'TERM_REPORT',
      includeAttendance: true,
      includeConduct: true,
      includeGPA: true,
      includeClassRank: false,
      includeComments: true,
      includeSignatures: true,
      pageSize: 'A4',
      orientation: 'portrait',
      isDefault: false
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock },
      PROCESSING: { variant: 'default' as const, icon: BarChart3 },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle },
      FAILED: { variant: 'destructive' as const, icon: AlertCircle },
      PARTIAL: { variant: 'secondary' as const, icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Cards</h1>
            <p className="text-gray-600 mt-2">Manage templates and generate report cards</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/gradebook')}
            >
              ← Back to Grade Book
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Batches
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Report Card Templates</CardTitle>
                    <CardDescription>
                      Create and manage report card templates for different report types
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateTemplateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading templates...</p>
                    </div>
                  </div>
                ) : templates.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      No templates found. Create your first template to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card key={template.id} className="border">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {template.name}
                                {template.isDefault && (
                                  <Badge variant="default">Default</Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Used:</span>
                              <span>{template._count.reportCards} times</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Created by:</span>
                              <span>{template.createdBy.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowEditTemplateDialog(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual Student */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Individual Student
                  </CardTitle>
                  <CardDescription>
                    Generate report card for a single student
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isCurrent && '(Current)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Term (Optional)</Label>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-terms">All Terms</SelectItem>
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={selectedTemplateForGeneration} onValueChange={setSelectedTemplateForGeneration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.isActive).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" disabled>
                    <User className="h-4 w-4 mr-2" />
                    Select Student (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Class Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Bulk Class Generation
                  </CardTitle>
                  <CardDescription>
                    Generate report cards for an entire class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isCurrent && '(Current)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Term (Optional)</Label>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-terms">All Terms</SelectItem>
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - Grade {cls.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={selectedTemplateForGeneration} onValueChange={setSelectedTemplateForGeneration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.isActive).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Report Period</Label>
                    <Input
                      placeholder="e.g. Term 1, Mid-Year, Final"
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleGenerateClassReports}
                    disabled={loading || !selectedClass || !selectedTemplateForGeneration || !reportPeriod}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {loading ? 'Generating...' : 'Generate Class Reports'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>View and manage generated report cards</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Report browsing interface coming soon. Use the batches tab to track generation progress.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Batch Processing</CardTitle>
                    <CardDescription>Track bulk report generation progress</CardDescription>
                  </div>
                  <Button onClick={fetchBatches} variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      No batch processes found. Generate reports to see them here.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {batches.map((batch) => (
                      <Card key={batch.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{batch.name}</h3>
                              <p className="text-sm text-gray-600">
                                Started: {batch.startedAt ? new Date(batch.startedAt).toLocaleString() : 'Not started'}
                              </p>
                            </div>
                            {getStatusBadge(batch.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {batch.totalStudents}
                              </div>
                              <div className="text-sm text-gray-600">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">
                                {batch.processedStudents}
                              </div>
                              <div className="text-sm text-gray-600">Processed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {batch.successfulReports}
                              </div>
                              <div className="text-sm text-gray-600">Success</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {batch.failedReports}
                              </div>
                              <div className="text-sm text-gray-600">Failed</div>
                            </div>
                          </div>

                          {batch.status === 'PROCESSING' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{Math.round((batch.processedStudents / batch.totalStudents) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(batch.processedStudents / batch.totalStudents) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {batch.status === 'COMPLETED' && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-2" />
                                Download All PDFs
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileSpreadsheet className="h-3 w-3 mr-2" />
                                Export Summary
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Report Card Template</DialogTitle>
              <DialogDescription>
                Create a new template for generating report cards
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Standard Term Report"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description of this template"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TERM_REPORT">Term Report</SelectItem>
                    <SelectItem value="SEMESTER_REPORT">Semester Report</SelectItem>
                    <SelectItem value="ANNUAL_REPORT">Annual Report</SelectItem>
                    <SelectItem value="PROGRESS_REPORT">Progress Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Size</Label>
                  <Select value={newTemplate.pageSize} onValueChange={(value) => setNewTemplate({...newTemplate, pageSize: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={newTemplate.orientation} onValueChange={(value) => setNewTemplate({...newTemplate, orientation: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in Template</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeAttendance}
                      onChange={(e) => setNewTemplate({...newTemplate, includeAttendance: e.target.checked})}
                    />
                    <span className="text-sm">Attendance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeConduct}
                      onChange={(e) => setNewTemplate({...newTemplate, includeConduct: e.target.checked})}
                    />
                    <span className="text-sm">Conduct</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeGPA}
                      onChange={(e) => setNewTemplate({...newTemplate, includeGPA: e.target.checked})}
                    />
                    <span className="text-sm">GPA</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeClassRank}
                      onChange={(e) => setNewTemplate({...newTemplate, includeClassRank: e.target.checked})}
                    />
                    <span className="text-sm">Class Rank</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeComments}
                      onChange={(e) => setNewTemplate({...newTemplate, includeComments: e.target.checked})}
                    />
                    <span className="text-sm">Comments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newTemplate.includeSignatures}
                      onChange={(e) => setNewTemplate({...newTemplate, includeSignatures: e.target.checked})}
                    />
                    <span className="text-sm">Signatures</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={loading || !newTemplate.name}>
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ReportCardsPage;
