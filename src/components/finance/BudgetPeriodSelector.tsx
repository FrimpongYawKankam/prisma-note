// 📅 Budget Period Selector Component
// Allow users to select different budget periods

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';
import { ModernButton } from '../ui/ModernButton';

interface BudgetPeriodSelectorProps {
  selectedPeriod: 'weekly' | 'monthly' | 'yearly';
  onPeriodChange: (period: 'weekly' | 'monthly' | 'yearly') => void;
  disabled?: boolean;
}

export const BudgetPeriodSelector: React.FC<BudgetPeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const periods = [
    { 
      key: 'weekly' as const, 
      label: 'Weekly', 
      icon: 'calendar-outline',
      description: '7 days'
    },
    { 
      key: 'monthly' as const, 
      label: 'Monthly', 
      icon: 'calendar',
      description: '30 days'
    },
    { 
      key: 'yearly' as const, 
      label: 'Yearly', 
      icon: 'calendar-sharp',
      description: '365 days'
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Budget Period
      </Text>
      <View style={styles.periodButtons}>
        {periods.map((period) => (
          <ModernButton
            key={period.key}
            title={period.label}
            variant={selectedPeriod === period.key ? 'primary' : 'secondary'}
            onPress={() => onPeriodChange(period.key)}
            disabled={disabled}
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
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {periods.find(p => p.key === selectedPeriod)?.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  periodButton: {
    flex: 1,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});
