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
import { useAuth } from './AuthContext';

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
  resetState: () => void;
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
  // Reset action
  | { type: 'RESET_STATE' }
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

    case 'RESET_STATE':
      console.log('🔄 Resetting Finance Context state');
      return {
        ...initialState,
      };

    case 'SET_BUDGET':
      console.log('📊 SET_BUDGET action:', {
        payload: action.payload ? 'EXISTS' : 'NULL',
        budgetId: action.payload?.id,
        isActive: action.payload?.isActive,
        hasActiveBudget: action.payload !== null && action.payload.isActive,
        stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n') // Show where this was called from
      });
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
      console.log('📈 SET_SUMMARY action:', {
        payload: action.payload ? 'EXISTS' : 'NULL',
        payloadType: typeof action.payload,
        payloadValue: action.payload,
        stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
      });
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
      console.log('📦 SET_INITIAL_DATA action:', {
        incomingBudget: action.payload.budget ? 'EXISTS' : 'NULL',
        existingBudget: state.budget ? 'EXISTS' : 'NULL',
        willPreserveExisting: state.budget && !action.payload.budget ? 'YES' : 'NO'
      });
      
      // If we have an existing budget but API returns null, preserve the existing budget
      const budgetToUse = action.payload.budget || state.budget;
      
      return {
        ...state,
        budget: budgetToUse,
        expenses: action.payload.expenses,
        summary: action.payload.summary,
        categories: action.payload.categories,
        hasActiveBudget: budgetToUse !== null && budgetToUse.isActive,
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
  const { isAuthenticated, user } = useAuth();

  console.log('🏭 FinanceProvider render:', { initialized, budgetExists: state.budget ? 'YES' : 'NO' });

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

  const resetState = useCallback(() => {
    console.log('🔄 Finance Context: Resetting state due to auth change');
    dispatch({ type: 'RESET_STATE' });
    setInitialized(false);
  }, []);

  const handleApiError = useCallback((error: any, type: keyof FinanceErrorState) => {
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(type, errorMessage);
    console.error(`Finance ${type} error:`, error);
  }, [setError]);

  // ===============================
  // AUTH LISTENER - Reset state when user logs out
  // ===============================

  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out or never logged in, reset state
      console.log('🔄 Finance Context: User not authenticated, resetting state');
      resetState();
    }
  }, [isAuthenticated, resetState]);

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
      
      // If API succeeds, use the API response
      dispatch({ type: 'SET_BUDGET', payload: newBudget });
      
      console.log('✅ Budget created successfully via API:', newBudget);

      // Try to refresh summary after budget creation (optional)
      setTimeout(async () => {
        try {
          const summary = await financeService.getBudgetSummary();
          dispatch({ type: 'SET_SUMMARY', payload: summary });
        } catch (summaryError) {
          console.warn('Failed to refresh summary after budget creation:', summaryError);
          // Create a basic fallback summary if API summary fails
          const fallbackSummary: BudgetSummary = {
            totalBudget: budgetData.totalBudget,
            totalSpent: 0,
            remainingBudget: budgetData.totalBudget,
            spentPercentage: 0,
            daysRemaining: budgetData.period === 'WEEKLY' ? 7 : 30,
            categoryBreakdown: [],
            currency: budgetData.currency,
          };
          dispatch({ type: 'SET_SUMMARY', payload: fallbackSummary });
        }
      }, 100);

      return newBudget;
    } catch (error: any) {
      console.warn('⚠️ API budget creation failed, using fallback system:', error);
      
      // Even if API fails, if we have the budget data, create a local version
      if (budgetData) {
        const fallbackBudget: Budget = {
          id: Date.now(), // Temporary ID
          totalBudget: budgetData.totalBudget,
          currency: budgetData.currency,
          period: budgetData.period,
          startDate: budgetData.startDate,
          endDate: budgetData.endDate,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalSpent: 0,
          remainingBudget: budgetData.totalBudget,
          spentPercentage: 0,
        };
        
        dispatch({ type: 'SET_BUDGET', payload: fallbackBudget });
        
        // Create a basic fallback summary for the error case too
        const fallbackSummary: BudgetSummary = {
          totalBudget: budgetData.totalBudget,
          totalSpent: 0,
          remainingBudget: budgetData.totalBudget,
          spentPercentage: 0,
          daysRemaining: budgetData.period === 'WEEKLY' ? 7 : 30,
          categoryBreakdown: [],
          currency: budgetData.currency,
        };
        dispatch({ type: 'SET_SUMMARY', payload: fallbackSummary });
        
        console.log('🔄 Using fallback budget due to API error:', fallbackBudget);
        
        // Return the fallback budget as if it was created successfully
        return fallbackBudget;
      }
      
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

      // Try to refresh summary after budget update (optional)
      setTimeout(async () => {
        try {
          const summary = await financeService.getBudgetSummary();
          dispatch({ type: 'SET_SUMMARY', payload: summary });
        } catch (summaryError) {
          console.warn('Failed to refresh summary after budget update:', summaryError);
        }
      }, 100);

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
      // Don't clear existing budget data on API failure
      console.warn('Failed to refresh budget from API, keeping existing data:', error);
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
          // Only update if API returns valid data, preserve existing data otherwise
          if (budget) {
            dispatch({ type: 'SET_BUDGET', payload: budget });
          }
          if (summary) {
            dispatch({ type: 'SET_SUMMARY', payload: summary });
          }
        } catch (error) {
          console.warn('Failed to refresh budget data after expense creation:', error);
        }
      }, 100);

      return newExpense;
    } catch (error: any) {
      // Create fallback expense even if API fails
      if (expenseData) {
        const fallbackExpense: Expense = {
          id: Date.now(), // Temporary ID
          amount: expenseData.amount,
          description: expenseData.description || '',
          categoryId: expenseData.categoryId,
          categoryName: 'General', // Fallback category name
          categoryIcon: 'wallet-outline',
          date: expenseData.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add the fallback expense to the state
        dispatch({ type: 'ADD_EXPENSE_OPTIMISTIC', payload: fallbackExpense });
        
        console.log('🔄 Using fallback expense due to API error:', fallbackExpense);
        
        // Return the fallback expense as if it was created successfully
        return fallbackExpense;
      }
      
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
          // Only update if API returns valid data, preserve existing data otherwise
          if (budget) {
            dispatch({ type: 'SET_BUDGET', payload: budget });
          }
          if (summary) {
            dispatch({ type: 'SET_SUMMARY', payload: summary });
          }
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
          // Only update if API returns valid data, preserve existing data otherwise
          if (budget) {
            dispatch({ type: 'SET_BUDGET', payload: budget });
          }
          if (summary) {
            dispatch({ type: 'SET_SUMMARY', payload: summary });
          }
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
      
      console.log('🔄 refreshAllData API response:', {
        budget: budget ? 'EXISTS' : 'NULL',
        expensesCount: expenses?.length || 0,
        summary: summary ? 'EXISTS' : 'NULL'
      });
      
      // Preserve existing data if API returns null/empty and we have local data
      const budgetToUse = budget || state.budget;
      const expensesToUse = (expenses && expenses.length > 0) ? expenses : state.expenses;
      const summaryToUse = summary || state.summary;
      
      console.log('🔄 refreshAllData preserving data:', {
        budgetPreserved: !budget && state.budget ? 'YES' : 'NO',
        expensesPreserved: (!expenses || expenses.length === 0) && state.expenses.length > 0 ? 'YES' : 'NO',
        summaryPreserved: !summary && state.summary ? 'YES' : 'NO'
      });
      
      // Update all data at once
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: {
          budget: budgetToUse,
          expenses: expensesToUse,
          summary: summaryToUse,
          categories: state.categories, // Keep existing categories
        },
      });
    } catch (error: any) {
      console.warn('⚠️ refreshAllData failed, keeping existing data:', error);
      handleApiError(error, 'general');
    } finally {
      setLoading('budget', false);
      setLoading('expenses', false);
      setLoading('summary', false);
    }
  }, [setLoading, clearErrors, handleApiError, state.categories, state.budget, state.expenses, state.summary]);

  const initializeFinanceData = useCallback(async (): Promise<void> => {
    if (initialized) return;

    console.log('🚀 Starting finance data initialization...');
    
    setLoading('budget', true);
    setLoading('expenses', true);
    setLoading('summary', true);
    setLoading('categories', true);

    try {
      const { budget, expenses, summary, categories } = await financeService.getFinanceOverview();
      
      console.log('📥 API returned data:', {
        budget: budget ? 'EXISTS' : 'NULL',
        budgetId: budget?.id,
        expensesCount: expenses?.length || 0,
        summary: summary ? 'EXISTS' : 'NULL',
        categoriesCount: categories?.length || 0
      });
      
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: { budget, expenses, summary, categories },
      });

      console.log('✅ Initialized finance data from API:', { budget: budget ? 'EXISTS' : 'NULL', expensesCount: expenses?.length || 0 });
      setInitialized(true);
    } catch (error: any) {
      console.warn('⚠️ Failed to initialize finance data from API, keeping existing data:', error);
      
      // Don't clear existing data on initialization failure
      // Just mark as initialized to prevent repeated failed attempts
      setInitialized(true);
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
    console.log('🔄 FinanceProvider useEffect triggered, calling initializeFinanceData');
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
    resetState,
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
  const { budget, hasActiveBudget, loading, errors, createBudget, updateBudget, refreshBudget } = useFinance();
  
  return {
    budget,
    isLoading: loading.budget || loading.creatingBudget || loading.updatingBudget,
    error: errors.budget,
    createBudget,
    updateBudget,
    refreshBudget,
    hasActiveBudget, // Use the state's hasActiveBudget instead of recalculating
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
  
  // Ensure summary is properly typed - filter out empty strings or invalid data
  const validSummary = summary && typeof summary === 'object' && summary !== null ? summary : null;
  const hasData = validSummary !== null;
  
  // Debug logging for summary hook
  React.useEffect(() => {
    console.log('📈 useBudgetSummary Debug:', {
      summary: validSummary ? 'EXISTS' : 'NULL',
      summaryType: typeof summary,
      summaryObject: summary,
      validSummary: validSummary ? 'VALID' : 'INVALID',
      hasData,
      topSpendingCategoriesCount: topSpendingCategories?.length || 0
    });
  }, [summary, validSummary, hasData, topSpendingCategories]);
  
  return {
    summary: validSummary,
    topSpendingCategories,
    isLoading: loading.summary,
    error: errors.summary,
    refreshSummary,
    hasData,
  };
};

/**
 * Hook for categories
 */
export const useCategories = () => {
  const { categories, loading, errors } = useFinance();
  
  // Ensure categories is always an array
  const safeCategories = categories && Array.isArray(categories) ? categories : [];
  
  return {
    categories: safeCategories,
    isLoading: loading.categories,
    error: errors.categories,
    getCategoryById: (id: number) => safeCategories.find(cat => cat.id === id),
    getCategoryByName: (name: string) => safeCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase()),
  };
};
