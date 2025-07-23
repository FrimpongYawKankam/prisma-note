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
import { CategoryBudget } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';
import { CategoryProgressBar } from './ProgressBar';

interface CategoryCardProps {
  category: CategoryBudget;
  onPress?: () => void;
  onAddExpense?: () => void;
}

export function CategoryCard({ category, onPress, onAddExpense }: CategoryCardProps) {
  const { colors } = useTheme();
  
  const spentPercentage = category.budgetAmount > 0 
    ? (category.spentAmount / category.budgetAmount) * 100 
    : 0;
  
  const remaining = category.budgetAmount - category.spentAmount;

  const getStatusText = () => {
    if (spentPercentage >= 100) return 'Over budget';
    if (spentPercentage >= 90) return 'Almost spent';
    if (spentPercentage >= 70) return 'Getting close';
    return 'On track';
  };

  const getStatusColor = () => {
    if (spentPercentage >= 90) return '#F44336';
    if (spentPercentage >= 70) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <ModernCard style={[styles.card, { backgroundColor: colors.surface }]}>
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.categoryInfo}>
            <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={category.color} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary + '20' }]}
            onPress={onAddExpense}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text style={[styles.spentAmount, { color: colors.text }]}>
              ${category.spentAmount.toLocaleString()}
            </Text>
            <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>
              of ${category.budgetAmount.toLocaleString()}
            </Text>
          </View>
          
          {/* Updated to use CategoryProgressBar */}
          <View style={styles.progressContainer}>
            <CategoryProgressBar
              spent={category.spentAmount}
              budget={category.budgetAmount}
              categoryColor={category.color}
              height={6}
              showAnimation={true}
            />
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
              {spentPercentage.toFixed(1)}% used
            </Text>
            <Text style={[
              styles.remainingText, 
              { color: remaining >= 0 ? colors.textSecondary : '#F44336' }
            ]}>
              {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `$${Math.abs(remaining).toLocaleString()} over`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.base,
  },
  content: {
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: Spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  spentAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginRight: Spacing.xs,
  },
  budgetAmount: {
    fontSize: Typography.fontSize.sm,
  },
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: Typography.fontSize.sm,
  },
  remainingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});