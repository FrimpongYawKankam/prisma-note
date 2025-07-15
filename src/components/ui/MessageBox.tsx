import React, { useEffect, useState } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';

interface MessageBoxProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  duration?: number; // in milliseconds
  style?: ViewStyle;
}

export const MessageBox: React.FC<MessageBoxProps> = ({ 
  message, 
  type = 'error', 
  duration = 3000,
  style 
}) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Only run effect if message changes and isn't empty
    if (!message) return;

    // Delay the state update to avoid React insertion phase conflicts
    const showMessage = () => {
      setVisible(true);
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Use requestAnimationFrame to schedule after render is complete
    const animationId = requestAnimationFrame(showMessage);
    
    // After duration, fade out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Delay the state update slightly
        requestAnimationFrame(() => {
          setVisible(false);
        });
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationId);
    };
  }, [message, duration, slideAnim, opacityAnim]);

  const getMessageStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      padding: Spacing.base,
      marginHorizontal: Spacing.base,
      marginTop: Spacing.base,
    };

    const typeStyles = {
      error: {
        backgroundColor: colors.error + '20',
        borderColor: colors.error,
        borderWidth: 1,
      },
      success: {
        backgroundColor: colors.success + '20',
        borderColor: colors.success,
        borderWidth: 1,
      },
      info: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
        borderWidth: 1,
      },
      warning: {
        backgroundColor: colors.warning + '20',
        borderColor: colors.warning,
        borderWidth: 1,
      },
    };

    return {
      ...baseStyle,
      ...typeStyles[type],
    };
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'info':
        return colors.primary;
      case 'warning':
        return colors.warning;
      default:
        return colors.error;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        getMessageStyle(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: getTextColor(),
          fontSize: Typography.fontSize.sm,
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
};
