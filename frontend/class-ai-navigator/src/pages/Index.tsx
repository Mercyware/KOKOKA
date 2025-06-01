import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TopNavigation from '@/components/TopNavigation';
import Dashboard from '@/components/Dashboard';
import StudentsManager from '@/components/StudentsManager';
import AddStudentForm from '@/components/AddStudentForm';
import AddStudentScores from '@/components/AddStudentScores';
import ViewStudent from '@/components/ViewStudent';
import ReportTemplates from '@/components/ReportTemplates';
import MarketingPage from '@/components/MarketingPage';
import AIInsights from '@/components/AIInsights';
import AuthPage from '@/components/AuthPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('marketing');
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [navigationMode, setNavigationMode] = useState<'sidebar' | 'top'>('sidebar');

  const handleAuthSuccess = (userData: { name: string; email: string; role: string }) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('marketing');
  };

  const handleAddStudent = () => {
    setActiveTab('students-add');
  };

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-view');
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
    setActiveTab('students-list');
  };

  const handleSaveStudent = (studentData: any) => {
    console.log('Saving student:', studentData);
    // In real app, save to backend
  };

  const toggleNavigation = () => {
    setNavigationMode(prev => prev === 'sidebar' ? 'top' : 'sidebar');
  };

  // Show marketing page when on 'marketing' tab or when user is not logged in
  if (activeTab === 'marketing' || !user) {
    return (
      <MarketingPage 
        onGetStarted={() => {
          if (user) {
            setActiveTab('dashboard');
          } else {
            // Show auth page for registration/login
            setActiveTab('auth');
          }
        }}
      />
    );
  }

  // Show auth page if user clicked to login/register
  if (activeTab === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
      case 'students-list':
        return (
          <StudentsManager 
            onAddStudent={handleAddStudent}
            onViewStudent={handleViewStudent}
          />
        );
      case 'students-add':
        return (
          <AddStudentForm 
            onBack={handleBackToStudents}
            onSave={handleSaveStudent}
          />
        );
      case 'student-view':
        return selectedStudentId ? (
          <ViewStudent 
            studentId={selectedStudentId}
            onBack={handleBackToStudents}
            onEdit={() => setActiveTab('students-edit')}
          />
        ) : (
          <StudentsManager 
            onAddStudent={handleAddStudent}
            onViewStudent={handleViewStudent}
          />
        );
      case 'students-edit':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Student</h2>
            <p className="text-gray-600 dark:text-gray-400">Student editing interface coming soon...</p>
          </div>
        );
      case 'students-reports':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Reports</h2>
            <p className="text-gray-600 dark:text-gray-400">Student reporting system coming soon...</p>
          </div>
        );
      case 'scores-add':
        return <AddStudentScores />;
      case 'report-templates':
        return <ReportTemplates />;
      case 'teachers':
      case 'teachers-list':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Teachers Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Teacher management interface coming soon...</p>
          </div>
        );
      case 'teachers-add':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Teacher</h2>
            <p className="text-gray-600 dark:text-gray-400">Teacher registration form coming soon...</p>
          </div>
        );
      case 'teachers-schedule':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Teacher Schedules</h2>
            <p className="text-gray-600 dark:text-gray-400">Schedule management interface coming soon...</p>
          </div>
        );
      case 'teachers-performance':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Teacher Performance</h2>
            <p className="text-gray-600 dark:text-gray-400">Performance analytics coming soon...</p>
          </div>
        );
      case 'courses':
      case 'courses-list':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Course management interface coming soon...</p>
          </div>
        );
      case 'courses-add':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Course</h2>
            <p className="text-gray-600 dark:text-gray-400">Course creation form coming soon...</p>
          </div>
        );
      case 'courses-curriculum':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Curriculum Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Curriculum planning interface coming soon...</p>
          </div>
        );
      case 'courses-assignments':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assignment Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Assignment creation and tracking coming soon...</p>
          </div>
        );
      case 'attendance':
      case 'attendance-today':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Today's Attendance</h2>
            <p className="text-gray-600 dark:text-gray-400">AI-powered attendance tracking interface coming soon...</p>
          </div>
        );
      case 'attendance-reports':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Attendance Reports</h2>
            <p className="text-gray-600 dark:text-gray-400">Attendance reporting system coming soon...</p>
          </div>
        );
      case 'attendance-bulk':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bulk Attendance Update</h2>
            <p className="text-gray-600 dark:text-gray-400">Bulk attendance management coming soon...</p>
          </div>
        );
      case 'attendance-alerts':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Attendance Alerts</h2>
            <p className="text-gray-600 dark:text-gray-400">Automated attendance alerts coming soon...</p>
          </div>
        );
      case 'grades':
      case 'grades-entry':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grade Entry</h2>
            <p className="text-gray-600 dark:text-gray-400">Grade entry interface coming soon...</p>
          </div>
        );
      case 'grades-reports':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grade Reports</h2>
            <p className="text-gray-600 dark:text-gray-400">Grade reporting system coming soon...</p>
          </div>
        );
      case 'grades-transcripts':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Transcripts</h2>
            <p className="text-gray-600 dark:text-gray-400">Transcript generation coming soon...</p>
          </div>
        );
      case 'grades-analytics':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grade Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Grade performance analytics coming soon...</p>
          </div>
        );
      case 'analytics':
      case 'analytics-overview':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive analytics dashboard coming soon...</p>
          </div>
        );
      case 'analytics-performance':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Performance Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Student and teacher performance metrics coming soon...</p>
          </div>
        );
      case 'analytics-attendance':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Attendance Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Attendance trend analysis coming soon...</p>
          </div>
        );
      case 'analytics-financial':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Financial Reports</h2>
            <p className="text-gray-600 dark:text-gray-400">Financial analytics and reporting coming soon...</p>
          </div>
        );
      case 'ai-insights':
        return <AIInsights />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col w-full">
      {/* Header */}
      <Header 
        user={user} 
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        navigationMode={navigationMode}
        onToggleNavigation={toggleNavigation}
      />

      {/* Top Navigation (when in top nav mode) */}
      {navigationMode === 'top' && (
        <TopNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar (when in sidebar mode) */}
        {navigationMode === 'sidebar' && (
          <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${navigationMode === 'sidebar' ? '' : 'hidden'}`}>
              <Sidebar 
                activeTab={activeTab} 
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }} 
                user={user} 
                onLogout={handleLogout} 
              />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
