// 🏦 Empty State Card Component
// Displays when user has no budget or expenses

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionText: string;
  onAction: () => void;
  variant?: 'budget' | 'expenses';
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  variant = 'budget',
}) => {
  const { colors } = useTheme();

  const getIconColor = () => {
    switch (variant) {
      case 'budget':
        return colors.primary;
      case 'expenses':
        return colors.accent;
      default:
        return colors.accent;
    }
  };

  return (
    <ModernCard variant="elevated" padding="lg" style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
          <Ionicons 
            name={icon} 
            size={48} 
            color={getIconColor()} 
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>

        {/* Action Button */}
        <ModernButton
          title={actionText}
          onPress={onAction}
          variant="primary"
          leftIcon={
            <Ionicons 
              name="add-circle-outline" 
              size={20} 
              color="white" 
            />
          }
          style={styles.actionButton}
        />
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.xl,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.base,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 200,
  },
});
