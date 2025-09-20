const jwt = require('jsonwebtoken');

// Your JWT token from the browser
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA3YTMxOTA2LTNkMWQtNGY5OC05YzY5LWIwZTYzMGVlNmI2MCIsImVtYWlsIjoiYWRtaW5AZ3JlZW53b29kLmNvbSIsInJvbGUiOiJBRE1JTiIsInNjaG9vbElkIjoiYjcyNTNlNzctZDU1NC00NzFkLTkzOTMtNzBlMTYyMzI1MmFkIiwiaWF0IjoxNzM3MzU4NjEwLCJleHAiOjE3Mzk5NTA2MTB9';

try {
  const decoded = jwt.decode(token);
  console.log('🔍 Decoded JWT token:');
  console.log(JSON.stringify(decoded, null, 2));

  console.log('\n📋 Key information:');
  console.log('User ID:', decoded.id);
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role);
  console.log('School ID:', decoded.schoolId);

} catch (error) {
  console.error('Error decoding token:', error);
}