/**
 * Unified Color System for KOKOKA
 * Centralized color definitions for consistent UI
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: 'bg-blue-50 dark:bg-blue-950',
    100: 'bg-blue-100 dark:bg-blue-900',
    500: 'bg-blue-500 dark:bg-blue-600',
    600: 'bg-blue-600 dark:bg-blue-700',
    700: 'bg-blue-700 dark:bg-blue-800',
    text: {
      50: 'text-blue-50 dark:text-blue-950',
      100: 'text-blue-100 dark:text-blue-900',
      500: 'text-blue-500 dark:text-blue-400',
      600: 'text-blue-600 dark:text-blue-400',
      700: 'text-blue-700 dark:text-blue-300',
      800: 'text-blue-800 dark:text-blue-200',
      900: 'text-blue-900 dark:text-blue-100',
    },
    border: {
      200: 'border-blue-200 dark:border-blue-800',
      300: 'border-blue-300 dark:border-blue-700',
      500: 'border-blue-500 dark:border-blue-600',
    }
  },

  // Success colors
  success: {
    50: 'bg-green-50 dark:bg-green-950',
    100: 'bg-green-100 dark:bg-green-900',
    500: 'bg-green-500 dark:bg-green-600',
    600: 'bg-green-600 dark:bg-green-700',
    text: {
      200: 'text-green-200 dark:text-green-800',
      400: 'text-green-400 dark:text-green-600',
      600: 'text-green-600 dark:text-green-400',
      800: 'text-green-800 dark:text-green-200',
      900: 'text-green-900 dark:text-green-100',
    },
    border: {
      200: 'border-green-200 dark:border-green-800',
      500: 'border-green-500 dark:border-green-600',
    }
  },

  // Error colors
  error: {
    50: 'bg-red-50 dark:bg-red-950',
    100: 'bg-red-100 dark:bg-red-900/50',
    500: 'bg-red-500 dark:bg-red-600',
    600: 'bg-red-600 dark:bg-red-700',
    700: 'bg-red-700 dark:bg-red-800',
    text: {
      200: 'text-red-200 dark:text-red-800',
      300: 'text-red-300 dark:text-red-700',
      400: 'text-red-400 dark:text-red-600',
      600: 'text-red-600 dark:text-red-400',
      700: 'text-red-700 dark:text-red-300',
      800: 'text-red-800 dark:text-red-200',
      900: 'text-red-900 dark:text-red-100',
    },
    border: {
      200: 'border-red-200 dark:border-red-800',
      300: 'border-red-300 dark:border-red-700',
      500: 'border-red-500 dark:border-red-600',
    }
  },

  // Warning colors
  warning: {
    50: 'bg-yellow-50 dark:bg-yellow-950',
    100: 'bg-yellow-100 dark:bg-yellow-900',
    500: 'bg-yellow-500 dark:bg-yellow-600',
    text: {
      600: 'text-yellow-600 dark:text-yellow-400',
      800: 'text-yellow-800 dark:text-yellow-200',
    },
    border: {
      200: 'border-yellow-200 dark:border-yellow-800',
    }
  },

  // Teal accent colors (for consistency with primary)
  teal: {
    50: 'bg-cyan-50 dark:bg-cyan-950',
    100: 'bg-cyan-100 dark:bg-cyan-900',
    600: 'bg-cyan-600 dark:bg-cyan-700',
    text: {
      600: 'text-cyan-600 dark:text-cyan-400',
    }
  },

  // Gray scale
  gray: {
    50: 'bg-gray-50 dark:bg-gray-950',
    100: 'bg-gray-100 dark:bg-gray-900',
    200: 'bg-gray-200 dark:bg-gray-800',
    300: 'bg-gray-300 dark:bg-gray-700',
    500: 'bg-gray-500 dark:bg-gray-600',
    600: 'bg-gray-600 dark:bg-gray-500',
    800: 'bg-gray-800 dark:bg-gray-300',
    900: 'bg-gray-900 dark:bg-gray-200',
    text: {
      300: 'text-gray-300 dark:text-gray-700',
      400: 'text-gray-400 dark:text-gray-600',
      500: 'text-gray-500 dark:text-gray-500',
      600: 'text-gray-600 dark:text-gray-400',
      700: 'text-gray-700 dark:text-gray-300',
      800: 'text-gray-800 dark:text-gray-200',
      900: 'text-gray-900 dark:text-gray-100',
    },
    border: {
      200: 'border-gray-200 dark:border-gray-800',
      300: 'border-gray-300 dark:border-gray-700',
    }
  },

  // Gradients
  gradients: {
    primaryToTeal: 'bg-gradient-to-r from-cyan-600 to-teal-600',
    primaryToTealHover: 'hover:from-cyan-700 hover:to-teal-700',
    primaryLight: 'bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20',
    primary100: 'bg-gradient-to-r from-cyan-100 to-teal-100',
    grayToTeal: 'bg-gradient-to-r from-gray-50 to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20',
  }
} as const;

// Utility functions for consistent color usage
export const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info') => {
  switch (status) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'info':
    default:
      return colors.primary;
  }
};

// Common color combinations
export const colorCombinations = {
  card: {
    background: 'bg-white dark:bg-gray-900',
    border: colors.gray.border[200],
    text: colors.gray.text[900],
  },
  button: {
    primary: {
      background: colors.primary[600],
      hover: 'hover:bg-cyan-700 dark:hover:bg-cyan-600',
      text: 'text-white',
    },
    secondary: {
      background: colors.gray[100],
      hover: 'hover:bg-gray-200 dark:hover:bg-gray-800',
      text: colors.gray.text[900],
    },
    danger: {
      background: colors.error[600],
      hover: 'hover:bg-red-700 dark:hover:bg-red-600',
      text: 'text-white',
    }
  },
  input: {
    background: 'bg-white dark:bg-gray-800',
    border: colors.gray.border[300],
    text: colors.gray.text[900],
    placeholder: colors.gray.text[500],
  },
  statusBadge: {
    active: `${colors.success[100]} ${colors.success.text[800]}`,
    inactive: `${colors.gray[100]} ${colors.gray.text[800]}`,
    pending: `${colors.warning[100]} ${colors.warning.text[800]}`,
  }
};