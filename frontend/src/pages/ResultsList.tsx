import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  PageContainer,
  PageHeader,
  PageTitle,
  PageContent,
  StatusBadge
} from '@/components/ui';
import { api } from '@/services/api';

interface Class {
  id: string;
  name: string;
  grade: string;
  _count: {
    students: number;
  };
}

interface Term {
  id: string;
  name: string;
  academicYear: {
    id: string;
    name: string;
  };
}

interface Result {
  id: string;
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  totalScore: number;
  averageScore: number;
  position: number;
  totalSubjects: number;
  isPublished: boolean;
}

interface ResultSummary {
  stats: {
    totalStudents: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  gradeDistribution: Record<string, number>;
}

export default function ResultsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const [publishingResults, setPublishingResults] = useState(false);
  
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      loadResults();
    }
  }, [selectedClass, selectedTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [classesResponse, termsResponse] = await Promise.all([
        api.get('/classes'),
        api.get('/terms')
      ]);

      setClasses(classesResponse.data.data);
      setTerms(termsResponse.data.data);
      
      // Auto-select first class and term if available
      if (classesResponse.data.data.length > 0) {
        setSelectedClass(classesResponse.data.data[0].id);
      }
      if (termsResponse.data.data.length > 0) {
        setSelectedTerm(termsResponse.data.data[0].id);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      
      const [resultsResponse, summaryResponse] = await Promise.all([
        api.get(`/results/class/${selectedClass}/term/${selectedTerm}`),
        api.get(`/results/class/${selectedClass}/term/${selectedTerm}/summary`)
      ]);

      setResults(resultsResponse.data.data);
      setSummary(summaryResponse.data.data);

    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedClass || !selectedTerm) return;
    
    if (!confirm('Are you sure you want to publish these results? This will make them visible to students and parents.')) {
      return;
    }

    try {
      setPublishingResults(true);
      
      await api.post('/results/publish', {
        classId: selectedClass,
        termId: selectedTerm
      });

      alert('Results published successfully!');
      loadResults(); // Reload to update published status

    } catch (error) {
      console.error('Error publishing results:', error);
      alert('Failed to publish results');
    } finally {
      setPublishingResults(false);
    }
  };

  const handleEnterResults = () => {
    if (selectedClass && selectedTerm) {
      navigate(`/results/entry/${selectedClass}/${selectedTerm}`);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': case 'A1': case 'A*': return 'bg-green-100 text-green-800';
      case 'B': case 'B1': case 'A2': return 'bg-blue-100 text-blue-800';
      case 'C': case 'C1': case 'B2': return 'bg-yellow-100 text-yellow-800';
      case 'D': case 'C2': case 'C3': return 'bg-orange-100 text-orange-800';
      case 'F': case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || '';
  const selectedTermName = terms.find(t => t.id === selectedTerm)?.name || '';
  const hasResults = results.length > 0;
  const allPublished = results.length > 0 && results.every(r => r.isPublished);

  if (loading && results.length === 0) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Results Management</PageTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            intent="primary"
            onClick={handleEnterResults}
            disabled={!selectedClass || !selectedTerm}
          >
            Enter Results
          </Button>
          {hasResults && !allPublished && (
            <Button
              intent="action"
              onClick={handlePublishResults}
              disabled={publishingResults}
            >
              {publishingResults ? 'Publishing...' : 'Publish Results'}
            </Button>
          )}
        </div>
      </PageHeader>

      <PageContent>
        {/* Filters */}
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>Select Class and Term</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls._count.students} students)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a term</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} - {term.academicYear.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>

        {selectedClass && selectedTerm && (
          <>
            {/* Summary Statistics */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{summary.stats.totalStudents}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Class Average</p>
                        <p className="text-2xl font-bold text-green-600">{summary.stats.averageScore?.toFixed(1) || 0}%</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Highest Score</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.stats.highestScore?.toFixed(1) || 0}%</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                        <p className="text-2xl font-bold text-orange-600">{summary.stats.lowestScore?.toFixed(1) || 0}%</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* Results Table */}
            <Card>
              <Card.Header>
                <Card.Title>
                  {selectedClassName} - {selectedTermName} Results
                  {allPublished && (
                    <StatusBadge variant="success" className="ml-2">Published</StatusBadge>
                  )}
                  {hasResults && !allPublished && (
                    <StatusBadge variant="warning" className="ml-2">Draft</StatusBadge>
                  )}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                {loading ? (
                  <div className="text-center py-8">Loading results...</div>
                ) : results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Position</th>
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Admission No.</th>
                          <th className="text-center p-3 font-medium">Subjects</th>
                          <th className="text-center p-3 font-medium">Total Score</th>
                          <th className="text-center p-3 font-medium">Average</th>
                          <th className="text-center p-3 font-medium">Status</th>
                          <th className="text-center p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => (
                          <tr key={result.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center">
                                {result.position && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    result.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    result.position === 2 ? 'bg-gray-100 text-gray-800' :
                                    result.position === 3 ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {result.position}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">
                                {result.student.firstName} {result.student.lastName}
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">
                              {result.student.admissionNumber}
                            </td>
                            <td className="p-3 text-center">
                              {result.totalSubjects}
                            </td>
                            <td className="p-3 text-center font-medium">
                              {result.totalScore.toFixed(1)}
                            </td>
                            <td className="p-3 text-center">
                              <div className="font-medium text-blue-600">
                                {result.averageScore.toFixed(1)}%
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <StatusBadge
                                variant={result.isPublished ? "success" : "warning"}
                              >
                                {result.isPublished ? "Published" : "Draft"}
                              </StatusBadge>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  intent="action"
                                  size="sm"
                                  onClick={() => navigate(`/results/view/${result.student.id}/${selectedTerm}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  intent="primary"
                                  size="sm"
                                  onClick={() => navigate(`/results/edit/${result.student.id}/${selectedTerm}`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-500 mb-4">No results have been entered for this class and term yet.</p>
                    <Button
                      intent="primary"
                      onClick={handleEnterResults}
                    >
                      Enter Results
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Grade Distribution */}
            {summary && Object.keys(summary.gradeDistribution).length > 0 && (
              <Card className="mt-6">
                <Card.Header>
                  <Card.Title>Grade Distribution</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(summary.gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getGradeColor(grade)}`}>
                          {grade}
                        </div>
                        <div className="mt-2 text-sm font-medium">{count} students</div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </PageContent>
    </PageContainer>
  );
}