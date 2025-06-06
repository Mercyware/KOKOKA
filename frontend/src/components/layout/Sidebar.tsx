import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  History as HistoryIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorIcon,
  EventSeat as SeatIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for nested menu items
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    academics: false,
    students: false,
    staff: false,
    assignments: false,
  });

  // Toggle nested menu
  const handleToggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Menu items based on user role
  const getMenuItems = () => {
    const role = authState.user?.role;
    const menuItems = [];

    // Dashboard - available to all roles
    menuItems.push(
      <ListItem key="dashboard" disablePadding>
        <ListItemButton
          selected={isActive('/dashboard')}
          onClick={() => handleNavigate('/dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon color={isActive('/dashboard') ? 'primary' : undefined} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
    );

    // School - available to admin
    if (role === 'admin' || role === 'superadmin') {
      menuItems.push(
        <ListItem key="school" disablePadding>
          <ListItemButton
            selected={isActive('/school')}
            onClick={() => handleNavigate('/school')}
          >
            <ListItemIcon>
              <SchoolIcon color={isActive('/school') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="School" />
          </ListItemButton>
        </ListItem>
      );
    }

    // Academics - available to admin and teachers
    if (role === 'admin' || role === 'teacher' || role === 'superadmin') {
      menuItems.push(
        <React.Fragment key="academics">
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleMenu('academics')}>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <ListItemText primary="Academics" />
              {openMenus.academics ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus.academics} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/academics/class-arms"
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <SchoolIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Class Arms" />
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to="/academics/departments"
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Departments" />
                  </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/subjects')}
                onClick={() => handleNavigate('/academics/subjects')}
              >
                <ListItemIcon>
                  <SubjectIcon color={isActive('/academics/subjects') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Subjects" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/timetable')}
                onClick={() => handleNavigate('/academics/timetable')}
              >
                <ListItemIcon>
                  <EventIcon color={isActive('/academics/timetable') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Timetable" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/academic-years')}
                onClick={() => handleNavigate('/academics/academic-years')}
              >
                <ListItemIcon>
                  <CalendarIcon color={isActive('/academics/academic-years') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Academic Years" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/academic-calendars')}
                onClick={() => handleNavigate('/academics/academic-calendars')}
              >
                <ListItemIcon>
                  <EventIcon color={isActive('/academics/academic-calendars') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Academic Calendars" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/houses')}
                onClick={() => handleNavigate('/academics/houses')}
              >
                <ListItemIcon>
                  <SchoolIcon color={isActive('/academics/houses') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Houses" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/class-arms')}
                onClick={() => handleNavigate('/academics/class-arms')}
              >
                <ListItemIcon>
                  <ClassIcon color={isActive('/academics/class-arms') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Class Arms" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/academics/departments')}
                onClick={() => handleNavigate('/academics/departments')}
              >
                <ListItemIcon>
                  <WorkIcon color={isActive('/academics/departments') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Departments" />
              </ListItemButton>
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    // Students - available to admin and teachers
    if (role === 'admin' || role === 'teacher' || role === 'superadmin') {
      menuItems.push(
        <React.Fragment key="students">
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleMenu('students')}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Students" />
              {openMenus.students ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus.students} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/list')}
                onClick={() => handleNavigate('/students/list')}
              >
                <ListItemIcon>
                  <PeopleIcon color={isActive('/students/list') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="All Students" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/create')}
                onClick={() => handleNavigate('/students/create')}
              >
                <ListItemIcon>
                  <PeopleIcon color={isActive('/students/create') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Create Student" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/attendance')}
                onClick={() => handleNavigate('/students/attendance')}
              >
                <ListItemIcon>
                  <EventIcon color={isActive('/students/attendance') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Attendance" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/grades')}
                onClick={() => handleNavigate('/students/grades')}
              >
                <ListItemIcon>
                  <AssessmentIcon color={isActive('/students/grades') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Grades" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/history-search')}
                onClick={() => handleNavigate('/students/history-search')}
              >
                <ListItemIcon>
                  <HistoryIcon color={isActive('/students/history-search') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Class History" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/students/filter')}
                onClick={() => handleNavigate('/students/filter')}
              >
                <ListItemIcon>
                  <PeopleIcon color={isActive('/students/filter') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Filter Students" />
              </ListItemButton>
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    // Assignments - available to admin and teachers
    if (role === 'admin' || role === 'teacher' || role === 'superadmin') {
      menuItems.push(
        <React.Fragment key="assignments">
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleMenu('assignments')}>
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText primary="Assignments" />
              {openMenus.assignments ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus.assignments} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Teacher Subject Assignments */}
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/assignments/teacher-subjects')}
                onClick={() => handleNavigate('/assignments/teacher-subjects')}
              >
                <ListItemIcon>
                  <SubjectIcon color={isActive('/assignments/teacher-subjects') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Teacher Subjects" />
              </ListItemButton>
              {role === 'admin' || role === 'superadmin' ? (
                <ListItemButton
                  sx={{ pl: 6 }}
                  selected={isActive('/assignments/teacher-subjects/create')}
                  onClick={() => handleNavigate('/assignments/teacher-subjects/create')}
                >
                  <ListItemIcon>
                    <SubjectIcon fontSize="small" color={isActive('/assignments/teacher-subjects/create') ? 'primary' : undefined} />
                  </ListItemIcon>
                  <ListItemText primary="Assign Subject" />
                </ListItemButton>
              ) : null}
              
              {/* Class Teachers */}
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/assignments/class-teachers')}
                onClick={() => handleNavigate('/assignments/class-teachers')}
              >
                <ListItemIcon>
                  <SupervisorIcon color={isActive('/assignments/class-teachers') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Class Teachers" />
              </ListItemButton>
              {role === 'admin' || role === 'superadmin' ? (
                <ListItemButton
                  sx={{ pl: 6 }}
                  selected={isActive('/assignments/class-teachers/create')}
                  onClick={() => handleNavigate('/assignments/class-teachers/create')}
                >
                  <ListItemIcon>
                    <SupervisorIcon fontSize="small" color={isActive('/assignments/class-teachers/create') ? 'primary' : undefined} />
                  </ListItemIcon>
                  <ListItemText primary="Assign Class Teacher" />
                </ListItemButton>
              ) : null}
              
              {/* Sitting Positions */}
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/assignments/sitting-positions')}
                onClick={() => handleNavigate('/assignments/sitting-positions')}
              >
                <ListItemIcon>
                  <SeatIcon color={isActive('/assignments/sitting-positions') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Sitting Positions" />
              </ListItemButton>
              {(role === 'admin' || role === 'teacher' || role === 'superadmin') ? (
                <ListItemButton
                  sx={{ pl: 6 }}
                  selected={isActive('/assignments/sitting-positions/create')}
                  onClick={() => handleNavigate('/assignments/sitting-positions/create')}
                >
                  <ListItemIcon>
                    <SeatIcon fontSize="small" color={isActive('/assignments/sitting-positions/create') ? 'primary' : undefined} />
                  </ListItemIcon>
                  <ListItemText primary="Assign Sitting Position" />
                </ListItemButton>
              ) : null}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    // Staff - available to admin
    if (role === 'admin' || role === 'superadmin') {
      menuItems.push(
        <React.Fragment key="staff">
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleMenu('staff')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Staff" />
              {openMenus.staff ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus.staff} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/staff/list')}
                onClick={() => handleNavigate('/staff/list')}
              >
                <ListItemIcon>
                  <PeopleIcon color={isActive('/staff/list') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="All Staff" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/staff/create')}
                onClick={() => handleNavigate('/staff/create')}
              >
                <ListItemIcon>
                  <PersonIcon color={isActive('/staff/create') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Create Staff" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/staff/teachers')}
                onClick={() => handleNavigate('/staff/teachers')}
              >
                <ListItemIcon>
                  <PersonIcon color={isActive('/staff/teachers') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Teachers" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={isActive('/staff/admin')}
                onClick={() => handleNavigate('/staff/admin')}
              >
                <ListItemIcon>
                  <PersonIcon color={isActive('/staff/admin') ? 'primary' : undefined} />
                </ListItemIcon>
                <ListItemText primary="Admin Staff" />
              </ListItemButton>
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    // Exams - available to admin and teachers
    if (role === 'admin' || role === 'teacher' || role === 'superadmin') {
      menuItems.push(
        <ListItem key="exams" disablePadding>
          <ListItemButton
            selected={isActive('/exams')}
            onClick={() => handleNavigate('/exams')}
          >
            <ListItemIcon>
              <AssessmentIcon color={isActive('/exams') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Exams" />
          </ListItemButton>
        </ListItem>
      );
    }

    // Fees - available to admin and cashier
    if (role === 'admin' || role === 'cashier' || role === 'superadmin') {
      menuItems.push(
        <ListItem key="fees" disablePadding>
          <ListItemButton
            selected={isActive('/fees')}
            onClick={() => handleNavigate('/fees')}
          >
            <ListItemIcon>
              <PaymentIcon color={isActive('/fees') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Fees" />
          </ListItemButton>
        </ListItem>
      );
    }

    // Settings - available to admin
    if (role === 'admin' || role === 'superadmin') {
      menuItems.push(
        <ListItem key="settings" disablePadding>
          <ListItemButton
            selected={isActive('/settings')}
            onClick={() => handleNavigate('/settings')}
          >
            <ListItemIcon>
              <SettingsIcon color={isActive('/settings') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      );
    }

    // Profile - available to all roles
    menuItems.push(
      <ListItem key="profile" disablePadding>
        <ListItemButton
          selected={isActive('/profile')}
          onClick={() => handleNavigate('/profile')}
        >
          <ListItemIcon>
            <PersonIcon color={isActive('/profile') ? 'primary' : undefined} />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </ListItem>
    );

    return menuItems;
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>School MS</Box>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>{getMenuItems()}</List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* Permanent drawer for desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Temporary drawer for mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
