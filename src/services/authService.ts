import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// For testing/development without a working backend
const USE_MOCK_AUTH = false; // Set to true to use mock authentication instead of real API calls

// Mock user database for testing when USE_MOCK_AUTH is true
const mockUsers = [
  {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    verified: true
  }
];

// Mock authentication functions
const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw { 
      response: { 
        status: 401, 
        data: { message: 'Invalid email or password' } 
      } 
    };
  }
  
  if (!user.verified) {
    throw { 
      response: { 
        status: 403, 
        data: { message: 'Email not verified. Please verify your email first.' } 
      } 
    };
  }
  
  // Generate mock tokens
  const accessToken = `mock-jwt-token-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${Date.now()}`;
  
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

const mockRegister = async (fullName: string, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  // Check if user already exists
  if (mockUsers.some(u => u.email === email)) {
    throw { 
      response: { 
        status: 409, 
        data: { message: 'User already exists with this email' } 
      } 
    };
  }
  
  // Add new user to mock database
  const newUser = {
    id: `${mockUsers.length + 1}`,
    fullName,
    email,
    password,
    verified: false
  };
  
  mockUsers.push(newUser);
  
  return { message: 'User registered successfully. Please check your email for verification.' };
};

const mockVerifyOtp = async (email: string, otp: string) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    throw { 
      response: { 
        status: 404, 
        data: { message: 'User not found' } 
      } 
    };
  }
  
  // Simple verification - any 6-digit OTP is valid in mock mode
  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    throw { 
      response: { 
        status: 400, 
        data: { message: 'Invalid OTP' } 
      } 
    };
  }
  
  // Mark user as verified
  user.verified = true;
  
  return { message: 'OTP verified successfully. You can now log in.' };
};

const mockResendOtp = async (email: string) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    throw { 
      response: { 
        status: 404, 
        data: { message: 'User not found' } 
      } 
    };
  }
  
  return { message: 'A new verification code has been sent to your email.' };
};

// Determine the API URL based on the environment
const getApiUrl = () => {
  // Check if running in Expo web
  if (typeof window !== 'undefined' && window.location) {
    return 'http://localhost:8080/api'; // For web browser
  }
  
  // For Android emulator, localhost refers to the emulator itself, not your machine
  // For iOS simulator, localhost works fine
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:8080/api'  // Special IP for Android emulator to access host machine
    : 'http://localhost:8080/api'; // Works for iOS
};

