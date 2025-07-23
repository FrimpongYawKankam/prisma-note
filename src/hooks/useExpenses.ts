import { useCallback, useEffect, useState } from 'react';
import { Expense } from '../types/finance';

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (categoryId: string, amount: number, description: string) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  getExpensesByCategory: (categoryId: string) => Expense[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getTotalSpending: (categoryId?: string) => number;
  refreshExpenses: () => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await financeApi.getExpenses();
      // setExpenses(response.data);
      
      // Mock data for now
      const mockExpenses: Expense[] = [
        {
          id: '1',
          amount: 25.50,
          description: 'Lunch at cafe',
          category: '1', // Food
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          amount: 45.00,
          description: 'Gas station',
          category: '2', // Transport
          date: new Date(Date.now() - 86400000), // Yesterday
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          amount: 120.00,
          description: 'Grocery shopping',
          category: '1', // Food
          date: new Date(Date.now() - 172800000), // 2 days ago
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      setExpenses(mockExpenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addExpense = useCallback(async (categoryId: string, amount: number, description: string) => {
    setError(null);
    
    try {
      const newExpense: Expense = {
        id: Date.now().toString(), // Temporary ID
        amount,
        description,
        category: categoryId,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: Replace with actual API call
      // const response = await financeApi.createExpense({
      //   amount,
      //   description,
      //   categoryId,
      // });
      // const createdExpense = response.data;

      // Optimistic update
      setExpenses(prev => [newExpense, ...prev]);

      // TODO: Update with actual expense from API
      // setExpenses(prev => prev.map(exp => 
      //   exp.id === newExpense.id ? createdExpense : exp
      // ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      console.error('Error adding expense:', err);
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await financeApi.updateExpense(expenseId, updates);
      // const updatedExpense = response.data;

      // Optimistic update
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, ...updates, updatedAt: new Date() }
          : expense
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      console.error('Error updating expense:', err);
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // await financeApi.deleteExpense(expenseId);

      // Optimistic update
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      console.error('Error deleting expense:', err);
      throw err;
    }
  }, []);

  const getExpensesByCategory = useCallback((categoryId: string): Expense[] => {
    return expenses.filter(expense => expense.category === categoryId);
  }, [expenses]);

  const getExpensesByDateRange = useCallback((startDate: Date, endDate: Date): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [expenses]);

  const getTotalSpending = useCallback((categoryId?: string): number => {
    const filteredExpenses = categoryId 
      ? expenses.filter(expense => expense.category === categoryId)
      : expenses;
    
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const refreshExpenses = useCallback(async () => {
    await loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesByDateRange,
    getTotalSpending,
    refreshExpenses,
  };
}