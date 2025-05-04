import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import * as authService from '../services/authService';

// Define the context type
interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string, school?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
    };
    checkAuthentication();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        const { token, user } = response.data;
        authService.setAuthToken(token);
        authService.setUser(user);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || 'Login failed',
        }));
        return false;
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      return false;
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    school?: string
  ): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.register({
        name,
        email,
        password,
        role: role as any,
        school,
      });
      if (response.success && response.data) {
        const { token, user } = response.data;
        authService.setAuthToken(token);
        authService.setUser(user);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || 'Registration failed',
        }));
        return false;
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Registration failed',
      }));
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.removeAuthToken();
      authService.removeUser();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      // First check if we have a token
      if (!authService.isAuthenticated()) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        return false;
      }

      // Then try to get the current user
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          loading: false,
          error: null,
        });
        // Update user in local storage
        authService.setUser(response.data);
        return true;
      } else {
        // If the request fails, clear auth data
        authService.removeAuthToken();
        authService.removeUser();
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: response.message || 'Authentication failed',
        });
        return false;
      }
    } catch (error: any) {
      // If there's an error, clear auth data
      authService.removeAuthToken();
      authService.removeUser();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Authentication failed',
      });
      return false;
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    authState,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
