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

interface ReportCard {
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
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [publishedReports, setPublishedReports] = useState<ReportCard[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
    fetchPublishedReports();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTerms(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchClassReports();
    }
  }, [selectedClass, selectedTerm]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/academic-years', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
        }
      });
      const data = await response.json();

      if (data.success) {
        setAcademicYears(data.data);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
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

  const fetchClassReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/report-cards/class/${selectedClass}?termId=${selectedTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
        }
      });
      const data = await response.json();

      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching class reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedReports = async () => {
    try {
      const url = selectedTerm
        ? `/api/report-cards/published?termId=${selectedTerm}`
        : '/api/report-cards/published';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
        }
      });
      const data = await response.json();

      if (data.success) {
        setPublishedReports(data.data);
      }
    } catch (error) {
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
      const response = await fetch('/api/report-cards/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'greenwood'
        },
        body: JSON.stringify({
          classId: selectedClass,
          termId: selectedTerm
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Reports published successfully',
        });
        await fetchClassReports();
        await fetchPublishedReports();
      } else {
        toast({
          title: 'Error',
          description: data.message,
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
    const url = `/api/report-cards/student/${studentId}/term/${termId}/pdf`;
    window.open(url, '_blank');
  };

  const handleViewReport = (studentId: string, termId: string) => {
    navigate(`/report-card/${studentId}/${termId}`);
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
                    <Label>Academic Year</Label>
                    <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                      <SelectTrigger>
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
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
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
                      <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                        <SelectTrigger>
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
                      <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
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
