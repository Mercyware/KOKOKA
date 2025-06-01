import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  School,
  Clock,
  DollarSign,
  Home,
  BarChart2,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
}

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  id: string;
  submenu?: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
}) => {
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const handleSubmenuToggle = (id: string) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      id: 'dashboard',
    },
    {
      title: 'Students',
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/students',
      id: 'students',
      submenu: [
        {
          title: 'All Students',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/students',
          id: 'all-students',
        },
        {
          title: 'Add Student',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/students/add',
          id: 'add-student',
        },
        {
          title: 'Student Attendance',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/students/attendance',
          id: 'student-attendance',
        },
      ],
    },
    {
      title: 'Teachers',
      icon: <GraduationCap className="h-5 w-5" />,
      href: '/dashboard/teachers',
      id: 'teachers',
      submenu: [
        {
          title: 'All Teachers',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/teachers',
          id: 'all-teachers',
        },
        {
          title: 'Add Teacher',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/teachers/add',
          id: 'add-teacher',
        },
        {
          title: 'Teacher Assignments',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/teachers/assignments',
          id: 'teacher-assignments',
        },
      ],
    },
    {
      title: 'Academics',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/dashboard/academics',
      id: 'academics',
      submenu: [
        {
          title: 'Classes',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/academics/classes',
          id: 'classes',
        },
        {
          title: 'Class Arms',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/academics/class-arms',
          id: 'class-arms',
        },
        {
          title: 'Subjects',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/academics/subjects',
          id: 'subjects',
        },
        {
          title: 'Timetable',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/academics/timetable',
          id: 'timetable',
        },
      ],
    },
    {
      title: 'Examinations',
      icon: <FileText className="h-5 w-5" />,
      href: '/dashboard/examinations',
      id: 'examinations',
      submenu: [
        {
          title: 'Exam Schedule',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/examinations/schedule',
          id: 'exam-schedule',
        },
        {
          title: 'Results',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/examinations/results',
          id: 'exam-results',
        },
        {
          title: 'Grade System',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/examinations/grades',
          id: 'grade-system',
        },
      ],
    },
    {
      title: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      href: '/dashboard/calendar',
      id: 'calendar',
    },
    {
      title: 'Finance',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/dashboard/finance',
      id: 'finance',
      submenu: [
        {
          title: 'Fee Structure',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/finance/fee-structure',
          id: 'fee-structure',
        },
        {
          title: 'Payments',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/finance/payments',
          id: 'payments',
        },
        {
          title: 'Expenses',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/finance/expenses',
          id: 'expenses',
        },
      ],
    },
    {
      title: 'Reports',
      icon: <BarChart2 className="h-5 w-5" />,
      href: '/dashboard/reports',
      id: 'reports',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/dashboard/settings',
      id: 'settings',
      submenu: [
        {
          title: 'School Profile',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/settings/school',
          id: 'school-profile',
        },
        {
          title: 'Academic Year',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/settings/academic-year',
          id: 'academic-year',
        },
        {
          title: 'User Management',
          icon: <ChevronRight className="h-4 w-4" />,
          href: '/dashboard/settings/users',
          id: 'user-management',
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Kokoka</h2>
        <p className="text-xs text-muted-foreground">School Management System</p>
      </div>
      
      <nav className="flex-1 overflow-auto p-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              {item.submenu ? (
                <div className="space-y-1">
                  <button
                    onClick={() => handleSubmenuToggle(item.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      activeTab === item.id || openSubmenu === item.id
                        ? 'bg-accent text-accent-foreground'
                        : 'transparent'
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openSubmenu === item.id && 'rotate-90'
                      )}
                    />
                  </button>
                  
                  {openSubmenu === item.id && (
                    <ul className="ml-6 space-y-1 mt-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.id}>
                          <Link
                            to={subitem.href}
                            className={cn(
                              'flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                              activeTab === subitem.id
                                ? 'bg-accent/50 text-accent-foreground'
                                : 'transparent'
                            )}
                            onClick={() => onTabChange(subitem.id)}
                          >
                            {subitem.icon}
                            <span className="ml-3">{subitem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    activeTab === item.id
                      ? 'bg-accent text-accent-foreground'
                      : 'transparent'
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
