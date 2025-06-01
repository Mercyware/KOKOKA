import React from 'react';
import { LogOut, Menu, LayoutGrid, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  navigationMode: 'sidebar' | 'top';
  onToggleNavigation: () => void;
}

const Header = ({ user, onLogout, onToggleSidebar, navigationMode, onToggleNavigation }: HeaderProps) => {
  if (!user) return null;
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {navigationMode === 'sidebar' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back, {user.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.role}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleNavigation}
          className="flex items-center space-x-2"
        >
          {navigationMode === 'sidebar' ? (
            <>
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Top Nav</span>
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Sidebar</span>
            </>
          )}
        </Button>
        
        <ThemeToggle />
        
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
