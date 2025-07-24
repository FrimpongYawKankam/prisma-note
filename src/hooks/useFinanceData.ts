import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
    Budget,
    CategoryBudget,
    Currency,
    Expense,
    getCurrencyFromCode,
    transformBackendCategoryToLegacy,
    transformBackendExpenseToLegacy
} from '../types/finance';

interface UseFinanceDataReturn {
  // Budget data (legacy format for existing components)
  budget: Budget | null;
  isLoadingBudget: boolean;
  budgetError: string | null;
  
  // Combined data (legacy format)
  expenses: Expense[];
  isLoadingExpenses: boolean;
  expensesError: string | null;
  
  // Computed values
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
  categorySpending: Map<string, number>;
  
  // Actions (adapted for backend integration)
  initializeBudget: (totalAmount: number, currency: Currency, categories: CategoryBudget[]) => Promise<void>;
  updateBudget: (updates: Partial<Budget>) => Promise<void>;
  addExpense: (categoryId: string, amount: number, description: string) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Analytics helpers
  getSpendingTrends: (period: 'week' | 'month' | 'year') => { date: string; amount: number }[];
  getCategoryBreakdown: () => { categoryId: string; spent: number; budget: number; percentage: number }[];
  getTopCategories: (limit?: number) => { categoryId: string; amount: number; percentage: number }[];
}

