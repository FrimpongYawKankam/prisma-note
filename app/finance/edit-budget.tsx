// 🏦 Edit Budget Screen
// Simple budget editing form

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
    }
  }, [budget]);

  const handleUpdateBudget = async () => {
    try {
      // Basic validation
      const amount = parseFloat(formData.totalBudget);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Please enter a valid budget amount');
        setErrorDialog(true);
        return;
      }

      await updateBudget({
        totalBudget: amount,
        currency: formData.currency,
        period: formData.period,
      });

      setSuccessDialog(true);
    } catch (error: any) {
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
            onPress={() => router.back()}
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
        title="Success!"
        message="Your budget has been updated successfully."
        buttons={[
          {
            text: 'OK',
            onPress: () => {
              setSuccessDialog(false);
              router.back();
            },
          },
        ]}
        onClose={() => {
          setSuccessDialog(false);
          router.back();
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
            onPress={() => router.back()}
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
  updateButton: {
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.base,
  },
});
