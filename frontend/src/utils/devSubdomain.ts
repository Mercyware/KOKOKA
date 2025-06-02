// Get the development subdomain from localStorage
export const getDevSubdomain = (): string | null => {
  return localStorage.getItem('dev_subdomain');
};

// Set the development subdomain in localStorage
export const setDevSubdomain = (subdomain: string): void => {
  localStorage.setItem('dev_subdomain', subdomain);
};

// Initialize development subdomain with a default value if none exists
export const initDevSubdomain = (defaultSubdomain: string): string => {
  const existingSubdomain = localStorage.getItem('dev_subdomain');
  if (!existingSubdomain) {
    localStorage.setItem('dev_subdomain', defaultSubdomain);
    return defaultSubdomain;
  }
  return existingSubdomain;
};