export function useFinanceData(): UseFinanceDataReturn {
  // Use the new FinanceContext
  const {
    currentBudget,
    budgetsLoading,
    budgetsError,
    categories,
    userCategories,
    categoriesLoading,
    categoriesError,
    expenses: backendExpenses,
    expensesLoading,
    expensesError,
    createBudget,
    updateBudget: updateBackendBudget,
    createExpense,
    updateExpense: updateBackendExpense,
    deleteExpense: deleteBackendExpense,
    refreshAll,
    getCategoryBreakdown: getBackendCategoryBreakdown,
    getSpendingTrends: getBackendSpendingTrends,
    assignCategoryToUser,
    createCategory
  } = useFinance();

  // Local state for computed values
  const [categorySpendingMap, setCategorySpendingMap] = useState<Map<string, number>>(new Map());

  // Transform backend data to legacy format for existing components
  const budget = useMemo((): Budget | null => {
    if (!currentBudget || !userCategories.length) return null;

    // Get user's assigned categories
    const userCategoryIds = userCategories.map(uc => uc.categoryId);
    const userAssignedCategories = categories.filter(cat => userCategoryIds.includes(cat.id));

    // Calculate spent amounts for each category
    const categoryBudgets: CategoryBudget[] = userAssignedCategories.map(category => {
      // Ensure we have a valid array before filtering
      const categoryExpenses = Array.isArray(backendExpenses) 
        ? backendExpenses.filter(exp => exp.categoryId === category.id)
        : [];
      const spentAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // For now, distribute budget evenly across categories (this can be enhanced later)
      const budgetAmount = currentBudget.totalAmount / userAssignedCategories.length;

      return transformBackendCategoryToLegacy(category, budgetAmount, spentAmount);
    });

    return {
      id: currentBudget.id.toString(),
      month: new Date(currentBudget.startDate).toISOString().slice(0, 7),
      totalAmount: currentBudget.totalAmount,
      categories: categoryBudgets,
      currency: getCurrencyFromCode(currentBudget.currency)
    };
  }, [currentBudget, userCategories, categories, backendExpenses]);

  // Transform backend expenses to legacy format
  const expenses = useMemo((): Expense[] => {
    // Double-check that backendExpenses is an array
    if (!Array.isArray(backendExpenses)) {
      console.warn('backendExpenses is not an array:', backendExpenses);
      return [];
    }
    return backendExpenses.map(transformBackendExpenseToLegacy);
  }, [backendExpenses]);

  // Computed values
  const totalSpent = useMemo(() => {
    // Ensure we have a valid array before reducing
    if (!Array.isArray(backendExpenses)) {
      return 0;
    }
    return backendExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [backendExpenses]);

  const remainingBudget = useMemo(() => {
    return (budget?.totalAmount || 0) - totalSpent;
  }, [budget?.totalAmount, totalSpent]);

  const spentPercentage = useMemo(() => {
    if (!budget?.totalAmount) return 0;
    return (totalSpent / budget.totalAmount) * 100;
  }, [totalSpent, budget?.totalAmount]);

  // Update category spending map when expenses change
  useEffect(() => {
    const newCategorySpending = new Map<string, number>();
    
    // Ensure we have a valid array before processing
    if (Array.isArray(backendExpenses)) {
      backendExpenses.forEach(expense => {
        const categoryId = expense.categoryId.toString();
        const currentAmount = newCategorySpending.get(categoryId) || 0;
        newCategorySpending.set(categoryId, currentAmount + expense.amount);
      });
    }

    setCategorySpendingMap(newCategorySpending);
  }, [backendExpenses]);

  // Actions (adapted for backend)
  const initializeBudget = useCallback(async (totalAmount: number, currency: Currency, categories: CategoryBudget[]) => {
    try {
      // Create budget for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const budgetData = {
        totalAmount,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        currency: currency.code,
        description: `Budget for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`
      };

      const newBudget = await createBudget(budgetData);

      // Create categories if they don't exist and assign them to user
      for (const categoryData of categories) {
        try {
          // Check if category already exists
          const existingCategory = await findCategoryByName(categoryData.name);
          
          let categoryId: number;
          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            // Create new category
            const newCategory = await createCategory({
              name: categoryData.name,
              color: categoryData.color,
              icon: categoryData.icon,
              description: `Category: ${categoryData.name}`
            });
            categoryId = newCategory.id;
          }

          // Assign category to user
          await assignCategoryToUser(categoryId);
        } catch (error) {
          console.error(`Failed to setup category ${categoryData.name}:`, error);
          // Continue with other categories
        }
      }

      await refreshAll();
    } catch (error) {
      console.error('Failed to initialize budget:', error);
      throw error;
    }
  }, [createBudget, createCategory, assignCategoryToUser, refreshAll]);

  const updateBudget = useCallback(async (updates: Partial<Budget>) => {
    if (!currentBudget) return;

    try {
      const updateData: any = {};
      
      if (updates.totalAmount !== undefined) {
        updateData.totalAmount = updates.totalAmount;
      }
      
      if (updates.currency) {
        updateData.currency = updates.currency.code;
      }

      await updateBackendBudget(currentBudget.id, updateData);
      await refreshAll();
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  }, [currentBudget, updateBackendBudget, refreshAll]);

  const addExpense = useCallback(async (categoryId: string, amount: number, description: string) => {
    try {
      const expenseData = {
        amount,
        description,
        categoryId: parseInt(categoryId),
        date: new Date().toISOString().split('T')[0],
        tags: []
      };

      await createExpense(expenseData);
      // The context will automatically update the local state
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  }, [createExpense]);

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    try {
      const updateData: any = {};
      
      if (updates.amount !== undefined) {
        updateData.amount = updates.amount;
      }
      
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      
      if (updates.date !== undefined) {
        updateData.date = updates.date.toISOString().split('T')[0];
      }

      await updateBackendExpense(parseInt(expenseId), updateData);
      // The context will automatically update the local state
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  }, [updateBackendExpense]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      await deleteBackendExpense(parseInt(expenseId));
      // The context will automatically update the local state
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  }, [deleteBackendExpense]);

  const refreshData = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  // Analytics helpers (simplified for now, can be enhanced with real backend data)
  const getSpendingTrends = useCallback((period: 'week' | 'month' | 'year') => {
    // This is a simplified implementation
    // In a real app, this would call the backend analytics endpoint
    const trends: { date: string; amount: number }[] = [];
    
    // Group expenses by the specified period
    const groupedExpenses = new Map<string, number>();
    
    (backendExpenses || []).forEach(expense => {
      const date = new Date(expense.date);
      let key: string;
      
      switch (period) {
        case 'week':
          // Group by week
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          // Group by month
          key = date.toISOString().slice(0, 7);
          break;
        case 'year':
          // Group by year
          key = date.getFullYear().toString();
          break;
      }
      
      const currentAmount = groupedExpenses.get(key) || 0;
      groupedExpenses.set(key, currentAmount + expense.amount);
    });

    // Convert to array format
    Array.from(groupedExpenses.entries()).forEach(([date, amount]) => {
      trends.push({ date, amount });
    });

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }, [backendExpenses]);

  const getCategoryBreakdown = useCallback(() => {
    if (!budget) return [];

    return budget.categories.map(category => ({
      categoryId: category.id,
      spent: category.spentAmount,
      budget: category.budgetAmount,
      percentage: category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0
    }));
  }, [budget]);

  const getTopCategories = useCallback((limit: number = 5) => {
    const breakdown = getCategoryBreakdown();
    return breakdown
      .sort((a, b) => b.spent - a.spent)
      .slice(0, limit)
      .map(item => ({
        categoryId: item.categoryId,
        amount: item.spent,
        percentage: item.percentage
      }));
  }, [getCategoryBreakdown]);

  // Helper function to find category by name
  const findCategoryByName = useCallback(async (name: string) => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  }, [categories]);

  return {
    // Budget data
    budget,
    isLoadingBudget: budgetsLoading || categoriesLoading,
    budgetError: budgetsError || categoriesError,
    
    // Combined data
    expenses,
    isLoadingExpenses: expensesLoading,
    expensesError,
    
    // Computed values
    totalSpent,
    remainingBudget,
    spentPercentage,
    categorySpending: categorySpendingMap,
    
    // Actions
    initializeBudget,
    updateBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshData,
    
    // Analytics helpers
    getSpendingTrends,
    getCategoryBreakdown,
    getTopCategories
  };
}
