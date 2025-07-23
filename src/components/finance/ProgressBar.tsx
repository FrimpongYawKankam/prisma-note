import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  backgroundColor?: string;
  showAnimation?: boolean;
  animationDuration?: number;
  colorMode?: 'budget' | 'custom';
  customColor?: string;
}

export function ProgressBar({
  percentage,
  height = 8,
  backgroundColor,
  showAnimation = true,
  animationDuration = 1000,
  colorMode = 'budget',
  customColor,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Color coding as per prompt: Blue (0-70%), Yellow (70-90%), Red (90%+)
  const getBudgetProgressColor = (progress: number) => {
    if (progress >= 90) return '#F44336'; // Red (danger 90%+)
    if (progress >= 70) return '#FF9800'; // Yellow (warning 70-90%)
    return '#2196F3'; // Blue (safe 0-70%)
  };

  const getProgressColor = () => {
    if (colorMode === 'custom' && customColor) {
      return customColor;
    }
    return getBudgetProgressColor(percentage);
  };

  const getColorAnimationValue = (progress: number) => {
    if (progress >= 90) return 2; // Red
    if (progress >= 70) return 1; // Yellow
    return 0; // Blue
  };

  useEffect(() => {
    if (showAnimation) {
      // Animate progress bar width
      Animated.timing(progressAnim, {
        toValue: Math.min(percentage, 100),
        duration: animationDuration,
        useNativeDriver: false,
      }).start();

      // Animate color transition for budget mode
      if (colorMode === 'budget') {
        Animated.timing(colorAnim, {
          toValue: getColorAnimationValue(percentage),
          duration: animationDuration * 0.7, // Slightly faster color transition
          useNativeDriver: false,
        }).start();
      }
    } else {
      progressAnim.setValue(Math.min(percentage, 100));
      colorAnim.setValue(getColorAnimationValue(percentage));
    }
  }, [percentage, showAnimation, animationDuration, colorMode]);

  const animatedBackgroundColor = colorMode === 'budget' 
    ? colorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['#2196F3', '#FF9800', '#F44336'],
        extrapolate: 'clamp',
      })
    : getProgressColor();

  const defaultBackgroundColor = backgroundColor || colors.border;

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.background,
          {
            height,
            backgroundColor: defaultBackgroundColor,
            borderRadius: height / 2,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              backgroundColor: showAnimation && colorMode === 'budget' 
                ? animatedBackgroundColor 
                : getProgressColor(),
            }
          ]}
        />
        
        {/* Shimmer effect for active progress */}
        {percentage > 0 && percentage < 100 && (
          <Animated.View
            style={[
              styles.shimmer,
              {
                height,
                borderRadius: height / 2,
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          />
        )}
      </View>
    </View>
  );
}

// Specialized component for budget progress with built-in color logic
export function BudgetProgressBar({
  spent,
  budget,
  height = 8,
  showAnimation = true,
  animationDuration = 1000,
}: {
  spent: number;
  budget: number;
  height?: number;
  showAnimation?: boolean;
  animationDuration?: number;
}) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <ProgressBar
      percentage={percentage}
      height={height}
      showAnimation={showAnimation}
      animationDuration={animationDuration}
      colorMode="budget"
    />
  );
}

// Specialized component for category progress
export function CategoryProgressBar({
  spent,
  budget,
  categoryColor,
  height = 6,
  showAnimation = true,
}: {
  spent: number;
  budget: number;
  categoryColor: string;
  height?: number;
  showAnimation?: boolean;
}) {
  const { colors } = useTheme();
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  // Use budget color logic for category progress
  const getColor = () => {
    if (percentage >= 90) return '#F44336'; // Red
    if (percentage >= 70) return '#FF9800'; // Yellow
    return categoryColor; // Use category color for safe range
  };

  return (
    <ProgressBar
      percentage={percentage}
      height={height}
      showAnimation={showAnimation}
      colorMode="custom"
      customColor={getColor()}
      backgroundColor={colors.border}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  background: {
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});