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
  Home as HomeIcon,
  Target,
  TrendingUp,
  Award,
  Eye,
  MessageSquare,
  Library
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
      id: 'curriculum',
      label: 'Curriculum',
      icon: Target,
      hasSubmenu: true,
      submenu: [
        { id: 'curriculum-global', label: 'Global Registry', icon: Globe },
        { id: 'curriculum-school', label: 'School Curricula', icon: BookOpen },
        { id: 'curriculum-progress', label: 'Progress Tracking', icon: TrendingUp },
        { id: 'curriculum-analytics', label: 'Analytics', icon: BarChart3 },
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
      id: 'gradebook',
      label: 'Grade Management',
      icon: Award,
      hasSubmenu: true,
      submenu: [
        { id: 'gradebook-teacher', label: 'Grade Books', icon: BookOpen },
        { id: 'gradebook-entry', label: 'Grade Entry', icon: Trophy },
        { id: 'gradebook-reports', label: 'Grade Reports', icon: FileText },
        { id: 'gradebook-analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'gradebook-parent', label: 'Parent Dashboard', icon: Users },
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
        { id: 'curricula', label: 'Curricula', icon: Library },
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
                          if (subItem.id === 'curricula') {
                            navigate('/school-settings/curricula');
                          }
                          // Curriculum menu items
                          if (subItem.id === 'curriculum-global') {
                            navigate('/curriculum/global');
                          }
                          if (subItem.id === 'curriculum-school') {
                            navigate('/curriculum/school');
                          }
                          if (subItem.id === 'curriculum-progress') {
                            navigate('/curriculum/progress');
                          }
                          if (subItem.id === 'curriculum-analytics') {
                            navigate('/curriculum/analytics');
                          }
                          // Grade management menu items
                          if (subItem.id === 'gradebook-teacher') {
                            navigate('/gradebook/teacher');
                          }
                          if (subItem.id === 'gradebook-entry') {
                            navigate('/gradebook/entry');
                          }
                          if (subItem.id === 'gradebook-reports') {
                            navigate('/gradebook/reports');
                          }
                          if (subItem.id === 'gradebook-analytics') {
                            navigate('/gradebook/analytics');
                          }
                          if (subItem.id === 'gradebook-parent') {
                            navigate('/parent/dashboard');
                          }
                          // Staff menu items
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
