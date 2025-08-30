import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from './ThemeToggle';
import {
  Users,
  Plus,
  GraduationCap,
  BookOpen,
  UserCheck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  Calendar,
  CalendarDays,
  Trophy,
  ClipboardList,
  PieChart,
  Brain,
  Globe,
  Building2,
  School,
  Layers,
  Building,
  Home as HomeIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, onTabChange, user }: SidebarProps) => {
  if (!user) return null;
  
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['students', 'school-settings']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, hasSubmenu: false },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      hasSubmenu: true,
      submenu: [
        { id: 'students-list', label: 'All Students', icon: Users },
        { id: 'students-add', label: 'Add Student', icon: Plus },
        { id: 'students-reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      id: 'academic',
      label: 'Academic',
      icon: BookOpen,
      hasSubmenu: true,
      submenu: [
        { id: 'scores-add', label: 'Add Scores', icon: ClipboardList },
        { id: 'report-templates', label: 'Report Cards', icon: FileText },
        { id: 'grades-entry', label: 'Grade Entry', icon: BookOpen },
        { id: 'grades-analytics', label: 'Grade Analytics', icon: PieChart },
      ]
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: GraduationCap,
      hasSubmenu: true,
      submenu: [
        { id: 'teachers-list', label: 'All Teachers', icon: GraduationCap },
        { id: 'teachers-add', label: 'Add Teacher', icon: Plus },
        { id: 'teachers-schedule', label: 'Schedules', icon: Calendar },
        { id: 'teachers-performance', label: 'Performance', icon: Trophy },
      ]
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      hasSubmenu: true,
      submenu: [
        { id: 'courses-list', label: 'All Courses', icon: BookOpen },
        { id: 'courses-add', label: 'Add Course', icon: Plus },
        { id: 'courses-curriculum', label: 'Curriculum', icon: FileText },
        { id: 'courses-assignments', label: 'Assignments', icon: ClipboardList },
      ]
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      hasSubmenu: true,
      submenu: [
        { id: 'attendance-today', label: 'Today\'s Attendance', icon: UserCheck },
        { id: 'attendance-reports', label: 'Reports', icon: BarChart3 },
        { id: 'attendance-bulk', label: 'Bulk Update', icon: ClipboardList },
        { id: 'attendance-alerts', label: 'Alerts', icon: Settings },
      ]
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: Trophy,
      hasSubmenu: true,
      submenu: [
        { id: 'grades-entry', label: 'Grade Entry', icon: Trophy },
        { id: 'grades-reports', label: 'Grade Reports', icon: FileText },
        { id: 'grades-transcripts', label: 'Transcripts', icon: FileText },
        { id: 'grades-analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      hasSubmenu: true,
      submenu: [
        { id: 'analytics-overview', label: 'Overview', icon: BarChart3 },
        { id: 'analytics-performance', label: 'Performance', icon: Trophy },
        { id: 'analytics-attendance', label: 'Attendance', icon: UserCheck },
        { id: 'analytics-financial', label: 'Financial', icon: PieChart },
      ]
    },
    {
      id: 'school-settings',
      label: 'School Settings',
      icon: Building2,
      hasSubmenu: true,
      submenu: [
        { id: 'academic-years', label: 'Academic Years', icon: CalendarDays },
        { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'sections', label: 'Arms/Sections', icon: Layers },
        { id: 'departments', label: 'Departments', icon: Building },
        { id: 'houses', label: 'Houses', icon: HomeIcon },
      ]
    },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain, hasSubmenu: false },
    { id: 'marketing', label: 'About', icon: Globe, hasSubmenu: false },
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: false },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 w-72 h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduManage Pro</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">School Management System</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/api/placeholder/40/40" alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {user.role}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isExpanded = expandedMenus.includes(item.id);
            const isActive = activeTab === item.id || (item.hasSubmenu && item.submenu?.some(sub => sub.id === activeTab));

            return (
              <div key={item.id}>
                <Button
                  variant={isActive && !item.hasSubmenu ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left h-10 px-3 ${
                    isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 
                    'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    if (item.hasSubmenu) {
                      toggleMenu(item.id);
                    } else {
                      onTabChange(item.id);
                      
                      // Navigate to appropriate route based on menu item
                      if (item.id === 'dashboard') {
                        navigate('/dashboard');
                      }
                    }
                  }}
                >
                  <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.hasSubmenu && (
                    isExpanded ? 
                      <ChevronDown className="h-4 w-4 flex-shrink-0" /> : 
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>

                {/* Submenu */}
                {item.hasSubmenu && isExpanded && item.submenu && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIconComponent = subItem.icon;
                      return (
                        <Button
                          key={subItem.id}
                          variant={activeTab === subItem.id ? "secondary" : "ghost"}
                          className={`w-full justify-start text-left h-9 px-3 text-sm ${
                            activeTab === subItem.id ? 
                            'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 
                            'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            onTabChange(subItem.id);
                            
                            // Navigate to appropriate route based on menu item
                            if (subItem.id === 'academic-years') {
                              navigate('/school-settings/academic-years');
                            }
                            if (subItem.id === 'academic-calendar') {
                              navigate('/school-settings/academic-calendars');
                            }
                            if (subItem.id === 'classes') {
                              navigate('/school-settings/classes');
                            }
                            if (subItem.id === 'sections') {
                              navigate('/school-settings/sections');
                            }
                            if (subItem.id === 'departments') {
                              navigate('/school-settings/departments');
                            }
                            if (subItem.id === 'houses') {
                              navigate('/school-settings/houses');
                            }
                            if (subItem.id === 'students-list') {
                              navigate('/students');
                            }
                            if (subItem.id === 'students-add') {
                              navigate('/students/add');
                            }
                          }}
                        >
                          <SubIconComponent className="mr-3 h-3 w-3 flex-shrink-0" />
                          <span>{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Sidebar;
