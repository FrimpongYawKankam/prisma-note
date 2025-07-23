import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBudget } from '../../hooks/useBudget';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { ModernCard } from '../ui/ModernCard';
import { CategoryCard } from './CategoryCard';
import { BudgetProgressBar } from './ProgressBar';

interface BudgetOverviewProps {
  onSetupBudget: () => void;
  onQuickExpense?: (categoryId?: string) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export function BudgetOverview({ onSetupBudget, onQuickExpense }: BudgetOverviewProps) {
  const { theme, colors } = useTheme();
  const { budget, isLoading, initializeBudget } = useBudget();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  const handleGetStarted = () => {
    initializeBudget();
  };

  const handleCategoryPress = (categoryId: string) => {
    console.log('Category pressed:', categoryId);
  };

  const handleAddExpense = (categoryId: string) => {
    console.log('Add expense for category:', categoryId);
    onQuickExpense?.(categoryId);
  };

  const handleCurrencySelect = (currency: any) => {
    console.log('Currency selected:', currency);
    setShowCurrencySelector(false);
    // TODO: Update budget currency
  };

  const handleAddCategory = () => {
    console.log('Add category pressed');
    // TODO: Navigate to category management
  };

  if (isLoading) {
    return (
      <ModernCard style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.setupContainer}>
          <Text style={[styles.setupTitle, { color: colors.text }]}>
            Setting up your budget...
          </Text>
        </View>
      </ModernCard>
    );
  }

  if (!budget) {
    return (
      <ModernCard style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.setupContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="wallet-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.setupTitle, { color: colors.text }]}>
            Set Up Your Budget
          </Text>
          <Text style={[styles.setupDescription, { color: colors.textSecondary }]}>
            Start by setting your monthly budget to track your expenses
          </Text>
          <TouchableOpacity 
            style={[styles.setupButton, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
          >
            <Text style={[styles.setupButtonText, { color: '#fff' }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ModernCard>
    );
  }

  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  const remaining = budget.totalAmount - totalSpent;
  const spentPercentage = (totalSpent / budget.totalAmount) * 100;

  return (
    <View>
      {/* Budget Summary Card */}
      <ModernCard style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              Monthly Budget
            </Text>
            {/* Currency Selector Dropdown */}
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => setShowCurrencySelector(true)}
            >
              <Text style={[styles.currency, { color: colors.textSecondary }]}>
                {budget.currency.name}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onSetupBudget}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {budget.currency.symbol}{budget.totalAmount.toLocaleString()}
          </Text>
        </View>

        {/* Updated to use BudgetProgressBar */}
        <View style={styles.progressContainer}>
          <BudgetProgressBar
            spent={totalSpent}
            budget={budget.totalAmount}
            height={8}
            showAnimation={true}
            animationDuration={1200}
          />
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {spentPercentage.toFixed(1)}% spent
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Spent
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {budget.currency.symbol}{totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Remaining
            </Text>
            <Text style={[styles.summaryValue, { color: remaining >= 0 ? '#4CAF50' : '#F44336' }]}>
              {budget.currency.symbol}{Math.abs(remaining).toLocaleString()}
            </Text>
          </View>
        </View>
      </ModernCard>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={[styles.categoriesTitle, { color: colors.text }]}>
            Categories
          </Text>
          <TouchableOpacity 
            style={[styles.addCategoryButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleAddCategory}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[styles.addCategoryText, { color: colors.primary }]}>
              Add Category
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Grid Layout for Categories */}
        <View style={styles.categoriesGrid}>
          {budget.categories.map((category) => (
            <View key={category.id} style={styles.categoryGridItem}>
              <CategoryCard
                category={category}
                onPress={() => handleCategoryPress(category.id)}
                onAddExpense={() => handleAddExpense(category.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Currency Selector Modal */}
      <Modal
        visible={showCurrencySelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCurrencySelector(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.currencyOption, { backgroundColor: colors.surface }]}
                onPress={() => handleCurrencySelect(item)}
              >
                <Text style={[styles.currencySymbol, { color: colors.text }]}>
                  {item.symbol}
                </Text>
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencyName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.currencyCode, { color: colors.textSecondary }]}>
                    {item.code}
                  </Text>
                </View>
                {budget.currency.code === item.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

// ...existing styles remain the same...
const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  setupContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  setupTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  setupDescription: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 250,
  },
  setupButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
  },
  setupButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  currency: {
    fontSize: Typography.fontSize.sm,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  categoriesSection: {
    marginTop: Spacing.lg,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  categoriesTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
    gap: Spacing.xs,
  },
  addCategoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  categoriesGrid: {
    gap: Spacing.sm,
  },
  categoryGridItem: {
    marginBottom: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancel: {
    fontSize: Typography.fontSize.base,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  currencySymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  currencyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: Typography.fontSize.sm,
  },
});