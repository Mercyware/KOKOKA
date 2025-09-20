import React, { useState, useEffect } from 'react';
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
  QrCode,
  Shield
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

  const menuItems = [
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
        { id: 'staff-reports', label: 'Reports', icon: FileText },
      ]
    },
    
    // Academic Operations
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      hasSubmenu: true,
      submenu: [
        { id: 'attendance-entry', label: 'Take Attendance', icon: UserCheck },
        { id: 'attendance-dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'attendance-reports', label: 'Reports', icon: FileText },
        { id: 'attendance-qr', label: 'QR Scanner', icon: QrCode },
      ]
    },
    {
      id: 'gradebook',
      label: 'Gradebook',
      icon: Award,
      hasSubmenu: true,
      submenu: [
        { id: 'scores-add', label: 'Add Scores', icon: ClipboardList },
        { id: 'gradebook-entry', label: 'Grade Entry', icon: Trophy },
        { id: 'gradebook-teacher', label: 'Grade Books', icon: BookOpen },
        { id: 'gradebook-reports', label: 'Reports', icon: FileText },
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
        { id: 'gradebook-parent', label: 'Parent Portal', icon: Users },
      ]
    },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain, hasSubmenu: false },
  ];

  // General section items (matching the reference image)
  const generalMenuItems = [
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: false },
    { id: 'security', label: 'Security', icon: Shield, hasSubmenu: false },
  ];

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
  }, [activeTab]);

return (
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
                        if (subItem.id === 'classes') navigate('/school-settings/classes');
                        if (subItem.id === 'subjects') navigate('/school-settings/subjects');
                        if (subItem.id === 'departments') navigate('/school-settings/departments');
                        if (subItem.id === 'houses') navigate('/school-settings/houses');
                        if (subItem.id === 'curriculum-school') navigate('/curriculum/school');
                        if (subItem.id === 'curriculum-global') navigate('/curriculum/global');
                        if (subItem.id === 'curriculum-progress') navigate('/curriculum/progress');
                        if (subItem.id === 'gradebook-teacher') navigate('/gradebook/teacher');
                        if (subItem.id === 'gradebook-entry') navigate('/gradebook/entry');
                        if (subItem.id === 'gradebook-reports') navigate('/gradebook/reports');
                        if (subItem.id === 'gradebook-parent') navigate('/parent/dashboard');
                        if (subItem.id === 'staff-list') navigate('/staff');
                        if (subItem.id === 'staff-add') navigate('/staff/create');
                        if (subItem.id === 'students-list') navigate('/students');
                        if (subItem.id === 'students-add') navigate('/students/add');
                        if (subItem.id === 'scores-add') navigate('/scores-add');
                        if (subItem.id === 'attendance-dashboard') navigate('/attendance/dashboard');
                        if (subItem.id === 'attendance-entry') navigate('/attendance/entry');
                        if (subItem.id === 'attendance-reports') navigate('/attendance/reports');
                        if (subItem.id === 'attendance-qr') navigate('/attendance/qr-scanner');
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
);

}
export default Sidebar;
