import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { CategoryBudget, Expense } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseHistoryProps {
  expenses: Expense[];
  categories: CategoryBudget[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => Promise<void>;
  showFilters?: boolean;
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all';
type SortOption = 'date' | 'amount' | 'category';

export function ExpenseHistory({
  expenses,
  categories,
  onEditExpense,
  onDeleteExpense,
  showFilters = true,
}: ExpenseHistoryProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        getCategoryInfo(expense.category)?.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Date filter
    const now = new Date();
    if (filterPeriod !== 'all') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const diffTime = now.getTime() - expenseDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterPeriod) {
          case 'today':
            return diffDays <= 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          const aCat = getCategoryInfo(a.category)?.name || '';
          const bCat = getCategoryInfo(b.category)?.name || '';
          comparison = aCat.localeCompare(bCat);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [expenses, searchQuery, selectedCategory, filterPeriod, sortBy, sortOrder, categories]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups = new Map<string, Expense[]>();

    filteredAndSortedExpenses.forEach(expense => {
      const date = new Date(expense.date);
      let groupKey: string;

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(expense);
    });

    return Array.from(groups.entries()).map(([date, expenseList]) => ({
      date,
      expenses: expenseList,
      total: expenseList.reduce((sum, exp) => sum + exp.amount, 0),
    }));
  }, [filteredAndSortedExpenses]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setFilterPeriod('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <ModernCard style={[styles.filtersCard, { backgroundColor: colors.surface }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search expenses..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Options */}
        <View style={styles.filterRow}>
          {/* Period Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Period</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'all', label: 'All' },
              ].map(period => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: filterPeriod === period.key
                        ? colors.primary + '20'
                        : colors.background,
                      borderColor: filterPeriod === period.key
                        ? colors.primary
                        : colors.border,
                    }
                  ]}
                  onPress={() => setFilterPeriod(period.key as FilterPeriod)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: filterPeriod === period.key ? colors.primary : colors.text }
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort by</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'date', label: 'Date', icon: 'calendar-outline' },
                { key: 'amount', label: 'Amount', icon: 'cash-outline' },
                { key: 'category', label: 'Category', icon: 'apps-outline' },
              ].map(sort => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.sortButton,
                    {
                      backgroundColor: sortBy === sort.key
                        ? colors.primary + '20'
                        : colors.background,
                      borderColor: sortBy === sort.key
                        ? colors.primary
                        : colors.border,
                    }
                  ]}
                  onPress={() => handleSort(sort.key as SortOption)}
                >
                  <Ionicons
                    name={sort.icon as any}
                    size={16}
                    color={sortBy === sort.key ? colors.primary : colors.textSecondary}
                  />
                  {sortBy === sort.key && (
                    <Ionicons
                      name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Categories</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === item.id
                      ? item.color + '20'
                      : colors.background,
                    borderColor: selectedCategory === item.id
                      ? item.color
                      : colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === item.id ? null : item.id
                )}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={selectedCategory === item.id ? item.color : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryChipText,
                  { color: selectedCategory === item.id ? item.color : colors.text }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory || filterPeriod !== 'all') && (
          <TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
              Clear all filters
            </Text>
          </TouchableOpacity>
        )}
      </ModernCard>
    );
  };

  const renderExpenseGroup = ({ item }: { item: { date: string; expenses: Expense[]; total: number } }) => (
    <View style={styles.expenseGroup}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={[styles.dateHeaderText, { color: colors.text }]}>
          {item.date}
        </Text>
        <Text style={[styles.dateHeaderTotal, { color: colors.textSecondary }]}>
          ${item.total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Expenses */}
      {item.expenses.map(expense => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          categoryInfo={getCategoryInfo(expense.category)}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          showCategory={!selectedCategory} // Hide category if filtering by category
        />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <ModernCard style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
      <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery || selectedCategory || filterPeriod !== 'all'
          ? 'No expenses found'
          : 'No expenses yet'
        }
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        {searchQuery || selectedCategory || filterPeriod !== 'all'
          ? 'Try adjusting your filters or search terms'
          : 'Start tracking your expenses to see them here'
        }
      </Text>
    </ModernCard>
  );

  return (
    <View style={styles.container}>
      {renderFilters()}

      {/* Results Summary */}
      {showFilters && filteredAndSortedExpenses.length > 0 && (
        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? 's' : ''} found
          </Text>
          <Text style={[styles.summaryTotal, { color: colors.text }]}>
            Total: ${filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      )}

      {/* Expense List */}
      <FlatList
        data={groupedExpenses}
        keyExtractor={(item) => item.date}
        renderItem={renderExpenseGroup}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          groupedExpenses.length === 0 && styles.emptyListContent
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersCard: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
  },
  filterRow: {
    gap: Spacing.base,
  },
  filterGroup: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryFilter: {
    marginBottom: Spacing.sm,
  },
  categoriesList: {
    paddingRight: Spacing.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: Spacing.xs,
    gap: Spacing.xs,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  clearFilters: {
    alignSelf: 'center',
    paddingVertical: Spacing.xs,
  },
  clearFiltersText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  summaryText: {
    fontSize: Typography.fontSize.sm,
  },
  summaryTotal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  expenseGroup: {
    marginBottom: Spacing.base,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  dateHeaderText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  dateHeaderTotal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    margin: Spacing.base,
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
});