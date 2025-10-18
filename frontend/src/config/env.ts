/**
 * Environment Configuration
 * Centralized configuration for environment-specific values
 * Works in both development and production environments
 */

// Determine environment
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// API Configuration
export const ENV_CONFIG = {
  // API Base URL - automatically switches between dev and prod
  API_URL: import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000/api' : '/api'),

  // Backend Base URL (for OAuth redirects, etc.)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || (isDevelopment ? 'http://localhost:5000' : ''),

  // Frontend Base URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || (isDevelopment ? 'http://localhost:8080' : window.location.origin),

  // App Base URL (for marketing website links)
  APP_URL: import.meta.env.VITE_APP_URL || (isDevelopment ? 'http://localhost:8080' : 'https://app.kokoka.com'),

  // Website URL (for marketing/landing pages)
  WEBSITE_URL: import.meta.env.VITE_WEBSITE_URL || (isDevelopment ? 'http://localhost:5173' : 'https://www.kokoka.com'),

  // Default subdomain for development
  DEFAULT_SUBDOMAIN: import.meta.env.VITE_DEFAULT_SUBDOMAIN || 'greenwood',

  // Environment name
  NODE_ENV: import.meta.env.MODE || 'development',
} as const;

/**
 * Get OAuth provider URL
 * @param provider - OAuth provider name (google, linkedin, etc.)
 * @returns Full OAuth redirect URL
 */
export const getOAuthURL = (provider: string): string => {
  return `${ENV_CONFIG.BACKEND_URL}/api/auth/${provider}`;
};

/**
 * Get full API endpoint URL
 * @param endpoint - API endpoint path
 * @returns Full API URL
 */
export const getApiURL = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ENV_CONFIG.API_URL}${cleanEndpoint}`;
};

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
    console.log('🔧 Environment Configuration:', {
      environment: ENV_CONFIG.NODE_ENV,
      apiUrl: ENV_CONFIG.API_URL,
      backendUrl: ENV_CONFIG.BACKEND_URL,
      frontendUrl: ENV_CONFIG.FRONTEND_URL,
      appUrl: ENV_CONFIG.APP_URL,
      websiteUrl: ENV_CONFIG.WEBSITE_URL,
      defaultSubdomain: ENV_CONFIG.DEFAULT_SUBDOMAIN,
    });
  }
};

export default ENV_CONFIG;
