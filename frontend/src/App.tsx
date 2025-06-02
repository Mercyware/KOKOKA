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
import AddStudentForm from "./pages/students/AddStudentForm";

const queryClient = new QueryClient();

function ViewStudentWrapper() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  if (!studentId) return null;
  return (
    <ViewStudent
      studentId={studentId}
      onBack={() => navigate(-1)}
      onEdit={() => {}}
    />
  );
}

function AddStudentFormWrapper() {
  const navigate = useNavigate();
  return (
    <AddStudentForm
      onBack={() => navigate(-1)}
      onSave={() => navigate("/students")}
    />
  );
}

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
            <Route path="/students" element={<StudentsManager />} />
            <Route path="/students/add" element={<AddStudentFormWrapper />} />
            <Route path="/students/:studentId" element={<ViewStudentWrapper />} />
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
