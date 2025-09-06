// Debug utility to check subdomain synchronization
import { getUser, getSchoolSubdomain } from '../services/authService';

export const debugSubdomainSync = () => {
  const user = getUser();
  const localStorageSubdomain = localStorage.getItem('schoolSubdomain');
  const helperSubdomain = getSchoolSubdomain();
  
  const debugInfo = {
    user: {
      exists: !!user,
      id: user?.id,
      name: user?.name,
      schoolId: user?.schoolId,
      school: {
        exists: !!user?.school,
        id: user?.school?.id,
        name: user?.school?.name,
        subdomain: user?.school?.subdomain,
        status: user?.school?.status
      }
    },
    localStorage: {
      schoolSubdomain: localStorageSubdomain,
      schoolName: localStorage.getItem('schoolName'),
      user: !!localStorage.getItem('user'),
      token: !!localStorage.getItem('token')
    },
    helper: {
      getSchoolSubdomain: helperSubdomain
    },
    sync: {
      isUserSubdomainSynced: user?.school?.subdomain === localStorageSubdomain,
      helperMatchesStorage: helperSubdomain === localStorageSubdomain,
      helperMatchesUser: helperSubdomain === user?.school?.subdomain
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('🔍 Subdomain Sync Debug:', JSON.stringify(debugInfo, null, 2));
  return debugInfo;
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugSubdomain = debugSubdomainSync;
}