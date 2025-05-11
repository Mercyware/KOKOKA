import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterSchool from './pages/auth/RegisterSchool';
import Welcome from './pages/auth/Welcome';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Placeholder for other pages
const Unauthorized = () => <div>Unauthorized</div>;
const NotFound = () => <div>Page Not Found</div>;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
<Route 
  path="/register-school" 
  element={
    <React.Suspense fallback={<div>Loading...</div>}>
      <RegisterSchool />
    </React.Suspense>
  } 
/>
<Route 
  path="/auth/welcome" 
  element={
    <React.Suspense fallback={<div>Loading...</div>}>
      <Welcome />
    </React.Suspense>
  } 
/>
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/school"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div>School Management</div>
                </ProtectedRoute>
              }
            />
            
            {/* Academic Routes */}
            <Route
              path="/academics/classes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Classes Management</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Subjects Management</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/timetable"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Timetable Management</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/academic-years"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div>Academic Years Management</div>
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/students/list"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Students List</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Student Attendance</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/grades"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Student Grades</div>
                </ProtectedRoute>
              }
            />
            
            {/* Staff Routes */}
            <Route
              path="/staff/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div>Teachers Management</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div>Admin Staff Management</div>
                </ProtectedRoute>
              }
            />
            
            {/* Exam Routes */}
            <Route
              path="/exams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <div>Exams Management</div>
                </ProtectedRoute>
              }
            />
            
            {/* Fee Routes */}
            <Route
              path="/fees"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cashier', 'superadmin']}>
                  <div>Fees Management</div>
                </ProtectedRoute>
              }
            />
            
            {/* Settings Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div>Settings</div>
                </ProtectedRoute>
              }
            />
            
            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>User Profile</div>
                </ProtectedRoute>
              }
            />
            
            {/* Utility Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />
            
            {/* Redirect to dashboard if authenticated, otherwise to login */}
<Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
