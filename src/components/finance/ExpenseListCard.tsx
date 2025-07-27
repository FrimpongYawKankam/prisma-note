// 🏦 Expense List Card Component
// Displays a list of expenses with add/view all functionality

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Expense } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListCardProps {
  expenses: Expense[];
  isEmpty: boolean;
  onAddExpense: () => void;
  onViewAll?: () => void;
  title?: string;
  showAddButton?: boolean;
  maxHeight?: number;
}

export const ExpenseListCard: React.FC<ExpenseListCardProps> = ({
  expenses,
  isEmpty,
  onAddExpense,
  onViewAll,
  title = "Expenses",
  showAddButton = true,
  maxHeight = 300,
}) => {
  const { colors } = useTheme();

  // Filter out any undefined/null expenses, with safety check for undefined expenses array
  const validExpenses = (expenses && Array.isArray(expenses)) 
    ? expenses.filter(expense => expense && typeof expense === 'object')
    : [];

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem 
      expense={item} 
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
        <Ionicons 
          name="receipt-outline" 
          size={32} 
          color={colors.accent} 
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.primary }]}>
        No Expenses Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Start tracking your spending by adding your first expense.
      </Text>
      {showAddButton && (
        <TouchableOpacity 
          onPress={onAddExpense}
          style={[styles.addButton, { borderColor: colors.primary }]}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={16} 
            color={colors.primary} 
          />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Add Expense
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSeparator = () => (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );

  return (
    <ModernCard variant="elevated" padding="none">
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {title}
        </Text>
        <View style={styles.headerActions}>
          {showAddButton && (
            <TouchableOpacity 
              onPress={onAddExpense}
              style={styles.headerButton}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
          {onViewAll && !isEmpty && (
            <TouchableOpacity 
              onPress={onViewAll}
              style={styles.headerButton}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isEmpty ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={validExpenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            ItemSeparatorComponent={renderSeparator}
            showsVerticalScrollIndicator={false}
            scrollEnabled={validExpenses.length > 3}
            style={{ maxHeight }}
            contentContainerStyle={validExpenses.length <= 3 ? { flexGrow: 1 } : undefined}
          />
        )}
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  content: {
    paddingBottom: Spacing.base,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.base,
    marginRight: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    lineHeight: Typography.lineHeight.base,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
    lineHeight: Typography.lineHeight.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 200,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
});
