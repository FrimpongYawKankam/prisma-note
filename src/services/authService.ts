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
    
    // Handle specific error cases
    if (error.response?.status === 401) {
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
    const registerRequest: RegisterRequest = { fullName, email, password };
    const response = await axiosInstance.post('/api/auth/register', registerRequest);
    return response.data; // Should return success message
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.response?.status === 409) {
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
