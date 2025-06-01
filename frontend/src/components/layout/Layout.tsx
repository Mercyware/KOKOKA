import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import TopNavigation from '../TopNavigation';
import { useTheme } from '../ThemeProvider';
import { Toaster } from '../ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navigationMode, setNavigationMode] = useState<'sidebar' | 'top'>('sidebar');
  const { theme } = useTheme();

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
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onToggleSidebar={handleToggleSidebar}
        navigationMode={navigationMode}
        onToggleNavigation={handleToggleNavigation}
      />
      
      {navigationMode === 'top' && (
        <TopNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
      <div className="flex">
        {navigationMode === 'sidebar' && sidebarOpen && (
          <div className="hidden md:block">
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              user={user} 
              onLogout={handleLogout} 
            />
          </div>
        )}
        
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Layout;
