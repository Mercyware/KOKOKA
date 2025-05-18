/**
 * This utility helps manage the development subdomain for local testing
 * It checks if a development subdomain is set in localStorage and provides
 * functions to set, get, and clear it
 */

// Check if we're in development environment
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
};

// Get the current development subdomain
export const getDevSubdomain = () => {
  if (!isDevelopment()) return null;
  return localStorage.getItem('dev_subdomain');
};

// Set a development subdomain
export const setDevSubdomain = (subdomain) => {
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
export const clearDevSubdomain = () => {
  if (!isDevelopment()) return false;
  localStorage.removeItem('dev_subdomain');
  console.log('Development subdomain cleared');
  return true;
};

// Initialize with a default subdomain if none exists
export const initDevSubdomain = (defaultSubdomain) => {
  if (!isDevelopment()) return null;
  
  const currentSubdomain = getDevSubdomain();
  if (!currentSubdomain && defaultSubdomain) {
    setDevSubdomain(defaultSubdomain);
    return defaultSubdomain;
  }
  
  return currentSubdomain;
};

export default {
  getDevSubdomain,
  setDevSubdomain,
  clearDevSubdomain,
  initDevSubdomain
};
