import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CONFIG } from './constants';

/**
 * Simulates network delay for realistic testing
 */
export const simulateDelay = (delayType: keyof typeof MOCK_CONFIG.DELAYS = 'NOTES'): Promise<void> => {
  const delay = MOCK_CONFIG.DELAYS[delayType];
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Generates a random ID for mock data
 */
export const generateMockId = (): number => {
  return Math.floor(Math.random() * 10000) + 1;
};

/**
 * Creates a date string in ISO format for mock data
 */
export const createMockDate = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

/**
 * Storage utilities for mock data persistence
 */
export const mockStorage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting mock data for key ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting mock data for key ${key}:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing mock data for key ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = Object.values(MOCK_CONFIG.STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing mock data:', error);
    }
  }
};

/**
 * Random error simulation (5% chance)
 */
export const shouldSimulateError = (): boolean => {
  return Math.random() < 0.05; // 5% chance of error
};

/**
 * Mock error generator
 */
export const createMockError = (message: string, status: number = 400) => {
  const error = new Error(message) as any;
  error.response = {
    status,
    data: { message }
  };
  return error;
};
