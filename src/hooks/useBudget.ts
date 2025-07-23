import { useState } from 'react';
import { Budget, CategoryBudget, Currency } from '../types/finance';

const DEFAULT_CURRENCY: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar'
};

export function useBudget() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateSpentAmount = (categoryId: string): number => {
    // This will be connected to expenses later
    return 0;
  };

  const getBudgetStatus = (spent: number, budget: number): 'safe' | 'warning' | 'danger' => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  };

  const initializeBudget = (totalAmount: number = 3000, currency: Currency = DEFAULT_CURRENCY) => {
    setIsLoading(true);
    
    // Sample data with some spending to show the progress bars
    const defaultCategories: CategoryBudget[] = [
      { id: '1', name: 'Food', budgetAmount: totalAmount * 0.3, spentAmount: 450, icon: 'restaurant-outline', color: '#4CAF50' },
      { id: '2', name: 'Transport', budgetAmount: totalAmount * 0.15, spentAmount: 200, icon: 'car-outline', color: '#FF9800' },
      { id: '3', name: 'Shopping', budgetAmount: totalAmount * 0.2, spentAmount: 580, icon: 'bag-outline', color: '#2196F3' },
      { id: '4', name: 'Entertainment', budgetAmount: totalAmount * 0.1, spentAmount: 280, icon: 'game-controller-outline', color: '#9C27B0' },
      { id: '5', name: 'Bills', budgetAmount: totalAmount * 0.25, spentAmount: 750, icon: 'receipt-outline', color: '#F44336' },
    ];

    const newBudget: Budget = {
      id: Date.now().toString(),
      month: new Date().toISOString().slice(0, 7),
      totalAmount,
      categories: defaultCategories,
      currency
    };

    // Simulate a brief loading state
    setTimeout(() => {
      setBudget(newBudget);
      setIsLoading(false);
    }, 500);
  };

  return {
    budget,
    isLoading,
    initializeBudget,
    calculateSpentAmount,
    getBudgetStatus
  };
}