import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
} from '../../components/ui/page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  FileText,
  Download,
  Eye,
  Users,
  CheckCircle,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { toast } from '../../components/ui/use-toast';
import api from '../../services/api';
import { API_CONFIG } from '../../config/api';

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

interface Result {
  id: string;
  studentId: string;
  termId: string;
  classId: string;
  totalScore: number;
  totalSubjects: number;
  averageScore: number;
  position: number | null;
  conductGrade: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  daysPresent?: number;
  daysAbsent?: number;
  timesLate?: number;
  teacherComment?: string | null;
  principalComment?: string | null;
  student: {
    user: {
      name: string;
      email: string;
    };
    admissionNumber: string;
  };
  term: {
    name: string;
    academicYear: {
      name: string;
    };
  };
  class: {
    name: string;
    grade: string;
  };
  subjectResults: Array<{
    subject: {
      name: string;
      code: string;
    };
    firstCA: number | null;
    secondCA: number | null;
    thirdCA: number | null;
    exam: number | null;
    totalScore: number | null;
    grade: string | null;
    remark: string | null;
  }>;
}

const ReportCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'view' | 'publish'>('view');

  // State for filters
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // State for data
  const [reports, setReports] = useState<Result[]>([]);
  const [publishedReports, setPublishedReports] = useState<Result[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading flags to prevent concurrent requests
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('📊 State Update:', {
      academicYears: academicYears.length,
      selectedAcademicYear,
      terms: terms.length,
      selectedTerm,
      classes: classes.length,
      selectedClass
    });
  }, [academicYears, selectedAcademicYear, terms, selectedTerm, classes, selectedClass]);

  useEffect(() => {
    console.log('🚀 Component mounted - initializing data');
    const initializeData = async () => {
      console.log('🔄 Starting parallel data fetch...');
      await Promise.all([
        fetchAcademicYears(),
        fetchClasses()
      ]);
      console.log('✅ Initial data fetch complete');
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTerms(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      // Debounce the API call to prevent rapid requests
      const timer = setTimeout(() => {
        fetchClassReports();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setReports([]);
    }
  }, [selectedClass, selectedTerm]);

  const fetchAcademicYears = async () => {
    if (loadingAcademicYears) {
      console.log('⏸️ Already loading academic years, skipping...');
      return;
    }

    try {
      console.log('🔄 Starting fetchAcademicYears...');
      setLoadingAcademicYears(true);
      const response = await api.get<AcademicYear[]>('/academic-years');

      console.log('📅 Academic Years Response:', JSON.stringify(response, null, 2));

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Response valid, setting academic years...', apiResponse.data);
        setAcademicYears(apiResponse.data);

        const current = apiResponse.data.find((year: AcademicYear) => year.isCurrent);
        if (current) {
          console.log('✅ Setting current academic year:', current.id, current.name);
          setSelectedAcademicYear(current.id);
        } else if (apiResponse.data.length > 0) {
          console.log('✅ Setting first academic year:', apiResponse.data[0].id, apiResponse.data[0].name);
          setSelectedAcademicYear(apiResponse.data[0].id);
        }
      } else {
        console.warn('⚠️ No academic years data or unsuccessful response');
        setAcademicYears([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching academic years:', error);
      toast({
        title: 'Error',
        description: 'Failed to load academic years',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 Finished fetchAcademicYears');
      setLoadingAcademicYears(false);
    }
  };

  const fetchTerms = async (academicYearId: string) => {
    if (loadingTerms) return;

    try {
      setLoadingTerms(true);
      const response = await api.get<Term[]>(`/academic-years/${academicYearId}/terms`);

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        setTerms(apiResponse.data);
        // Auto-select first term if none selected
        if (!selectedTerm || !apiResponse.data.find(t => t.id === selectedTerm)) {
          setSelectedTerm(apiResponse.data[0].id);
        }
      } else {
        setTerms([]);
        setSelectedTerm('');
      }
    } catch (error: any) {
      console.error('Error fetching terms:', error);
      setTerms([]);
      setSelectedTerm('');
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchClasses = async () => {
    if (loadingClasses) return;

    try {
      setLoadingClasses(true);
      const response = await api.get<Class[]>('/classes');

      console.log('🏫 Classes Response:', response);

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Setting classes:', apiResponse.data.length, 'classes');
        setClasses(apiResponse.data);
      } else {
        setClasses([]);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchClassReports = async () => {
    if (!selectedClass || !selectedTerm) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/report-cards/class/${selectedClass}`, {
        params: { termId: selectedTerm }
      });

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success) {
        setReports(apiResponse.data);
      } else {
        setError(apiResponse.message);
      }
    } catch (error: any) {
      console.error('Error fetching class reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedReports = async () => {
    try {
      const response = await api.get('/report-cards/published', {
        params: selectedTerm ? { termId: selectedTerm } : undefined
      });

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success) {
        setPublishedReports(apiResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching published reports:', error);
    }
  };

  const handlePublishReports = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: 'Error',
        description: 'Please select both class and term',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/report-cards/publish', {
        classId: selectedClass,
        termId: selectedTerm
      });

      // Extract the actual API response from axios wrapper
      const apiResponse = response.data || response;

      if (apiResponse.success) {
        toast({
          title: 'Success',
          description: 'Reports published successfully',
        });
        await fetchClassReports();
        await fetchPublishedReports();
      } else {
        toast({
          title: 'Error',
          description: apiResponse.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error publishing reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (studentId: string, termId: string) => {
    const token = localStorage.getItem('token');
    const subdomain = localStorage.getItem('schoolSubdomain') || 'greenwood';
    const baseUrl = API_CONFIG.BASE_URL;
    const url = `${baseUrl}/report-cards/student/${studentId}/term/${termId}/pdf?token=${token}&subdomain=${subdomain}`;
    window.open(url, '_blank');
  };

  const handleViewReport = (studentId: string, termId: string) => {
    // Open PDF in new tab instead of navigating to non-existent route
    handleDownloadPDF(studentId, termId);
  };

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex justify-between items-center">
          <div>
            <PageTitle>Report Cards</PageTitle>
            <PageDescription>Generate and manage student report cards</PageDescription>
          </div>
          <Button intent="cancel" onClick={() => navigate('/gradebook')}>
            ← Back to Grade Book
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="view">
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </TabsTrigger>
            <TabsTrigger value="publish">
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish Reports
            </TabsTrigger>
          </TabsList>

          {/* View Reports Tab */}
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Class Reports</CardTitle>
                <CardDescription>View report cards for a specific class and term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Academic Year ({academicYears.length} items)</Label>
                    <Select
                      value={selectedAcademicYear || undefined}
                      onValueChange={setSelectedAcademicYear}
                      disabled={academicYears.length === 0}
                    >
                      <SelectTrigger disabled={academicYears.length === 0}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.length === 0 && (
                          <div className="p-2 text-sm text-gray-500">No academic years available</div>
                        )}
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isCurrent && '(Current)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Term ({terms.length} items)</Label>
                    <Select
                      value={selectedTerm || undefined}
                      onValueChange={setSelectedTerm}
                      disabled={!selectedAcademicYear || terms.length === 0}
                    >
                      <SelectTrigger disabled={!selectedAcademicYear || terms.length === 0}>
                        <SelectValue placeholder={!selectedAcademicYear ? "Select year first" : "Select term"} />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.length === 0 && (
                          <div className="p-2 text-sm text-gray-500">No terms available</div>
                        )}
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Class ({classes.length} items)</Label>
                    <Select
                      value={selectedClass || undefined}
                      onValueChange={setSelectedClass}
                      disabled={classes.length === 0}
                    >
                      <SelectTrigger disabled={classes.length === 0}>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.length === 0 && (
                          <div className="p-2 text-sm text-gray-500">No classes available</div>
                        )}
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - Grade {cls.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading reports...</p>
                    </div>
                  </div>
                ) : reports.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      {selectedClass && selectedTerm
                        ? 'No reports found for this class and term. Make sure results have been entered.'
                        : 'Please select a class and term to view reports.'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <Card key={report.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-semibold">{report.student.user.name}</h4>
                              <p className="text-sm text-gray-600">
                                Admission: {report.student.admissionNumber} | Position: {report.position || 'N/A'}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm">Average: <strong>{report.averageScore.toFixed(2)}%</strong></span>
                                <span className="text-sm">Subjects: <strong>{report.totalSubjects}</strong></span>
                                {report.conductGrade && (
                                  <span className="text-sm">Conduct: <strong>{report.conductGrade}</strong></span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {report.isPublished && (
                                <Badge variant="default">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Published
                                </Badge>
                              )}
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => handleViewReport(report.studentId, report.termId)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => handleDownloadPDF(report.studentId, report.termId)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publish Reports Tab */}
          <TabsContent value="publish">
            <Card>
              <CardHeader>
                <CardTitle>Publish Reports</CardTitle>
                <CardDescription>Make report cards available to students and parents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Publishing reports will make them visible to students and parents. Make sure all results are finalized before publishing.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select
                        value={selectedAcademicYear || undefined}
                        onValueChange={setSelectedAcademicYear}
                        disabled={academicYears.length === 0}
                      >
                        <SelectTrigger disabled={academicYears.length === 0}>
                          <SelectValue placeholder="Select year" />
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
                      <Label>Term</Label>
                      <Select
                        value={selectedTerm || undefined}
                        onValueChange={setSelectedTerm}
                        disabled={!selectedAcademicYear || terms.length === 0}
                      >
                        <SelectTrigger disabled={!selectedAcademicYear || terms.length === 0}>
                          <SelectValue placeholder={!selectedAcademicYear ? "Select year first" : "Select term"} />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Select
                        value={selectedClass || undefined}
                        onValueChange={setSelectedClass}
                        disabled={classes.length === 0}
                      >
                        <SelectTrigger disabled={classes.length === 0}>
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
                  </div>

                  {reports.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900">Ready to Publish</h4>
                          <p className="text-sm text-blue-700">
                            {reports.length} report{reports.length !== 1 ? 's' : ''} will be published
                          </p>
                        </div>
                        <Button
                          intent="primary"
                          onClick={handlePublishReports}
                          disabled={loading || !selectedClass || !selectedTerm}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish Reports
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
};

export default ReportCardsPage;
