import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MessageResponse,
  OtpVerificationRequest,
  RegisterRequest,
  User
} from '../types/api';
import axiosInstance from '../utils/axiosInstance';

// Auth service methods
export const login = async (email: string, password: string) => {
  try {
    const loginRequest: LoginRequest = { email, password };
    const response = await axiosInstance.post('/api/auth/login', loginRequest);
    
    // Extract data from AuthResponse
    const authResponse: AuthResponse = response.data;
    const { token, user } = authResponse;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    // Store tokens in AsyncStorage
    await AsyncStorage.setItem('jwt_token', token);
    // Use same token as refresh token since backend doesn't provide separate refresh token
    await AsyncStorage.setItem('refresh_token', token);
    
    // Store user data
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    
    return {
      user,
      accessToken: token,
      refreshToken: token
    };
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle network errors specifically
    if (error.code === 'ECONNABORTED') {
      throw new Error('Login request timed out. Please check your internet connection and try again.');
    } else if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 403) {
      throw new Error('Email not verified. Please verify your email first.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

export const register = async (fullName: string, email: string, password: string): Promise<MessageResponse> => {
  try {
    console.log('🚀 Starting registration request...');
    console.log('📍 BaseURL:', axiosInstance.defaults.baseURL);
    console.log('📝 Request data:', { fullName, email, password: '***' });
    
    const registerRequest: RegisterRequest = { fullName, email, password };
    const response = await axiosInstance.post('/api/auth/register', registerRequest);
    
    console.log('✅ Registration successful:', response.status);
    return response.data; // Should return success message
  } catch (error: any) {
    console.error('❌ Register error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      }
    });
    
    // Handle network errors specifically
    if (error.code === 'ECONNABORTED') {
      throw new Error('Registration request timed out. Please check your internet connection and try again.');
    } else if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
      throw new Error('Unable to connect to server. Please check if the server is running and your network connection is stable.');
    } else if (error.response?.status === 409) {
      throw new Error('User already exists with this email');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const otpRequest: OtpVerificationRequest = { email, otp };
    const response = await axiosInstance.post('/api/auth/verify-otp', otpRequest);
    return response.data; // Should return success message
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid OTP. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('OTP verification failed. Please try again.');
    }
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axiosInstance.get('/api/auth/users/me');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }
};

export const changePassword = async (email: string, otp: string, newPassword: string) => {
  try {
    const changePasswordRequest: ChangePasswordRequest = { email, otp, newPassword };
    const response = await axiosInstance.post('/api/auth/forgot-password', changePasswordRequest);
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to change password. Please try again.');
    }
  }
};

export const changePasswordForLoggedInUser = async (newPassword: string) => {
  try {
    const changePasswordRequest: ChangePasswordRequest = { newPassword };
    const response = await axiosInstance.post('/api/auth/change-password', changePasswordRequest);
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to change password. Please try again.');
    }
  }
};

export const logout = async () => {
  try {
    // Clear tokens from storage
    await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove tokens even if there's an error
    await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
    throw error;
  }
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('jwt_token');
  return !!token;
};

// Test function to check server connectivity
export const testServerConnection = async () => {
  try {
    console.log('🧪 Testing server connection...');
    const response = await axiosInstance.get('/api/health', { timeout: 5000 });
    console.log('✅ Server is reachable:', response.status);
    return { success: true, status: response.status };
  } catch (error: any) {
    console.error('❌ Server connection test failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });
    return { 
      success: false, 
      error: error.message,
      suggestion: error.code === 'ECONNABORTED' ? 'Server timeout' : 
                 error.message === 'Network Error' ? 'Cannot reach server - check IP and port' :
                 'Unknown connection issue'
    };
  }
};

// Additional utility functions for backward compatibility
export const resendOtp = async (email: string) => {
  try {
    // If backend has resend OTP endpoint, use it
    const response = await axiosInstance.post('/api/auth/resend-otp', { email });
    return response.data;
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }
};

export default axiosInstance;
