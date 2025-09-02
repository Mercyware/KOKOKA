import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import DevSubdomainSelector from "@/components/DevSubdomainSelector";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import StudentsManager from "./pages/students/StudentsManager";
import ViewStudent from "@/pages/students/ViewStudent";
import CreateStudent from "./pages/students/CreateStudent";
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
// Staff Components
import StaffList from "./pages/staff/StaffList";
import CreateStaff from "./pages/staff/CreateStaff";
import EditStaff from "./pages/staff/EditStaff";
import StaffDetails from "./pages/staff/StaffDetails";

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

// No wrapper needed for CreateStudent as it handles navigation internally

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="edumanage-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/students" element={<StudentsManager />} />
            <Route path="/students/add" element={<CreateStudent />} />
            <Route path="/students/:studentId" element={<ViewStudentWrapper />} />
            <Route path="/students/:studentId/edit" element={<EditStudentFormWrapper />} />
            {/* School Settings - Academic Years Routes */}
            <Route path="/school-settings/academic-years" element={<AcademicYearsList />} />
            {/* School Settings - Academic Calendar Routes */}
            <Route path="/school-settings/academic-calendars" element={<AcademicCalendarsList />} />
            <Route path="/school-settings/academic-calendars/create" element={<CreateAcademicCalendar />} />
            <Route path="/school-settings/academic-calendars/edit/:id" element={<EditAcademicCalendar />} />
            
            {/* School Settings - Classes Routes */}
            <Route path="/school-settings/classes" element={<ClassesList />} />
            <Route path="/school-settings/classes/create" element={<ClassForm />} />
            <Route path="/school-settings/classes/edit/:id" element={<ClassForm />} />
            
            {/* School Settings - Sections Routes */}
            <Route path="/school-settings/sections" element={<SectionsList />} />
            <Route path="/school-settings/sections/create" element={<SectionForm />} />
            <Route path="/school-settings/sections/edit/:id" element={<SectionForm />} />
            
            {/* School Settings - Departments Routes */}
            <Route path="/school-settings/departments" element={<DepartmentsList />} />
            
            {/* School Settings - Subjects Routes */}
            <Route path="/school-settings/subjects" element={<SubjectsList />} />
            <Route path="/school-settings/subjects/create" element={<CreateSubject />} />
            <Route path="/school-settings/subjects/edit/:id" element={<EditSubject />} />
            
            {/* School Settings - Houses Routes */}
            <Route path="/school-settings/houses" element={<HousesList />} />
            
            {/* Staff Routes */}
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/create" element={<CreateStaff />} />
            <Route path="/staff/edit/:id" element={<EditStaff />} />
            <Route path="/staff/:id" element={<StaffDetails />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DevSubdomainSelector />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
