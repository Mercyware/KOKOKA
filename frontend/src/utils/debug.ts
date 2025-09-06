// Debug utilities for development

export const debugAuth = () => {
  console.log('=== Auth Debug Info ===');
  console.log('Token:', localStorage.getItem('token'));
  console.log('User:', localStorage.getItem('user'));
  console.log('Subdomain:', localStorage.getItem('devSubdomain'));
  console.log('=======================');
};

export const setMockAuth = () => {
  // Mock auth token for development
  const mockToken = 'mock-token-for-development';
  const mockUser = JSON.stringify({
    id: 'mock-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    schoolId: 'mock-school-id'
  });
  
  localStorage.setItem('token', mockToken);
  localStorage.setItem('user', mockUser);
  console.log('Mock auth set');
};
