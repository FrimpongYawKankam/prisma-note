// 🏦 Create Budget Screen
// Simple budget creation form with date selection and notes integration

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

  // Currency symbols mapping
  const currencySymbols = {
    GHS: '₵',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  // Date selection state
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });

  // Dialog states
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update end date when period changes
  useEffect(() => {
    if (!startDate || !(startDate instanceof Date)) return;
    
    const newEndDate = new Date(startDate);
    if (formData.period === 'WEEKLY') {
      newEndDate.setDate(newEndDate.getDate() + 7);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }
    setEndDate(newEndDate);
  }, [startDate, formData.period]);

  const handleCreateBudget = async () => {
    try {
      // Basic validation
      const amount = parseFloat(formData.totalBudget);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Please enter a valid budget amount');
        setErrorDialog(true);
        return;
      }

      // Validate dates exist and are valid
      if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
        setErrorMessage('Please select valid start and end dates');
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

      await createBudget({
        totalBudget: amount,
        currency: formData.currency,
        period: formData.period,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log('✅ Budget created successfully:', {
        amount,
        currency: formData.currency,
        period: formData.period,
        dateRange: `${formattedStartDate} to ${formattedEndDate}`
      });

      setSuccessDialog(true);
    } catch (error: any) {
      console.error('❌ Failed to create budget:', error);
      setErrorMessage(error.message || 'Failed to create budget');
      setErrorDialog(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Success Dialog */}
      <ModernDialog
        visible={successDialog}
        title="Budget Created Successfully! 🎉"
        message="Your budget has been created and is now active. You can start tracking your expenses right away."
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

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ModernButton
            title=""
            onPress={() =>  router.push('/(tabs)/finance')}
            variant="ghost"
            leftIcon={<Ionicons name="arrow-back" size={24} color={colors.primary} />}
            style={styles.backButton}
          />
          <Text style={[styles.title, { color: colors.primary }]}>Create Budget</Text>
          <View style={styles.placeholder} />
        </View>
        <ModernCard variant="elevated" padding="lg" style={styles.formCard}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>
            Budget Details
          </Text>
          
          {/* Budget Amount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Budget Amount
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                {currencySymbols[formData.currency]}
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
            <Text style={[styles.label, { color: colors.primary }]}>
              Currency
            </Text>
            <View style={styles.currencyButtons}>
              {(['GHS', 'USD', 'EUR', 'GBP'] as Currency[]).map((currency) => (
                <ModernButton
                  key={currency}
                  title={currency}
                  onPress={() => setFormData(prev => ({ ...prev, currency }))}
                  variant={formData.currency === currency ? 'primary' : 'ghost'}
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.primary }]}>
              Budget Period
            </Text>
            <View style={styles.periodButtons}>
              {(['WEEKLY', 'MONTHLY'] as BudgetPeriod[]).map((period) => (
                <ModernButton
                  key={period}
                  title={period === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                  onPress={() => setFormData(prev => ({ ...prev, period }))}
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
              labelColor={colors.primary}
              value={startDate}
              onDateChange={setStartDate}
              minimumDate={new Date()}
            />
            
            <ModernDatePicker
              label="End Date"
              labelColor={colors.primary}
              value={endDate}
              onDateChange={setEndDate}
              minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} // Next day
            />
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Your budget will be active from {startDate?.toLocaleDateString() || 'N/A'} to {endDate?.toLocaleDateString() || 'N/A'}.
            </Text>
          </View>
        </ModernCard>

        {/* Create Button */}
        <ModernButton
          title="Create Budget"
          onPress={handleCreateBudget}
          variant="primary"
          loading={loading.creatingBudget}
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
  scrollContent: {
    paddingBottom: Spacing.xl,
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
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
    gap: Spacing.xs,
  },
  currencyButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.xs,
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
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  createButton: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
});
