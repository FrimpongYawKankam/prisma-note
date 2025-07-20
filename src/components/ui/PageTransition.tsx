import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

/**
 * A smooth page transition component that can be wrapped around any screen
 * Provides consistent entrance animations throughout the app
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 350,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH * 0.1)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }
  }, [duration, delay]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#f5f5f5',
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/**
 * A smooth modal transition component
 * Provides slide-up animation for modal screens
 */
export const ModalTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 400,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }
  }, [duration, delay]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#f5f5f5',
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default PageTransition;
