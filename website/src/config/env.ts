/**
 * Environment Configuration for Marketing Website
 * Centralized configuration for environment-specific values
 */

// Determine environment
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Website Configuration
export const ENV_CONFIG = {
  // App URL (main application)
  APP_URL: import.meta.env.VITE_APP_URL || (isDevelopment ? 'http://localhost:8080' : 'https://app.kokoka.com'),

  // Backend URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || (isDevelopment ? 'http://localhost:5000' : 'https://api.kokoka.com'),

  // Website URL (this marketing site)
  WEBSITE_URL: import.meta.env.VITE_WEBSITE_URL || (isDevelopment ? 'http://localhost:5173' : 'https://www.kokoka.com'),

  // Environment name
  NODE_ENV: import.meta.env.MODE || 'development',
} as const;

/**
 * Get app URL with optional path
 * @param path - Optional path to append
 * @returns Full app URL
 */
export const getAppURL = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV_CONFIG.APP_URL}${cleanPath}`;
};

/**
 * Get website URL with optional path
 * @param path - Optional path to append
 * @returns Full website URL
 */
export const getWebsiteURL = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV_CONFIG.WEBSITE_URL}${cleanPath}`;
};

/**
 * Log environment configuration (only in development)
 */
export const logEnvConfig = (): void => {
  if (isDevelopment) {
    console.log('🌐 Website Environment Configuration:', {
      environment: ENV_CONFIG.NODE_ENV,
      appUrl: ENV_CONFIG.APP_URL,
      backendUrl: ENV_CONFIG.BACKEND_URL,
      websiteUrl: ENV_CONFIG.WEBSITE_URL,
    });
  }
};

export default ENV_CONFIG;
