// 📅 Budget Date Display Component
// Enhanced functional component to show budget date range with smart defaults

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';

interface BudgetDateDisplayProps {
  startDate?: string;
  endDate?: string;
  period?: string;
  onEditDates?: () => void;
  showEditButton?: boolean;
  onPeriodChange?: (period: string) => void;
  allowPeriodChange?: boolean;
}

export const BudgetDateDisplay: React.FC<BudgetDateDisplayProps> = ({
  startDate,
  endDate,
  period = 'monthly',
  onEditDates,
  showEditButton = false,
  onPeriodChange,
  allowPeriodChange = false,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSmartEndDate = () => {
    const now = new Date();
    if (period === 'weekly') {
      now.setDate(now.getDate() + 7);
    } else if (period === 'daily') {
      now.setDate(now.getDate() + 1);
    } else {
      // Default to monthly
      now.setMonth(now.getMonth() + 1);
    }
    return now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDateStatus = () => {
    if (startDate && endDate) {
      return 'active'; // Has real budget dates
    } else if (!startDate && !endDate) {
      return 'planning'; // No dates, show suggested period
    } else {
      return 'partial'; // Some dates missing
    }
  };

  const dateStatus = getDateStatus();
  const displayStartDate = formatDate(startDate) || getCurrentDate();
  const displayEndDate = formatDate(endDate) || getSmartEndDate();

  const getStatusColor = () => {
    switch (dateStatus) {
      case 'active': return colors.success || colors.primary;
      case 'planning': return colors.primary;
      case 'partial': return colors.warning || colors.primary;
      default: return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (dateStatus) {
      case 'active': return 'Active Budget Period';
      case 'planning': return 'Suggested Budget Period';
      case 'partial': return 'Budget Period (Partial)';
      default: return 'Budget Period';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: `${colors.primary}10` }]}>
      <View style={styles.header}>
        <Ionicons 
          name={dateStatus === 'active' ? 'calendar' : 'calendar-outline'} 
          size={20} 
          color={getStatusColor()} 
        />
        <Text style={[styles.title, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            From
          </Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {displayStartDate}
          </Text>
          {dateStatus === 'planning' && (
            <Text style={[styles.suggestedLabel, { color: colors.textSecondary }]}>
              (suggested)
            </Text>
          )}
        </View>
        
        <View style={styles.separator}>
          <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
        </View>
        
        <View style={styles.dateItem}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            To
          </Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {displayEndDate}
          </Text>
          {dateStatus === 'planning' && (
            <Text style={[styles.suggestedLabel, { color: colors.textSecondary }]}>
              (suggested)
            </Text>
          )}
        </View>
      </View>
      
      <View style={[styles.periodBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={[styles.periodText, { color: 'white' }]}>
          {period.charAt(0).toUpperCase() + period.slice(1)} Budget
        </Text>
        {dateStatus === 'planning' && (
          <View style={styles.suggestionIndicator}>
            <Ionicons name="bulb-outline" size={12} color="white" />
          </View>
        )}
      </View>
      
      {dateStatus === 'planning' && allowPeriodChange && onPeriodChange && (
        <View style={styles.periodSelector}>
          <Text style={[styles.selectorTitle, { color: colors.text }]}>
            Choose Period:
          </Text>
          <View style={styles.periodButtons}>
            {['weekly', 'monthly', 'yearly'].map((p) => (
              <View key={p} style={styles.periodButtonContainer}>
                <Text 
                  style={[
                    styles.periodButtonText, 
                    { 
                      color: period === p ? 'white' : colors.primary,
                      backgroundColor: period === p ? colors.primary : 'transparent',
                    }
                  ]}
                  onPress={() => onPeriodChange(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {dateStatus === 'planning' && (
        <View style={styles.helpText}>
          <Text style={[styles.helpTextContent, { color: colors.textSecondary }]}>
            💡 These are suggested dates. Create a budget to set your actual period.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    flex: 1,
  },
  editButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  suggestedLabel: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
  separator: {
    paddingHorizontal: Spacing.sm,
  },
  periodBadge: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  periodText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  suggestionIndicator: {
    marginLeft: Spacing.xs,
  },
  helpText: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: BorderRadius.sm,
  },
  helpTextContent: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.sm,
  },
  periodSelector: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: BorderRadius.sm,
  },
  selectorTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  periodButtonContainer: {
    flex: 1,
  },
  periodButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
});
