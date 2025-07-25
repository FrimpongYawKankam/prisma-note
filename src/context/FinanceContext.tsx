// 🏦 PrismaNote Finance Context - New Simplified System
// Global state management for finance module

import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import financeService from '../services/financeService';
import {
  Budget,
  BudgetSummary,
  Category,
  CreateBudgetRequest,
  CreateExpenseRequest,
  Expense,
  FinanceErrorState,
  FinanceLoadingState,
  FinanceState,
  UpdateBudgetRequest,
  UpdateExpenseRequest
} from '../types/finance';

// ===============================
// CONTEXT DEFINITION
// ===============================

interface FinanceContextType extends FinanceState {
  // Budget actions
  createBudget: (budgetData: CreateBudgetRequest) => Promise<Budget>;
  updateBudget: (budgetData: UpdateBudgetRequest) => Promise<Budget>;
  refreshBudget: () => Promise<void>;

  // Expense actions
  addExpense: (expenseData: CreateExpenseRequest) => Promise<Expense>;
  updateExpense: (expenseId: number, expenseData: UpdateExpenseRequest) => Promise<Expense>;
  deleteExpense: (expenseId: number) => Promise<void>;
  refreshExpenses: () => Promise<void>;

  // Summary actions
  refreshSummary: () => Promise<void>;

  // Combined actions
  refreshAllData: () => Promise<void>;
  initializeFinanceData: () => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  setError: (type: keyof FinanceErrorState, error: string) => void;
}

// ===============================
// REDUCER FOR STATE MANAGEMENT
// ===============================

type FinanceAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof FinanceLoadingState; value: boolean } }
  // Error actions
  | { type: 'SET_ERROR'; payload: { key: keyof FinanceErrorState; value: string | null } }
  | { type: 'CLEAR_ERRORS' }
  // Data actions
  | { type: 'SET_BUDGET'; payload: Budget | null }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_SUMMARY'; payload: BudgetSummary | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  // Optimistic updates
  | { type: 'ADD_EXPENSE_OPTIMISTIC'; payload: Expense }
  | { type: 'UPDATE_EXPENSE_OPTIMISTIC'; payload: { id: number; expense: Expense } }
  | { type: 'DELETE_EXPENSE_OPTIMISTIC'; payload: number }
  // Bulk updates
  | { type: 'SET_INITIAL_DATA'; payload: { budget: Budget | null; expenses: Expense[]; summary: BudgetSummary | null; categories: Category[] } };

const initialState: FinanceState = {
  budget: null,
  expenses: [],
  summary: null,
  categories: [],
  loading: {
    budget: false,
    expenses: false,
    summary: false,
    categories: false,
    creatingBudget: false,
    creatingExpense: false,
    updatingBudget: false,
    updatingExpense: false,
    deletingExpense: false,
  },
  errors: {
    budget: null,
    expenses: null,
    summary: null,
    categories: null,
    general: null,
  },
  hasActiveBudget: false,
  isExpenseListEmpty: true,
  topSpendingCategories: [],
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {
          budget: null,
          expenses: null,
          summary: null,
          categories: null,
          general: null,
        },
      };

    case 'SET_BUDGET':
      return {
        ...state,
        budget: action.payload,
        hasActiveBudget: action.payload !== null && action.payload.isActive,
      };

    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload,
        isExpenseListEmpty: action.payload.length === 0,
      };

    case 'SET_SUMMARY':
      return {
        ...state,
        summary: action.payload,
        topSpendingCategories: (action.payload?.categoryBreakdown && Array.isArray(action.payload.categoryBreakdown))
          ? action.payload.categoryBreakdown.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5)
          : [],
      };

    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    case 'ADD_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        isExpenseListEmpty: false,
      };

    case 'UPDATE_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload.expense : expense
        ),
      };

    case 'DELETE_EXPENSE_OPTIMISTIC':
      const filteredExpenses = state.expenses.filter(expense => expense.id !== action.payload);
      return {
        ...state,
        expenses: filteredExpenses,
        isExpenseListEmpty: filteredExpenses.length === 0,
      };

    case 'SET_INITIAL_DATA':
      return {
        ...state,
        budget: action.payload.budget,
        expenses: action.payload.expenses,
        summary: action.payload.summary,
        categories: action.payload.categories,
        hasActiveBudget: action.payload.budget !== null && action.payload.budget.isActive,
        isExpenseListEmpty: action.payload.expenses.length === 0,
        topSpendingCategories: (action.payload.summary?.categoryBreakdown && Array.isArray(action.payload.summary.categoryBreakdown))
          ? action.payload.summary.categoryBreakdown.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5)
          : [],
      };

    default:
      return state;
  }
}

