import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Text,
    TextInput,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';

interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'username' | 'off';
  enableHaptics?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  enableHaptics = false,
}) => {
  const { theme, colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [animatedLabel] = useState(new Animated.Value(value ? 1 : 0));
  const [animatedBorder] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isFocused || value) {
      Animated.timing(animatedLabel, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animatedLabel]);

  const handleFocus = () => {
    setIsFocused(true);
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate border
    Animated.timing(animatedBorder, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (label && !value) {
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
    
    // Animate border back
    Animated.timing(animatedBorder, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const getContainerStyle = (): ViewStyle => {
    const borderColor = animatedBorder.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? colors.error : colors.border,
        error ? colors.error : colors.primary
      ]
    });

    return {
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: borderColor as any,
      backgroundColor: disabled ? colors.textMuted + '20' : colors.surface,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      paddingHorizontal: Spacing.base,
      paddingVertical: multiline ? Spacing.base : Spacing.sm,
      minHeight: multiline ? 80 : 42,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: Typography.fontSize.base,
      lineHeight: Typography.lineHeight.base,
      color: disabled ? colors.textMuted : colors.text,
      paddingTop: label && (isFocused || value) ? Spacing.lg : 0,
      textAlignVertical: multiline ? 'top' : 'center',
      includeFontPadding: false, // Remove extra padding on Android
    };
  };

  const getLabelStyle = () => {
    return {
      position: 'absolute' as const,
      left: Spacing.base,
      fontSize: animatedLabel.interpolate({
        inputRange: [0, 1],
        outputRange: [Typography.fontSize.base, Typography.fontSize.sm],
      }),
      top: animatedLabel.interpolate({
        inputRange: [0, 1],
        outputRange: [multiline ? Spacing.base : Spacing.md, Spacing.sm],
      }),
      color: error 
        ? colors.error 
        : isFocused 
          ? colors.primary 
          : colors.textTertiary,
      backgroundColor: colors.surface,
      paddingHorizontal: 4,
      zIndex: 1,
    };
  };

  return (
    <View style={[{ marginBottom: Spacing.base }, style]}>
      <Animated.View style={getContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: Spacing.sm }}>
            {leftIcon}
          </View>
        )}
        
        <View style={{ flex: 1, justifyContent: multiline ? 'flex-start' : 'center' }}>
          {label && (
            <Animated.Text style={getLabelStyle()}>
              {label}
            </Animated.Text>
          )}
          
          <TextInput
            style={[getInputStyle(), inputStyle]}
            value={value}
            onChangeText={onChangeText}
            placeholder={!label ? placeholder : ''}
            placeholderTextColor={colors.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            multiline={multiline}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
        </View>
        
        {rightIcon && (
          <View style={{ marginLeft: Spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </Animated.View>
      
      {error && (
        <Text style={{
          color: colors.error,
          fontSize: Typography.fontSize.sm,
          marginTop: Spacing.xs,
          marginLeft: Spacing.xs,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};
