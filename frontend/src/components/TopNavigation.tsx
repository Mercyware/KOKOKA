import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  TopNavigation as TopNav,
  TopNavigationList,
  TopNavigationItem,
  TopNavigationDropdown,
  TopNavigationDropdownItem,
} from '@/components/ui/top-navigation';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Settings,
  Plus,
  FileText,
  Calendar,
  Trophy,
  ClipboardList,
  PieChart,
  QrCode
} from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const navigationItems = [
    {
      title: 'Students',
      items: [
        { id: 'students-list', label: 'All Students', icon: Users, description: 'View and manage all students' },
        { id: 'students-add', label: 'Add Student', icon: Plus, description: 'Register new students' },
        { id: 'students-reports', label: 'Reports', icon: FileText, description: 'Generate student reports' },
      ]
    },
    {
      title: 'Academic',
      items: [
        { id: 'scores-add', label: 'Add Scores', icon: ClipboardList, description: 'Record student scores' },
        { id: 'report-templates', label: 'Report Cards', icon: FileText, description: 'Generate report cards' },
        { id: 'grades-entry', label: 'Grade Entry', icon: BookOpen, description: 'Enter student grades' },
        { id: 'grades-analytics', label: 'Grade Analytics', icon: PieChart, description: 'Analyze grade performance' },
      ]
    },
    {
      title: 'Teachers',
      items: [
        { id: 'teachers-list', label: 'All Teachers', icon: GraduationCap, description: 'View all teachers' },
        { id: 'teachers-add', label: 'Add Teacher', icon: Plus, description: 'Add new teachers' },
        { id: 'teachers-schedule', label: 'Schedules', icon: Calendar, description: 'Manage teacher schedules' },
        { id: 'teachers-performance', label: 'Performance', icon: Trophy, description: 'Teacher performance metrics' },
      ]
    },
    {
      title: 'Attendance',
      items: [
        { id: 'attendance-dashboard', label: 'Dashboard', icon: BarChart3, description: 'Attendance overview and analytics' },
        { id: 'attendance-entry', label: 'Take Attendance', icon: UserCheck, description: 'Mark student attendance' },
        { id: 'attendance-reports', label: 'Reports', icon: FileText, description: 'Detailed attendance reports' },
        { id: 'attendance-bulk', label: 'Bulk Operations', icon: ClipboardList, description: 'Bulk attendance operations' },
        { id: 'attendance-qr', label: 'QR Scanner', icon: QrCode, description: 'QR code attendance scanning' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: 'analytics-overview', label: 'Overview', icon: BarChart3, description: 'General analytics dashboard' },
        { id: 'analytics-performance', label: 'Performance', icon: Trophy, description: 'Performance metrics' },
        { id: 'analytics-attendance', label: 'Attendance', icon: UserCheck, description: 'Attendance trends' },
      ]
    }
  ];

  const handleDropdownToggle = (sectionTitle: string) => {
    setOpenDropdown(openDropdown === sectionTitle ? null : sectionTitle);
  };

  return (
    <TopNav>
      <TopNavigationList>
        {/* Dashboard */}
        <TopNavigationItem
          active={activeTab === 'dashboard'}
          onClick={() => {
            onTabChange('dashboard');
            navigate('/dashboard');
            setOpenDropdown(null);
          }}
        >
          Dashboard
        </TopNavigationItem>

        {/* Dropdown sections */}
        {navigationItems.map((section) => (
          <div key={section.title} className="relative">
            <TopNavigationItem
              hasDropdown
              active={section.items.some(item => item.id === activeTab)}
              onClick={() => handleDropdownToggle(section.title)}
            >
              {section.title}
            </TopNavigationItem>

            <TopNavigationDropdown
              open={openDropdown === section.title}
              align="left"
            >
              <div className="grid gap-1 p-2 w-[400px] lg:w-[500px] lg:grid-cols-2">
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <TopNavigationDropdownItem
                      key={item.id}
                      icon={<IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                      description={item.description}
                      active={activeTab === item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {item.label}
                        {activeTab === item.id && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </TopNavigationDropdownItem>
                  );
                })}
              </div>
            </TopNavigationDropdown>
          </div>
        ))}

        {/* Single items */}
        <TopNavigationItem
          active={activeTab === 'ai-insights'}
          onClick={() => {
            onTabChange('ai-insights');
            setOpenDropdown(null);
          }}
        >
          AI Insights
        </TopNavigationItem>

        <TopNavigationItem
          active={activeTab === 'marketing'}
          onClick={() => {
            onTabChange('marketing');
            setOpenDropdown(null);
          }}
        >
          About
        </TopNavigationItem>
      </TopNavigationList>
    </TopNav>
  );
};

export default TopNavigation;
