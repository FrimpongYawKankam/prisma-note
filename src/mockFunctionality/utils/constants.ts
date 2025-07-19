// Mock functionality constants and configuration

export const MOCK_CONFIG = {
  // Enable/disable mock mode - set to true for mock mode
  USE_MOCK: false, // Change this to false to use real backend
  
  // Network simulation delays (in milliseconds)
  DELAYS: {
    AUTH: 800,      // Login/register/logout delays
    NOTES: 600,     // Note operations delays
    EVENTS: 500,    // Event operations delays
    SEARCH: 400,    // Search delays
  },
  
  // AsyncStorage keys for mock data persistence
  STORAGE_KEYS: {
    MOCK_USER: 'mock_user',
    MOCK_NOTES: 'mock_notes',
    MOCK_EVENTS: 'mock_events',
    MOCK_AUTH_TOKEN: 'mock_auth_token',
  },
  
  // Mock user credentials
  TEST_USER: {
    email: 'testemail@example.com',
    password: 'Test123=',
    fullName: 'TestUser'
  }
};

export const MOCK_RESPONSES = {
  SUCCESS_MESSAGES: {
    LOGIN: 'Login successful',
    REGISTER: 'Registration successful. Please verify your email.',
    NOTE_CREATED: 'Note created successfully',
    NOTE_UPDATED: 'Note updated successfully',
    NOTE_DELETED: 'Note deleted successfully',
    EVENT_CREATED: 'Event created successfully',
  },
  
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists with this email',
    NOTE_NOT_FOUND: 'Note not found',
    UNAUTHORIZED: 'Authentication required',
    NETWORK_ERROR: 'Network error occurred',
  }
};
