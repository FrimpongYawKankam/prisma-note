import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Gradients, Shadows, Spacing, Typography } from '../../styles/tokens';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
  enableHaptics?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  gradient,
  enableHaptics = false,
}) => {
  const { theme, colors } = useTheme();

  const gradientColors = gradient || (variant === 'gradient' ? Gradients.primary : null);

  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      ...Shadows.sm,
    };

    // Size variations
    const sizeStyles = {
      sm: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        minHeight: 42,
      },
      lg: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minHeight: 48,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        ...({ shadowOpacity: 0, elevation: 0 } as any),
      },
      gradient: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...sizeStyles[size],
        backgroundColor: colors.textMuted,
        borderWidth: 0,
        ...({ shadowOpacity: 0, elevation: 0 } as any),
      };
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyles = () => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600' as const,
      textAlign: 'center',
    };

    const sizeTextStyles = {
      sm: {
        fontSize: Typography.fontSize.sm,
        lineHeight: Typography.lineHeight.sm,
      },
      md: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.lineHeight.base,
      },
      lg: {
        fontSize: Typography.fontSize.lg,
        lineHeight: Typography.lineHeight.lg,
      },
    };

    const variantTextStyles = {
      primary: {
        color: '#ffffff',
      },
      secondary: {
        color: '#ffffff',
      },
      outline: {
        color: colors.text,
      },
      ghost: {
        color: colors.primary,
      },
      gradient: {
        color: '#ffffff',
      },
    };

    if (disabled) {
      return {
        ...baseTextStyle,
        ...sizeTextStyles[size],
        color: colors.background,
      };
    }

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const handlePress = () => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const renderButton = () => {
    if (variant === 'gradient' && gradientColors && gradientColors.length >= 2) {
      return (
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyles(), style]}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
          >
            {renderButtonContent()}
          </TouchableOpacity>
        </LinearGradient>
      );
    }

    return (
      <TouchableOpacity
        style={[getButtonStyles(), style]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    );
  };

  const renderButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#ffffff'}
          style={{ marginRight: leftIcon || title ? Spacing.sm : 0 }}
        />
      )}
      
      {leftIcon && !loading && (
        <View style={{ marginRight: title ? Spacing.sm : 0 }}>
          {leftIcon}
        </View>
      )}
      
      {title && (
        <Text style={getTextStyles()}>
          {title}
        </Text>
      )}
      
      {rightIcon && (
        <View style={{ marginLeft: title ? Spacing.sm : 0 }}>
          {rightIcon}
        </View>
      )}
    </>
  );

  return renderButton();
};
