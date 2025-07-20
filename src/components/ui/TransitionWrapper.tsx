import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TransitionWrapperProps {
  children: React.ReactNode;
  transitionType?: 'slide' | 'fade' | 'scale' | 'slideUp';
  duration?: number;
  delay?: number;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  transitionType = 'slide',
  duration = 300,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    const startAnimation = () => {
      switch (transitionType) {
        case 'fade':
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }).start();
          break;
        
        case 'slide':
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
          break;
        
        case 'scale':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        
        case 'slideUp':
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    };

    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }
  }, [transitionType, duration, delay]);

  const getAnimatedStyle = () => {
    switch (transitionType) {
      case 'fade':
        return {
          opacity: fadeAnim,
        };
      
      case 'slide':
        return {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        };
      
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      
      case 'slideUp':
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
        };
      
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: isDark ? '#000000' : '#f5f5f5' }, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

export default TransitionWrapper;
