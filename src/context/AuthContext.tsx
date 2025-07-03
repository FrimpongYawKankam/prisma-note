import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

interface User {
  id?: string;
  fullName: string;
  email: string;
  isVerified?: boolean;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (fullName: string, email: string, password: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data from API
  const refreshUserData = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) return false;

      try {
        // Try to get user data from the new endpoint
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      } catch (error) {
        console.error('Failed to refresh user data from API:', error);
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  // Check authentication status on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // First try to get user data from storage for immediate UI update
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          try {
            const parsedUser = JSON.parse(userString);
            const userWithDefaults = {
              ...parsedUser,
              fullName: parsedUser.fullName || (parsedUser.email ? parsedUser.email.split('@')[0] : '') || ''
            };
            setUser(userWithDefaults);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }

        // Then try to refresh from API
        await refreshUserData();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      // Get user from response or from storage
      let userObj;
      if (response && response.user) {
        userObj = response.user;
      } else {
        // Try to get from storage as a fallback
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          try {
            userObj = JSON.parse(storedUser);
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
      }
      
      // Ensure we have user data with all required fields
      if (userObj) {
        const userWithDefaults = {
          id: userObj.id || '',
          email: userObj.email || email,
          fullName: userObj.fullName || email.split('@')[0],
          isVerified: userObj.isVerified !== undefined ? userObj.isVerified : true,
          role: userObj.role || 'USER'
        };
        
        setUser(userWithDefaults);
        setIsAuthenticated(true);
        
        // Update stored user with complete data
        await AsyncStorage.setItem('user', JSON.stringify(userWithDefaults));
      } else {
        // Last resort fallback if no user data anywhere
        console.error('Could not obtain user data from any source');
        const defaultUser = {
          id: '',
          email: email,
          fullName: email.split('@')[0],
          isVerified: true,
          role: 'USER'
        };
        
        setUser(defaultUser);
        setIsAuthenticated(true);
        
        // Store minimal user info
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
      }
      
      // Try to refresh user data once more to ensure we have the latest
      setTimeout(async () => {
        try {
          await refreshUserData();
        } catch (refreshError) {
          console.error('Failed to refresh user data after login:', refreshError);
        }
      }, 500);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    return await authService.register(fullName, email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still update UI state even if network request fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyOtp(email, otp);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        verifyOtp,
        logout,
        loading,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
