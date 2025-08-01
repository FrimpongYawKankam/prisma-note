// 💰 Add Expense Screen - Expense Creation Form
// Comprehensive expense management with category selection

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { ModernInput } from '../../src/components/ui/ModernInput';
import { useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { CategoryId, FIXED_CATEGORIES } from '../../src/types/finance';

// Fallback categories in case of import issues
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Food & Dining', icon: '🍽️' },
  { id: 2, name: 'Transportation', icon: '🚗' },
  { id: 3, name: 'Shopping', icon: '🛒' },
  { id: 4, name: 'Entertainment', icon: '🎬' },
  { id: 5, name: 'Bills & Utilities', icon: '🏠' },
  { id: 6, name: 'Healthcare', icon: '🏥' },
  { id: 7, name: 'Education', icon: '📚' },
  { id: 8, name: 'Travel', icon: '✈️' },
  { id: 9, name: 'Personal Care', icon: '💳' },
  { id: 10, name: 'Gifts & Donations', icon: '🎁' },
  { id: 11, name: 'Other', icon: '📦' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { addExpense } = useFinance();

  // Debug categories to prevent iterator error
  React.useEffect(() => {
    console.log('🐛 AddExpense Debug:', {
      FIXED_CATEGORIES: FIXED_CATEGORIES ? 'EXISTS' : 'NULL',
      isArray: Array.isArray(FIXED_CATEGORIES),
      fallbackUsed: !Array.isArray(FIXED_CATEGORIES),
      categoriesLength: Array.isArray(FIXED_CATEGORIES) ? FIXED_CATEGORIES.length : 'NOT_ARRAY'
    });
  }, []);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: null as CategoryId | null,
    date: new Date(), // Use Date object for picker
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [errors, setErrors] = useState({
    amount: '',
    description: '',
    categoryId: '',
  });

  const handleSubmit = async () => {
    // Reset errors
    setErrors({
      amount: '',
      description: '',
      categoryId: '',
    });

    // Validation
    const newErrors = {
      amount: '',
      description: '',
      categoryId: '',
    };

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (newErrors.amount || newErrors.description || newErrors.categoryId) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId!,
        date: formData.date.toISOString().split('T')[0], // Convert Date to string
      });

      setSuccessDialog(true);
    } catch (error) {
      console.error('Failed to add expense:', error);
      setErrorMessage('Failed to add expense. Please try again.');
      setErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setFormData(prev => ({ ...prev, categoryId }));
    setErrors(prev => ({ ...prev, categoryId: '' }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Success Dialog */}
      <ModernDialog
        visible={successDialog}
        title="Success"
        message="Expense added successfully!"
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/finance')}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.primary }]}>Add Expense</Text>
            <View style={{ width: 24 }} />
          </View>
          <ModernCard style={styles.formCard}>
            {/* Amount Input */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Amount
              </Text>
              <ModernInput
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, amount: value }));
                  setErrors(prev => ({ ...prev, amount: '' }));
                }}
                keyboardType="numeric"
                error={errors.amount}
                inputStyle={styles.amountInput}
                leftIcon={
                  <View style={styles.currencyContainer}>
                    <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                      ₵
                    </Text>
                  </View>
                }
              />
            </View>

            {/* Description Input */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Description
              </Text>
              <ModernInput
                placeholder="What did you spend on?"
                value={formData.description}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, description: value }));
                  setErrors(prev => ({ ...prev, description: '' }));
                }}
                error={errors.description}
                multiline
              />
            </View>

            {/* Category Selection */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Category
              </Text>
              {errors.categoryId ? (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.categoryId}
                </Text>
              ) : null}
              <View style={styles.categoriesGrid}>
                {(Array.isArray(FIXED_CATEGORIES) ? FIXED_CATEGORIES : FALLBACK_CATEGORIES).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: formData.categoryId === category.id 
                          ? colors.primary 
                          : colors.surfaceSecondary,
                        borderColor: formData.categoryId === category.id 
                          ? colors.primary 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleCategorySelect(category.id as CategoryId)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text 
                      style={[
                        styles.categoryName,
                        {
                          color: formData.categoryId === category.id 
                            ? colors.surface 
                            : colors.text,
                        }
                      ]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Input */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Date
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {formData.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData(prev => ({ ...prev, date: selectedDate }));
                    }
                  }}
                  maximumDate={new Date()} // Can't select future dates
                />
              )}
            </View>
          </ModernCard>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <ModernButton
              title="Add Expense"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              leftIcon={
                <Ionicons name="add-circle-outline" size={20} color="white" />
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl, // Extra bottom padding for submit button
  },
  formCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
  },
  amountInput: {
    textAlign: 'left',
    paddingVertical: 0, // Remove extra padding
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  currencyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 24, // Match input text line height
    paddingBottom: 1, // Fine-tune vertical alignment
  },
  currencySymbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.base,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
  },
  submitContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    gap: Spacing.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
});
