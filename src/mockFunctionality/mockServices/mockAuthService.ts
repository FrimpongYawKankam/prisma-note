import {
    MessageResponse,
    User
} from '../../types/api';
import { mockToken, mockUser } from '../mockData/users';
import { MOCK_CONFIG, MOCK_RESPONSES } from '../utils/constants';
import { createMockError, mockStorage, simulateDelay } from '../utils/mockUtils';

/**
 * Mock Auth Service - Simulates backend authentication
 */
export const mockAuthService = {
  /**
   * Mock login function
   */
  login: async (email: string, password: string) => {
    await simulateDelay('AUTH');
    
    // Check credentials
    if (email !== MOCK_CONFIG.TEST_USER.email || password !== MOCK_CONFIG.TEST_USER.password) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }
    
    // Store auth data
    await mockStorage.set(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN, mockToken);
    await mockStorage.set(MOCK_CONFIG.STORAGE_KEYS.MOCK_USER, mockUser);
    
    return {
      user: mockUser,
      accessToken: mockToken,
      refreshToken: mockToken
    };
  },

  /**
   * Mock register function
   */
  register: async (fullName: string, email: string, password: string): Promise<MessageResponse> => {
    await simulateDelay('AUTH');
    
    // Simulate user already exists scenario occasionally
    if (email === mockUser.email) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.USER_EXISTS, 409);
    }
    
    return {
      message: MOCK_RESPONSES.SUCCESS_MESSAGES.REGISTER
    };
  },

  /**
   * Mock OTP verification
   */
  verifyOtp: async (email: string, otp: string) => {
    await simulateDelay('AUTH');
    
    // Accept any 6-digit OTP for demo
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw createMockError('Invalid OTP format', 400);
    }
    
    return {
      message: 'Email verified successfully'
    };
  },

  /**
   * Mock get current user
   */
  getCurrentUser: async (): Promise<User> => {
    await simulateDelay('AUTH');
    
    const token = await mockStorage.get<string>(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN);
    if (!token) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
    
    return mockUser;
  },

  /**
   * Mock forgot password
   */
  forgotPassword: async (email: string) => {
    await simulateDelay('AUTH');
    
    return {
      message: 'Password reset email sent successfully'
    };
  },

  /**
   * Mock change password
   */
  changePassword: async (email: string, otp: string, newPassword: string) => {
    await simulateDelay('AUTH');
    
    return {
      message: 'Password changed successfully'
    };
  },

  /**
   * Mock change password for logged in user
   */
  changePasswordForLoggedInUser: async (newPassword: string) => {
    await simulateDelay('AUTH');
    
    const token = await mockStorage.get<string>(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN);
    if (!token) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
    
    return {
      message: 'Password changed successfully'
    };
  },

  /**
   * Mock logout
   */
  logout: async () => {
    await simulateDelay('AUTH');
    
    // Clear auth data
    await mockStorage.remove(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN);
    await mockStorage.remove(MOCK_CONFIG.STORAGE_KEYS.MOCK_USER);
    
    return true;
  },

  /**
   * Mock authentication check
   */
  isAuthenticated: async () => {
    const token = await mockStorage.get<string>(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN);
    return !!token;
  },

  /**
   * Mock resend OTP
   */
  resendOtp: async (email: string) => {
    await simulateDelay('AUTH');
    
    return {
      message: 'OTP sent successfully'
    };
  }
};
