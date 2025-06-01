import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  DollarSign,
  BarChart2,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b">
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard" onClick={() => onTabChange('dashboard')}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    activeTab === 'dashboard' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                className={cn(
                  activeTab.startsWith('student') && 'bg-accent text-accent-foreground'
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                Students
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/dashboard/students"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        onClick={() => onTabChange('all-students')}
                      >
                        <Users className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Students
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Manage student records, attendance, and academic performance.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/students"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('all-students')}
                    >
                      <div className="text-sm font-medium leading-none">All Students</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View and manage all student records.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/students/add"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('add-student')}
                    >
                      <div className="text-sm font-medium leading-none">Add Student</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Register a new student in the system.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/students/attendance"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('student-attendance')}
                    >
                      <div className="text-sm font-medium leading-none">Attendance</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Track and manage student attendance records.
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  activeTab.startsWith('teacher') && 'bg-accent text-accent-foreground'
                )}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Teachers
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/dashboard/teachers"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        onClick={() => onTabChange('all-teachers')}
                      >
                        <GraduationCap className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Teachers
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Manage teacher records, assignments, and schedules.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/teachers"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('all-teachers')}
                    >
                      <div className="text-sm font-medium leading-none">All Teachers</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View and manage all teacher records.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/teachers/add"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('add-teacher')}
                    >
                      <div className="text-sm font-medium leading-none">Add Teacher</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Register a new teacher in the system.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/teachers/assignments"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('teacher-assignments')}
                    >
                      <div className="text-sm font-medium leading-none">Assignments</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage teacher subject and class assignments.
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  activeTab.startsWith('academic') && 'bg-accent text-accent-foreground'
                )}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Academics
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <Link
                      to="/dashboard/academics/classes"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('classes')}
                    >
                      <div className="text-sm font-medium leading-none">Classes</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage school classes and sections.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/academics/class-arms"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('class-arms')}
                    >
                      <div className="text-sm font-medium leading-none">Class Arms</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage class arms and divisions.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/academics/subjects"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('subjects')}
                    >
                      <div className="text-sm font-medium leading-none">Subjects</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage academic subjects and curriculum.
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/academics/timetable"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => onTabChange('timetable')}
                    >
                      <div className="text-sm font-medium leading-none">Timetable</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Create and manage class timetables.
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/dashboard/calendar" onClick={() => onTabChange('calendar')}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    activeTab === 'calendar' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/dashboard/reports" onClick={() => onTabChange('reports')}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    activeTab === 'reports' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Reports
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
