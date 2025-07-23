import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Expense } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';

interface ExpenseItemProps {
  expense: Expense;
  categoryInfo?: {
    name: string;
    icon: string;
    color: string;
  };
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
  showCategory?: boolean;
}

export function ExpenseItem({ 
  expense, 
  categoryInfo, 
  onEdit, 
  onDelete, 
  showCategory = true 
}: ExpenseItemProps) {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleLongPress = () => {
    if (!onEdit && !onDelete) return;
    
    setShowActions(!showActions);
    Animated.timing(slideAnim, {
      toValue: showActions ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEdit = () => {
    setShowActions(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onEdit?.(expense);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setShowActions(false);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
            onDelete?.(expense.id);
          },
        },
      ]
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDate(date);
  };

  return (
    <ModernCard style={[styles.card, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.content}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={styles.mainContent}>
          {/* Category Icon and Info */}
          {showCategory && categoryInfo && (
            <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
              <Ionicons 
                name={categoryInfo.icon as any} 
                size={20} 
                color={categoryInfo.color} 
              />
            </View>
          )}

          {/* Expense Details */}
          <View style={styles.expenseDetails}>
            <View style={styles.topRow}>
              <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
                {expense.description || 'Expense'}
              </Text>
              <Text style={[styles.amount, { color: colors.text }]}>
                {formatCurrency(expense.amount)}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              {showCategory && categoryInfo && (
                <Text style={[styles.category, { color: categoryInfo.color }]}>
                  {categoryInfo.name}
                </Text>
              )}
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {getDateLabel(expense.date)}
              </Text>
            </View>
          </View>

          {/* Time indicator for recent expenses */}
          {isToday(expense.date) && (
            <View style={[styles.timeIndicator, { backgroundColor: '#4CAF50' }]} />
          )}
        </View>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <Animated.View 
            style={[
              styles.actionButtons,
              {
                height: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
                opacity: slideAnim,
              }
            ]}
          >
            <View style={styles.actionButtonsContent}>
              {onEdit && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={handleEdit}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' + '20' }]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                  <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </ModernCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.base,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  expenseDetails: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  date: {
    fontSize: Typography.fontSize.sm,
  },
  timeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.xs,
  },
  actionButtons: {
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  actionButtonsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});