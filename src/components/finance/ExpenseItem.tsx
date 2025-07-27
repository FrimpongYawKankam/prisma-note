// 🏦 Expense Item Component
// Individual expense row component

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Category, Expense } from '../../types/finance';

interface ExpenseItemProps {
  expense: Expense;
  categories: Category[];
  onPress?: () => void;
  showDate?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  categories = [], // Default to empty array if undefined
  onPress,
  showDate = true,
}) => {
  const { colors } = useTheme();

  // Safety check for invalid expense object
  if (!expense || typeof expense !== 'object') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Invalid expense data
        </Text>
      </View>
    );
  }

  // Safety check for categories
  if (!categories || !Array.isArray(categories)) {
    console.warn('ExpenseItem: categories prop is not a valid array', categories);
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₵0.00';
    }
    return `₵${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'No date';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) {
      return 'No time';
    }
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid time';
    }
  };

  const getCategory = () => {
    if (!categories || !Array.isArray(categories)) {
      return null;
    }
    return categories.find(cat => cat.id === expense.categoryId);
  };

  const getCategoryIcon = () => {
    const category = getCategory();
    if (!category) return 'help-circle-outline';

    const iconMap: Record<string, string> = {
      'Food & Dining': 'restaurant-outline',
      'Transportation': 'car-outline',
      'Shopping': 'bag-outline',
      'Entertainment': 'game-controller-outline',
      'Bills & Utilities': 'receipt-outline',
      'Healthcare': 'medical-outline',
      'Education': 'school-outline',
      'Travel': 'airplane-outline',
      'Business': 'briefcase-outline',
      'Personal Care': 'person-outline',
      'Other': 'ellipsis-horizontal-outline',
    };

    return iconMap[category.name] || 'ellipsis-horizontal-outline';
  };

  const getCategoryColor = () => {
    const category = getCategory();
    if (!category) return colors.textMuted;

    const colorMap: Record<string, string> = {
      'Food & Dining': colors.warning,
      'Transportation': colors.primary,
      'Shopping': colors.accent,
      'Entertainment': colors.accent,
      'Bills & Utilities': colors.error,
      'Healthcare': colors.success,
      'Education': colors.primary,
      'Travel': colors.accent,
      'Business': colors.textSecondary,
      'Personal Care': colors.accent,
      'Other': colors.textMuted,
    };

    return colorMap[category.name] || colors.textMuted;
  };

  const category = getCategory();

  const content = (
    <View style={styles.container}>
      {/* Category Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${getCategoryColor()}15` }]}>
        <Ionicons 
          name={getCategoryIcon() as keyof typeof Ionicons.glyphMap} 
          size={24} 
          color={getCategoryColor()} 
        />
      </View>

      {/* Expense Details */}
      <View style={styles.details}>
        <View style={styles.mainInfo}>
          <Text style={[styles.category, { color: colors.text }]}>
            {category?.name || 'Unknown Category'}
          </Text>
          {expense.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {expense.description}
            </Text>
          )}
        </View>

        {showDate && (
          <View style={styles.timeInfo}>
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              {formatDate(expense.date)}
            </Text>
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {formatTime(expense.date)}
            </Text>
          </View>
        )}
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: Spacing.xs,
  },
  mainInfo: {
    gap: 2,
  },
  category: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.base,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.sm,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  date: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.xs,
  },
  time: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.xs,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.base,
  },
});
