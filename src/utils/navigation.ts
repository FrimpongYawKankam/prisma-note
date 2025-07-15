import { router } from 'expo-router';

/**
 * Safe navigation helper that provides fallback navigation
 * when router.back() might not work (no previous screen in stack)
 */
export const safeNavigateBack = (fallbackRoute: string = '/') => {
  try {
    // First try to go back
    if (router.canGoBack()) {
      router.back();
    } else {
      // If can't go back, navigate to fallback route
      router.push(fallbackRoute);
    }
  } catch (error) {
    // If there's any error, navigate to fallback route
    console.warn('Navigation error, falling back to:', fallbackRoute);
    router.push(fallbackRoute);
  }
};

/**
 * Safe navigation to home screen
 */
export const navigateToHome = () => {
  router.push('/');
};

/**
 * Safe navigation to login screen
 */
export const navigateToLogin = () => {
  router.push('/login');
};

/**
 * Safe navigation to signup screen
 */
export const navigateToSignup = () => {
  router.push('/signup');
};
