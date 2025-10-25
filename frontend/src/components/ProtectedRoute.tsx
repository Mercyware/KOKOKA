import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ActivationPendingScreen from './ActivationPendingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireActiveSchool?: boolean; // New prop to control school activation check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActiveSchool = true // Default to true - most routes require active school
}) => {
  const { authState, checkAuth } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && authState.user && !allowedRoles.includes(authState.user.role)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  // Check if school is active (if required for this route)
  if (requireActiveSchool && authState.user?.school?.status !== 'ACTIVE') {
    return (
      <ActivationPendingScreen
        schoolName={authState.user?.school?.name || 'Your School'}
        schoolStatus={authState.user?.school?.status || 'PENDING'}
        userEmail={authState.user?.email}
        onRefresh={checkAuth}
      />
    );
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
