import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/layout/Layout";
import DevSubdomainSelector from "@/components/DevSubdomainSelector";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import StudentsManager from "./pages/students/StudentsManager";
import ViewStudent from "@/pages/students/ViewStudent";
import AddStudentForm from "./pages/students/AddStudentForm";
import EditStudentForm from "./pages/students/EditStudentForm";
import Register from "./pages/auth/Register";
import RegisterSchool from "./pages/auth/RegisterSchool";
import RegistrationSuccess from "./pages/auth/RegistrationSuccess";
import VerifyEmail from './pages/auth/VerifyEmail';
import OAuthCallback from './pages/auth/OAuthCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import UserProfile from './pages/profile/UserProfile';
// Academic Year Components
import AcademicYearsList from "./pages/school-settings/academicYears/AcademicYearsList";
// Academic Calendar Components
import AcademicCalendarsList from "./pages/school-settings/academicCalendars/AcademicCalendarsList";
import CreateAcademicCalendar from "./pages/school-settings/academicCalendars/CreateAcademicCalendar";
import EditAcademicCalendar from "./pages/school-settings/academicCalendars/EditAcademicCalendar";
// School Settings Components
import ClassesList from "./pages/school-settings/classes/ClassesList";
import ClassForm from "./pages/school-settings/classes/ClassForm";
import SectionsList from "./pages/school-settings/sections/SectionsList";
import SectionForm from "./pages/school-settings/sections/SectionForm";
import DepartmentsList from "./pages/school-settings/departments/DepartmentsList";
import SubjectsList from "./pages/school-settings/subjects/SubjectsList";
import CreateSubject from "./pages/school-settings/subjects/CreateSubject";
import EditSubject from "./pages/school-settings/subjects/EditSubject";
import HousesList from "./pages/school-settings/houses/HousesList";
// Class-Subject History Components
import ClassSubjectHistory from "./pages/school-settings/class-subjects/ClassSubjectHistory";
import TestClassSubjectHistory from "./pages/school-settings/class-subjects/TestClassSubjectHistory";
import SimpleClassSubjectHistory from "./pages/school-settings/class-subjects/SimpleClassSubjectHistory";
// Staff Components
import StaffList from "./pages/staff/StaffList";
import CreateStaff from "./pages/staff/CreateStaff";
import EditStaff from "./pages/staff/EditStaff";
import ViewStaff from "./pages/staff/ViewStaff";
// Staff Subject Assignment Components
import TeacherSubjectAssignmentsList from "./pages/assignments/staff-subjects/TeacherSubjectAssignmentsList";
// Class Teacher Assignment Components
import ClassAssignments from "./pages/assignments/class-teachers/ClassAssignments";
import AssignmentForm from "./pages/assignments/class-teachers/AssignmentForm";
import AssignmentHistory from "./pages/assignments/class-teachers/AssignmentHistory";
import AssignmentDetails from "./pages/assignments/class-teachers/AssignmentDetails";
// New Grade Management Components
import ReportCards from "./pages/gradebook/ReportCards";
import ParentDashboard from "./pages/parent/ParentDashboard";
import StudentGradeView from "./pages/student/StudentGradeView";
// Academic Components
import AddScores from "./pages/academics/AddScores";
import AddScoresQuickEntry from "./pages/academics/AddScores.QuickEntry";
import AddScoresGradeBook from "./pages/academics/AddScores.GradeBook";
import ScoreEntryModes from "./pages/academics/ScoreEntryModes";
import SubjectAssignments from "./pages/academics/SubjectAssignments";
// Assessment Components
import AssessmentsList from "./pages/assessments/AssessmentsList";
import CreateAssessment from "./pages/assessments/CreateAssessment";
import ViewAssessment from "./pages/assessments/ViewAssessment";
import EditAssessment from "./pages/assessments/EditAssessment";
// Behavioral Assessment Components
import BehavioralAssessmentsList from "./pages/behavioral/BehavioralAssessmentsList";
import RecordBehavioralScores from "./pages/behavioral/RecordBehavioralScores";
// Attendance Components
import AttendanceDashboard from "./pages/attendance/AttendanceDashboardNew";
import AttendanceEntry from "./pages/attendance/TakeAttendanceNew";
import AttendanceReports from "./pages/attendance/AttendanceReportsNew";
import StudentAttendanceView from "./pages/attendance/StudentAttendanceView";
// Settings Components
import SchoolSettings from "./pages/settings/SchoolSettings";
// Library Components
import BooksList from "./pages/library/BooksList";
import AddBook from "./pages/library/AddBook";
import BookIssues from "./pages/library/BookIssues";
import ViewBook from "./pages/library/ViewBook";
// Hostel Components
import HostelList from "./pages/hostel/HostelList";
import AddHostel from "./pages/hostel/AddHostel";
import RoomManagement from "./pages/hostel/RoomManagement";
import Allocations from "./pages/hostel/Allocations";
import HostelFees from "./pages/hostel/HostelFees";
import { MessagingPage } from "./pages/messaging";
import NotificationsPage from "./pages/NotificationsPage";
import { TransportationPage, RoutesPage, VehiclesPage, AssignmentsPage, MaintenancePage } from "./pages/transportation";
import { InventoryPage, ItemsPage, TransactionsPage, AllocationsPage } from "./pages/inventory";
import { FeeStructuresPage, InvoicesPage, PaymentsPage, PaymentReportPage, OutstandingPage } from "./pages/finance";
import CreateInvoicePage from "./pages/finance/CreateInvoicePage";
import ViewInvoicePage from "./pages/finance/ViewInvoicePage";
import PayInvoicePage from "./pages/finance/PayInvoicePage";
import PaymentCallbackPage from "./pages/finance/PaymentCallbackPage";
import MasterInvoicesPage from "./pages/finance/MasterInvoicesPage";
import CreateMasterInvoicePage from "./pages/finance/CreateMasterInvoicePage";
import ViewMasterInvoicePage from "./pages/finance/ViewMasterInvoicePage";
import GenerateChildInvoicesPage from "./pages/finance/GenerateChildInvoicesPage";
import { AccountingDashboard, IncomePage, ExpenditurePage } from "./pages/accounting";
// Results Components
import TerminalReport from "./pages/results/TerminalReport";
import TerminalReportSelector from "./pages/results/TerminalReportSelector";
import StandardReportCard from "./pages/results/StandardReportCard";
// Analytics/AI Components
import StudentAnalyticsDashboard from "./pages/analytics/StudentAnalyticsDashboard";
import AtRiskStudentsDashboard from "./pages/analytics/AtRiskStudentsDashboard";
// Assignment Components
import StudentAssignmentsList from "./pages/assignments/StudentAssignmentsList";
import SubmitAssignment from "./pages/assignments/SubmitAssignment";
import TeacherGradingQueue from "./pages/assignments/TeacherGradingQueue";

