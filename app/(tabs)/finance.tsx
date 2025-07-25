// 🏦 Finance Screen - Main Finance Tab
// Comprehensive budget and expense management

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModernButton } from '../../src/components/ui/ModernButton';
import {
  useBudget,
  useBudgetSummary,
  useExpenses,
  useFinance,
} from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, Typography } from '../../src/styles/tokens';

// Import finance components
import {
  BudgetOverviewCard,
  EmptyStateCard,
  ExpenseListCard,
  QuickStatsCard,
} from '../../src/components/finance';

export default function FinanceScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { refreshAllData, loading } = useFinance();
  const { budget, hasActiveBudget } = useBudget();
  const { summary, hasData: hasSummaryData } = useBudgetSummary();
  const { expenses, isEmpty: isExpenseListEmpty } = useExpenses();

  const isRefreshing = loading.budget || loading.expenses || loading.summary;

  const handleRefresh = async () => {
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Failed to refresh finance data:', error);
    }
  };

  const handleCreateBudget = () => {
    router.push('/finance/create-budget');
  };

  const handleAddExpense = () => {
    router.push('/finance/add-expense');
  };

  const handleViewAllExpenses = () => {
    router.push('/finance/expenses');
  };

  const handleViewAnalytics = () => {
    router.push('/finance/analytics');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Finance
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your budget and expenses
        </Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {!hasActiveBudget ? (
          // No Budget State
          <View style={styles.content}>
            <EmptyStateCard
              title="No Budget Set"
              description="Create your first budget to start tracking your expenses and reach your financial goals."
              icon="wallet-outline"
              actionText="Create Budget"
              onAction={handleCreateBudget}
            />
          </View>
        ) : (
          // Budget Exists State
          <View style={styles.content}>
            {/* Budget Overview */}
            <BudgetOverviewCard
              budget={budget!}
              summary={summary}
              onAddExpense={handleAddExpense}
              onViewAnalytics={handleViewAnalytics}
            />

            {/* Quick Stats */}
            {hasSummaryData && (
              <QuickStatsCard
                summary={summary!}
                onViewAnalytics={handleViewAnalytics}
              />
            )}

            {/* Recent Expenses */}
            <ExpenseListCard
              expenses={expenses.slice(0, 5)} // Show only 5 most recent
              isEmpty={isExpenseListEmpty}
              onAddExpense={handleAddExpense}
              onViewAll={handleViewAllExpenses}
              title="Recent Expenses"
              showAddButton={true}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <ModernButton
                title="Add Expense"
                onPress={handleAddExpense}
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
              
              <ModernButton
                title="View All Expenses"
                onPress={handleViewAllExpenses}
                variant="secondary"
                leftIcon={
                  <Ionicons 
                    name="list-outline" 
                    size={20} 
                    color={colors.primary} 
                  />
                }
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
    lineHeight: Typography.lineHeight['3xl'],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  actionButton: {
    flex: 1,
  },
});