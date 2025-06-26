// src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://192.168.56.1:8080/api';  // Replace with your backend URL

const api = axios.create({
  baseURL: API_URL
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (fullName: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { fullName, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};
