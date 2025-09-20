import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import TopNavigation from '../TopNavigation';
import ContentHeader from '../ContentHeader';
import { useTheme } from '../ThemeProvider';
import { Toaster } from '../ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
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
      'attendance': subPath === 'entry' || subPath === 'take' ? 'attendance-entry' :
                   subPath === 'dashboard' ? 'attendance-dashboard' :
                   subPath === 'reports' ? 'attendance-reports' :
                   subPath === 'qr-scanner' ? 'attendance-qr' : 'attendance',
      'gradebook': subPath === 'entry' ? 'gradebook-entry' :
                  subPath === 'teacher' ? 'gradebook-teacher' :
                  subPath === 'reports' ? 'gradebook-reports' : 'gradebook',
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
      'school-settings': subPath === 'academic-years' ? 'academic-years' :
                        subPath === 'classes' ? 'classes' :
                        subPath === 'subjects' ? 'subjects' :
                        subPath === 'departments' ? 'departments' :
                        subPath === 'houses' ? 'houses' : basePath,
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

  // Simulate user authentication
  useEffect(() => {
    // In a real app, check for auth token and fetch user data
    const mockUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrator'
    };
    
    setUser(mockUser);
  }, []);

  const handleLogout = () => {
    // In a real app, clear auth token and redirect to login
    setUser(null);
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
          
          {/* Page Content */}
          <div className="flex-1">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { 
                  onMenuToggle: isMobile ? handleToggleSidebar : undefined,
                  user
                } as any);
              }
              return child;
            })}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Layout;
