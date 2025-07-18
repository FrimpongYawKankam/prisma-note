// Service factory to switch between mock and real services
import { MOCK_CONFIG } from './utils/constants';

// Real services
import * as realAuthService from '../services/authService';
import * as realNoteService from '../services/noteService';

// Mock services
import { mockAuthService } from './mockServices/mockAuthService';
import { mockNoteService } from './mockServices/mockNoteService';

/**
 * Auth Service Factory
 * Returns mock or real auth service based on configuration
 */
export const createAuthService = () => {
  if (MOCK_CONFIG.USE_MOCK) {
    console.log('🔧 Using Mock Auth Service');
    return mockAuthService;
  } else {
    console.log('🌐 Using Real Auth Service');
    return realAuthService;
  }
};

/**
 * Note Service Factory
 * Returns mock or real note service based on configuration
 */
export const createNoteService = () => {
  if (MOCK_CONFIG.USE_MOCK) {
    console.log('🔧 Using Mock Note Service');
    return mockNoteService;
  } else {
    console.log('🌐 Using Real Note Service');
    return realNoteService;
  }
};

/**
 * Get current service mode
 */
export const getServiceMode = (): 'mock' | 'real' => {
  return MOCK_CONFIG.USE_MOCK ? 'mock' : 'real';
};

/**
 * Check if currently using mock services
 */
export const isUsingMockServices = (): boolean => {
  return MOCK_CONFIG.USE_MOCK;
};

/**
 * Mock data management utilities
 */
export const mockDataUtils = {
  /**
   * Reset all mock data to initial state
   */
  resetMockData: async () => {
    if (MOCK_CONFIG.USE_MOCK) {
      const { mockStorage } = await import('./utils/mockUtils');
      await mockStorage.clear();
      console.log('🔄 Mock data reset to initial state');
    }
  },

  /**
   * Clear all mock data
   */
  clearMockData: async () => {
    if (MOCK_CONFIG.USE_MOCK) {
      const { mockStorage } = await import('./utils/mockUtils');
      await mockStorage.clear();
      console.log('🗑️ All mock data cleared');
    }
  },

  /**
   * Get mock data status
   */
  getMockDataStatus: async () => {
    if (!MOCK_CONFIG.USE_MOCK) {
      return { mode: 'real', hasData: false };
    }

    const { mockStorage } = await import('./utils/mockUtils');
    const hasUser = !!(await mockStorage.get(MOCK_CONFIG.STORAGE_KEYS.MOCK_USER));
    const hasNotes = !!(await mockStorage.get(MOCK_CONFIG.STORAGE_KEYS.MOCK_NOTES));
    const hasToken = !!(await mockStorage.get(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN));

    return {
      mode: 'mock' as const,
      hasData: hasUser || hasNotes || hasToken,
      details: { hasUser, hasNotes, hasToken }
    };
  }
};

// Initialize mock services if needed
if (MOCK_CONFIG.USE_MOCK) {
  console.log('🎭 Mock functionality initialized');
  console.log(`📧 Test Email: ${MOCK_CONFIG.TEST_USER.email}`);
  console.log(`🔑 Test Password: ${MOCK_CONFIG.TEST_USER.password}`);
}
