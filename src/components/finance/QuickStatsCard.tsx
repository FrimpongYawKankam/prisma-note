// 🏦 Quick Stats Card Component
// Displays key financial metrics and insights

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
import { BudgetSummary, FIXED_CATEGORIES } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';

interface QuickStatsCardProps {
  summary: BudgetSummary;
  onViewAnalytics: () => void;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  summary,
  onViewAnalytics,
}) => {
  const { colors } = useTheme();

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCategoryInfo = (categoryId: number) => {
    return FIXED_CATEGORIES.find(cat => cat.id === categoryId) || FIXED_CATEGORIES[10]; // Default to 'Other'
  };

  const getTopCategory = () => {
    if (!summary.categoryBreakdown || !Array.isArray(summary.categoryBreakdown) || summary.categoryBreakdown.length === 0) return null;
    return summary.categoryBreakdown.reduce((prev, current) => 
      prev.totalAmount > current.totalAmount ? prev : current
    );
  };

  const getTotalExpenses = () => {
    if (!summary.categoryBreakdown || !Array.isArray(summary.categoryBreakdown)) return 0;
    return summary.categoryBreakdown.reduce((total, category) => total + category.transactionCount, 0);
  };

  const getAverageExpense = () => {
    const totalExpenses = getTotalExpenses();
    return totalExpenses > 0 ? summary.totalSpent / totalExpenses : 0;
  };

  const topCategory = getTopCategory();

  const stats = [
    {
      icon: 'wallet-outline',
      label: 'Total Spent',
      value: formatCurrency(summary.totalSpent),
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    {
      icon: 'receipt-outline',
      label: 'Total Expenses',
      value: getTotalExpenses().toString(),
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    {
      icon: 'trending-up-outline',
      label: 'Average Expense',
      value: formatCurrency(getAverageExpense()),
      color: colors.accent,
      backgroundColor: `${colors.accent}15`,
    },
    {
      icon: 'pie-chart-outline',
      label: 'Top Category',
      value: topCategory ? getCategoryInfo(topCategory.categoryId).name : 'None',
      color: colors.warning,
      backgroundColor: `${colors.warning}15`,
    },
  ];

  return (
    <ModernCard variant="elevated" padding="lg">
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Quick Stats
        </Text>
        <TouchableOpacity 
          onPress={onViewAnalytics}
          style={styles.viewAllButton}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View Details
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: stat.backgroundColor }]}>
              <Ionicons 
                name={stat.icon as keyof typeof Ionicons.glyphMap} 
                size={24} 
                color={stat.color} 
              />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Additional Insights */}
      {summary.categoryBreakdown && Array.isArray(summary.categoryBreakdown) && summary.categoryBreakdown.length > 0 && (
        <View style={styles.insights}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Spending Insights
          </Text>
          
          {/* Top 3 Categories */}
          <View style={styles.topCategories}>
            {summary.categoryBreakdown && Array.isArray(summary.categoryBreakdown) && summary.categoryBreakdown
              .sort((a, b) => b.totalAmount - a.totalAmount)
              .slice(0, 3)
              .map((category, index) => (
                <View key={category.categoryId} style={styles.categoryItem}>
                  <View style={styles.categoryRank}>
                    <Text style={[styles.rankNumber, { color: colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {getCategoryInfo(category.categoryId).name}
                    </Text>
                    <View style={styles.categoryAmount}>
                      <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
                        {formatCurrency(category.totalAmount)}
                      </Text>
                      <Text style={[styles.categoryCount, { color: colors.textTertiary }]}>
                        ({category.transactionCount} expenses)
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: Spacing.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
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
  insights: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: Spacing.base,
  },
  insightsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.base,
    marginBottom: Spacing.sm,
  },
  topCategories: {
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold as any,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.sm,
    marginBottom: Spacing.xs,
  },
  categoryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
  },
  categoryCount: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
  },
});
