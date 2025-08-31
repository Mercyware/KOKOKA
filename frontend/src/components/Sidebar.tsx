import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Navigation,
  NavigationHeader,
  NavigationContent,
  NavigationFooter,
  NavigationGroup,
  NavigationItem,
  NavigationSubmenu,
  NavigationSubitem,
  NavigationProfile,
} from '@/components/ui/navigation';
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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
      id: 'staff',
      label: 'Staff',
      icon: GraduationCap,
      hasSubmenu: true,
      submenu: [
        { id: 'staff-list', label: 'All Staff', icon: GraduationCap },
        { id: 'staff-add', label: 'Add Staff', icon: Plus },
        { id: 'staff-reports', label: 'Reports', icon: FileText },
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
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'houses', label: 'Houses', icon: HomeIcon },
      ]
    },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain, hasSubmenu: false },
    { id: 'marketing', label: 'About', icon: Globe, hasSubmenu: false },
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: false },
  ];

  return (
    <Navigation width="md">
      {/* Header */}
      <NavigationHeader>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">KOKOKA</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">School Management System</p>
      </NavigationHeader>

      {/* User Profile */}
      <NavigationProfile
        name={user.name}
        email={user.email}
        role={user.role}
        avatar={
          <Avatar className="h-10 w-10">
            <AvatarImage src="/api/placeholder/40/40" alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        }
      />

      {/* Navigation Content */}
      <NavigationContent>
        <NavigationGroup>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isExpanded = expandedMenus.includes(item.id);
            const isActive = activeTab === item.id || (item.hasSubmenu && item.submenu?.some(sub => sub.id === activeTab));

            return (
              <div key={item.id}>
                <NavigationItem
                  icon={<IconComponent />}
                  active={isActive && !item.hasSubmenu}
                  hasSubmenu={item.hasSubmenu}
                  expanded={isExpanded}
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
                  {item.label}
                </NavigationItem>

                {/* Submenu */}
                <NavigationSubmenu open={item.hasSubmenu && isExpanded}>
                  {item.submenu?.map((subItem) => {
                    const SubIconComponent = subItem.icon;
                    return (
                      <NavigationSubitem
                        key={subItem.id}
                        icon={<SubIconComponent />}
                        active={activeTab === subItem.id}
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
                          if (subItem.id === 'subjects') {
                            navigate('/school-settings/subjects');
                          }
                          if (subItem.id === 'houses') {
                            navigate('/school-settings/houses');
                          }
                          if (subItem.id === 'staff-list') {
                            navigate('/staff');
                          }
                          if (subItem.id === 'staff-add') {
                            navigate('/staff/create');
                          }
                        }}
                      >
                        {subItem.label}
                      </NavigationSubitem>
                    );
                  })}
                </NavigationSubmenu>
              </div>
            );
          })}
        </NavigationGroup>
      </NavigationContent>

      {/* Footer */}
      <NavigationFooter>
        <ThemeToggle />
      </NavigationFooter>
    </Navigation>
  );
};

export default Sidebar;
