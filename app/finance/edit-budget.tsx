// 🏦 Edit Budget Screen
// Simple budget editing form with date selection and notes integration

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModernDatePicker } from '../../src/components/ui/DatePicker';
import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { useBudget, useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { BudgetPeriod, Currency } from '../../src/types/finance';

export default function EditBudgetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateBudget, loading } = useFinance();
  const { budget } = useBudget();

  const [formData, setFormData] = useState({
    totalBudget: '',
    currency: 'GHS' as Currency,
    period: 'MONTHLY' as BudgetPeriod,
  });

  // Date selection state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });

  // Dialog states
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form with current budget data
  useEffect(() => {
    if (budget) {
      setFormData({
        totalBudget: budget.totalBudget.toString(),
        currency: budget.currency,
        period: budget.period,
      });
      
      // Set dates from budget if available
      if (budget.startDate) {
        setStartDate(new Date(budget.startDate));
      }
      if (budget.endDate) {
        setEndDate(new Date(budget.endDate));
      }
    }
  }, [budget]);

  // Update end date when period changes
  useEffect(() => {
    const newEndDate = new Date(startDate);
    if (formData.period === 'WEEKLY') {
      newEndDate.setDate(newEndDate.getDate() + 7);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }
    setEndDate(newEndDate);
  }, [startDate, formData.period]);

  const handleUpdateBudget = async () => {
    try {
      // Basic validation
      const amount = parseFloat(formData.totalBudget);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Please enter a valid budget amount');
        setErrorDialog(true);
        return;
      }

      // Validate date range
      if (endDate <= startDate) {
        setErrorMessage('End date must be after start date');
        setErrorDialog(true);
        return;
      }

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      await updateBudget({
        totalBudget: amount,
        currency: formData.currency,
        period: formData.period,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log('✅ Budget updated successfully:', {
        amount,
        currency: formData.currency,
        period: formData.period,
        dateRange: `${formattedStartDate} to ${formattedEndDate}`
      });

      setSuccessDialog(true);
    } catch (error: any) {
      console.error('❌ Failed to update budget:', error);
      setErrorMessage(error.message || 'Failed to update budget');
      setErrorDialog(true);
    }
  };

  if (!budget) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <ModernButton
            title=""
            onPress={() => router.push('/(tabs)/finance')}
            variant="ghost"
            leftIcon={<Ionicons name="arrow-back" size={24} color={colors.text} />}
            style={styles.backButton}
          />
          <Text style={[styles.title, { color: colors.text }]}>Edit Budget</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.centeredContent}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            No active budget found to edit.
          </Text>
          <ModernButton
            title="Create Budget"
            onPress={() => router.replace('/finance/create-budget')}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Success Dialog */}
      <ModernDialog
        visible={successDialog}
        title="Budget Updated Successfully! ✅"
        message="Your budget changes have been saved and are now active."
        buttons={[
          {
            text: 'Go to Finance',
            onPress: () => {
              setSuccessDialog(false);
              router.push('/(tabs)/finance');
            },
          },
        ]}
        onClose={() => {
          setSuccessDialog(false);
          router.push('/(tabs)/finance');
        }}
      />

      {/* Error Dialog */}
      <ModernDialog
        visible={errorDialog}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setErrorDialog(false),
          },
        ]}
        onClose={() => setErrorDialog(false)}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ModernButton
            title=""
            onPress={() => router.push('/(tabs)/finance')}
            variant="ghost"
            leftIcon={<Ionicons name="arrow-back" size={24} color={colors.text} />}
            style={styles.backButton}
          />
          <Text style={[styles.title, { color: colors.text }]}>Edit Budget</Text>
          <View style={styles.placeholder} />
        </View>

        <ModernCard variant="elevated" padding="lg" style={styles.formCard}>
          {/* Current Budget Info */}
          <View style={styles.currentBudgetSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Budget
            </Text>
            <Text style={[styles.currentBudgetAmount, { color: colors.primary }]}>
              ₵ {budget.totalBudget.toFixed(2)}
            </Text>
            <Text style={[styles.currentBudgetPeriod, { color: colors.textSecondary }]}>
              {budget.period.toLowerCase()} • {budget.currency}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              New Budget Amount
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: colors.border,
              backgroundColor: colors.surface 
            }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>
                ₵
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.totalBudget}
                onChangeText={(value) => 
                  setFormData(prev => ({ ...prev, totalBudget: value }))
                }
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Currency Selection */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Currency
            </Text>
            <View style={styles.currencyButtons}>
              {(['GHS', 'USD', 'EUR'] as Currency[]).map((currency) => (
                <ModernButton
                  key={currency}
                  title={currency}
                  onPress={() => 
                    setFormData(prev => ({ ...prev, currency }))
                  }
                  variant={formData.currency === currency ? 'primary' : 'ghost'}
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Budget Period
            </Text>
            <View style={styles.periodButtons}>
              {(['WEEKLY', 'MONTHLY', 'YEARLY'] as BudgetPeriod[]).map((period) => (
                <ModernButton
                  key={period}
                  title={period.toLowerCase()}
                  onPress={() => 
                    setFormData(prev => ({ ...prev, period }))
                  }
                  variant={formData.period === period ? 'primary' : 'ghost'}
                  style={styles.periodButton}
                />
              ))}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <ModernDatePicker
              label="Start Date"
              value={startDate}
              onDateChange={setStartDate}
              minimumDate={new Date()}
            />
            
            <ModernDatePicker
              label="End Date"
              value={endDate}
              onDateChange={setEndDate}
              minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} // Next day
            />
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Budget period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </Text>
          </View>
        </ModernCard>

        <ModernButton
          title="Update Budget"
          onPress={handleUpdateBudget}
          loading={loading.budget}
          variant="primary"
          leftIcon={<Ionicons name="save-outline" size={20} color="white" />}
          style={styles.updateButton}
        />
      </ScrollView>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  placeholder: {
    width: 40,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  formCard: {
    marginHorizontal: Spacing.base,
  },
  currentBudgetSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentBudgetAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.xs,
  },
  currentBudgetPeriod: {
    fontSize: Typography.fontSize.base,
    textTransform: 'capitalize',
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  currencyPrefix: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'left',
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  currencyButton: {
    flex: 1,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodButton: {
    flex: 1,
  },
  dateSection: {
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  updateButton: {
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.base,
  },
});