const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  async (config) => {    // List of auth endpoints that should NOT have the JWT attached
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];

    // Skip attaching token for auth endpoints
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      config.url?.endsWith(endpoint)
    );

    // Only attach token for non-auth endpoints
    if (!isAuthEndpoint) {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try refreshing the token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await refreshAuthToken(refreshToken);
        
        // Store the new tokens
        await AsyncStorage.setItem('jwt_token', response.accessToken);
        await AsyncStorage.setItem('refresh_token', response.refreshToken);
        
        // Check if the original request was to an auth endpoint        // List of auth endpoints that don't need authorization headers
        const authEndpoints = [
          '/auth/login',
          '/auth/register',
          '/auth/refresh-token',
          '/auth/verify-otp',
          '/auth/resend-otp',
          '/auth/forgot-password',
          '/auth/reset-password'
        ];
        
        const isAuthEndpoint = authEndpoints.some(endpoint => 
          originalRequest.url?.endsWith(endpoint)
        );
        
        // Only set Authorization header for non-auth endpoints
        if (!isAuthEndpoint) {
          // Update the header and retry the original request
          originalRequest.headers['Authorization'] = `Bearer ${response.accessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Simpler atob implementation for environments where it's not available
function safeAtob(str: string): string {
  try {
    // Use built-in atob if available
    if (typeof atob === 'function') {
      return atob(str);
    }
    
    // Simple base64 decoder implementation
    const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    
    // Remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    const base64 = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    do {
      enc1 = keyStr.indexOf(base64.charAt(i++));
      enc2 = keyStr.indexOf(base64.charAt(i++));
      enc3 = keyStr.indexOf(base64.charAt(i++));
      enc4 = keyStr.indexOf(base64.charAt(i++));
      
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      
      output = output + String.fromCharCode(chr1);
      
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    } while (i < base64.length);
    
    return output;
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
};

// Utility function to parse JWT token
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = safeAtob(base64);
    
    // Convert the decoded string to JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Auth service methods
export const login = async (email: string, password: string) => {
  try {
    if (USE_MOCK_AUTH) {
      const mockResponse = await mockLogin(email, password);
      
      // Store mock tokens in AsyncStorage
      await AsyncStorage.setItem('jwt_token', mockResponse.accessToken);
      await AsyncStorage.setItem('refresh_token', mockResponse.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      return mockResponse;
    }
    
    // Real API implementation
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response data:', JSON.stringify(response.data));
    
    // Extract data from response
    const token = response.data.token || response.data.accessToken;
    const refreshToken = response.data.refreshToken || token; // Fallback to same token if refresh token is not provided
    
    // Store tokens in AsyncStorage
    await AsyncStorage.setItem('jwt_token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refresh_token', refreshToken);
    }
    
    // Handle user data - first store anything that came in the response
    if (response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    // Always try to get fresh user data from the API regardless
    if (token) {
      try {
        console.log('Fetching user data after login...');
        // Try to get user data from the new endpoint with Bearer token
        let userResponse;
        
        try {
          // First try with /api prefix
          userResponse = await api.get('/auth/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (firstError) {
          console.log('First endpoint failed, trying alternative endpoint...');
          // If that fails, try without /api prefix
          userResponse = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        if (userResponse.data) {
          // Store user info in AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userResponse.data));
          
          // Add user to response data for consistent handling
          response.data.user = userResponse.data;
        }
      } catch (endpointError) {
        console.log('Error fetching user from /users/me endpoint:', endpointError);
        console.log('Falling back to JWT extraction...');
        
        // Endpoint call failed, fall back to JWT extraction
        const tokenPayload = parseJwt(token);
        
        if (tokenPayload) {
          // Create user object from token payload
          const user = {
            id: tokenPayload.id || tokenPayload.userId || tokenPayload.sub || '',
            email: tokenPayload.email || email,
            fullName: tokenPayload.fullName || tokenPayload.name || email.split('@')[0],
            isVerified: tokenPayload.isVerified !== undefined ? tokenPayload.isVerified : true,
            role: tokenPayload.role || 'USER'
          };
          
          // Store user info in AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(user));
          
          // Add user to response data for consistent handling
          response.data.user = user;
        } else {
          // Create minimal user object if token couldn't be parsed
          const user = {
            id: '',
            email: email,
            fullName: email.split('@')[0],
            isVerified: true,
            role: 'USER'
          };
          await AsyncStorage.setItem('user', JSON.stringify(user));
          response.data.user = user;
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
}

export const register = async (fullName: string, email: string, password: string) => {
  if (USE_MOCK_AUTH) {
    return mockRegister(fullName, email, password);
  }
  
  try {
    const response = await api.post('/auth/register', { fullName, email, password });
    return response.data;
  } catch (error: any) {
    console.error('Register error details:', { 
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  if (USE_MOCK_AUTH) {
    return mockVerifyOtp(email, otp);
  }
  
  try {
    // Based on backend implementation, this just returns success/failure message
    // It doesn't return tokens as the user needs to login after verification
    const response = await api.post('/auth/verify-otp', { email, otp });
    
    // Just return the response data which will be a success message
    return response.data;
  } catch (error: any) {
    console.error('Verify OTP error details:', { 
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const refreshAuthToken = async (refreshToken: string | null) => {
  if (!refreshToken) throw new Error('No refresh token available');
  
  try {
    // This endpoint doesn't need JWT in the request header
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call server logout endpoint if needed
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    const accessToken = await AsyncStorage.getItem('jwt_token');
    
    if (refreshToken && accessToken) {
      // Explicitly send the access token in the header for logout
      await api.post(
        '/auth/logout', 
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
    }
    
    // Clear tokens from storage
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove tokens even if server call fails
    await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (email: string) => {
  if (USE_MOCK_AUTH) {
    return mockResendOtp(email);
  }
  
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('jwt_token');
  return !!token;
};

// Fetch current user details from API
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Make explicit request with token in Authorization header
    let response;
    
    try {
      // First try with /api prefix
      response = await api.get('/api/users/me', {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
    } catch (firstAttemptError) {
      // If that fails, try without /api prefix
      response = await api.get('/users/me', {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    console.log('Current user data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

// Export the API instance for other service modules to use
export default api;