
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
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
  PieChart
} from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
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
        { id: 'attendance-today', label: 'Today\'s Attendance', icon: UserCheck, description: 'Mark daily attendance' },
        { id: 'attendance-reports', label: 'Reports', icon: BarChart3, description: 'Attendance analytics' },
        { id: 'attendance-bulk', label: 'Bulk Update', icon: ClipboardList, description: 'Bulk attendance updates' },
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

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">
        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onTabChange('dashboard')}
                className="h-9"
              >
                Dashboard
              </Button>
            </NavigationMenuItem>

            {navigationItems.map((section) => (
              <NavigationMenuItem key={section.title}>
                <NavigationMenuTrigger className="h-9">
                  {section.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {section.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="group relative flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => onTabChange(item.id)}
                        >
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.label}
                              </p>
                              {activeTab === item.id && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <Button
                variant={activeTab === 'ai-insights' ? 'default' : 'ghost'}
                onClick={() => onTabChange('ai-insights')}
                className="h-9"
              >
                AI Insights
              </Button>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Button
                variant={activeTab === 'marketing' ? 'default' : 'ghost'}
                onClick={() => onTabChange('marketing')}
                className="h-9"
              >
                About
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
