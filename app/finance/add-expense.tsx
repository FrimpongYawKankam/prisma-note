// 💰 Add Expense Screen - Expense Creation Form
// Comprehensive expense management with category selection

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { ModernInput } from '../../src/components/ui/ModernInput';
import { useFinance } from '../../src/context/FinanceContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { CategoryId, FIXED_CATEGORIES } from '../../src/types/finance';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { addExpense, loading } = useFinance();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: null as CategoryId | null,
    date: new Date().toISOString().split('T')[0], // Today's date
  });

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

    try {
      await addExpense({
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId!,
        date: formData.date,
      });

      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to add expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setFormData(prev => ({ ...prev, categoryId }));
    setErrors(prev => ({ ...prev, categoryId: '' }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Expense</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ModernCard style={styles.formCard}>
            {/* Amount Input */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                leftIcon={
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                    GHS
                  </Text>
                }
              />
            </View>

            {/* Description Input */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Category
              </Text>
              {errors.categoryId ? (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.categoryId}
                </Text>
              ) : null}
              <View style={styles.categoriesGrid}>
                {FIXED_CATEGORIES.map((category) => (
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
              <ModernInput
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, date: value }));
                }}
                leftIcon={
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                }
              />
            </View>
          </ModernCard>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <ModernButton
            title="Add Expense"
            onPress={handleSubmit}
            loading={loading.expenses}
            variant="primary"
            leftIcon={
              <Ionicons name="add-circle-outline" size={20} color="white" />
            }
          />
        </View>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  formCard: {
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
  currencySymbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
