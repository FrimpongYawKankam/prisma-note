import { useState, useEffect, useCallback, useMemo } from 'react';
import { Budget, Expense, CategoryBudget, Currency } from '../types/finance';
import { useExpenses } from './useExpenses';

interface UseFinanceDataReturn {
  // Budget data
  budget: Budget | null;
  isLoadingBudget: boolean;
  budgetError: string | null;
  
  // Combined data
  expenses: Expense[];
  isLoadingExpenses: boolean;
  expensesError: string | null;
  
  // Computed values
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
  categorySpending: Map<string, number>;
  
  // Actions
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
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const {
    expenses,
    isLoading: isLoadingExpenses,
    error: expensesError,
    addExpense: addExpenseAction,
    updateExpense: updateExpenseAction,
    deleteExpense: deleteExpenseAction,
    refreshExpenses,
  } = useExpenses();

  // Load budget on mount
  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = useCallback(async () => {
    setIsLoadingBudget(true);
    setBudgetError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await financeApi.getBudget();
      // setBudget(response.data);
      
      // Mock data for now
      const mockBudget: Budget = {
        id: '1',
        totalAmount: 3000,
        currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
        categories: [
          {
            id: '1',
            name: 'Food',
            icon: 'restaurant-outline',
            color: '#4CAF50',
            budgetAmount: 900,
            spentAmount: 0, // Will be calculated from expenses
          },
          {
            id: '2',
            name: 'Transport',
            icon: 'car-outline',
            color: '#FF9800',
            budgetAmount: 450,
            spentAmount: 0,
          },
          {
            id: '3',
            name: 'Shopping',
            icon: 'bag-outline',
            color: '#2196F3',
            budgetAmount: 600,
            spentAmount: 0,
          },
          {
            id: '4',
            name: 'Entertainment',
            icon: 'game-controller-outline',
            color: '#9C27B0',
            budgetAmount: 300,
            spentAmount: 0,
          },
          {
            id: '5',
            name: 'Bills',
            icon: 'receipt-outline',
            color: '#F44336',
            budgetAmount: 750,
            spentAmount: 0,
          },
        ],
        period: 'monthly',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setBudget(mockBudget);
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to load budget');
      console.error('Error loading budget:', err);
    } finally {
      setIsLoadingBudget(false);
    }
  }, []);

  // Calculate category spending from expenses
  const categorySpending = useMemo(() => {
    const spending = new Map<string, number>();
    
    expenses.forEach(expense => {
      const current = spending.get(expense.category) || 0;
      spending.set(expense.category, current + expense.amount);
    });
    
    return spending;
  }, [expenses]);

  // Update budget categories with actual spending
  const budgetWithSpending = useMemo(() => {
    if (!budget) return null;
    
    return {
      ...budget,
      categories: budget.categories.map(category => ({
        ...category,
        spentAmount: categorySpending.get(category.id) || 0,
      })),
    };
  }, [budget, categorySpending]);

  // Computed values
  const totalSpent = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const remainingBudget = useMemo(() => {
    return (budget?.totalAmount || 0) - totalSpent;
  }, [budget?.totalAmount, totalSpent]);

  const spentPercentage = useMemo(() => {
    if (!budget?.totalAmount) return 0;
    return (totalSpent / budget.totalAmount) * 100;
  }, [totalSpent, budget?.totalAmount]);

  // Actions
  const initializeBudget = useCallback(async (
    totalAmount: number,
    currency: Currency,
    categories: CategoryBudget[]
  ) => {
    setBudgetError(null);
    
    try {
      const newBudget: Budget = {
        id: Date.now().toString(),
        totalAmount,
        currency,
        categories,
        period: 'monthly',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: Replace with actual API call
      // const response = await financeApi.createBudget({
      //   totalAmount,
      //   currency,
      //   categories,
      // });
      // setBudget(response.data);

      setBudget(newBudget);
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to create budget');
      console.error('Error creating budget:', err);
      throw err;
    }
  }, []);

  const updateBudget = useCallback(async (updates: Partial<Budget>) => {
    if (!budget) return;
    
    setBudgetError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await financeApi.updateBudget(budget.id, updates);
      // setBudget(response.data);

      setBudget(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to update budget');
      console.error('Error updating budget:', err);
      throw err;
    }
  }, [budget]);

  const addExpense = useCallback(async (categoryId: string, amount: number, description: string) => {
    await addExpenseAction(categoryId, amount, description);
  }, [addExpenseAction]);

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    await updateExpenseAction(expenseId, updates);
  }, [updateExpenseAction]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    await deleteExpenseAction(expenseId);
  }, [deleteExpenseAction]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadBudget(),
      refreshExpenses(),
    ]);
  }, [loadBudget, refreshExpenses]);

  // Analytics helpers
  const getSpendingTrends = useCallback((period: 'week' | 'month' | 'year') => {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const trends: { date: string; amount: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExpenses = expenses.filter(expense => 
        expense.date.toISOString().split('T')[0] === dateStr
      );
      
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      trends.push({ date: dateStr, amount: dayTotal });
    }

    return trends;
  }, [expenses]);

  const getCategoryBreakdown = useCallback(() => {
    if (!budgetWithSpending) return [];
    
    return budgetWithSpending.categories.map(category => ({
      categoryId: category.id,
      spent: category.spentAmount,
      budget: category.budgetAmount,
      percentage: category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0,
    }));
  }, [budgetWithSpending]);

  const getTopCategories = useCallback((limit = 5) => {
    const breakdown = getCategoryBreakdown();
    return breakdown
      .sort((a, b) => b.spent - a.spent)
      .slice(0, limit)
      .map(item => ({
        categoryId: item.categoryId,
        amount: item.spent,
        percentage: totalSpent > 0 ? (item.spent / totalSpent) * 100 : 0,
      }));
  }, [getCategoryBreakdown, totalSpent]);

  return {
    // Budget data
    budget: budgetWithSpending,
    isLoadingBudget,
    budgetError,
    
    // Combined data
    expenses,
    isLoadingExpenses,
    expensesError,
    
    // Computed values
    totalSpent,
    remainingBudget,
    spentPercentage,
    categorySpending,
    
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
    getTopCategories,
  };
}