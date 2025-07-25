import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import financeService, {
    BudgetCreateRequest,
    BudgetResponse,
    BudgetUpdateRequest,
    CategoryCreateRequest,
    CategoryResponse,
    ExpenseCreateRequest,
    ExpenseResponse,
    ExpenseUpdateRequest,
    UserCategoryRequest,
    UserCategoryResponse
} from '../services/financeService';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  // Budget State
  budgets: BudgetResponse[];
  currentBudget: BudgetResponse | null;
  budgetsLoading: boolean;
  budgetsError: string | null;

  // Category State
  categories: CategoryResponse[];
  userCategories: UserCategoryResponse[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Expense State
  expenses: ExpenseResponse[];
  expensesLoading: boolean;
  expensesError: string | null;

  // Analytics State
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Budget Operations
  createBudget: (budgetData: BudgetCreateRequest) => Promise<BudgetResponse>;
  updateBudget: (budgetId: number, budgetData: BudgetUpdateRequest) => Promise<BudgetResponse>;
  deleteBudget: (budgetId: number) => Promise<void>;
  refreshBudgets: () => Promise<void>;
  setCurrentBudget: (budget: BudgetResponse | null) => void;

  // Category Operations
  createCategory: (categoryData: CategoryCreateRequest) => Promise<CategoryResponse>;
  updateCategory: (categoryId: number, categoryData: Partial<CategoryCreateRequest>) => Promise<CategoryResponse>;
  deleteCategory: (categoryId: number) => Promise<void>;
  assignCategoryToUser: (userCategoryData: UserCategoryRequest) => Promise<UserCategoryResponse>;
  removeUserCategory: (userCategoryId: number) => Promise<void>;
  refreshCategories: () => Promise<void>;

  // Expense Operations
  createExpense: (expenseData: ExpenseCreateRequest) => Promise<ExpenseResponse>;
  updateExpense: (expenseId: number, expenseData: ExpenseUpdateRequest) => Promise<ExpenseResponse>;
  deleteExpense: (expenseId: number) => Promise<void>;
  getExpensesByCategory: (categoryId: number) => Promise<ExpenseResponse[]>;
  getExpensesByDateRange: (startDate: string, endDate: string) => Promise<ExpenseResponse[]>;
  searchExpenses: (query: string) => Promise<ExpenseResponse[]>;
  refreshExpenses: () => Promise<void>;

  // Analytics Operations
  getSpendingTrends: (period: 'day' | 'week' | 'month', startDate?: string, endDate?: string) => Promise<any[]>;
  getCategoryBreakdown: (startDate?: string, endDate?: string) => Promise<any[]>;
  getMonthlySpending: (year: number, month: number) => Promise<any>;
  getTotalSpending: (startDate?: string, endDate?: string) => Promise<{ totalAmount: number }>;
  getBudgetAnalytics: (budgetId: number, startDate: string, endDate: string) => Promise<any>;
  getBudgetSummary: (budgetId: number) => Promise<any>;
  getBudgetWarnings: (budgetId: number) => Promise<string[]>;
  getBudgetSpendingTrends: (budgetId: number, months?: number) => Promise<any>;
  getBudgetTopCategories: (budgetId: number, limit?: number) => Promise<any[]>;
  getDefaultCategories: () => Promise<CategoryResponse[]>;

  // Utility Operations
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Budget State
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [currentBudget, setCurrentBudgetState] = useState<BudgetResponse | null>(null);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);

  // Category State
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Expense State
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  // Analytics State
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      // Clear data when not authenticated
      setBudgets([]);
      setCurrentBudgetState(null);
      setCategories([]);
      setUserCategories([]);
      setExpenses([]);
    }
  }, [isAuthenticated]);

  // Budget Operations
  const loadBudgets = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setBudgetsLoading(true);
      setBudgetsError(null);

      const [budgetsData, currentBudgetData] = await Promise.all([
        financeService.getBudgets(),
        financeService.getCurrentBudget()
      ]);

      setBudgets(budgetsData);
      setCurrentBudgetState(currentBudgetData);
    } catch (error: any) {
      console.error('Failed to load budgets:', error);
      // Don't set error for 403 cases - just means finance endpoints don't exist yet
      if (error.response?.status !== 403) {
        setBudgetsError(error.response?.data?.message || error.message || 'Failed to load budgets');
      }
    } finally {
      setBudgetsLoading(false);
    }
  }, [isAuthenticated]);

  const createBudget = useCallback(async (budgetData: BudgetCreateRequest): Promise<BudgetResponse> => {
    try {
      setBudgetsLoading(true);
      setBudgetsError(null);

      const newBudget = await financeService.createBudget(budgetData);
      
      // Update local state
      setBudgets(prev => [newBudget, ...prev]);
      
      // If this is the only budget or is current, set as current
      if (budgets.length === 0 || isCurrentPeriod(newBudget)) {
        setCurrentBudgetState(newBudget);
      }

      return newBudget;
    } catch (error: any) {
      console.error('Failed to create budget:', error);
      setBudgetsError(error.message || 'Failed to create budget');
      throw error;
    } finally {
      setBudgetsLoading(false);
    }
  }, [budgets.length]);

  const updateBudget = useCallback(async (budgetId: number, budgetData: BudgetUpdateRequest): Promise<BudgetResponse> => {
    try {
      setBudgetsLoading(true);
      setBudgetsError(null);

      const updatedBudget = await financeService.updateBudget(budgetId, budgetData);
      
      // Update local state
      setBudgets(prev => prev.map(budget => 
        budget.id === budgetId ? updatedBudget : budget
      ));

      // Update current budget if it's the one being updated
      if (currentBudget?.id === budgetId) {
        setCurrentBudgetState(updatedBudget);
      }

      return updatedBudget;
    } catch (error: any) {
      console.error('Failed to update budget:', error);
      setBudgetsError(error.message || 'Failed to update budget');
      throw error;
    } finally {
      setBudgetsLoading(false);
    }
  }, [currentBudget?.id]);

  const deleteBudget = useCallback(async (budgetId: number): Promise<void> => {
    try {
      setBudgetsLoading(true);
      setBudgetsError(null);

      await financeService.deleteBudget(budgetId);
      
      // Update local state
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));

      // Clear current budget if it's the one being deleted
      if (currentBudget?.id === budgetId) {
        setCurrentBudgetState(null);
      }
    } catch (error: any) {
      console.error('Failed to delete budget:', error);
      setBudgetsError(error.message || 'Failed to delete budget');
      throw error;
    } finally {
      setBudgetsLoading(false);
    }
  }, [currentBudget?.id]);

  const refreshBudgets = useCallback(async () => {
    await loadBudgets();
  }, [loadBudgets]);

  const setCurrentBudget = useCallback((budget: BudgetResponse | null) => {
    setCurrentBudgetState(budget);
  }, []);

  // Category Operations
  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const [categoriesData, userCategoriesData] = await Promise.all([
        financeService.getCategories(),
        financeService.getUserCategories()
      ]);

      // Ensure we always have arrays
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setUserCategories(Array.isArray(userCategoriesData) ? userCategoriesData : []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      // Don't set error for 403 cases - just means finance endpoints don't exist yet
      if (error.response?.status !== 403) {
        setCategoriesError(error.response?.data?.message || error.message || 'Failed to load categories');
      }
      // Always ensure we have empty arrays as fallback
      setCategories([]);
      setUserCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [isAuthenticated]);

  const createCategory = useCallback(async (categoryData: CategoryCreateRequest): Promise<CategoryResponse> => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const newCategory = await financeService.createCategory(categoryData);
      
      // Update local state
      setCategories(prev => [newCategory, ...prev]);

      return newCategory;
    } catch (error: any) {
      console.error('Failed to create category:', error);
      setCategoriesError(error.message || 'Failed to create category');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId: number, categoryData: Partial<CategoryCreateRequest>): Promise<CategoryResponse> => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const updatedCategory = await financeService.updateCategory(categoryId, categoryData);
      
      // Update local state
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updatedCategory : category
      ));

      return updatedCategory;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      setCategoriesError(error.message || 'Failed to update category');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: number): Promise<void> => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      await financeService.deleteCategory(categoryId);
      
      // Update local state
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      setUserCategories(prev => prev.filter(userCat => userCat.categoryId !== categoryId));
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      setCategoriesError(error.message || 'Failed to delete category');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const assignCategoryToUser = useCallback(async (userCategoryData: UserCategoryRequest): Promise<UserCategoryResponse> => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const userCategory = await financeService.assignCategoryToUser(userCategoryData);
      
      // Update local state
      setUserCategories(prev => [userCategory, ...prev]);

      return userCategory;
    } catch (error: any) {
      console.error('Failed to assign category to user:', error);
      setCategoriesError(error.message || 'Failed to assign category to user');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const removeUserCategory = useCallback(async (userCategoryId: number): Promise<void> => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      await financeService.removeUserCategory(userCategoryId);
      
      // Update local state
      setUserCategories(prev => prev.filter(userCat => userCat.id !== userCategoryId));
    } catch (error: any) {
      console.error('Failed to remove user category:', error);
      setCategoriesError(error.message || 'Failed to remove user category');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  // Expense Operations
  const loadExpenses = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setExpensesLoading(true);
      setExpensesError(null);

      const expensesData = await financeService.getExpenses();
      // Ensure we always have an array
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (error: any) {
      console.error('Failed to load expenses:', error);
      // Don't set error for 403 cases - just means finance endpoints don't exist yet
      if (error.response?.status !== 403) {
        setExpensesError(error.message || 'Failed to load expenses');
      }
      // Always ensure we have an empty array as fallback
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, [isAuthenticated]);

  const createExpense = useCallback(async (expenseData: ExpenseCreateRequest): Promise<ExpenseResponse> => {
    try {
      setExpensesLoading(true);
      setExpensesError(null);

      const newExpense = await financeService.createExpense(expenseData);
      
      // Update local state with optimistic update
      setExpenses(prev => [newExpense, ...prev]);

      return newExpense;
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      setExpensesError(error.message || 'Failed to create expense');
      throw error;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const updateExpense = useCallback(async (expenseId: number, expenseData: ExpenseUpdateRequest): Promise<ExpenseResponse> => {
    try {
      setExpensesLoading(true);
      setExpensesError(null);

      const updatedExpense = await financeService.updateExpense(expenseId, expenseData);
      
      // Update local state
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? updatedExpense : expense
      ));

      return updatedExpense;
    } catch (error: any) {
      console.error('Failed to update expense:', error);
      setExpensesError(error.message || 'Failed to update expense');
      throw error;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (expenseId: number): Promise<void> => {
    try {
      setExpensesLoading(true);
      setExpensesError(null);

      await financeService.deleteExpense(expenseId);
      
      // Update local state
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      setExpensesError(error.message || 'Failed to delete expense');
      throw error;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const getExpensesByCategory = useCallback(async (categoryId: number): Promise<ExpenseResponse[]> => {
    try {
      setExpensesError(null);
      return await financeService.getExpensesByCategory(categoryId);
    } catch (error: any) {
      console.error('Failed to get expenses by category:', error);
      setExpensesError(error.message || 'Failed to get expenses by category');
      throw error;
    }
  }, []);

  const getExpensesByDateRange = useCallback(async (startDate: string, endDate: string): Promise<ExpenseResponse[]> => {
    try {
      setExpensesError(null);
      return await financeService.getExpensesByDateRange(startDate, endDate);
    } catch (error: any) {
      console.error('Failed to get expenses by date range:', error);
      setExpensesError(error.message || 'Failed to get expenses by date range');
      throw error;
    }
  }, []);

  const searchExpenses = useCallback(async (query: string): Promise<ExpenseResponse[]> => {
    try {
      setExpensesError(null);
      return await financeService.searchExpenses(query);
    } catch (error: any) {
      console.error('Failed to search expenses:', error);
      setExpensesError(error.message || 'Failed to search expenses');
      throw error;
    }
  }, []);

  const refreshExpenses = useCallback(async () => {
    await loadExpenses();
  }, [loadExpenses]);

  // Analytics Operations
  const getSpendingTrends = useCallback(async (period: 'day' | 'week' | 'month', startDate?: string, endDate?: string) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getSpendingTrends(period, startDate, endDate);
    } catch (error: any) {
      console.error('Failed to get spending trends:', error);
      setAnalyticsError(error.message || 'Failed to get spending trends');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getCategoryBreakdown = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getCategoryBreakdown(startDate, endDate);
    } catch (error: any) {
      console.error('Failed to get category breakdown:', error);
      setAnalyticsError(error.message || 'Failed to get category breakdown');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getMonthlySpending = useCallback(async (year: number, month: number) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      // Calculate start and end dates for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const expensesData = await financeService.getExpensesByDateRange(startDate, endDate);
      const totalAmount = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Group by categories
      const categoryBreakdown = expensesData.reduce((acc: any[], expense) => {
        const existing = acc.find(item => item.categoryId === expense.categoryId);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({
            categoryId: expense.categoryId,
            categoryName: expense.categoryName || 'Unknown',
            amount: expense.amount
          });
        }
        return acc;
      }, []);
      
      return {
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        totalAmount,
        categoryBreakdown
      };
    } catch (error: any) {
      console.error('Failed to get monthly spending:', error);
      setAnalyticsError(error.message || 'Failed to get monthly spending');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getTotalSpending = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      // Note: This method doesn't exist in financeService, implementing basic logic
      const expensesData = await financeService.getExpensesByDateRange(startDate || '', endDate || '');
      const totalAmount = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      return { totalAmount };
    } catch (error: any) {
      console.error('Failed to get total spending:', error);
      setAnalyticsError(error.message || 'Failed to get total spending');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getBudgetAnalytics = useCallback(async (budgetId: number, startDate: string, endDate: string) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getBudgetAnalytics(budgetId, startDate, endDate);
    } catch (error: any) {
      console.error('Failed to get budget analytics:', error);
      setAnalyticsError(error.message || 'Failed to get budget analytics');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getBudgetSummary = useCallback(async (budgetId: number) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getBudgetSummary(budgetId);
    } catch (error: any) {
      console.error('Failed to get budget summary:', error);
      setAnalyticsError(error.message || 'Failed to get budget summary');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getBudgetWarnings = useCallback(async (budgetId: number) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getBudgetWarnings(budgetId);
    } catch (error: any) {
      console.error('Failed to get budget warnings:', error);
      setAnalyticsError(error.message || 'Failed to get budget warnings');
      // Return empty array instead of throwing for warnings
      return [];
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getBudgetSpendingTrends = useCallback(async (budgetId: number, months: number = 6) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getBudgetSpendingTrends(budgetId, months);
    } catch (error: any) {
      console.error('Failed to get budget spending trends:', error);
      setAnalyticsError(error.message || 'Failed to get budget spending trends');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getBudgetTopCategories = useCallback(async (budgetId: number, limit: number = 5) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      return await financeService.getBudgetTopCategories(budgetId, limit);
    } catch (error: any) {
      console.error('Failed to get budget top categories:', error);
      setAnalyticsError(error.message || 'Failed to get budget top categories');
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const getDefaultCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      return await financeService.getDefaultCategories();
    } catch (error: any) {
      console.error('Failed to get default categories:', error);
      setCategoriesError(error.message || 'Failed to get default categories');
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Utility Operations
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadBudgets(),
      loadCategories(),
      loadExpenses()
    ]);
  }, [loadBudgets, loadCategories, loadExpenses]);

  const clearErrors = useCallback(() => {
    setBudgetsError(null);
    setCategoriesError(null);
    setExpensesError(null);
    setAnalyticsError(null);
  }, []);

  // Helper function to determine if a budget is for the current period
  const isCurrentPeriod = (budget: BudgetResponse): boolean => {
    const now = new Date();
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);
    return now >= budgetStart && now <= budgetEnd;
  };

  const contextValue: FinanceContextType = {
    // Budget State
    budgets,
    currentBudget,
    budgetsLoading,
    budgetsError,

    // Category State
    categories,
    userCategories,
    categoriesLoading,
    categoriesError,

    // Expense State
    expenses,
    expensesLoading,
    expensesError,

    // Analytics State
    analyticsLoading,
    analyticsError,

    // Budget Operations
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
    setCurrentBudget,

    // Category Operations
    createCategory,
    updateCategory,
    deleteCategory,
    assignCategoryToUser,
    removeUserCategory,
    refreshCategories,

    // Expense Operations
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesByDateRange,
    searchExpenses,
    refreshExpenses,

    // Analytics Operations
    getSpendingTrends,
    getCategoryBreakdown,
    getMonthlySpending,
    getTotalSpending,
    getBudgetAnalytics,
    getBudgetSummary,
    getBudgetWarnings,
    getBudgetSpendingTrends,
    getBudgetTopCategories,
    getDefaultCategories,

    // Utility Operations
    refreshAll,
    clearErrors
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
