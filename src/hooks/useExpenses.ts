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
      
      // Mock data for now - Generate more realistic spending patterns
      const generateMockExpenses = (): Expense[] => {
        const expenses: Expense[] = [];
        const now = new Date();
        let id = 1;

        // Categories with their typical spending patterns
        const categories = [
          { id: '1', name: 'Food', avgDaily: 20, variance: 15 },
          { id: '2', name: 'Transport', avgDaily: 15, variance: 10 },
          { id: '3', name: 'Shopping', avgDaily: 8, variance: 25 },
          { id: '4', name: 'Entertainment', avgDaily: 5, variance: 20 },
          { id: '5', name: 'Bills', avgDaily: 3, variance: 30 },
        ];

        // Generate expenses for the last 30 days
        for (let days = 0; days < 30; days++) {
          const date = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
          
          categories.forEach(category => {
            // Some days might have no expenses for certain categories
            if (Math.random() > 0.6) return;
            
            // Random number of expenses per day (0-3)
            const numExpenses = Math.floor(Math.random() * 4);
            
            for (let i = 0; i < numExpenses; i++) {
              const baseAmount = category.avgDaily;
              const variance = category.variance;
              const amount = Math.max(1, baseAmount + (Math.random() - 0.5) * variance);
              
              const descriptions = {
                '1': ['Lunch', 'Coffee', 'Dinner', 'Groceries', 'Snacks', 'Restaurant'],
                '2': ['Gas', 'Bus fare', 'Taxi', 'Parking', 'Train ticket'],
                '3': ['Clothes', 'Electronics', 'Books', 'Gifts', 'Home items'],
                '4': ['Movies', 'Games', 'Concert', 'Sports', 'Streaming'],
                '5': ['Internet', 'Phone', 'Utilities', 'Insurance', 'Rent'],
              };
              
              const categoryDescriptions = descriptions[category.id as keyof typeof descriptions] || ['Expense'];
              const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
              
              expenses.push({
                id: id.toString(),
                amount: Math.round(amount * 100) / 100,
                description,
                category: category.id,
                date: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              
              id++;
            }
          });
        }
        
        return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
      };

      const mockExpenses = generateMockExpenses();
      
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