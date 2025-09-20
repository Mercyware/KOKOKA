import React from 'react'
import { Bell, Search, Mail, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Menu Toggle Button */}
          {onMenuToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100"
              onClick={onMenuToggle}
            >
              <Menu size={20} className="text-gray-600" />
            </Button>
          )}
          
          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search students, classes, assignments..."
                  className="pl-10 py-2 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Mail Icon */}
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Mail size={20} className="text-gray-600" />
          </Button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              3
            </Badge>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 ml-2">
              <Avatar className="h-8 w-8 bg-green-500">
                <AvatarFallback className="bg-green-500 text-white text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;