const queryClient = new QueryClient();

function ViewStudentWrapper() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  if (!studentId) return null;
  return (
    <ViewStudent
      studentId={studentId}
      onBack={() => navigate(-1)}
      onEdit={() => navigate(`/students/${studentId}/edit`)}
    />
  );
}

function EditStudentFormWrapper() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  if (!studentId) return null;
  return (
    <EditStudentForm
      studentId={studentId}
      onBack={() => navigate(`/students/${studentId}`)}
      onSave={() => navigate(`/students/${studentId}`)}
    />
  );
}



import { SchoolSettingsProvider } from './contexts/SchoolSettingsContext';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SchoolSettingsProvider>
      <ThemeProvider defaultTheme="system" storageKey="edumanage-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public routes - Authentication and landing pages */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes - Main application */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><StudentsManager /></ProtectedRoute>} />
            <Route path="/students/add" element={<ProtectedRoute><AddStudentForm /></ProtectedRoute>} />
            <Route path="/students/:studentId" element={<ProtectedRoute><ViewStudentWrapper /></ProtectedRoute>} />
            <Route path="/students/:studentId/edit" element={<ProtectedRoute><EditStudentFormWrapper /></ProtectedRoute>} />

            {/* School Settings Routes */}
            <Route path="/school-settings/academic-years" element={<ProtectedRoute><AcademicYearsList /></ProtectedRoute>} />
            <Route path="/school-settings/academic-calendars" element={<ProtectedRoute><AcademicCalendarsList /></ProtectedRoute>} />
            <Route path="/school-settings/academic-calendars/create" element={<ProtectedRoute><CreateAcademicCalendar /></ProtectedRoute>} />
            <Route path="/school-settings/academic-calendars/edit/:id" element={<ProtectedRoute><EditAcademicCalendar /></ProtectedRoute>} />

            <Route path="/school-settings/classes" element={<ProtectedRoute><ClassesList /></ProtectedRoute>} />
            <Route path="/school-settings/classes/create" element={<ProtectedRoute><ClassForm /></ProtectedRoute>} />
            <Route path="/school-settings/classes/edit/:id" element={<ProtectedRoute><ClassForm /></ProtectedRoute>} />

            <Route path="/school-settings/sections" element={<ProtectedRoute><SectionsList /></ProtectedRoute>} />
            <Route path="/school-settings/sections/create" element={<ProtectedRoute><SectionForm /></ProtectedRoute>} />
            <Route path="/school-settings/sections/edit/:id" element={<ProtectedRoute><SectionForm /></ProtectedRoute>} />

            <Route path="/school-settings/departments" element={<ProtectedRoute><DepartmentsList /></ProtectedRoute>} />

            <Route path="/school-settings/subjects" element={<ProtectedRoute><SubjectsList /></ProtectedRoute>} />
            <Route path="/school-settings/subjects/create" element={<ProtectedRoute><CreateSubject /></ProtectedRoute>} />
            <Route path="/school-settings/subjects/edit/:id" element={<ProtectedRoute><EditSubject /></ProtectedRoute>} />

            <Route path="/school-settings/class-subjects" element={<ProtectedRoute><ClassSubjectHistory /></ProtectedRoute>} />
            <Route path="/school-settings/class-subjects-simple" element={<ProtectedRoute><SimpleClassSubjectHistory /></ProtectedRoute>} />
            <Route path="/school-settings/class-subjects-test" element={<ProtectedRoute><TestClassSubjectHistory /></ProtectedRoute>} />

            <Route path="/school-settings/houses" element={<ProtectedRoute><HousesList /></ProtectedRoute>} />
            
            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
            <Route path="/staff/create" element={<ProtectedRoute><CreateStaff /></ProtectedRoute>} />
            <Route path="/staff/edit/:id" element={<ProtectedRoute><EditStaff /></ProtectedRoute>} />
            <Route path="/staff/:id" element={<ProtectedRoute><ViewStaff /></ProtectedRoute>} />

            {/* Academic Routes */}
            <Route path="/scores-add" element={<ProtectedRoute><ScoreEntryModes /></ProtectedRoute>} />
            <Route path="/academics/scores" element={<ProtectedRoute><ScoreEntryModes /></ProtectedRoute>} />
            <Route path="/academics/scores/standard" element={<ProtectedRoute><AddScores /></ProtectedRoute>} />
            <Route path="/academics/scores/quick-entry" element={<ProtectedRoute><AddScoresQuickEntry /></ProtectedRoute>} />
            <Route path="/academics/scores/gradebook" element={<ProtectedRoute><AddScoresGradeBook /></ProtectedRoute>} />

            {/* Assessment Routes */}
            <Route path="/assessments" element={<ProtectedRoute><AssessmentsList /></ProtectedRoute>} />
            <Route path="/assessments/create" element={<ProtectedRoute><CreateAssessment /></ProtectedRoute>} />
            <Route path="/assessments/:id" element={<ProtectedRoute><ViewAssessment /></ProtectedRoute>} />
            <Route path="/assessments/:id/edit" element={<ProtectedRoute><EditAssessment /></ProtectedRoute>} />

            {/* Behavioral Assessment Routes */}
            <Route path="/behavioral/record" element={<ProtectedRoute><RecordBehavioralScores /></ProtectedRoute>} />
            <Route path="/behavioral-assessments" element={<ProtectedRoute><BehavioralAssessmentsList /></ProtectedRoute>} />

            {/* Teacher Assignment Routes */}
            <Route path="/teachers/class-assignments" element={<ProtectedRoute><ClassAssignments /></ProtectedRoute>} />
            <Route path="/teachers/class-assignments/create" element={<ProtectedRoute><AssignmentForm mode="create" /></ProtectedRoute>} />
            <Route path="/teachers/class-assignments/:id" element={<ProtectedRoute><AssignmentDetails /></ProtectedRoute>} />
            <Route path="/teachers/class-assignments/:id/edit" element={<ProtectedRoute><AssignmentForm mode="edit" /></ProtectedRoute>} />
            <Route path="/teachers/class-assignments/history" element={<ProtectedRoute><AssignmentHistory /></ProtectedRoute>} />
            <Route path="/teachers/subject-assignments" element={<ProtectedRoute><TeacherSubjectAssignmentsList /></ProtectedRoute>} />
            <Route path="/academics/subject-assignments" element={<ProtectedRoute><SubjectAssignments /></ProtectedRoute>} />

            {/* Legacy Staff Routes */}
            <Route path="/staff/subject-assignments" element={<ProtectedRoute><TeacherSubjectAssignmentsList /></ProtectedRoute>} />

            {/* Grade Book Routes */}
            <Route path="/gradebook/report-cards" element={<ProtectedRoute><Layout><ReportCards /></Layout></ProtectedRoute>} />

            {/* Parent Dashboard Routes */}
            <Route path="/parent/dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/gradebook/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/students/:studentId/grades" element={<ProtectedRoute><StudentGradeView /></ProtectedRoute>} />
            <Route path="/parent/students/:studentId/progress" element={<ProtectedRoute><StudentGradeView /></ProtectedRoute>} />
            <Route path="/parent/students/:studentId/attendance" element={<ProtectedRoute><StudentAttendanceView /></ProtectedRoute>} />

            {/* Student Grade Views */}
            <Route path="/student/grades" element={<ProtectedRoute><StudentGradeView /></ProtectedRoute>} />
            <Route path="/student/progress" element={<ProtectedRoute><StudentGradeView /></ProtectedRoute>} />

            {/* Attendance Management Routes */}
            <Route path="/attendance" element={<ProtectedRoute><AttendanceDashboard /></ProtectedRoute>} />
            <Route path="/attendance/dashboard" element={<ProtectedRoute><AttendanceDashboard /></ProtectedRoute>} />
            <Route path="/attendance/entry" element={<ProtectedRoute><AttendanceEntry /></ProtectedRoute>} />
            <Route path="/attendance/take" element={<ProtectedRoute><AttendanceEntry /></ProtectedRoute>} />
            <Route path="/attendance/take/:classId" element={<ProtectedRoute><AttendanceEntry /></ProtectedRoute>} />
            <Route path="/attendance/reports" element={<ProtectedRoute><AttendanceReports /></ProtectedRoute>} />
            <Route path="/attendance/reports/class/:classId" element={<ProtectedRoute><AttendanceReports /></ProtectedRoute>} />
            <Route path="/attendance/bulk" element={<ProtectedRoute><AttendanceEntry /></ProtectedRoute>} />
            <Route path="/students/:studentId/attendance" element={<ProtectedRoute><StudentAttendanceView /></ProtectedRoute>} />

            {/* Settings and Security */}
            <Route path="/settings" element={<ProtectedRoute><SchoolSettings /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Layout><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900">Security Page</h1><p className="text-gray-600 mt-2">Coming soon - security settings</p></div></Layout></ProtectedRoute>} />

            {/* Library Routes */}
            <Route path="/library/books" element={<ProtectedRoute><BooksList /></ProtectedRoute>} />
            <Route path="/library/books/:bookId" element={<ProtectedRoute><ViewBook /></ProtectedRoute>} />
            <Route path="/library/add-book" element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
            <Route path="/library/issues" element={<ProtectedRoute><BookIssues /></ProtectedRoute>} />

            {/* Hostel Routes */}
            <Route path="/hostel" element={<ProtectedRoute><HostelList /></ProtectedRoute>} />
            <Route path="/hostel/add" element={<ProtectedRoute><AddHostel /></ProtectedRoute>} />
            <Route path="/hostel/edit/:id" element={<ProtectedRoute><AddHostel /></ProtectedRoute>} />
            <Route path="/hostel/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
            <Route path="/hostel/allocations" element={<ProtectedRoute><Allocations /></ProtectedRoute>} />
            <Route path="/hostel/fees" element={<ProtectedRoute><HostelFees /></ProtectedRoute>} />

            {/* Messaging */}
            <Route path="/messaging" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />

            {/* Transportation */}
            <Route path="/transportation" element={<ProtectedRoute><TransportationPage /></ProtectedRoute>} />
            <Route path="/transportation/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/transportation/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
            <Route path="/transportation/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/transportation/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />

            {/* Inventory */}
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/inventory/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
            <Route path="/inventory/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/inventory/allocations" element={<ProtectedRoute><AllocationsPage /></ProtectedRoute>} />

            {/* Finance Routes */}
            <Route path="/finance/fee-structures" element={<ProtectedRoute><FeeStructuresPage /></ProtectedRoute>} />
            <Route path="/finance/master-invoices" element={<ProtectedRoute><MasterInvoicesPage /></ProtectedRoute>} />
            <Route path="/finance/master-invoices/create" element={<ProtectedRoute><CreateMasterInvoicePage /></ProtectedRoute>} />
            <Route path="/finance/master-invoices/:id" element={<ProtectedRoute><ViewMasterInvoicePage /></ProtectedRoute>} />
            <Route path="/finance/master-invoices/:id/generate" element={<ProtectedRoute><GenerateChildInvoicesPage /></ProtectedRoute>} />
            <Route path="/finance/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
            <Route path="/finance/invoices/create" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />
            <Route path="/finance/invoices/:invoiceId" element={<ProtectedRoute><ViewInvoicePage /></ProtectedRoute>} />
            <Route path="/finance/invoices/:id/pay" element={<PayInvoicePage />} />
            <Route path="/finance/payment-callback" element={<PaymentCallbackPage />} />
            <Route path="/finance/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />

            {/* Accounting Routes */}
            <Route path="/accounting/dashboard" element={<ProtectedRoute><AccountingDashboard /></ProtectedRoute>} />
            <Route path="/accounting/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
            <Route path="/accounting/expenditure" element={<ProtectedRoute><ExpenditurePage /></ProtectedRoute>} />

            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Results Routes */}
            <Route path="/results/terminal-report-select/:studentId" element={<ProtectedRoute><TerminalReportSelector /></ProtectedRoute>} />
            <Route path="/results/terminal-report/:studentId/:termId" element={<ProtectedRoute><TerminalReport /></ProtectedRoute>} />
            <Route path="/results/report-card/:studentId/:termId" element={<ProtectedRoute><StandardReportCard /></ProtectedRoute>} />

            {/* Analytics/AI Routes */}
            <Route path="/analytics/students/:studentId" element={<ProtectedRoute><StudentAnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/analytics/at-risk" element={<ProtectedRoute><AtRiskStudentsDashboard /></ProtectedRoute>} />

            {/* Assignment Routes */}
            <Route path="/assignments" element={<ProtectedRoute><StudentAssignmentsList /></ProtectedRoute>} />
            <Route path="/assignments/:assignmentId/submit" element={<ProtectedRoute><SubmitAssignment /></ProtectedRoute>} />
            <Route path="/assignments/grading-queue" element={<ProtectedRoute><TeacherGradingQueue /></ProtectedRoute>} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DevSubdomainSelector />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </SchoolSettingsProvider>
  </QueryClientProvider>
);

export default App;
