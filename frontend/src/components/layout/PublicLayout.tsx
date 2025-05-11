import React from 'react';
import { Box, CssBaseline } from '@mui/material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PublicLayout;
