// 🏦 Create Budget Screen
// Simple budget creation form

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { BudgetPeriod, Currency } from '../../src/types/finance';

export default function CreateBudgetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createBudget, loading } = useFinance();

  const [formData, setFormData] = useState({
    totalBudget: '',
    currency: 'GHS' as Currency,
    period: 'MONTHLY' as BudgetPeriod,
  });

  // Dialog states
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateBudget = async () => {
    try {
      // Basic validation
      const amount = parseFloat(formData.totalBudget);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Please enter a valid budget amount');
        setErrorDialog(true);
        return;
      }

      // Calculate dates for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      await createBudget({
        totalBudget: amount,
        currency: formData.currency,
        period: formData.period,
        startDate,
        endDate,
      });

      setSuccessDialog(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create budget');
      setErrorDialog(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Success Dialog */}
      <ModernDialog
        visible={successDialog}
        title="Success!"
        message="Your budget has been created successfully."
        buttons={[
          {
            text: 'OK',
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
          <Text style={[styles.title, { color: colors.text }]}>Create Budget</Text>
          <View style={styles.placeholder} />
        </View>
        <ModernCard variant="elevated" padding="lg" style={styles.formCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Budget Details
          </Text>
          
          {/* Budget Amount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Budget Amount
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                ₵
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.totalBudget}
                onChangeText={(text) => setFormData(prev => ({ ...prev, totalBudget: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* Currency Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Currency
            </Text>
            <View style={styles.currencyButtons}>
              {(['GHS', 'USD', 'EUR', 'GBP'] as Currency[]).map((currency) => (
                <ModernButton
                  key={currency}
                  title={currency}
                  onPress={() => setFormData(prev => ({ ...prev, currency }))}
                  variant={formData.currency === currency ? 'primary' : 'secondary'}
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Budget Period
            </Text>
            <View style={styles.periodButtons}>
              {(['WEEKLY', 'MONTHLY'] as BudgetPeriod[]).map((period) => (
                <ModernButton
                  key={period}
                  title={period === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                  onPress={() => setFormData(prev => ({ ...prev, period }))}
                  variant={formData.period === period ? 'primary' : 'secondary'}
                  style={styles.periodButton}
                />
              ))}
            </View>
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Your budget will be active for the current {formData.period.toLowerCase()} period.
            </Text>
          </View>
        </ModernCard>

        {/* Create Button */}
        <ModernButton
          title="Create Budget"
          onPress={handleCreateBudget}
          variant="primary"
          loading={loading.budget}
          disabled={!formData.totalBudget.trim()}
          leftIcon={<Ionicons name="wallet-outline" size={20} color="white" />}
          style={styles.createButton}
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
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  formCard: {
    marginHorizontal: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  currencySymbol: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium as any,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  createButton: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
  },
});
