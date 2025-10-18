import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { get } from '../../services/api';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

const TerminalReportSelector: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [allTerms, setAllTerms] = useState<Term[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  useEffect(() => {
    if (selectedAcademicYear) {
      // Filter terms by selected academic year
      const filteredTerms = allTerms.filter(t => t.academicYearId === selectedAcademicYear);
      setTerms(filteredTerms);
      setSelectedTerm(''); // Reset term selection
    } else {
      setTerms([]);
      setSelectedTerm('');
    }
  }, [selectedAcademicYear, allTerms]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch student info
      const studentResponse = await get<any>(`/students/${studentId}`);
      if (studentResponse.success && studentResponse.data) {
        setStudent(studentResponse.data);
      }

      // Fetch academic years
      const yearResponse = await get<any>('/academic-years');
      if (yearResponse.success) {
        const years = yearResponse.data?.academicYears || yearResponse.data || [];
        setAcademicYears(years);

        // Auto-select current academic year
        const currentYear = years.find((y: AcademicYear) => y.isCurrent);
        if (currentYear) {
          setSelectedAcademicYear(currentYear.id);
        }
      }

      // Fetch all terms
      const termsResponse = await get<any>('/terms');
      if (termsResponse.success) {
        const allTermsData = termsResponse.data?.terms || termsResponse.data || [];
        setAllTerms(allTermsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load academic years and terms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    if (!selectedAcademicYear || !selectedTerm) {
      toast({
        title: 'Selection Required',
        description: 'Please select both academic year and term',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/results/terminal-report/${studentId}/${selectedTerm}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button intent="action" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Select Terminal Report
            </CardTitle>
            {student && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Student: {student.firstName} {student.lastName} ({student.admissionNumber})
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger id="academicYear">
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
              <Label htmlFor="term">Term</Label>
              <Select
                value={selectedTerm}
                onValueChange={setSelectedTerm}
                disabled={!selectedAcademicYear || terms.length === 0}
              >
                <SelectTrigger id="term">
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
              {selectedAcademicYear && terms.length === 0 && (
                <p className="text-sm text-amber-600">No terms found for this academic year</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button intent="cancel" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleViewReport}
                disabled={!selectedAcademicYear || !selectedTerm}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Terminal Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">About Terminal Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Terminal reports provide a comprehensive summary of a student's academic performance
              for a specific term, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Subject-wise grades and scores (CA1, CA2, FAT, SAT)</li>
              <li>Overall performance metrics and class position</li>
              <li>Attendance records</li>
              <li>Teacher and principal comments</li>
              <li>Conduct grades</li>
            </ul>
            <p className="mt-3">
              You can view the report on screen before printing or downloading as PDF.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TerminalReportSelector;
