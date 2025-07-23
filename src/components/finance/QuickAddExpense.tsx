import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { CategoryBudget } from '../../types/finance';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface QuickAddExpenseProps {
  visible: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
  onAddExpense: (categoryId: string, amount: number, description: string) => void;
  preselectedCategoryId?: string;
}

const QUICK_AMOUNTS = [10, 20, 50, 100];
const RECENT_DESCRIPTIONS = ['Lunch', 'Coffee', 'Gas', 'Groceries', 'Uber'];

export function QuickAddExpense({
  visible,
  onClose,
  categories,
  onAddExpense,
  preselectedCategoryId,
}: QuickAddExpenseProps) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const amountInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Reset form
      setSelectedCategory(preselectedCategoryId || categories[0]?.id || '');
      setAmount('');
      setDescription('');
      
      // Animate in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-focus amount input after animation
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 350);
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, preselectedCategoryId, categories]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setShowKeyboard(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setShowKeyboard(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleAddExpense = () => {
    const expenseAmount = parseFloat(amount);
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (!amount || expenseAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    onAddExpense(selectedCategory, expenseAmount, description.trim());
    onClose();
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    // Auto-focus description after selecting amount
    setTimeout(() => {
      // Focus description input if amount is set
      if (amountInputRef.current) {
        amountInputRef.current.blur();
      }
    }, 100);
  };

  const handleQuickDescription = (desc: string) => {
    setDescription(desc);
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === selectedCategory);
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '$0' : `$${numValue.toLocaleString()}`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.container,
            { 
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
              paddingBottom: showKeyboard ? Spacing.lg : Spacing.xl,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Add Expense
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                ref={amountInputRef}
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Focus description or handle next action
                }}
              />
            </View>
            
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map(quickAmount => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    { 
                      backgroundColor: amount === quickAmount.toString() 
                        ? colors.primary + '20' 
                        : colors.surface,
                      borderColor: amount === quickAmount.toString() 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    { 
                      color: amount === quickAmount.toString() 
                        ? colors.primary 
                        : colors.text 
                    }
                  ]}>
                    ${quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.categorySection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: selectedCategory === item.id 
                        ? item.color + '20' 
                        : colors.surface,
                      borderColor: selectedCategory === item.id 
                        ? item.color 
                        : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.color} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    { 
                      color: selectedCategory === item.id 
                        ? item.color 
                        : colors.text 
                    }
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.descriptionInput,
                { 
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="What did you spend on?"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleAddExpense}
            />
            
            {/* Quick Description Buttons */}
            {!showKeyboard && (
              <View style={styles.quickDescriptions}>
                {RECENT_DESCRIPTIONS.map(desc => (
                  <TouchableOpacity
                    key={desc}
                    style={[
                      styles.quickDescButton,
                      { 
                        backgroundColor: description === desc 
                          ? colors.primary + '20' 
                          : colors.surface,
                        borderColor: description === desc 
                          ? colors.primary 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleQuickDescription(desc)}
                  >
                    <Text style={[
                      styles.quickDescText,
                      { 
                        color: description === desc 
                          ? colors.primary 
                          : colors.textSecondary 
                      }
                    ]}>
                      {desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Preview */}
          {amount && selectedCategory && description && (
            <ModernCard style={[styles.previewCard, { backgroundColor: colors.surface }]}>
              <View style={styles.previewContent}>
                <View style={styles.previewLeft}>
                  <View style={[styles.previewIcon, { backgroundColor: getSelectedCategory()?.color + '20' }]}>
                    <Ionicons 
                      name={getSelectedCategory()?.icon as any} 
                      size={16} 
                      color={getSelectedCategory()?.color} 
                    />
                  </View>
                  <View>
                    <Text style={[styles.previewDescription, { color: colors.text }]}>
                      {description}
                    </Text>
                    <Text style={[styles.previewCategory, { color: colors.textSecondary }]}>
                      {getSelectedCategory()?.name}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.previewAmount, { color: colors.text }]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            </ModernCard>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ModernButton
              title="Add Expense"
              onPress={handleAddExpense}
              variant="primary"
              disabled={!amount || !selectedCategory || !description.trim()}
              style={styles.addButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
  },
  amountSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  currencySymbol: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    flex: 1,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAmountButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  categorySection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoriesList: {
    paddingRight: Spacing.lg,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  descriptionSection: {
    padding: Spacing.lg,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.base,
  },
  quickDescriptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickDescButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  quickDescText: {
    fontSize: Typography.fontSize.sm,
  },
  previewCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  previewDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  previewCategory: {
    fontSize: Typography.fontSize.sm,
  },
  previewAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  actions: {
    padding: Spacing.lg,
  },
  addButton: {
    width: '100%',
  },
});