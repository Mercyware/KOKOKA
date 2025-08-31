import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, LayoutGrid, Navigation } from 'lucide-react';
import {
  HeaderBar,
  HeaderContent,
  HeaderUserInfo,
  HeaderAction,
} from '@/components/ui/top-navigation';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  navigationMode: 'sidebar' | 'top';
  onToggleNavigation: () => void;
}

const Header = ({ user, onToggleSidebar, navigationMode, onToggleNavigation }: HeaderProps) => {
  const { logout } = useAuth();
  if (!user) return null;
  
  return (
    <HeaderBar>
      <HeaderContent align="left">
        {navigationMode === 'sidebar' && (
          <HeaderAction
            icon={<Menu />}
            onClick={onToggleSidebar}
            className="md:hidden"
            showLabel={false}
          />
        )}
        <HeaderUserInfo name={user.name} role={user.role} />
      </HeaderContent>
      
      <HeaderContent align="right">
        <HeaderAction
          icon={navigationMode === 'sidebar' ? <Navigation /> : <LayoutGrid />}
          label={navigationMode === 'sidebar' ? 'Top Nav' : 'Sidebar'}
          onClick={onToggleNavigation}
        />
        
        <ThemeToggle />
        
        <HeaderAction
          icon={<LogOut />}
          label="Sign Out"
          onClick={logout}
        />
      </HeaderContent>
    </HeaderBar>
  );
};

export default Header;
