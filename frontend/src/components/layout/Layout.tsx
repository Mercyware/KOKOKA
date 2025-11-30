import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import TopNavigation from '../TopNavigation';
import ContentHeader from '../ContentHeader';
import EmailVerificationBanner from '../EmailVerificationBanner';
import { ChatbotWidget } from '../chatbot/ChatbotWidget';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Toaster } from '../ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navigationMode, setNavigationMode] = useState<'sidebar' | 'top'>('sidebar');
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  // Function to determine active tab from current route
  const getActiveTabFromPath = (pathname: string): string => {
    // Remove leading slash and split by '/'
    const pathSegments = pathname.substring(1).split('/');
    const basePath = pathSegments[0];
    const subPath = pathSegments[1];

    // Map routes to active tab IDs
    const routeMapping: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'students': subPath === 'add' ? 'students-add' : 'students-list',
      'staff': subPath === 'create' ? 'staff-add' : 'staff-list',
      'teachers': subPath === 'class-assignments' ? 'teachers-class-assignments' :
                 subPath === 'subject-assignments' ? 'teachers-subject-assignments' : 'teachers',
      'attendance': subPath === 'entry' || subPath === 'take' ? 'attendance-entry' :
                   subPath === 'dashboard' ? 'attendance-dashboard' :
                   subPath === 'reports' ? 'attendance-reports' :
                   subPath === 'qr-scanner' ? 'attendance-qr' : 'attendance',
      'gradebook': subPath === 'entry' ? 'gradebook-entry' :
                  subPath === 'teacher' ? 'gradebook-teacher' :
                  subPath === 'reports' ? 'gradebook-reports' :
                  subPath === 'report-cards' ? 'report-cards' : 'gradebook',
      'parent': 'gradebook-parent',
      'academics': subPath === 'scores' ? 'scores-add' : basePath,
      'scores-add': 'scores-add',
      'curriculum': subPath === 'global' ? 'curriculum-global' :
                   subPath === 'school' ? 'curriculum-school' :
                   subPath === 'progress' ? 'curriculum-progress' : basePath,
      'analytics': subPath === 'overview' ? 'analytics-overview' :
                  subPath === 'performance' ? 'analytics-performance' :
                  subPath === 'attendance' ? 'analytics-attendance' : 'analytics',
      'ai-insights': 'ai-insights',
      'settings': 'settings',
      'security': 'security',
      'notifications': 'notifications',
      'messaging': 'messaging',
      'communication': 'communication',
      'school-settings': subPath === 'academic-years' ? 'academic-years' :
                        subPath === 'academic-calendars' ? 'academic-calendars' :
                        subPath === 'classes' ? 'classes' :
                        subPath === 'sections' ? 'sections' :
                        subPath === 'subjects' ? 'subjects' :
                        subPath === 'departments' ? 'departments' :
                        subPath === 'houses' ? 'houses' :
                        subPath === 'curricula' ? 'curricula' : basePath,
    };

    return routeMapping[basePath] || 'dashboard';
  };

  // Update active tab when route changes
  useEffect(() => {
    const newActiveTab = getActiveTabFromPath(location.pathname);
    setActiveTab(newActiveTab);
  }, [location.pathname]);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get authenticated user from auth context
  useEffect(() => {
    if (authState.user) {
      setUser({
        name: authState.user.name,
        email: authState.user.email,
        role: authState.user.role
      });
    } else {
      setUser(null);
    }
  }, [authState.user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleNavigation = () => {
    setNavigationMode(navigationMode === 'sidebar' ? 'top' : 'sidebar');
  };

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      {navigationMode === 'top' && (
        <TopNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {navigationMode === 'sidebar' && (
          <>
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <div className={`
              ${isMobile 
                ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`
                : sidebarOpen ? 'relative' : 'hidden'
              }
            `}>
              <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                user={user} 
                onLogout={handleLogout} 
              />
            </div>
          </>
        )}
        
        <main className="flex-1 overflow-auto min-w-0">
          {/* Content Header - Appears on all pages */}
          <ContentHeader
            user={user}
            showSearch={true}
            showActions={true}
            onMenuToggle={isMobile ? handleToggleSidebar : undefined}
          />
          
          {/* Email Verification Banner - Show if user is authenticated and email not verified */}
          {authState.user && !authState.user.emailVerified && (
            <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <EmailVerificationBanner
                user={{
                  id: authState.user.id,
                  name: authState.user.name,
                  email: authState.user.email,
                  emailVerified: authState.user.emailVerified,
                }}
                isDismissible={true}
              />
            </div>
          )}
          
          {/* Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>

      {/* AI Chatbot Widget - Available to all authenticated users */}
      {authState.user && <ChatbotWidget />}

      <Toaster />
    </div>
  );
};

export default Layout;
