import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/layout/Layout";
import DevSubdomainSelector from "@/components/DevSubdomainSelector";
import Index from "./pages/Index";
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
import OAuthCallback from "./pages/auth/OAuthCallback";
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
// Curriculum Components
import CurriculumList from "./pages/school-settings/curricula/CurriculumList";
import CreateCurriculum from "./pages/school-settings/curricula/CreateCurriculum";
import EditCurriculum from "./pages/school-settings/curricula/EditCurriculum";
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
// New Curriculum and Grade Management Components
import GlobalCurriculumRegistry from "./pages/curriculum/GlobalCurriculumRegistry";
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
// Behavioral Assessment Components
import BehavioralAssessmentsList from "./pages/behavioral/BehavioralAssessmentsList";
import RecordBehavioralScores from "./pages/behavioral/RecordBehavioralScores";
// Attendance Components
import AttendanceDashboard from "./pages/attendance/AttendanceDashboardNew";
import AttendanceEntry from "./pages/attendance/TakeAttendanceNew";
import AttendanceReports from "./pages/attendance/AttendanceReportsNew";
import QRAttendanceScanner from "./pages/attendance/QRAttendanceScanner";
import StudentAttendanceView from "./pages/attendance/StudentAttendanceView";

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



const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* Authentication and landing pages (no layout) */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Main application routes (pages handle their own layout) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentsManager />} />
            <Route path="/students/add" element={<AddStudentForm />} />
            <Route path="/students/:studentId" element={<ViewStudentWrapper />} />
            <Route path="/students/:studentId/edit" element={<EditStudentFormWrapper />} />
            
            {/* School Settings Routes */}
            <Route path="/school-settings/academic-years" element={<AcademicYearsList />} />
            <Route path="/school-settings/academic-calendars" element={<AcademicCalendarsList />} />
            <Route path="/school-settings/academic-calendars/create" element={<CreateAcademicCalendar />} />
            <Route path="/school-settings/academic-calendars/edit/:id" element={<EditAcademicCalendar />} />
            
            <Route path="/school-settings/classes" element={<ClassesList />} />
            <Route path="/school-settings/classes/create" element={<ClassForm />} />
            <Route path="/school-settings/classes/edit/:id" element={<ClassForm />} />
            
            <Route path="/school-settings/sections" element={<SectionsList />} />
            <Route path="/school-settings/sections/create" element={<SectionForm />} />
            <Route path="/school-settings/sections/edit/:id" element={<SectionForm />} />
            
            <Route path="/school-settings/departments" element={<DepartmentsList />} />
            
            <Route path="/school-settings/subjects" element={<SubjectsList />} />
            <Route path="/school-settings/subjects/create" element={<CreateSubject />} />
            <Route path="/school-settings/subjects/edit/:id" element={<EditSubject />} />
            
            <Route path="/school-settings/curricula" element={<CurriculumList />} />
            <Route path="/school-settings/curricula/create" element={<CreateCurriculum />} />
            <Route path="/school-settings/curricula/:id/edit" element={<EditCurriculum />} />
            
            <Route path="/school-settings/class-subjects" element={<ClassSubjectHistory />} />
            <Route path="/school-settings/class-subjects-simple" element={<SimpleClassSubjectHistory />} />
            <Route path="/school-settings/class-subjects-test" element={<TestClassSubjectHistory />} />
            
            <Route path="/school-settings/houses" element={<HousesList />} />
            
            {/* Staff Routes */}
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/create" element={<CreateStaff />} />
            <Route path="/staff/edit/:id" element={<EditStaff />} />
            <Route path="/staff/:id" element={<ViewStaff />} />
            
            {/* Academic Routes */}
            <Route path="/scores-add" element={<ScoreEntryModes />} />
            <Route path="/academics/scores" element={<ScoreEntryModes />} />
            <Route path="/academics/scores/standard" element={<AddScores />} />
            <Route path="/academics/scores/quick-entry" element={<AddScoresQuickEntry />} />
            <Route path="/academics/scores/gradebook" element={<AddScoresGradeBook />} />

            {/* Assessment Routes */}
            <Route path="/assessments" element={<AssessmentsList />} />
            <Route path="/assessments/create" element={<CreateAssessment />} />

            {/* Behavioral Assessment Routes */}
            <Route path="/behavioral/record" element={<RecordBehavioralScores />} />
            <Route path="/behavioral-assessments" element={<BehavioralAssessmentsList />} />

            {/* Teacher Assignment Routes */}
            <Route path="/teachers/class-assignments" element={<ClassAssignments />} />
            <Route path="/teachers/class-assignments/create" element={<AssignmentForm mode="create" />} />
            <Route path="/teachers/class-assignments/:id" element={<AssignmentDetails />} />
            <Route path="/teachers/class-assignments/:id/edit" element={<AssignmentForm mode="edit" />} />
            <Route path="/teachers/class-assignments/history" element={<AssignmentHistory />} />
            <Route path="/teachers/subject-assignments" element={<TeacherSubjectAssignmentsList />} />
            <Route path="/academics/subject-assignments" element={<SubjectAssignments />} />

            {/* Legacy Staff Routes */}
            <Route path="/staff/subject-assignments" element={<TeacherSubjectAssignmentsList />} />
            
            {/* Curriculum Routes */}
            <Route path="/curriculum/global" element={<GlobalCurriculumRegistry />} />
            <Route path="/curriculum/school" element={<CurriculumList />} />
            <Route path="/curriculum/progress" element={<Layout><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900">Curriculum Progress Page</h1><p className="text-gray-600 mt-2">Coming soon - curriculum progress tracking features</p></div></Layout>} />
            <Route path="/curriculum/analytics" element={<Layout><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900">Curriculum Analytics Page</h1><p className="text-gray-600 mt-2">Coming soon - curriculum analytics and insights</p></div></Layout>} />
            
            {/* Grade Book Routes */}
            <Route path="/gradebook/reports" element={<ReportCards />} />
            
            {/* Parent Dashboard Routes */}
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/gradebook/parent" element={<ParentDashboard />} />
            <Route path="/parent/students/:studentId/grades" element={<StudentGradeView />} />
            <Route path="/parent/students/:studentId/progress" element={<StudentGradeView />} />
            <Route path="/parent/students/:studentId/attendance" element={<StudentAttendanceView />} />
            
            {/* Student Grade Views */}
            <Route path="/student/grades" element={<StudentGradeView />} />
            <Route path="/student/progress" element={<StudentGradeView />} />
            
            {/* Attendance Management Routes */}
            <Route path="/attendance" element={<AttendanceDashboard />} />
            <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
            <Route path="/attendance/entry" element={<AttendanceEntry />} />
            <Route path="/attendance/take" element={<AttendanceEntry />} />
            <Route path="/attendance/take/:classId" element={<AttendanceEntry />} />
            <Route path="/attendance/reports" element={<AttendanceReports />} />
            <Route path="/attendance/bulk" element={<AttendanceEntry />} />
            <Route path="/attendance/qr-scanner" element={<QRAttendanceScanner />} />
            <Route path="/students/:studentId/attendance" element={<StudentAttendanceView />} />
            
            {/* Settings and Security */}
            <Route path="/settings" element={<Layout><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900">Settings Page</h1><p className="text-gray-600 mt-2">Coming soon - settings configuration</p></div></Layout>} />
            <Route path="/security" element={<Layout><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900">Security Page</h1><p className="text-gray-600 mt-2">Coming soon - security settings</p></div></Layout>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DevSubdomainSelector />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
