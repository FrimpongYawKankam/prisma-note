import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../styles/tokens';

interface ModernCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  enableHaptics?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'md',
  disabled = false,
  enableHaptics = false,
}) => {
  const { theme, colors } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.card,
    };

    const paddingStyles = {
      none: {},
      sm: { padding: Spacing.sm },
      md: { padding: Spacing.base },
      lg: { padding: Spacing.lg },
    };

    const variantStyles = {
      elevated: {
        ...Shadows.sm,
        shadowColor: theme === 'dark' ? '#000' : colors.text,
        shadowOpacity: theme === 'dark' ? 0.3 : 0.08,
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        ...({ shadowOpacity: 0, elevation: 0 } as any),
      },
      filled: {
        backgroundColor: colors.surfaceSecondary,
        ...({ shadowOpacity: 0, elevation: 0 } as any),
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const handlePressIn = () => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            getCardStyle(),
            {
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};
