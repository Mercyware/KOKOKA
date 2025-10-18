import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, Download, ArrowLeft, Loader2, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageContainer, PageHeader, PageTitle, PageActions, PageContent } from '@/components/ui/page';
import { useToast } from '@/hooks/use-toast';
import { get } from '../../services/api';

/**
 * Convert S3 URL to use backend proxy to avoid CORS issues
 */
const getProxiedImageUrl = (s3Url: string | undefined): string | undefined => {
  if (!s3Url) return undefined;

  // If it's already a relative URL or proxy URL, return as is
  if (!s3Url.startsWith('http')) return s3Url;

  try {
    // Extract the S3 key from the URL
    // Format: https://bucket-name.s3.region.amazonaws.com/schoolId/type/filename
    const url = new URL(s3Url);
    const s3Key = url.pathname.substring(1); // Remove leading slash

    // Return proxy URL (VITE_API_URL already includes /api)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${apiUrl}/images/s3/${s3Key}`;
  } catch (error) {
    console.error('Failed to parse S3 URL:', error);
    return s3Url;
  }
};

interface SubjectGrade {
  subjectName: string;
  subjectCode: string;
  ca1?: number;
  ca2?: number;
  fat?: number;
  sat?: number;
  total: number;
  maxScore: number;
  grade: string;
  remark: string;
  position?: number;
}

