import React from 'react'
import { Bell, Search, Mail, Menu, User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ContentHeaderProps {
  title?: string;
  subtitle?: string;
  user: { name: string; email: string; role: string } | null;
  showSearch?: boolean;
  showActions?: boolean;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  subtitle,
  user,
  showSearch = true,
  showActions = true,
  actions,
  onMenuToggle
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleSecurity = () => {
    navigate('/security');
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on user role
  const getAvatarColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'bg-primary',
      'teacher': 'bg-cyan-700',
      'student': 'bg-emerald-600',
      'parent': 'bg-amber-600',
      'staff': 'bg-cyan-600',
    };
    return colors[role.toLowerCase()] || 'bg-slate-600';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Menu Toggle Button */}
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={onMenuToggle}
            >
              <Menu size={20} className="text-slate-600 dark:text-slate-300" />
            </Button>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search students, classes, assignments..."
                  className="pl-10 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-sm transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Actions & User Profile */}
        <div className="flex items-center gap-1">
          {/* Mail Icon */}
          <button
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Mail size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <Badge className="absolute top-0 right-0 h-5 w-5 p-0 text-xs bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              3
            </Badge>
          </div>

          {/* User Profile Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 ml-2 px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 rounded-lg transition-colors"
                >
                  <Avatar className={`h-8 w-8 ${getAvatarColor(user.role)}`}>
                    <AvatarFallback className={`${getAvatarColor(user.role)} text-white text-xs font-semibold`}>
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2 p-2">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-12 w-12 ${getAvatarColor(user.role)}`}>
                        <AvatarFallback className={`${getAvatarColor(user.role)} text-white font-semibold`}>
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile} className="cursor-pointer py-2.5">
                  <User className="h-4 w-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                  <Settings className="h-4 w-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSecurity} className="cursor-pointer py-2.5">
                  <Shield className="h-4 w-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium">Security</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;