// 📋 All Expenses Screen - Complete Expense List View
// Comprehensive expense management with filtering and sorting

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { FIXED_CATEGORIES } from '../../src/types/finance';

type SortOption = 'date' | 'amount' | 'category';
type FilterOption = 'all' | 'today' | 'week' | 'month';

export default function AllExpensesScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { expenses, loading, refreshAllData } = useFinance();

  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const handleRefresh = async () => {
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Failed to refresh expenses:', error);
    }
  };

  const handleAddExpense = () => {
    router.push('/finance/add-expense');
  };

  const getCategoryInfo = (categoryId: number) => {
    return FIXED_CATEGORIES.find(cat => cat.id === categoryId) || FIXED_CATEGORIES[10]; // Default to 'Other'
  };

  const formatAmount = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFilteredAndSortedExpenses = () => {
    let filtered = [...(expenses || [])];

    // Apply filters
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthAgo;
        });
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'amount':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'category':
        filtered.sort((a, b) => {
          const catA = getCategoryInfo(a.categoryId).name;
          const catB = getCategoryInfo(b.categoryId).name;
          return catA.localeCompare(catB);
        });
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return filtered;
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>All Expenses</Text>
        <TouchableOpacity onPress={handleAddExpense}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsContainer}>
        <ModernCard style={styles.controlsCard}>
          {/* Filter Options */}
          <Text style={[styles.controlLabel, { color: colors.text }]}>Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {[
              { key: 'all', label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: filterBy === option.key ? colors.primary : colors.surfaceSecondary,
                    borderColor: filterBy === option.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setFilterBy(option.key as FilterOption)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: filterBy === option.key ? colors.surface : colors.text,
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <Text style={[styles.controlLabel, { color: colors.text, marginTop: Spacing.base }]}>Sort by</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {[
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount' },
              { key: 'category', label: 'Category' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: sortBy === option.key ? colors.primary : colors.surfaceSecondary,
                    borderColor: sortBy === option.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSortBy(option.key as SortOption)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: sortBy === option.key ? colors.surface : colors.text,
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ModernCard>
      </View>

      {/* Expenses List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading.expenses}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {filteredExpenses.length === 0 ? (
          <ModernCard style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No expenses found
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                {filterBy === 'all' 
                  ? "You haven't added any expenses yet."
                  : `No expenses found for the selected ${filterBy} period.`}
              </Text>
              <ModernButton
                title="Add First Expense"
                onPress={handleAddExpense}
                variant="primary"
                style={styles.emptyButton}
              />
            </View>
          </ModernCard>
        ) : (
          <>
            {/* Summary */}
            <ModernCard style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                Total: {formatAmount(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </Text>
            </ModernCard>

            {/* Expense Items */}
            {filteredExpenses.map((expense) => {
              const category = getCategoryInfo(expense.categoryId);
              return (
                <ModernCard key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseItem}>
                    <View style={styles.expenseLeft}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <View style={styles.expenseDetails}>
                        <Text style={[styles.expenseDescription, { color: colors.text }]}>
                          {expense.description}
                        </Text>
                        <Text style={[styles.expenseCategory, { color: colors.textSecondary }]}>
                          {category.name} • {formatDate(expense.date)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.expenseAmount, { color: colors.primary }]}>
                      {formatAmount(expense.amount)}
                    </Text>
                  </View>
                </ModernCard>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Add Expense FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddExpense}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  controlsContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  controlsCard: {
    padding: Spacing.base,
  },
  controlLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  optionsScroll: {
    marginBottom: Spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: 100, // Space for FAB
  },
  summaryCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  summaryAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  expenseCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.base,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.base,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  expenseCategory: {
    fontSize: Typography.fontSize.sm,
  },
  expenseAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
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
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
