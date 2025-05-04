import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, drawerWidth }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleColorMode } = useAppTheme();

  // State for user menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // State for notifications menu
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  const notificationOpen = Boolean(notificationAnchorEl);

  // Handle user menu open
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle notification menu open
  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  // Handle notification menu close
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Handle profile navigation
  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  // Handle settings navigation
  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  // Handle logout
  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {authState.user?.role === 'admin' ? 'Admin Dashboard' : 
           authState.user?.role === 'teacher' ? 'Teacher Dashboard' : 
           authState.user?.role === 'student' ? 'Student Portal' : 
           'School Management System'}
        </Typography>

        {/* Theme toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={toggleColorMode}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
            />
          }
          label=""
        />

        {/* Notifications */}
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationMenu}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={notificationOpen}
            onClose={handleNotificationClose}
          >
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">New student registration</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">Upcoming exam: Mathematics</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">Fee payment reminder</Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* User menu */}
        <Box sx={{ display: 'flex', ml: 1 }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              color="inherit"
            >
              {authState.user?.profileImage ? (
                <Avatar
                  alt={authState.user?.name}
                  src={authState.user?.profileImage}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
