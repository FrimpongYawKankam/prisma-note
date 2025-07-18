import { User } from '../../types/api';
import { MOCK_CONFIG } from '../utils/constants';

export const mockUser: User = {
  id: '1',
  fullName: MOCK_CONFIG.TEST_USER.fullName,
  email: MOCK_CONFIG.TEST_USER.email,
  isVerified: true,
  role: 'USER'
};

export const mockToken = 'mock_jwt_token_12345_testuser';
