import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';
import DevSubdomainSelector from './components/DevSubdomainSelector';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterSchool from './pages/auth/RegisterSchool';
import Welcome from './pages/auth/Welcome';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Student Pages
import CreateStudent from './pages/students/CreateStudent';
import StudentHistorySearch from './pages/students/StudentHistorySearch';
import StudentDetails from './pages/students/StudentDetails';
import StudentFilterList from './pages/students/StudentFilterList';

// Staff Pages
import StaffList from './pages/staff/StaffList';
import CreateStaff from './pages/staff/CreateStaff';
import StaffDetails from './pages/staff/StaffDetails';
import EditStaff from './pages/staff/EditStaff';

// Academic Pages
import ClassesList from './pages/academics/classes/ClassesList';
import CreateClass from './pages/academics/classes/CreateClass';
import EditClass from './pages/academics/classes/EditClass';
import AcademicYearsList from './pages/academics/academicYears/AcademicYearsList';
import CreateAcademicYear from './pages/academics/academicYears/CreateAcademicYear';
import EditAcademicYear from './pages/academics/academicYears/EditAcademicYear';
import AcademicCalendarsList from './pages/academics/academicCalendars/AcademicCalendarsList';
import CreateAcademicCalendar from './pages/academics/academicCalendars/CreateAcademicCalendar';
import EditAcademicCalendar from './pages/academics/academicCalendars/EditAcademicCalendar';
import SubjectsList from './pages/academics/subjects/SubjectsList';
import CreateSubject from './pages/academics/subjects/CreateSubject';
import EditSubject from './pages/academics/subjects/EditSubject';
import HousesList from './pages/academics/houses/HousesList';
import CreateHouse from './pages/academics/houses/CreateHouse';
import EditHouse from './pages/academics/houses/EditHouse';
import SectionsList from './pages/academics/sections/SectionsList';
import CreateSection from './pages/academics/sections/CreateSection';
import EditSection from './pages/academics/sections/EditSection';
import ClassArmsList from './pages/academics/classArms/ClassArmsList';
import CreateClassArm from './pages/academics/classArms/CreateClassArm';
import EditClassArm from './pages/academics/classArms/EditClassArm';
import DepartmentsList from './pages/academics/departments/DepartmentsList';
import CreateDepartment from './pages/academics/departments/CreateDepartment';
import EditDepartment from './pages/academics/departments/EditDepartment';

// Assignment Pages
import ClassTeachersList from './pages/assignments/class-teachers/ClassTeachersList';
import CreateClassTeacher from './pages/assignments/class-teachers/CreateClassTeacher';
import EditClassTeacher from './pages/assignments/class-teachers/EditClassTeacher';
import SittingPositionsList from './pages/assignments/sitting-positions/SittingPositionsList';
import CreateSittingPosition from './pages/assignments/sitting-positions/CreateSittingPosition';
import EditSittingPosition from './pages/assignments/sitting-positions/EditSittingPosition';
import TeacherSubjectAssignmentsList from './pages/assignments/teacher-subjects/TeacherSubjectAssignmentsList';
import CreateTeacherSubjectAssignment from './pages/assignments/teacher-subjects/CreateTeacherSubjectAssignment';
import EditTeacherSubjectAssignment from './pages/assignments/teacher-subjects/EditTeacherSubjectAssignment';

// Placeholder for other pages
const Unauthorized = () => <div>Unauthorized</div>;
const NotFound = () => <div>Page Not Found</div>;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <DevSubdomainSelector />
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
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/school"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <div>School Management</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Academic Routes */}
            {/* Classes Routes */}
            <Route
              path="/academics/classes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <ClassesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/classes/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/classes/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditClass />
                </ProtectedRoute>
              }
            />
            {/* Subjects Routes */}
            <Route
              path="/academics/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <SubjectsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/subjects/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateSubject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/subjects/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditSubject />
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
            {/* Academic Years Routes */}
            <Route
              path="/academics/academic-years"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AcademicYearsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/academic-years/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateAcademicYear />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/academic-years/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditAcademicYear />
                </ProtectedRoute>
              }
            />
            
            {/* Academic Calendar Routes */}
            <Route
              path="/academics/academic-calendars"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AcademicCalendarsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/academic-calendars/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateAcademicCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/academic-calendars/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditAcademicCalendar />
                </ProtectedRoute>
              }
            />
            
            {/* Houses Routes */}
            <Route
              path="/academics/houses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <HousesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/houses/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateHouse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/houses/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditHouse />
                </ProtectedRoute>
              }
            />
            
            {/* Sections Routes */}
            <Route
              path="/academics/sections"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <SectionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/sections/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateSection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/sections/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditSection />
                </ProtectedRoute>
              }
            />
            
            {/* Class Arms Routes */}
            <Route
              path="/academics/class-arms"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <ClassArmsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/class-arms/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateClassArm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/class-arms/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditClassArm />
                </ProtectedRoute>
              }
            />
            
            {/* Departments Routes */}
            <Route
              path="/academics/departments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <DepartmentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/departments/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <CreateDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics/departments/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <EditDepartment />
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/students/list"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <StudentFilterList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/filter"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <StudentFilterList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <CreateStudent />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <div>Student Attendance</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/grades"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <div>Student Grades</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/history-search"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <StudentHistorySearch />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <StudentDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Staff Routes */}
            <Route
              path="/staff/list"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <StaffList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <CreateStaff />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <StaffDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <EditStaff />
                  </Layout>
                </ProtectedRoute>
              }
            />
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
            
            {/* Assignment Routes */}
            {/* Class Teachers Routes */}
            <Route
              path="/assignments/class-teachers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <ClassTeachersList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/class-teachers/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <CreateClassTeacher />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/class-teachers/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <EditClassTeacher />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Sitting Positions Routes */}
            <Route
              path="/assignments/sitting-positions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <SittingPositionsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/sitting-positions/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <CreateSittingPosition />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/sitting-positions/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <EditSittingPosition />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Teacher Subject Assignments Routes */}
            <Route
              path="/assignments/teacher-subjects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'superadmin']}>
                  <Layout>
                    <TeacherSubjectAssignmentsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/teacher-subjects/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <CreateTeacherSubjectAssignment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/teacher-subjects/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <Layout>
                    <EditTeacherSubjectAssignment />
                  </Layout>
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
