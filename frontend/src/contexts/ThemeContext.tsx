import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define theme context type
interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get stored theme preferences or use defaults
  const storedMode = localStorage.getItem('themeMode') as PaletteMode || 'light';
  const storedPrimaryColor = localStorage.getItem('primaryColor') || '#1976d2';
  const storedSecondaryColor = localStorage.getItem('secondaryColor') || '#f50057';

  const [mode, setMode] = useState<PaletteMode>(storedMode);
  const [primaryColor, setPrimaryColor] = useState<string>(storedPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(storedSecondaryColor);

  // Create theme based on current settings
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryColor,
          },
          secondary: {
            main: secondaryColor,
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 500,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 4px 6px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 6px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode, primaryColor, secondaryColor]
  );

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Update primary color
  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
  };

  // Update secondary color
  const handleSetSecondaryColor = (color: string) => {
    setSecondaryColor(color);
  };

  // Save theme preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [mode, primaryColor, secondaryColor]);

  // Context value
  const contextValue: ThemeContextType = {
    mode,
    toggleColorMode,
    theme,
    primaryColor,
    secondaryColor,
    setPrimaryColor: handleSetPrimaryColor,
    setSecondaryColor: handleSetSecondaryColor,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
