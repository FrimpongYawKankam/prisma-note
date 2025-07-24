import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
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
    addExpense,
    deleteExpense,
    refreshData,
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

  // Create sections data for FlatList
  const getSectionsData = () => {
    const sections = [];
    
    switch (activeTab) {
      case 'overview':
        sections.push({ type: 'budgetOverview' });
        if (budget) {
          sections.push({ type: 'stats' });
        }
        if (expenses.length > 0) {
          sections.push({ type: 'recentExpenses' });
        }
        break;
      case 'history':
        sections.push({ type: 'expenseHistory' });
        break;
      case 'analytics':
        sections.push({ type: 'analytics' });
        break;
    }
    
    return sections;
  };

  const renderSection = ({ item }: { item: { type: string } }) => {
    switch (item.type) {
      case 'budgetOverview':
        return (
          <BudgetOverview
            onSetupBudget={handleSetupBudget}
            onQuickExpense={handleQuickExpense}
          />
        );

      case 'stats':
        return (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <ModernCard style={StyleSheet.flatten([styles.statCard, { backgroundColor: colors.surface }])}>
                <View style={styles.statContent}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <View style={styles.statText}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {budget?.currency.symbol}{totalSpent.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Total Spent
                    </Text>
                  </View>
                </View>
              </ModernCard>

              <ModernCard style={StyleSheet.flatten([styles.statCard, { backgroundColor: colors.surface }])}>
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
                      {budget?.currency.symbol}{Math.abs(remainingBudget).toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                    </Text>
                  </View>
                </View>
              </ModernCard>
            </View>
          </View>
        );

      case 'recentExpenses':
        return (
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
            
            {/* Render recent expenses directly without FlatList */}
            <View style={styles.recentExpensesList}>
              {expenses.slice(0, 3).map((expense, index) => {
                const categoryInfo = budget?.categories.find(cat => cat.id === expense.category);
                return (
                  <View key={`${expense.id}-${index}`} style={styles.recentExpenseItem}>
                    <View style={styles.expenseContent}>
                      <View style={styles.expenseLeft}>
                        {categoryInfo && (
                          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                            <Ionicons name={categoryInfo.icon as any} size={20} color={categoryInfo.color} />
                          </View>
                        )}
                        <View style={styles.expenseDetails}>
                          <Text style={[styles.expenseDescription, { color: colors.text }]}>
                            {expense.description}
                          </Text>
                          {categoryInfo && (
                            <Text style={[styles.expenseCategory, { color: colors.textSecondary }]}>
                              {categoryInfo.name}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.expenseRight}>
                        <Text style={[styles.expenseAmount, { color: colors.text }]}>
                          {budget?.currency.symbol || '$'}{expense.amount.toLocaleString()}
                        </Text>
                        <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
                          {new Date(expense.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );

      case 'expenseHistory':
        return (
          <View style={styles.historyContainer}>
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
        return budget && expenses.length > 0 ? (
          <>
            {/* Analytics Summary */}
            <ModernCard style={StyleSheet.flatten([styles.analyticsHeader, { backgroundColor: colors.surface }])}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Spending Analytics
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {budget.currency.symbol}{totalSpent.toLocaleString()}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Total Spent This Month
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: expenses.length > 0 ? '#4CAF50' : colors.textSecondary }]}>
                    {expenses.length}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Transactions
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: budget.categories.length > 0 ? '#FF9800' : colors.textSecondary }]}>
                    {budget.categories.length}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Categories
                  </Text>
                </View>
              </View>
            </ModernCard>

            {/* Spending Chart */}
            <SpendingChart
              expenses={expenses}
              categories={budget.categories}
              chartType="pie"
              period="month"
              height={300}
            />

            {/* Debug info - Remove in production */}
            {__DEV__ && (
              <View style={{ padding: 10, backgroundColor: '#f0f0f0', margin: 10 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Debug: {expenses.length} expenses, {budget.categories.length} categories
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>
                  Categories: {budget.categories.map(c => c.name).join(', ')}
                </Text>
              </View>
            )}

            {/* Trends Chart */}
            <View style={styles.trendsSection}>
              <ModernCard style={StyleSheet.flatten([styles.trendsCard, { backgroundColor: colors.surface }])}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Spending Trends
                </Text>
                <SpendingChart
                  expenses={expenses}
                  categories={budget.categories}
                  chartType="line"
                  period="month"
                  height={250}
                />
              </ModernCard>
            </View>

            {/* Category Performance */}
            <ModernCard style={StyleSheet.flatten([styles.performanceCard, { backgroundColor: colors.surface }])}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Category Performance
              </Text>
              {budget.categories.length > 0 ? (
                budget.categories.map(categoryInfo => {
                  const categoryBreakdown = getCategoryBreakdown().find(cat => cat.categoryId === categoryInfo.id);
                  const spent = categoryBreakdown?.spent || 0;
                  const budgetUsedPercentage = (spent / categoryInfo.budgetAmount) * 100;

                  return (
                    <View key={categoryInfo.id} style={styles.performanceItem}>
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
                          color: budgetUsedPercentage >= 90 ? '#F44336' : 
                                 budgetUsedPercentage >= 70 ? '#FF9800' : '#4CAF50'
                        }]}>
                          {budgetUsedPercentage.toFixed(1)}%
                        </Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { 
                                backgroundColor: budgetUsedPercentage >= 90 ? '#F44336' : 
                                               budgetUsedPercentage >= 70 ? '#FF9800' : categoryInfo.color,
                                width: `${Math.min(budgetUsedPercentage, 100)}%`
                              }
                            ]} 
                          />
                        </View>
                      </View>
                      
                      <View style={styles.performanceAmounts}>
                        <Text style={[styles.performanceSpent, { color: colors.text }]}>
                          {budget.currency.symbol}{spent.toLocaleString()}
                        </Text>
                        <Text style={[styles.performanceBudget, { color: colors.textSecondary }]}>
                          of {budget.currency.symbol}{categoryInfo.budgetAmount.toLocaleString()}
                        </Text>
                        <Text style={[styles.performanceRemaining, { 
                          color: (categoryInfo.budgetAmount - spent) >= 0 ? '#4CAF50' : '#F44336' 
                        }]}>
                          {(categoryInfo.budgetAmount - spent) >= 0 ? 
                            `${budget.currency.symbol}${(categoryInfo.budgetAmount - spent).toLocaleString()} left` :
                            `${budget.currency.symbol}${Math.abs(categoryInfo.budgetAmount - spent).toLocaleString()} over`
                          }
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                    No categories configured
                  </Text>
                </View>
              )}
            </ModernCard>
          </>
        ) : (
          <ModernCard style={{ ...styles.emptyAnalytics, backgroundColor: colors.surface }}>
            <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Analytics Available
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Add some expenses to see your spending analytics
            </Text>
          </ModernCard>
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
      {hasError ? (
        <View style={styles.content}>
          <ModernCard style={{ ...styles.errorCard, backgroundColor: colors.surface }}>
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
        </View>
      ) : (
        <FlatList
          data={getSectionsData()}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={renderSection}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshData}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        />
      )}

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
    flexGrow: 1,
    padding: Spacing.lg,
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
  recentExpensesList: {
    gap: Spacing.sm,
  },
  recentExpenseItem: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  historyContainer: {
    minHeight: 600, // Ensure enough height for the nested FlatList
  },
  trendsSection: {
    marginTop: Spacing.base,
  },
  trendsCard: {
    padding: Spacing.lg,
  },
  analyticsHeader: {
    padding: Spacing.lg,
    marginBottom: Spacing.base,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.base,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
    marginBottom: Spacing.xs,
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
    flex: 1,
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
    flexWrap: 'wrap',
  },
  performanceSpent: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  performanceBudget: {
    fontSize: Typography.fontSize.sm,
  },
  performanceRemaining: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  progressBarContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    marginLeft: 40,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
  noDataContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: Typography.fontSize.base,
    fontStyle: 'italic',
  },
});