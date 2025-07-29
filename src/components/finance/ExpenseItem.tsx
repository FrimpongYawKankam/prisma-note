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

import { useBudget } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Expense, FIXED_CATEGORIES } from '../../types/finance';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: () => void;
  showDate?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  showDate = true,
}) => {
  const { colors } = useTheme();
  const { budget } = useBudget();

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

  const formatCurrency = (amount: number | undefined) => {
    // Get currency symbol from budget with comprehensive mapping
    const getCurrencySymbol = (currency: string | undefined) => {
      switch (currency) {
        case 'GHS': return '₵';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return '₵'; // Default to Cedi
      }
    };

    const currencySymbol = getCurrencySymbol(budget?.currency);

    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currencySymbol}0.00`;
    }
    
    return `${currencySymbol}${amount.toLocaleString('en-US', {
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

  // Get category info from FIXED_CATEGORIES using categoryId (more reliable than API categoryName)
  const getCategoryInfo = () => {
    return FIXED_CATEGORIES.find(cat => cat.id === expense.categoryId) || FIXED_CATEGORIES[10]; // Default to 'Other'
  };

  // Use FIXED_CATEGORIES to map to Ionicons
  const getCategoryIcon = () => {
    const category = getCategoryInfo();

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
      'Gifts & Donations': 'gift-outline',
      'Other': 'ellipsis-horizontal-outline',
    };

    return iconMap[category.name] || 'ellipsis-horizontal-outline';
  };

  const getCategoryColor = () => {
    const category = getCategoryInfo();

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
      'Gifts & Donations': colors.success,
      'Other': colors.textMuted,
    };

    return colorMap[category.name] || colors.textMuted;
  };

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
            {getCategoryInfo().name}
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
