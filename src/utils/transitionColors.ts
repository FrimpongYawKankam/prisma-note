import { useTheme } from '../context/ThemeContext';

/**
 * Hook to get theme-aware transition background colors
 * Returns appropriate background colors for transitions based on current theme
 */
export const useTransitionColors = () => {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  return {
    // Main transition background
    transitionBackground: isDark ? '#000000' : '#f5f5f5',
    
    // Loading screen background
    loadingBackground: isDark ? '#000000' : '#f5f5f5',
    
    // Modal overlay background
    modalOverlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    
    // Splash transition background
    splashBackground: '#000000', // Always dark for splash
    
    // Card transition background
    cardBackground: isDark ? '#1a1a1a' : '#ffffff',
    
    // Theme colors
    primary: colors.primary,
    text: isDark ? '#ffffff' : '#000000',
    subtext: isDark ? '#aaaaaa' : '#666666',
    
    // Utility
    isDark,
  };
};

/**
 * Get transition background color based on theme
 * @param isDark - Whether the current theme is dark
 * @returns Appropriate background color for transitions
 */
export const getTransitionBackground = (isDark: boolean): string => {
  return isDark ? '#000000' : '#f5f5f5';
};

/**
 * Get loading background color based on theme
 * @param isDark - Whether the current theme is dark
 * @returns Appropriate background color for loading screens
 */
export const getLoadingBackground = (isDark: boolean): string => {
  return isDark ? '#000000' : '#f5f5f5';
};

export default useTransitionColors;
