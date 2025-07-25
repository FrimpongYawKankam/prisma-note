// 🏦 Budget Overview Card Component
// Displays current budget status and key metrics

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Budget, BudgetSummary } from '../../types/finance';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface BudgetOverviewCardProps {
  budget: Budget;
  summary?: BudgetSummary | null;
  onAddExpense: () => void;
  onViewAnalytics: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  budget,
  summary,
  onAddExpense,
  onViewAnalytics,
}) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number) => {
    const currencySymbol = budget.currency === 'GHS' ? '₵' : 
                          budget.currency === 'USD' ? '$' :
                          budget.currency === 'EUR' ? '€' :
                          budget.currency === 'GBP' ? '£' : 
                          budget.currency;
    
    return `${currencySymbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressPercentage = () => {
    if (!summary) return 0;
    return Math.min((summary.totalSpent / budget.totalBudget) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return colors.error;
    if (percentage >= 75) return colors.warning;
    return colors.success;
  };

  const getRemainingBudget = () => {
    if (!summary) return budget.totalBudget;
    return Math.max(budget.totalBudget - summary.totalSpent, 0);
  };

  const isOverBudget = summary ? summary.totalSpent > budget.totalBudget : false;

  const getTotalExpenses = () => {
    if (!summary || !summary.categoryBreakdown || !Array.isArray(summary.categoryBreakdown)) return 0;
    return summary.categoryBreakdown.reduce((total, category) => total + category.transactionCount, 0);
  };

  const getAverageExpense = () => {
    if (!summary) return 0;
    const totalExpenses = getTotalExpenses();
    return totalExpenses > 0 ? summary.totalSpent / totalExpenses : 0;
  };

  return (
    <ModernCard variant="elevated" padding="lg">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>
            {budget.period.toLowerCase().charAt(0).toUpperCase() + budget.period.toLowerCase().slice(1)} Budget
          </Text>
          <Text style={[styles.period, { color: colors.textSecondary }]}>
            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: budget.isActive ? colors.success : colors.textMuted }]}>
          <Text style={[styles.statusText, { color: budget.isActive ? '#fff' : colors.text }]}>
            {budget.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Budget Amount */}
      <View style={styles.budgetAmount}>
        <Text style={[styles.totalBudget, { color: colors.text }]}>
          {formatCurrency(budget.totalBudget)}
        </Text>
        <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
          Total Budget
        </Text>
      </View>

      {/* Progress Section */}
      {summary && (
        <View style={styles.progressSection}>
          {/* Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
            <View 
              style={[
                styles.progressBar,
                { 
                  backgroundColor: getProgressColor(),
                  width: `${getProgressPercentage()}%`,
                }
              ]} 
            />
          </View>

          {/* Spent vs Remaining */}
          <View style={styles.spentVsRemaining}>
            <View style={styles.spentInfo}>
              <Text style={[styles.amount, { color: isOverBudget ? colors.error : colors.text }]}>
                {formatCurrency(summary.totalSpent)}
              </Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Spent {isOverBudget && '(Over budget)'}
              </Text>
            </View>
            <View style={styles.remainingInfo}>
              <Text style={[styles.amount, { color: isOverBudget ? colors.error : colors.success }]}>
                {formatCurrency(getRemainingBudget())}
              </Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isOverBudget ? 'Over budget' : 'Remaining'}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {getTotalExpenses()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Expenses
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {(summary?.categoryBreakdown && Array.isArray(summary.categoryBreakdown)) ? summary.categoryBreakdown.length : 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Categories
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(getAverageExpense())}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Avg. Expense
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <ModernButton
          title="Add Expense"
          onPress={onAddExpense}
          variant="primary"
          leftIcon={
            <Ionicons 
              name="add-circle-outline" 
              size={18} 
              color="white" 
            />
          }
          style={styles.actionButton}
        />
        <ModernButton
          title="Analytics"
          onPress={onViewAnalytics}
          variant="secondary"
          leftIcon={
            <Ionicons 
              name="analytics-outline" 
              size={18} 
              color={colors.primary} 
            />
          }
          style={styles.actionButton}
        />
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.lg,
    marginBottom: Spacing.xs,
  },
  period: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  budgetAmount: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalBudget: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
    lineHeight: Typography.lineHeight['3xl'],
    marginBottom: Spacing.xs,
  },
  budgetLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.sm,
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  spentVsRemaining: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  spentInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  remainingInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.lg,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.xs,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.base,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  actionButton: {
    flex: 1,
  },
});
