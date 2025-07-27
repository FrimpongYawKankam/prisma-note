// 📊 Simple Budget Planner Component
// Functional budget planning when no active budget exists

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface SimpleBudgetPlannerProps {
  onCreateBudget: () => void;
}

export const SimpleBudgetPlanner: React.FC<SimpleBudgetPlannerProps> = ({
  onCreateBudget,
}) => {
  const { colors } = useTheme();
  const [planningAmount, setPlanningAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const handleQuickPlan = () => {
    const amount = parseFloat(planningAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }

    const dailyAmount = selectedPeriod === 'weekly' ? amount / 7 : amount / 30;
    
    Alert.alert(
      'Budget Planning',
      `Your ${selectedPeriod} budget of GHS ${amount.toFixed(2)} means:\n\n` +
      `• Daily spending limit: GHS ${dailyAmount.toFixed(2)}\n` +
      `• Weekly spending limit: GHS ${(dailyAmount * 7).toFixed(2)}\n\n` +
      `Ready to create this budget?`,
      [
        { text: 'Plan More', style: 'cancel' },
        { text: 'Create Budget', onPress: onCreateBudget },
      ]
    );
  };

  const periods = [
    { key: 'weekly' as const, label: 'Weekly', icon: 'calendar-outline' },
    { key: 'monthly' as const, label: 'Monthly', icon: 'calendar' },
  ];

  return (
    <ModernCard style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calculator-outline" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Budget Planner
        </Text>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Plan your budget before creating it
      </Text>

      <View style={styles.amountSection}>
        <Text style={[styles.label, { color: colors.text }]}>
          Budget Amount (GHS)
        </Text>
        <TextInput
          style={[styles.amountInput, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.background 
          }]}
          value={planningAmount}
          onChangeText={setPlanningAmount}
          placeholder="Enter amount..."
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.periodSection}>
        <Text style={[styles.label, { color: colors.text }]}>
          Budget Period
        </Text>
        <View style={styles.periodButtons}>
          {periods.map((period) => (
            <ModernButton
              key={period.key}
              title={period.label}
              variant={selectedPeriod === period.key ? 'primary' : 'ghost'}
              onPress={() => setSelectedPeriod(period.key)}
              leftIcon={
                <Ionicons 
                  name={period.icon as any} 
                  size={16} 
                  color={selectedPeriod === period.key ? 'white' : colors.primary} 
                />
              }
              style={styles.periodButton}
            />
          ))}
        </View>
      </View>

      {planningAmount && parseFloat(planningAmount) > 0 && (
        <View style={[styles.preview, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.previewTitle, { color: colors.primary }]}>
            Quick Preview
          </Text>
          <Text style={[styles.previewText, { color: colors.text }]}>
            Daily limit: GHS {(parseFloat(planningAmount) / (selectedPeriod === 'weekly' ? 7 : 30)).toFixed(2)}
          </Text>
        </View>
      )}

      <ModernButton
        title="Calculate & Plan"
        onPress={handleQuickPlan}
        variant="primary"
        disabled={!planningAmount || parseFloat(planningAmount) <= 0}
        leftIcon={<Ionicons name="calculator" size={16} color="white" />}
        style={styles.calculateButton}
      />

      <ModernButton
        title="Create Actual Budget"
        onPress={onCreateBudget}
        variant="ghost"
        leftIcon={<Ionicons name="add-circle-outline" size={16} color={colors.primary} />}
        style={styles.createButton}
      />
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.base,
    lineHeight: Typography.lineHeight.sm,
  },
  amountSection: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  periodSection: {
    marginBottom: Spacing.base,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodButton: {
    flex: 1,
  },
  preview: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.base,
  },
  previewTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.xs,
  },
  previewText: {
    fontSize: Typography.fontSize.sm,
  },
  calculateButton: {
    marginBottom: Spacing.sm,
  },
  createButton: {
    marginBottom: 0,
  },
});
