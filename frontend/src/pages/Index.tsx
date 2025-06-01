import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TopNavigation from '@/components/TopNavigation';
import Dashboard from '@/components/Dashboard';
import AIInsights from '@/components/AIInsights';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationMode, setNavigationMode] = useState<'sidebar' | 'top'>('sidebar');

  const handleLogout = () => {
    setUser(null);
  };

  const toggleNavigation = () => {
    setNavigationMode(prev => prev === 'sidebar' ? 'top' : 'sidebar');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setUser({ name: 'John Doe', email: 'john.doe@example.com', role: 'Administrator' })}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-insights':
        return <AIInsights />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{activeTab}</h2>
            <p className="text-gray-600 dark:text-gray-400">This feature is coming soon...</p>
          </div>
        );
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
