// 🏦 Finance Screen - Main Finance Tab
// Comprehensive budget and expense management

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  BudgetDateDisplay,
  BudgetOverviewCard,
  EmptyStateCard,
  ExpenseListCard,
  QuickStatsCard,
} from '../../src/components/finance';

export default function FinanceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshAllData, loading } = useFinance();
  const { budget, hasActiveBudget } = useBudget();
  const { summary, hasData: hasSummaryData } = useBudgetSummary();
  const { expenses, isEmpty: isExpenseListEmpty } = useExpenses();
  
  // State for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);

  // Debug logging to understand the issue
  React.useEffect(() => {
    console.log('🔍 Finance Screen Debug:', {
      budget: budget ? 'EXISTS' : 'NULL',
      hasActiveBudget,
      budgetId: budget?.id,
      budgetAmount: budget?.totalBudget,
      budgetPeriod: budget?.period,
      budgetIsActive: budget?.isActive,
      summary: summary ? 'EXISTS' : 'NULL',
      hasSummaryData,
      expensesCount: expenses?.length || 0
    });
  }, [budget, hasActiveBudget, summary, hasSummaryData, expenses]);

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

  const handleEditBudget = () => {
    router.push('/finance/edit-budget');
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

  const handleCalculator = () => {
    setShowDropdown(false);
    router.push('/calculator');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.primary }]}>
                Finance
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Track your budget and expenses
              </Text>
            </View>
            
            {/* Dropdown Menu */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                onPress={toggleDropdown}
                style={[styles.menuButton, { backgroundColor: colors.surface }]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="ellipsis-vertical" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
              
              {/* Dropdown Modal */}
              <Modal
                visible={showDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
              >
                <Pressable 
                  style={styles.modalOverlay}
                  onPress={() => setShowDropdown(false)}
                >
                  <View style={styles.dropdownContainer}>
                    <View style={[styles.dropdown, { 
                      backgroundColor: colors.surface,
                      shadowColor: colors.text,
                    }]}>
                      <TouchableOpacity
                        onPress={handleCalculator}
                        style={[styles.dropdownItem, { 
                          borderBottomColor: colors.border 
                        }]}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="calculator-outline" 
                          size={20} 
                          color={colors.primary} 
                          style={styles.dropdownIcon}
                        />
                        <Text style={[styles.dropdownText, { color: colors.text }]}>
                          Calculator
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              </Modal>
            </View>
          </View>
        </View>
        {/* Always show Budget Date Range */}
        <View style={styles.content}>
          <BudgetDateDisplay
            startDate={budget?.startDate}
            endDate={budget?.endDate}
            period={budget?.period?.toLowerCase() || 'monthly'}
          />
        </View>

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
            {hasSummaryData && summary && (
              <QuickStatsCard
                summary={summary!}
                onViewAnalytics={handleViewAnalytics}
              />
            )}

            {/* Recent Expenses */}
            <ExpenseListCard
              expenses={(expenses && Array.isArray(expenses)) ? expenses.slice(0, 5) : []} // Show only 5 most recent
              isEmpty={isExpenseListEmpty}
              onAddExpense={handleAddExpense}
              onViewAll={handleViewAllExpenses}
              title="Recent Expenses"
              showAddButton={true}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <ModernButton
                title="Edit Budget"
                onPress={handleEditBudget}
                variant="ghost"
                leftIcon={
                  <Ionicons 
                    name="create-outline" 
                    size={20} 
                    color={colors.primary} 
                  />
                }
                style={styles.actionButton}
              />
              
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
    paddingBottom: Spacing.base,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  menuContainer: {
    position: 'relative',
    marginLeft: Spacing.base,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownContainer: {
    marginTop: 80,
    marginRight: Spacing.base,
  },
  dropdown: {
    borderRadius: 12,
    minWidth: 150,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 0,
  },
  dropdownIcon: {
    marginRight: Spacing.sm,
  },
  dropdownText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
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