/**
 * KOKOKA Design System
 * Modern design tokens for a next-generation school management system
 */

// Base color palette
export const palette = {
  // Brand colors
  brand: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe', 
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e',
    }
  },

  // Semantic colors
  semantic: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac', 
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    }
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
} as const;

// Design tokens
export const tokens = {
  // Spacing scale (4px base unit)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '52px'],
      '6xl': ['60px', '64px'],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  // Border radius
  radius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation durations
  duration: {
    fastest: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },

  // Animation easings
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Theme configuration
export const theme = {
  light: {
    background: {
      primary: palette.neutral[50],
      secondary: palette.neutral[100],
      tertiary: palette.neutral[200],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    foreground: {
      primary: palette.neutral[900],
      secondary: palette.neutral[700],
      tertiary: palette.neutral[500],
      inverse: palette.neutral[50],
      muted: palette.neutral[400],
    },
    border: {
      primary: palette.neutral[200],
      secondary: palette.neutral[300],
      focus: palette.brand.primary[500],
    },
  },
  dark: {
    background: {
      primary: palette.neutral[950],
      secondary: palette.neutral[900],
      tertiary: palette.neutral[800],
      elevated: palette.neutral[900],
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    foreground: {
      primary: palette.neutral[50],
      secondary: palette.neutral[300],
      tertiary: palette.neutral[500],
      inverse: palette.neutral[900],
      muted: palette.neutral[600],
    },
    border: {
      primary: palette.neutral[800],
      secondary: palette.neutral[700],
      focus: palette.brand.primary[400],
    },
  },
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: tokens.spacing[8],
      md: tokens.spacing[10],
      lg: tokens.spacing[12],
      xl: tokens.spacing[16],
    },
    padding: {
      sm: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      md: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      lg: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      xl: `${tokens.spacing[5]} ${tokens.spacing[8]}`,
    },
    fontSize: {
      sm: tokens.typography.fontSize.sm,
      md: tokens.typography.fontSize.base,
      lg: tokens.typography.fontSize.lg,
      xl: tokens.typography.fontSize.xl,
    },
    borderRadius: tokens.radius.md,
  },
  input: {
    height: {
      sm: tokens.spacing[8],
      md: tokens.spacing[10], 
      lg: tokens.spacing[12],
    },
    padding: {
      sm: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      md: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      lg: `${tokens.spacing[4]} ${tokens.spacing[4]}`,
    },
    borderRadius: tokens.radius.md,
  },
  card: {
    padding: tokens.spacing[6],
    borderRadius: tokens.radius.lg,
    shadow: tokens.shadow.md,
  },
} as const;

// Utility functions
export const getColorValue = (path: string, opacity?: number) => {
  const keys = path.split('.');
  let value: any = palette;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  if (typeof value !== 'string') return '';
  
  if (opacity !== undefined) {
    // Convert hex to rgba
    const hex = value.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return value;
};

export type Palette = typeof palette;
export type Tokens = typeof tokens;
export type Theme = typeof theme;
export type Components = typeof components;