interface TerminalReportData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    registrationNumber: string;
    profilePictureUrl?: string;
    dateOfBirth: Date;
    gender: string;
  };
  class: {
    id: string;
    name: string;
    level: number;
  };
  term: {
    id: string;
    name: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  school: {
    id: string;
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  subjectGrades: SubjectGrade[];
  totalScore: number;
  averageScore: number;
  position?: number;
  classSize?: number;
  daysPresent: number;
  daysAbsent: number;
  timesLate: number;
  conductGrade?: string;
  teacherComment?: string;
  principalComment?: string;
  nextTermBegins?: Date;
}

const TerminalReport: React.FC = () => {
  const { studentId, termId } = useParams<{ studentId: string; termId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<TerminalReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId && termId) {
      fetchTerminalReport();
    }
  }, [studentId, termId]);

  const fetchTerminalReport = async () => {
    setLoading(true);
    try {
      const response = await get<any>(`/results/terminal-report/${studentId}/${termId}`);
      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load terminal report',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching terminal report:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while loading the terminal report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !reportData) return;

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we generate your PDF document.',
      });

      // Get the printable element
      const element = printRef.current;

      // Wait for all images to load
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          }
        });
      });
      await Promise.all(imagePromises);

      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        foreignObjectRendering: false
      });

      // Calculate PDF dimensions (A4 size)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const fileName = `Terminal_Report_${reportData.student.lastName}_${reportData.student.firstName}_${reportData.term.name}_${reportData.academicYear.name}.pdf`;

      // Save PDF
      pdf.save(fileName);

      toast({
        title: 'Success!',
        description: 'PDF downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading terminal report...</span>
        </div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Terminal report not found</p>
          <Button intent="action" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @media print {
          body *, nav, header, aside, footer {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hide {
            display: none !important;
          }
        }

        @page {
          size: A4;
          margin: 10mm;
        }

        .report-card {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
      `}</style>

      <PageContainer className="print-hide">
        <PageHeader>
          <div className="flex justify-between items-center">
            <div>
              <PageTitle>Terminal Report Card</PageTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {reportData.student.lastName} {reportData.student.firstName} - {reportData.academicYear.name} ({reportData.term.name})
              </p>
            </div>
            <PageActions>
              <Button intent="action" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button intent="action" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button intent="primary" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </PageActions>
          </div>
        </PageHeader>

        <PageContent>
          <Card className="p-6">

        {/* Printable Report */}
        <div
          id="printable-report"
          ref={printRef}
          className="report-card bg-white shadow-lg"
          style={{ maxWidth: '210mm', margin: '0 auto' }}
        >
          {/* Header - Blue gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            padding: '10px 16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              {/* School Logo */}
              <div style={{ flex: '0 0 55px' }}>
                {reportData.school.logo ? (
                  <img
                    src={getProxiedImageUrl(reportData.school.logo)}
                    alt={reportData.school.name}
                    crossOrigin="anonymous"
                    style={{ width: '55px', height: '55px', objectFit: 'contain', background: 'white', borderRadius: '6px', padding: '4px' }}
                  />
                ) : (
                  <div style={{ width: '55px', height: '55px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                    {reportData.school.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* School Info */}
              <div style={{ flex: 1, padding: '0 12px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px', letterSpacing: '0.5px' }}>
                  {reportData.school.name}
                </h1>
                {reportData.school.address && (
                  <p style={{ fontSize: '9px', marginBottom: '2px', opacity: 0.95 }}>
                    {reportData.school.address}
                  </p>
                )}
                <div style={{ fontSize: '8px', opacity: 0.9 }}>
                  {reportData.school.phone && <span>Tel: {reportData.school.phone}</span>}
                  {reportData.school.phone && reportData.school.email && <span> | </span>}
                  {reportData.school.email && <span>Email: {reportData.school.email}</span>}
                </div>
              </div>

              {/* Student Photo */}
              <div style={{ flex: '0 0 55px' }}>
                {reportData.student.profilePictureUrl ? (
                  <img
                    src={getProxiedImageUrl(reportData.student.profilePictureUrl)}
                    alt="Student"
                    crossOrigin="anonymous"
                    style={{ width: '55px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '2px solid white' }}
                  />
                ) : (
                  <div style={{ width: '55px', height: '70px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>
                    No Photo
                  </div>
                )}
              </div>
            </div>

            <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', padding: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}>
              STUDENT REPORT CARD
            </h2>
          </div>

          {/* Report Body */}
          <div style={{ padding: '10px 16px' }}>
            {/* Academic Year and Term Bar */}
            <div style={{
              background: '#eff6ff',
              padding: '6px 12px',
              borderRadius: '4px',
              marginBottom: '8px',
              border: '1px solid #bfdbfe',
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              Academic Year: {reportData.academicYear.name} &nbsp;|&nbsp; Term: {reportData.term.name}
            </div>

            {/* Student Information Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '8px',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>STUDENT NAME:</td>
                      <td style={{ padding: '2px 0', fontWeight: '600', textTransform: 'uppercase', color: '#1e293b' }}>
                        {reportData.student.lastName} {reportData.student.firstName} {reportData.student.middleName}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>ADMISSION NO.:</td>
                      <td style={{ padding: '2px 0', fontWeight: '600', color: '#1e293b' }}>{reportData.student.registrationNumber}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>CLASS:</td>
                      <td style={{ padding: '2px 0', fontWeight: '600', color: '#1e293b' }}>{reportData.class.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>CLASS TEACHER:</td>
                      <td style={{ padding: '2px 0', fontWeight: '600', color: '#1e293b' }}>-</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>Position in Class:</td>
                      <td style={{ padding: '2px 0', fontWeight: '700', color: '#dc2626', fontSize: '10px' }}>
                        {reportData.position ? `${reportData.position}${getOrdinalSuffix(reportData.position)}` : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>Total Average:</td>
                      <td style={{ padding: '2px 0', fontWeight: '700', color: '#059669', fontSize: '10px' }}>
                        {reportData.averageScore.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', color: '#64748b', fontWeight: '600' }}>Total Subjects:</td>
                      <td style={{ padding: '2px 0', fontWeight: '600', color: '#1e293b' }}>{reportData.subjectGrades.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Performance Title */}
            <div style={{
              background: '#1e40af',
              color: 'white',
              padding: '4px 12px',
              fontWeight: '700',
              fontSize: '10px',
              textTransform: 'uppercase',
              marginBottom: '0',
              letterSpacing: '0.3px'
            }}>
              ACADEMIC PERFORMANCE
            </div>

            {/* Grading Table */}
            <table style={{
              width: '100%',
              border: '1px solid #cbd5e1',
              borderCollapse: 'collapse',
              marginBottom: '8px',
              fontSize: '8px',
              background: 'white'
            }}>
              <thead>
                <tr style={{ background: '#dbeafe', color: '#1e40af' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '8px' }} rowSpan={2}>S/N</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 5px', textAlign: 'left', fontWeight: '700', fontSize: '8px' }} rowSpan={2}>SUBJECT</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    1ST CA<br/>(10)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    2ND CA<br/>(10)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    3RD CA<br/>(10)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    4TH CA<br/>(10)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    EXAM<br/>(60)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '7px' }} rowSpan={2}>
                    TOTAL<br/>(100)
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 3px', textAlign: 'center', fontWeight: '700', fontSize: '8px' }} rowSpan={2}>
                    GRADE
                  </th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '4px 5px', textAlign: 'center', fontWeight: '700', fontSize: '8px' }} rowSpan={2}>
                    REMARK
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjectGrades.map((subject, index) => (
                  <tr key={index} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px 5px', fontWeight: '600', color: '#1e293b' }}>{subject.subjectName}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{subject.ca1 || '-'}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{subject.ca2 || '-'}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{subject.fat || '-'}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{subject.sat || '-'}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', fontWeight: '600' }}>
                      {((subject.ca1 || 0) + (subject.ca2 || 0) + (subject.fat || 0) + (subject.sat || 0))}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', fontWeight: '700', color: '#1e40af', fontSize: '9px' }}>
                      {subject.total}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', fontWeight: '700', color: getGradeColor(subject.grade), fontSize: '9px' }}>
                      {subject.grade}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '3px 5px', textAlign: 'center', fontSize: '8px' }}>
                      {subject.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grading Scale and Attendance Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
              {/* Grading Scale */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#1e40af', color: 'white', padding: '3px 8px', fontWeight: '700', fontSize: '8px' }}>
                  GRADING SCALE
                </div>
                <div style={{ padding: '4px 8px' }}>
                  <table style={{ width: '100%', fontSize: '7px' }}>
                    <tbody>
                      <tr><td style={{ padding: '1px 0' }}><strong>A:</strong> 70-100 - Excellent</td></tr>
                      <tr><td style={{ padding: '1px 0' }}><strong>B:</strong> 60-69 - Very Good</td></tr>
                      <tr><td style={{ padding: '1px 0' }}><strong>C:</strong> 50-59 - Good</td></tr>
                      <tr><td style={{ padding: '1px 0' }}><strong>D:</strong> 40-49 - Fair</td></tr>
                      <tr><td style={{ padding: '1px 0' }}><strong>F:</strong> 0-39 - Fail</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance & Conduct */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#1e40af', color: 'white', padding: '3px 8px', fontWeight: '700', fontSize: '8px' }}>
                  ATTENDANCE & CONDUCT
                </div>
                <div style={{ padding: '4px 8px' }}>
                  <table style={{ width: '100%', fontSize: '7px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '1px 0', color: '#64748b' }}>Days Present:</td>
                        <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: '700' }}>{reportData.daysPresent}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1px 0', color: '#64748b' }}>Days Absent:</td>
                        <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: '700' }}>{reportData.daysAbsent}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1px 0', color: '#64748b' }}>Attendance %:</td>
                        <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                          {((reportData.daysPresent / (reportData.daysPresent + reportData.daysAbsent)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1px 0', color: '#64748b' }}>Times Late:</td>
                        <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: '700' }}>{reportData.timesLate}</td>
                      </tr>
                      {reportData.conductGrade && (
                        <tr>
                          <td style={{ padding: '1px 0', color: '#64748b' }}>Conduct:</td>
                          <td style={{ padding: '1px 0', textAlign: 'right', fontWeight: '700' }}>{reportData.conductGrade}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Class Teacher's Comment */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '6px', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '3px 8px', fontWeight: '700', fontSize: '8px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                CLASS TEACHER'S COMMENT
              </div>
              <div style={{ padding: '5px 8px', minHeight: '25px', fontSize: '8px', lineHeight: '1.3' }}>
                {reportData.teacherComment || 'Excellent performance. Keep up the good work!'}
              </div>
            </div>

            {/* Principal's Comment */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '6px', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '3px 8px', fontWeight: '700', fontSize: '8px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                PRINCIPAL'S COMMENT
              </div>
              <div style={{ padding: '5px 8px', minHeight: '25px', fontSize: '8px', lineHeight: '1.3' }}>
                {reportData.principalComment || 'Good performance. Maintain the standard.'}
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '6px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', height: '20px', marginBottom: '3px' }}></div>
                <p style={{ fontSize: '7px', fontWeight: '600', color: '#475569' }}>Class Teacher's Signature</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', height: '20px', marginBottom: '3px' }}></div>
                <p style={{ fontSize: '7px', fontWeight: '600', color: '#475569' }}>Head Master's Signature</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', height: '20px', marginBottom: '3px' }}></div>
                <p style={{ fontSize: '7px', fontWeight: '600', color: '#475569' }}>Date Principal</p>
              </div>
            </div>

            {/* Footer */}
            {reportData.nextTermBegins && (
              <div style={{
                textAlign: 'center',
                padding: '4px 8px',
                background: '#eff6ff',
                borderRadius: '4px',
                fontSize: '8px',
                fontWeight: '600',
                color: '#1e40af',
                border: '1px solid #bfdbfe'
              }}>
                Next Term Begins: {format(new Date(reportData.nextTermBegins), 'MMMM do, yyyy')}
              </div>
            )}
          </div>
        </div>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

// Helper function to get grade color
function getGradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A': return '#059669';
    case 'B': return '#0284c7';
    case 'C': return '#d97706';
    case 'D': return '#dc2626';
    case 'F': return '#991b1b';
    default: return '#64748b';
  }
}

export default TerminalReport;
