import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

interface User {
  id?: string;
  fullName?: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (fullName: string, email: string, password: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check if user is logged in on app startup
    const checkAuthStatus = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('jwt_token');
        
        if (userString && token) {
          try {
            const parsedUser = JSON.parse(userString);
            
            // Ensure the user object has all required fields
            const userWithDefaults = {
              ...parsedUser,
              // If username is missing but fullName exists, use fullName as username
              username: parsedUser.username || parsedUser.fullName || '',
              // Make sure fullName exists
              fullName: parsedUser.fullName || parsedUser.username || ''
            };
            
            setUser(userWithDefaults);
            setIsAuthenticated(true);
            
            // Update stored user with complete data
            if (JSON.stringify(userWithDefaults) !== userString) {
              await AsyncStorage.setItem('user', JSON.stringify(userWithDefaults));
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Remove invalid data
            await AsyncStorage.removeItem('user');
          }
        }
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
      
      // Ensure the user object has all required fields
      const userWithDefaults = {
        ...response.user,
        // If username is missing but fullName exists, use fullName as username
        username: response.user.username || response.user.fullName || '',
        // Make sure fullName exists
        fullName: response.user.fullName || response.user.username || ''
      };
      
      setUser(userWithDefaults);
      setIsAuthenticated(true);
      
      // Update stored user with complete data
      await AsyncStorage.setItem('user', JSON.stringify(userWithDefaults));
      
      return response;
    } catch (error) {
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
        loading
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
