import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
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
  Library,
  CheckSquare,
  Shield,
  Bell,
  DoorOpen,
  DollarSign,
  Send,
  UserPlus,
  BookOpenCheck,
  Cog,
  Bus,
  MapPin,
  Car,
  Users as UsersIcon,
  Wrench,
  Package,
  Boxes,
  ArrowRightLeft,
  UserCog,
  Receipt,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, onTabChange, user }: SidebarProps) => {
  if (!user) {
    return <div className="hidden" />;
  }
  
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [folded, setFolded] = useState(false);

  const handleFoldToggle = () => setFolded(f => !f);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: Home, hasSubmenu: false },

    // Core Management
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      hasSubmenu: true,
      submenu: [
        { id: 'students-list', label: 'All Students', icon: Users },
        { id: 'students-add', label: 'Add Student', icon: Plus },
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
      ]
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: UserPlus,
      hasSubmenu: true,
      submenu: [
        { id: 'teachers-class-assignments', label: 'Class Assignments', icon: School },
        { id: 'teachers-subject-assignments', label: 'Subject Assignments', icon: BookOpenCheck },
      ]
    },

    // Academic Operations
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      hasSubmenu: true,
      submenu: [
        { id: 'attendance-take', label: 'Take Attendance', icon: UserCheck },
        { id: 'attendance-reports', label: 'Reports & Analytics', icon: FileText },
      ]
    },
    {
      id: 'gradebook',
      label: 'Gradebook',
      icon: Award,
      hasSubmenu: true,
      submenu: [
        { id: 'scores-add', label: 'Add Scores', icon: ClipboardList },
        { id: 'gradebook-reports', label: 'Reports', icon: FileText },
        { id: 'report-cards', label: 'Report Cards', icon: FileText },
        { id: 'behavioral-record-gradebook', label: 'Behavioral Scores', icon: Target },
      ]
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: ClipboardList,
      hasSubmenu: true,
      submenu: [
        { id: 'assignments-list', label: 'My Assignments', icon: FileText },
        { id: 'assignments-grading', label: 'Grading Queue', icon: CheckSquare },
      ]
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: CheckSquare,
      hasSubmenu: true,
      submenu: [
        { id: 'assessments-list', label: 'All Assessments', icon: ClipboardList },
        { id: 'assessments-create', label: 'Create Assessment', icon: Plus },
        { id: 'assessments-schedule', label: 'Schedule Assessment', icon: Calendar },
        { id: 'assessments-reports', label: 'Assessment Reports', icon: FileText },
      ]
    },
    {
      id: 'library',
      label: 'Library',
      icon: BookOpen,
      hasSubmenu: true,
      submenu: [
        { id: 'library-books', label: 'All Books', icon: BookOpen },
        { id: 'library-add-book', label: 'Add Book', icon: Plus },
        { id: 'library-issues', label: 'Book Issues', icon: ClipboardList },
      ]
    },
    {
      id: 'hostel',
      label: 'Hostel',
      icon: Home,
      hasSubmenu: true,
      submenu: [
        { id: 'hostel-list', label: 'All Hostels', icon: Home },
        { id: 'hostel-rooms', label: 'Rooms', icon: DoorOpen },
        { id: 'hostel-allocations', label: 'Allocations', icon: UserCheck },
        { id: 'hostel-fees', label: 'Fees', icon: DollarSign },
      ]
    },
    // Transportation
    {
      id: 'transportation',
      label: 'Transportation',
      icon: Bus,
      hasSubmenu: true,
      submenu: [
        { id: 'transportation-routes', label: 'Routes', icon: MapPin },
        { id: 'transportation-vehicles', label: 'Vehicles', icon: Car },
        { id: 'transportation-assignments', label: 'Assignments', icon: UsersIcon },
        { id: 'transportation-maintenance', label: 'Maintenance', icon: Wrench },
      ]
    },

    // Inventory
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      hasSubmenu: true,
      submenu: [
        { id: 'inventory-items', label: 'Items', icon: Boxes },
        { id: 'inventory-transactions', label: 'Transactions', icon: ArrowRightLeft },
        { id: 'inventory-allocations', label: 'Allocations', icon: UserCog },
      ]
    },

    // Finance
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      hasSubmenu: true,
      submenu: [
        { id: 'finance-fee-structures', label: 'Fee Structures', icon: FileText },
        { id: 'finance-invoices', label: 'Invoices', icon: Receipt },
        { id: 'finance-payments', label: 'Payments', icon: CreditCard },
        { id: 'finance-outstanding', label: 'Outstanding Debt', icon: AlertCircle },
      ]
    },

    // School Settings
    {
      id: 'school-settings',
      label: 'School Settings',
      icon: Cog,
      hasSubmenu: true,
      submenu: [
        { id: 'academic-years', label: 'Academic Years', icon: Calendar },
        { id: 'academic-calendars', label: 'Academic Calendars', icon: CalendarDays },
        { id: 'classes', label: 'Classes', icon: Building2 },
        { id: 'sections', label: 'Sections', icon: Layers },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'departments', label: 'Departments', icon: Building },
        { id: 'houses', label: 'Houses', icon: HomeIcon },
      ]
    },

    // Communication
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      hasSubmenu: true,
      submenu: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'messaging', label: 'Messaging', icon: Send },
      ]
    },

    // Analytics & Insights
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      hasSubmenu: true,
      submenu: [
        { id: 'analytics-overview', label: 'Overview', icon: BarChart3 },
        { id: 'analytics-performance', label: 'Performance', icon: Trophy },
        { id: 'analytics-attendance', label: 'Attendance', icon: UserCheck },
        { id: 'analytics-at-risk', label: 'At-Risk Students', icon: Brain },
        { id: 'gradebook-parent', label: 'Parent Portal', icon: Users },
      ]
    },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain, hasSubmenu: false },
  ], []); // Added useMemo dependency array

  // General section items (matching the reference image)
  const generalMenuItems = useMemo(() => [
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: false },
    { id: 'security', label: 'Security', icon: Shield, hasSubmenu: false },
  ], []); // Added useMemo dependency array

  // Auto-expand parent menus when submenu is active
  useEffect(() => {
    // Find which parent menu should be expanded based on active tab
    const parentMenuToExpand: string[] = [];
    
    menuItems.forEach(item => {
      if (item.hasSubmenu && item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem => subItem.id === activeTab);
        if (hasActiveSubmenu) {
          parentMenuToExpand.push(item.id);
        }
      }
    });
    
    // Update expanded menus to include the parent of active submenu
    if (parentMenuToExpand.length > 0) {
      setExpandedMenus(prev => {
        const newExpanded = [...prev];
        parentMenuToExpand.forEach(parentId => {
          if (!newExpanded.includes(parentId)) {
            newExpanded.push(parentId);
          }
        });
        return newExpanded;
      });
    }
  }, [activeTab, menuItems]); // Added proper dependency array

  return (
    <React.Fragment key="sidebar-wrapper">
      <nav className={`siohioma-sidebar transition-all duration-200 ${folded ? "w-16" : "w-72"} flex flex-col min-h-screen shadow-siohioma-lg`}>
    {/* Header / Logo */}
    <div className="flex items-center justify-between px-siohioma-lg py-siohioma-xl border-b border-white/20 flex-shrink-0">
      {!folded && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-siohioma-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-siohioma-bold text-lg">K</span>
          </div>
          <div>
            <span className="siohioma-heading-3 text-white">KOKOKA</span>
            <p className="siohioma-caption text-white">School Management</p>
          </div>
        </div>
      )}
      <button
        onClick={handleFoldToggle}
        className="p-2 rounded-siohioma-lg hover:text-siohioma-light-green text-white transition-colors"
        aria-label={folded ? "Expand sidebar" : "Collapse sidebar"}
      >
        {folded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>

    {/* Menu Section Header */}
    {!folded && (
      <div className="px-siohioma-lg py-siohioma-md flex-shrink-0">
        <span className="siohioma-caption text-white">MAIN MENU</span>
      </div>
    )}

    {/* Navigation Content */}
    <div className="flex-1 py-siohioma-sm px-siohioma-md overflow-y-auto">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        const isExpanded = expandedMenus.includes(item.id);
        const isActive = activeTab === item.id || (item.hasSubmenu && item.submenu?.some(sub => sub.id === activeTab));

        return (
          <div key={item.id} className="mb-1">
            <button
              onClick={() => {
                if (item.hasSubmenu) {
                  toggleMenu(item.id);
                } else {
                  onTabChange(item.id);
                  if (item.id === 'dashboard') {
                    navigate('/dashboard');
                  }
                  if (item.id === 'messaging') {
                    navigate('/messaging');
                  }
                  if (item.id === 'inventory') {
                    navigate('/inventory');
                  }
                }
              }}
              className={`${
                isActive && !item.hasSubmenu 
                  ? "siohioma-nav-item-active" 
                  : "siohioma-nav-item"
              } w-full ${folded ? "justify-center px-3" : ""}`}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              {!folded && <span className="siohioma-body text-white">{item.label}</span>}
              {item.hasSubmenu && !folded && (
                <span className="ml-auto text-white">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </button>
            {/* Submenu */}
            {item.hasSubmenu && isExpanded && !folded && (
              <div className="ml-siohioma-lg mt-1 space-y-1">
                {item.submenu?.map((subItem) => {
                  const SubIconComponent = subItem.icon;
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        onTabChange(subItem.id);
                        // Routing logic
                        if (subItem.id === 'academic-years') navigate('/school-settings/academic-years');
                        if (subItem.id === 'academic-calendars') navigate('/school-settings/academic-calendars');
                        if (subItem.id === 'classes') navigate('/school-settings/classes');
                        if (subItem.id === 'sections') navigate('/school-settings/sections');
                        if (subItem.id === 'subjects') navigate('/school-settings/subjects');
                        if (subItem.id === 'departments') navigate('/school-settings/departments');
                        if (subItem.id === 'houses') navigate('/school-settings/houses');
                        if (subItem.id === 'teachers-class-assignments') navigate('/teachers/class-assignments');
                        if (subItem.id === 'teachers-subject-assignments') navigate('/academics/subject-assignments');
                        if (subItem.id === 'teachers-assignment-history') navigate('/teachers/class-assignments/history');
                        if (subItem.id === 'notifications') navigate('/notifications');
                        if (subItem.id === 'messaging') navigate('/messaging');
                        if (subItem.id === 'gradebook-teacher') navigate('/gradebook/teacher');
                        if (subItem.id === 'gradebook-entry') navigate('/gradebook/entry');
                        if (subItem.id === 'gradebook-reports') navigate('/gradebook/reports');
                        if (subItem.id === 'report-cards') navigate('/gradebook/report-cards');
                        if (subItem.id === 'gradebook-parent') navigate('/parent/dashboard');
                        if (subItem.id === 'staff-list') navigate('/staff');
                        if (subItem.id === 'staff-add') navigate('/staff/create');
                        if (subItem.id === 'students-list') navigate('/students');
                        if (subItem.id === 'students-add') navigate('/students/add');
                        if (subItem.id === 'scores-add') navigate('/scores-add');
                        if (subItem.id === 'behavioral-record') navigate('/behavioral/record');
                        if (subItem.id === 'behavioral-record-gradebook') navigate('/behavioral/record');
                        if (subItem.id === 'behavioral-assessments') navigate('/behavioral-assessments');
                        if (subItem.id === 'assessments-list') navigate('/assessments');
                        if (subItem.id === 'assessments-create') navigate('/assessments/create');
                        if (subItem.id === 'assessments-schedule') navigate('/assessments/schedule');
                        if (subItem.id === 'assessments-reports') navigate('/assessments/reports');
                        if (subItem.id === 'library-books') navigate('/library/books');
                        if (subItem.id === 'library-add-book') navigate('/library/add-book');
                        if (subItem.id === 'library-issues') navigate('/library/issues');
                        if (subItem.id === 'hostel-list') navigate('/hostel');
                        if (subItem.id === 'hostel-rooms') navigate('/hostel/rooms');
                        if (subItem.id === 'hostel-allocations') navigate('/hostel/allocations');
                        if (subItem.id === 'hostel-fees') navigate('/hostel/fees');
                        if (subItem.id === 'transportation-routes') navigate('/transportation/routes');
                        if (subItem.id === 'transportation-vehicles') navigate('/transportation/vehicles');
                        if (subItem.id === 'transportation-assignments') navigate('/transportation/assignments');
                        if (subItem.id === 'transportation-maintenance') navigate('/transportation/maintenance');
                        if (subItem.id === 'inventory-items') navigate('/inventory/items');
                        if (subItem.id === 'inventory-transactions') navigate('/inventory/transactions');
                        if (subItem.id === 'analytics-at-risk') navigate('/analytics/at-risk');
                        if (subItem.id === 'inventory-allocations') navigate('/inventory/allocations');
                        if (subItem.id === 'finance-fee-structures') navigate('/finance/fee-structures');
                        if (subItem.id === 'finance-invoices') navigate('/finance/invoices');
                        if (subItem.id === 'finance-payments') navigate('/finance/payments');
                        if (subItem.id === 'finance-outstanding') navigate('/finance/outstanding');
                        if (subItem.id === 'assignments-list') navigate('/assignments');
                        if (subItem.id === 'assignments-grading') navigate('/assignments/grading-queue');
                        if (subItem.id === 'attendance-dashboard') navigate('/attendance');
                        if (subItem.id === 'attendance-take') navigate('/attendance/take');
                        if (subItem.id === 'attendance-reports') navigate('/attendance/reports');
                        if (subItem.id === 'analytics-overview') navigate('/analytics/overview');
                        if (subItem.id === 'analytics-performance') navigate('/analytics/performance');
                        if (subItem.id === 'analytics-attendance') navigate('/analytics/attendance');
                      }}
                      className={activeTab === subItem.id ? "siohioma-nav-subitem-active" : "siohioma-nav-subitem"}
                    >
                      <SubIconComponent size={16} className="flex-shrink-0" />
                      <span className="siohioma-body-sm text-left text-white">{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* General Section */}
      {!folded && (
        <div className="px-siohioma-lg py-siohioma-md mt-siohioma-md">
          <span className="siohioma-caption text-white">GENERAL</span>
        </div>
      )}
      
      {generalMenuItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;

        return (
          <div key={item.id} className="mb-1">
            <button
              onClick={() => {
                onTabChange(item.id);
                if (item.id === 'settings') navigate('/settings');
                if (item.id === 'security') navigate('/security');
              }}
              className={isActive ? "siohioma-nav-item-active" : "siohioma-nav-item"}
              style={{ width: folded ? 'auto' : '100%' }}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              {!folded && <span className="siohioma-body text-white">{item.label}</span>}
            </button>
          </div>
        );
      })}
    </div>

    {/* User Profile Section */}
    <div className="px-siohioma-lg py-siohioma-lg border-t border-white/20 bg-white/5 flex-shrink-0">
      {!folded ? (
        <div className="space-y-siohioma-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white/20">
              <AvatarFallback className="text-sm font-siohioma-semibold bg-white/20 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="siohioma-body font-siohioma-semibold text-white truncate">{user.name}</div>
              <div className="siohioma-caption text-white truncate">{user.role}</div>
              <div className="siohioma-caption text-white/60 truncate">{user.email}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-siohioma-sm border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-siohioma-md hover:text-siohioma-light-green text-white transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </div>
            <button
              onClick={() => {/* Add logout functionality */}}
              className="flex items-center gap-2 px-siohioma-sm py-1 rounded-siohioma-md hover:bg-red-500/20 text-white hover:text-red-400 transition-colors text-xs"
              title="Sign out"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="text-sm font-siohioma-semibold bg-white/20 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1">
            <button
              className="p-1 rounded-siohioma-md hover:text-siohioma-light-green text-white transition-colors"
              title="Settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      )}
      </div>
    </nav>
    </React.Fragment>
  );
};

export default Sidebar;
