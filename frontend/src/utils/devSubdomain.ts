/**
 * This utility helps manage the development subdomain for local testing
 * It checks if a development subdomain is set in localStorage and provides
 * functions to set, get, and clear it
 */

// Check if we're in development environment
const isDevelopment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/) !== null;
};

// Get the current development subdomain
export const getDevSubdomain = (): string | null => {
  if (!isDevelopment()) return null;
  return localStorage.getItem('dev_subdomain');
};

// Set a development subdomain
export const setDevSubdomain = (subdomain: string): boolean => {
  if (!isDevelopment()) return false;
  if (!subdomain) {
    localStorage.removeItem('dev_subdomain');
    return true;
  }
  
  localStorage.setItem('dev_subdomain', subdomain);
  console.log(`Development subdomain set to: ${subdomain}`);
  return true;
};

// Clear the development subdomain
export const clearDevSubdomain = (): boolean => {
  if (!isDevelopment()) return false;
  localStorage.removeItem('dev_subdomain');
  console.log('Development subdomain cleared');
  return true;
};

// Initialize development subdomain with a default value
export const initDevSubdomain = (defaultSubdomain: string): string | null => {
  if (!isDevelopment()) return null;
  
  const existing = getDevSubdomain();
  if (existing) {
    return existing;
  }
  
  // Set default if none exists
  setDevSubdomain(defaultSubdomain);
  return defaultSubdomain;
};

// Get current effective subdomain (dev override or actual)
export const getEffectiveSubdomain = (): string | null => {
  // First check for dev override
  const devSubdomain = getDevSubdomain();
  if (devSubdomain) {
    return devSubdomain;
  }
  
  // Fall back to actual hostname subdomain
  const hostname = window.location.hostname;
  if (hostname.includes('.') && !hostname.includes('localhost')) {
    return hostname.split('.')[0];
  }
  
  return null;
};