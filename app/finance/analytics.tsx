// 📊 Finance Analytics Screen - Comprehensive Financial Insights
// Advanced analytics and visualization for budget and expenses

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ModernCard } from '../../src/components/ui/ModernCard';
import { useBudget, useBudgetSummary, useExpenses, useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { FIXED_CATEGORIES } from '../../src/types/finance';

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { refreshAllData, loading } = useFinance();
  const { budget, hasActiveBudget } = useBudget();
  const { summary, hasData: hasSummaryData } = useBudgetSummary();
  const { expenses, isEmpty: isExpenseListEmpty } = useExpenses();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const handleRefresh = async () => {
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    }
  };

  const getCategoryInfo = (categoryId: number) => {
    return FIXED_CATEGORIES.find(cat => cat.id === categoryId) || FIXED_CATEGORIES[10];
  };

  const formatAmount = (amount: number) => {
    return `₵ ${amount.toFixed(2)}`;
  };

  const getFilteredExpenses = () => {
    if (!expenses || expenses.length === 0) return [];

    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return expenses;
    }

    return expenses.filter(expense => new Date(expense.date) >= filterDate);
  };

  const getCategoryBreakdown = () => {
    const filteredExpenses = getFilteredExpenses();
    const categoryMap = new Map<number, { name: string; icon: string; total: number; count: number }>();

    filteredExpenses.forEach(expense => {
      const category = getCategoryInfo(expense.categoryId);
      const existing = categoryMap.get(expense.categoryId) || {
        name: category.name,
        icon: category.icon,
        total: 0,
        count: 0,
      };

      categoryMap.set(expense.categoryId, {
        ...existing,
        total: existing.total + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 categories
  };

  const getSpendingTrend = () => {
    const filteredExpenses = getFilteredExpenses();
    const dailySpending = new Map<string, number>();

    filteredExpenses.forEach(expense => {
      const dateKey = expense.date;
      const existing = dailySpending.get(dateKey) || 0;
      dailySpending.set(dateKey, existing + expense.amount);
    });

    return Array.from(dailySpending.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7); // Last 7 days
  };

  const getTotalSpending = () => {
    return getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAverageDaily = () => {
    const filteredExpenses = getFilteredExpenses();
    if (filteredExpenses.length === 0) return 0;

    const total = getTotalSpending();
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : filteredExpenses.length;
    return total / days;
  };

  const categoryBreakdown = getCategoryBreakdown();
  const spendingTrend = getSpendingTrend();
  const totalSpending = getTotalSpending();
  const averageDaily = getAverageDaily();
  const maxCategoryAmount = Math.max(...categoryBreakdown.map(cat => cat.total), 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading.summary}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Period Selector */}
        <ModernCard style={styles.periodCard}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Time Period</Text>
          <View style={styles.periodSelector}>
            {[
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'all', label: 'All Time' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodOption,
                  {
                    backgroundColor: selectedPeriod === period.key ? colors.primary : colors.surfaceSecondary,
                    borderColor: selectedPeriod === period.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: selectedPeriod === period.key ? colors.surface : colors.text,
                    }
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ModernCard>

        {/* Overview Stats */}
        <ModernCard style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatAmount(totalSpending)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Spent
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatAmount(averageDaily)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Daily Average
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {getFilteredExpenses().length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Transactions
              </Text>
            </View>
            {hasActiveBudget && hasSummaryData && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatAmount(budget!.totalBudget - summary!.totalSpent)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Remaining
                </Text>
              </View>
            )}
          </View>
        </ModernCard>

        {/* Budget Progress */}
        {hasActiveBudget && hasSummaryData && (
          <ModernCard style={styles.budgetCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Progress</Text>
            <View style={styles.budgetProgress}>
              <View style={styles.budgetInfo}>
                <Text style={[styles.budgetAmount, { color: colors.text }]}>
                  {formatAmount(summary!.totalSpent)} / {formatAmount(budget!.totalBudget)}
                </Text>
                <Text style={[styles.budgetPercentage, { color: colors.textSecondary }]}>
                  {((summary!.totalSpent / budget!.totalBudget) * 100).toFixed(1)}% used
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((summary!.totalSpent / budget!.totalBudget) * 100, 100)}%`,
                      backgroundColor: summary!.totalSpent > budget!.totalBudget ? colors.error : colors.primary,
                    }
                  ]}
                />
              </View>
            </View>
          </ModernCard>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <ModernCard style={styles.categoryCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Spending by Category
            </Text>
            {categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {category.count} transaction{category.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[styles.categoryAmount, { color: colors.primary }]}>
                    {formatAmount(category.total)}
                  </Text>
                  <View style={[styles.categoryBar, { backgroundColor: colors.surfaceSecondary }]}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${(category.total / maxCategoryAmount) * 100}%`,
                          backgroundColor: colors.primary,
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ModernCard>
        )}

        {/* Empty State */}
        {isExpenseListEmpty && (
          <ModernCard style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Analytics Available
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Add some expenses to see your spending analytics and insights.
              </Text>
            </View>
          </ModernCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  periodCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.base,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  statsCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.base,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  budgetCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  budgetProgress: {
    gap: Spacing.base,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  budgetPercentage: {
    fontSize: Typography.fontSize.base,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.base,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  categoryCount: {
    fontSize: Typography.fontSize.sm,
  },
  categoryRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  categoryAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.xs,
  },
  categoryBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyCard: {
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});
