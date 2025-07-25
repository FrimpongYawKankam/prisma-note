// src/utils/axiosInstance.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://prismanote-backend.onrender.com', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout to handle slow API responses
  validateStatus: function (status) {
    return status < 500; // resolves only if status is less than 500
  },
});

// request interceptor to add JWT token 
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('🌐 Making request to:', (config.baseURL || '') + (config.url || ''));
    console.log('📡 Method:', config.method?.toUpperCase());
    console.log('⏱️  Timeout:', config.timeout);
    
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and log responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.statusText);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired, invalid, or forbidden - clear storage
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
      console.log('🔓 Cleared authentication data due to invalid/expired token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