// ===============================
// CONTEXT CREATION
// ===============================

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// ===============================
// PROVIDER COMPONENT
// ===============================

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [initialized, setInitialized] = useState(false);

  // ===============================
  // HELPER FUNCTIONS
  // ===============================

  const setLoading = useCallback((key: keyof FinanceLoadingState, value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((key: keyof FinanceErrorState, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value: error } });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const handleApiError = useCallback((error: any, type: keyof FinanceErrorState) => {
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(type, errorMessage);
    console.error(`Finance ${type} error:`, error);
  }, [setError]);

  // ===============================
  // BUDGET OPERATIONS
  // ===============================

  const createBudget = useCallback(async (budgetData: CreateBudgetRequest): Promise<Budget> => {
    setLoading('creatingBudget', true);
    clearErrors();

    try {
      // Client-side validation
      const validationErrors = financeService.validateBudgetData(budgetData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const newBudget = await financeService.createBudget(budgetData);
      dispatch({ type: 'SET_BUDGET', payload: newBudget });

      // Refresh summary after budget creation
      await refreshSummary();

      return newBudget;
    } catch (error: any) {
      handleApiError(error, 'budget');
      throw error;
    } finally {
      setLoading('creatingBudget', false);
    }
  }, [setLoading, clearErrors, handleApiError]);

  const updateBudget = useCallback(async (budgetData: UpdateBudgetRequest): Promise<Budget> => {
    setLoading('updatingBudget', true);
    clearErrors();

    try {
      const updatedBudget = await financeService.updateBudget(budgetData);
      dispatch({ type: 'SET_BUDGET', payload: updatedBudget });

      // Refresh summary after budget update
      await refreshSummary();

      return updatedBudget;
    } catch (error: any) {
      handleApiError(error, 'budget');
      throw error;
    } finally {
      setLoading('updatingBudget', false);
    }
  }, [setLoading, clearErrors, handleApiError]);

  const refreshBudget = useCallback(async (): Promise<void> => {
    setLoading('budget', true);

    try {
      const budget = await financeService.getCurrentBudget();
      dispatch({ type: 'SET_BUDGET', payload: budget });
    } catch (error: any) {
      handleApiError(error, 'budget');
    } finally {
      setLoading('budget', false);
    }
  }, [setLoading, handleApiError]);

  // ===============================
  // EXPENSE OPERATIONS
  // ===============================

  const addExpense = useCallback(async (expenseData: CreateExpenseRequest): Promise<Expense> => {
    setLoading('creatingExpense', true);
    clearErrors();

    try {
      // Client-side validation
      const validationErrors = financeService.validateExpenseData(expenseData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const newExpense = await financeService.createExpense(expenseData);
      
      // Optimistic update
      dispatch({ type: 'ADD_EXPENSE_OPTIMISTIC', payload: newExpense });

      // Refresh budget and summary data in the background
      setTimeout(async () => {
        try {
          const { budget, summary } = await financeService.refreshBudgetData();
          dispatch({ type: 'SET_BUDGET', payload: budget });
          dispatch({ type: 'SET_SUMMARY', payload: summary });
        } catch (error) {
          console.warn('Failed to refresh budget data after expense creation:', error);
        }
      }, 100);

      return newExpense;
    } catch (error: any) {
      handleApiError(error, 'expenses');
      throw error;
    } finally {
      setLoading('creatingExpense', false);
    }
  }, [setLoading, clearErrors, handleApiError]);

  const updateExpense = useCallback(async (expenseId: number, expenseData: UpdateExpenseRequest): Promise<Expense> => {
    setLoading('updatingExpense', true);
    clearErrors();

    try {
      const updatedExpense = await financeService.updateExpense(expenseId, expenseData);
      
      // Optimistic update
      dispatch({ type: 'UPDATE_EXPENSE_OPTIMISTIC', payload: { id: expenseId, expense: updatedExpense } });

      // Refresh budget and summary data in the background
      setTimeout(async () => {
        try {
          const { budget, summary } = await financeService.refreshBudgetData();
          dispatch({ type: 'SET_BUDGET', payload: budget });
          dispatch({ type: 'SET_SUMMARY', payload: summary });
        } catch (error) {
          console.warn('Failed to refresh budget data after expense update:', error);
        }
      }, 100);

      return updatedExpense;
    } catch (error: any) {
      handleApiError(error, 'expenses');
      throw error;
    } finally {
      setLoading('updatingExpense', false);
    }
  }, [setLoading, clearErrors, handleApiError]);

  const deleteExpense = useCallback(async (expenseId: number): Promise<void> => {
    setLoading('deletingExpense', true);
    clearErrors();

    try {
      await financeService.deleteExpense(expenseId);
      
      // Optimistic update
      dispatch({ type: 'DELETE_EXPENSE_OPTIMISTIC', payload: expenseId });

      // Refresh budget and summary data in the background
      setTimeout(async () => {
        try {
          const { budget, summary } = await financeService.refreshBudgetData();
          dispatch({ type: 'SET_BUDGET', payload: budget });
          dispatch({ type: 'SET_SUMMARY', payload: summary });
        } catch (error) {
          console.warn('Failed to refresh budget data after expense deletion:', error);
        }
      }, 100);

    } catch (error: any) {
      handleApiError(error, 'expenses');
      throw error;
    } finally {
      setLoading('deletingExpense', false);
    }
  }, [setLoading, clearErrors, handleApiError]);

  const refreshExpenses = useCallback(async (): Promise<void> => {
    setLoading('expenses', true);

    try {
      const expenses = await financeService.getExpenses();
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
    } catch (error: any) {
      handleApiError(error, 'expenses');
    } finally {
      setLoading('expenses', false);
    }
  }, [setLoading, handleApiError]);

  // ===============================
  // SUMMARY OPERATIONS
  // ===============================

  const refreshSummary = useCallback(async (): Promise<void> => {
    setLoading('summary', true);

    try {
      const summary = await financeService.getBudgetSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });
    } catch (error: any) {
      handleApiError(error, 'summary');
    } finally {
      setLoading('summary', false);
    }
  }, [setLoading, handleApiError]);

  // ===============================
  // COMBINED OPERATIONS
  // ===============================

  const refreshAllData = useCallback(async (): Promise<void> => {
    setLoading('budget', true);
    setLoading('expenses', true);
    setLoading('summary', true);
    clearErrors();

    try {
      const { budget, expenses, summary } = await financeService.getFinanceOverview();
      
      // Update all data at once
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: {
          budget,
          expenses,
          summary,
          categories: state.categories, // Keep existing categories
        },
      });
    } catch (error: any) {
      handleApiError(error, 'general');
    } finally {
      setLoading('budget', false);
      setLoading('expenses', false);
      setLoading('summary', false);
    }
  }, [setLoading, clearErrors, handleApiError, state.categories]);

  const initializeFinanceData = useCallback(async (): Promise<void> => {
    if (initialized) return;

    setLoading('budget', true);
    setLoading('expenses', true);
    setLoading('summary', true);
    setLoading('categories', true);

    try {
      const { budget, expenses, summary, categories } = await financeService.getFinanceOverview();
      
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: { budget, expenses, summary, categories },
      });

      setInitialized(true);
    } catch (error: any) {
      handleApiError(error, 'general');
    } finally {
      setLoading('budget', false);
      setLoading('expenses', false);
      setLoading('summary', false);
      setLoading('categories', false);
    }
  }, [initialized, setLoading, handleApiError]);

  // ===============================
  // INITIALIZATION EFFECT
  // ===============================

  useEffect(() => {
    initializeFinanceData();
  }, [initializeFinanceData]);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue: FinanceContextType = {
    // State
    ...state,

    // Budget actions
    createBudget,
    updateBudget,
    refreshBudget,

    // Expense actions
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses,

    // Summary actions
    refreshSummary,

    // Combined actions
    refreshAllData,
    initializeFinanceData,

    // Utility actions
    clearErrors,
    setError,
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

// ===============================
// HOOK FOR CONSUMING CONTEXT
// ===============================

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// ===============================
// ADDITIONAL HOOKS
// ===============================

/**
 * Hook for budget-specific operations
 */
export const useBudget = () => {
  const { budget, loading, errors, createBudget, updateBudget, refreshBudget } = useFinance();
  
  return {
    budget,
    isLoading: loading.budget || loading.creatingBudget || loading.updatingBudget,
    error: errors.budget,
    createBudget,
    updateBudget,
    refreshBudget,
    hasActiveBudget: budget !== null && budget.isActive,
  };
};

/**
 * Hook for expense-specific operations
 */
export const useExpenses = () => {
  const { 
    expenses, 
    loading, 
    errors, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    refreshExpenses,
    isExpenseListEmpty,
  } = useFinance();
  
  return {
    expenses,
    isEmpty: isExpenseListEmpty,
    isLoading: loading.expenses || loading.creatingExpense || loading.updatingExpense || loading.deletingExpense,
    error: errors.expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses,
  };
};

/**
 * Hook for summary and analytics
 */
export const useBudgetSummary = () => {
  const { 
    summary, 
    topSpendingCategories, 
    loading, 
    errors, 
    refreshSummary,
  } = useFinance();
  
  return {
    summary,
    topSpendingCategories,
    isLoading: loading.summary,
    error: errors.summary,
    refreshSummary,
    hasData: summary !== null,
  };
};

/**
 * Hook for categories
 */
export const useCategories = () => {
  const { categories, loading, errors } = useFinance();
  
  return {
    categories,
    isLoading: loading.categories,
    error: errors.categories,
    getCategoryById: (id: number) => categories.find(cat => cat.id === id),
    getCategoryByName: (name: string) => categories.find(cat => cat.name.toLowerCase() === name.toLowerCase()),
  };
};
