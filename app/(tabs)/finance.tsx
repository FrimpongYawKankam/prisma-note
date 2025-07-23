import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BudgetOverview } from '../../src/components/finance/BudgetOverview';
import { ExpenseHistory } from '../../src/components/finance/ExpenseHistory';
import { QuickAddExpense } from '../../src/components/finance/QuickAddExpense';
import { SpendingChart } from '../../src/components/finance/SpendingChart';
import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { useTheme } from '../../src/context/ThemeContext';
import { useFinanceData } from '../../src/hooks/useFinanceData';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';

export default function Finance() {
  const { colors } = useTheme();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analytics'>('overview');

  const {
    budget,
    expenses,
    isLoadingBudget,
    isLoadingExpenses,
    budgetError,
    expensesError,
    totalSpent,
    remainingBudget,
    spentPercentage,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshData,
    getSpendingTrends,
    getCategoryBreakdown,
  } = useFinanceData();

  const handleQuickExpense = (categoryId?: string) => {
    setPreselectedCategory(categoryId);
    setShowQuickAdd(true);
  };

  const handleAddExpense = async (categoryId: string, amount: number, description: string) => {
    try {
      await addExpense(categoryId, amount, description);
      setShowQuickAdd(false);
      // Could show success toast here
    } catch (error) {
      console.error('Failed to add expense:', error);
      // Could show error toast here
    }
  };

  const handleSetupBudget = () => {
    // TODO: Navigate to Budget Setup screen
    console.log('Navigate to Budget Setup');
  };

  const isLoading = isLoadingBudget || isLoadingExpenses;
  const hasError = budgetError || expensesError;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Budget Overview */}
            <BudgetOverview
              onSetupBudget={handleSetupBudget}
              onQuickExpense={handleQuickExpense}
            />

            {/* Quick Stats */}
            {budget && (
              <View style={styles.statsSection}>
                <View style={styles.statsGrid}>
                  <ModernCard style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.statContent}>
                      <Ionicons name="trending-up" size={24} color="#4CAF50" />
                      <View style={styles.statText}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {budget.currency.symbol}{totalSpent.toLocaleString()}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          Total Spent
                        </Text>
                      </View>
                    </View>
                  </ModernCard>

                  <ModernCard style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.statContent}>
                      <Ionicons 
                        name="wallet" 
                        size={24} 
                        color={remainingBudget >= 0 ? '#2196F3' : '#F44336'} 
                      />
                      <View style={styles.statText}>
                        <Text style={[
                          styles.statValue, 
                          { color: remainingBudget >= 0 ? colors.text : '#F44336' }
                        ]}>
                          {budget.currency.symbol}{Math.abs(remainingBudget).toLocaleString()}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                        </Text>
                      </View>
                    </View>
                  </ModernCard>
                </View>
              </View>
            )}

            {/* Recent Expenses Preview */}
            {expenses.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Recent Expenses
                  </Text>
                  <TouchableOpacity onPress={() => setActiveTab('history')}>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <ExpenseHistory
                  expenses={expenses.slice(0, 3)} // Show only 3 recent
                  categories={budget?.categories || []}
                  onEditExpense={(expense) => console.log('Edit expense:', expense)}
                  onDeleteExpense={deleteExpense}
                  showFilters={false}
                />
              </View>
            )}
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            <ExpenseHistory
              expenses={expenses}
              categories={budget?.categories || []}
              onEditExpense={(expense) => console.log('Edit expense:', expense)}
              onDeleteExpense={deleteExpense}
              showFilters={true}
            />
          </View>
        );

      case 'analytics':
        return (
          <View style={styles.tabContent}>
            {budget && expenses.length > 0 ? (
              <>
                {/* Spending Chart */}
                <SpendingChart
                  expenses={expenses}
                  categories={budget.categories}
                  chartType="pie"
                  period="month"
                  height={300}
                />

                {/* Trends Chart */}
                <View style={styles.trendsSection}>
                  <SpendingChart
                    expenses={expenses}
                    categories={budget.categories}
                    chartType="line"
                    period="month"
                    height={250}
                  />
                </View>

                {/* Category Performance */}
                <ModernCard style={[styles.performanceCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Category Performance
                  </Text>
                  {getCategoryBreakdown().map(category => {
                    const categoryInfo = budget.categories.find(cat => cat.id === category.categoryId);
                    if (!categoryInfo) return null;

                    return (
                      <View key={category.categoryId} style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                          <View style={styles.performanceLeft}>
                            <View style={[styles.performanceIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                              <Ionicons name={categoryInfo.icon as any} size={16} color={categoryInfo.color} />
                            </View>
                            <Text style={[styles.performanceName, { color: colors.text }]}>
                              {categoryInfo.name}
                            </Text>
                          </View>
                          <Text style={[styles.performancePercentage, { 
                            color: category.percentage >= 90 ? '#F44336' : 
                                   category.percentage >= 70 ? '#FF9800' : '#4CAF50'
                          }]}>
                            {category.percentage.toFixed(1)}%
                          </Text>
                        </View>
                        <View style={styles.performanceAmounts}>
                          <Text style={[styles.performanceSpent, { color: colors.text }]}>
                            {budget.currency.symbol}{category.spent.toLocaleString()}
                          </Text>
                          <Text style={[styles.performanceBudget, { color: colors.textSecondary }]}>
                            of {budget.currency.symbol}{category.budget.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ModernCard>
              </>
            ) : (
              <ModernCard style={[styles.emptyAnalytics, { backgroundColor: colors.surface }]}>
                <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Analytics Available
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Add some expenses to see your spending analytics
                </Text>
              </ModernCard>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Finance
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Track your spending
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleQuickExpense()}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home-outline' },
          { key: 'history', label: 'History', icon: 'list-outline' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics-outline' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { 
                borderBottomColor: colors.primary,
                borderBottomWidth: 2 
              }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.primary : colors.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {hasError ? (
          <ModernCard style={[styles.errorCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              Something went wrong
            </Text>
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              {budgetError || expensesError}
            </Text>
            <ModernButton
              title="Try Again"
              onPress={refreshData}
              variant="primary"
              style={styles.retryButton}
            />
          </ModernCard>
        ) : (
          renderTabContent()
        )}
      </ScrollView>

      {/* Quick Add Expense Modal */}
      <QuickAddExpense
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        categories={budget?.categories || []}
        onAddExpense={handleAddExpense}
        preselectedCategoryId={preselectedCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  statsSection: {
    marginTop: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Spacing.base,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  recentSection: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  trendsSection: {
    marginTop: Spacing.base,
  },
  performanceCard: {
    padding: Spacing.lg,
    marginTop: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  performanceItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  performanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  performanceIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  performancePercentage: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  performanceAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 40,
  },
  performanceSpent: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  performanceBudget: {
    fontSize: Typography.fontSize.sm,
  },
  emptyAnalytics: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.base,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  errorCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    margin: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.base,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
});