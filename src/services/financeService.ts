import axiosInstance from '../utils/axiosInstance';

// Request DTOs matching backend exactly
export interface BudgetCreateRequest {
  totalBudget: number;  // Backend: BigDecimal (will be converted)
  currency: string;     // Backend: String (3 chars, uppercase)
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';  // Backend: BudgetPeriod enum (NO QUARTERLY!)
  startDate: string;    // Backend: LocalDate (YYYY-MM-DD format)
  endDate: string;      // Backend: LocalDate (YYYY-MM-DD format)
}

export interface BudgetUpdateRequest {
  totalBudget?: number;  // Backend: BigDecimal
  currency?: string;     // Backend: String (3 chars, uppercase)
  period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';  // Backend: BudgetPeriod enum (NO QUARTERLY!)
  startDate?: string;    // Backend: LocalDate (YYYY-MM-DD format)
  endDate?: string;      // Backend: LocalDate (YYYY-MM-DD format)
}

export interface CategoryCreateRequest {
  name: string;    // Backend: String (1-100 chars, specific pattern)
  icon?: string;   // Backend: String (max 50 chars, optional)
}

export interface ExpenseCreateRequest {
  categoryId: number;   // Backend: Long (required, positive)
  budgetId: number;     // Backend: Long (required, positive)
  amount: number;       // Backend: BigDecimal (required, > 0)
  description?: string; // Backend: String (max 500 chars, optional)
  date: string;         // Backend: LocalDate (required, PastOrPresent)
}

export interface ExpenseUpdateRequest {
  categoryId?: number;   // Backend: Long
  budgetId?: number;     // Backend: Long  
  amount?: number;       // Backend: BigDecimal
  description?: string;  // Backend: String (max 500 chars)
  date?: string;         // Backend: LocalDate (PastOrPresent)
}

export interface UserCategoryRequest {
  categoryId: number;      // Backend: Long (required, positive)
  budgetId: number;        // Backend: Long (required, positive)
  allocatedBudget: number; // Backend: BigDecimal (required, > 0)
  isActive?: boolean;      // Backend: Boolean (optional)
}

// Response DTOs matching backend exactly
export interface BudgetResponse {
  id: number;              // Backend: Long
  userId: number;          // Backend: Long
  totalBudget: number;     // Backend: BigDecimal
  currency: string;        // Backend: String
  period: string;          // Backend: BudgetPeriod enum
  startDate: string;       // Backend: LocalDate
  endDate: string;         // Backend: LocalDate
  isActive: boolean;       // Backend: Boolean
  createdAt: string;       // Backend: LocalDateTime
  updatedAt: string;       // Backend: LocalDateTime
  // Additional calculated fields
  totalSpent: number;      // Backend: BigDecimal
  remainingBudget: number; // Backend: BigDecimal
  spentPercentage: number; // Backend: Double
}

export interface CategoryResponse {
  id: number;              // Backend: Long
  name: string;            // Backend: String
  icon: string;            // Backend: String
  isDefault: boolean;      // Backend: Boolean
  isActive: boolean;       // Backend: Boolean
  createdByUserId: number | null; // Backend: Long (nullable)
  createdAt: string;       // Backend: LocalDateTime
  updatedAt: string;       // Backend: LocalDateTime
}

export interface ExpenseResponse {
  id: number;              // Backend: Long
  userId: number;          // Backend: Long
  categoryId: number;      // Backend: Long
  budgetId: number;        // Backend: Long
  amount: number;          // Backend: BigDecimal
  description: string;     // Backend: String
  date: string;            // Backend: LocalDate
  createdAt: string;       // Backend: LocalDateTime
  updatedAt: string;       // Backend: LocalDateTime
  // Additional response fields
  categoryName: string;    // Backend: String
  categoryIcon: string;    // Backend: String
}

export interface UserCategoryResponse {
  id: number;              // Backend: Long
  userId: number;          // Backend: Long  
  categoryId: number;      // Backend: Long
  budgetId: number;        // Backend: Long
  allocatedBudget: number; // Backend: BigDecimal
  isActive: boolean;       // Backend: Boolean
  createdAt: string;       // Backend: LocalDateTime
  updatedAt: string;       // Backend: LocalDateTime
  // Additional response fields
  categoryName: string;    // Backend: String
  categoryIcon: string;    // Backend: String
}

export interface SpendingTrendResponse {
  date: string;
  totalAmount: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    amount: number;
  }[];
}

export interface CategoryBreakdownResponse {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlySpendingResponse {
  month: string;
  totalAmount: number;
  budgetAmount?: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    amount: number;
  }[];
}

class FinanceService {
  // Budget Operations
  async getBudgets(): Promise<BudgetResponse[]> {
    try {
      const response = await axiosInstance.get('/api/budgets');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return []; // Endpoints don't exist yet, return empty array
      }
      console.error('Failed to fetch budgets:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }

  async getBudgetById(budgetId: number): Promise<BudgetResponse> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget');
    }
  }

  async createBudget(budgetData: BudgetCreateRequest): Promise<BudgetResponse> {
    try {
      const response = await axiosInstance.post('/api/budgets', budgetData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to create budget');
    }
  }

  async updateBudget(budgetId: number, budgetData: BudgetUpdateRequest): Promise<BudgetResponse> {
    try {
      const response = await axiosInstance.put(`/api/budgets/${budgetId}`, budgetData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to update budget');
    }
  }

  async deleteBudget(budgetId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/budgets/${budgetId}`);
    } catch (error: any) {
      console.error('Failed to delete budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete budget');
    }
  }

  async getCurrentBudget(): Promise<BudgetResponse | null> {
    try {
      const response = await axiosInstance.get('/api/budgets/current');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        return null; // No current budget found or endpoints don't exist yet
      }
      console.error('Failed to fetch current budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch current budget');
    }
  }

  async getBudgetsByDateRange(startDate: string, endDate: string): Promise<BudgetResponse[]> {
    try {
      const response = await axiosInstance.get('/api/budgets/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch budgets by date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budgets by date range');
    }
  }

  // Category Operations
  async getCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axiosInstance.get('/api/budgets/categories');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return []; // Endpoints don't exist yet, return empty array
      }
      console.error('Failed to fetch categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  async getCategoryById(categoryId: number): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.get(`/api/budgets/categories/${categoryId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  }

  async createCategory(categoryData: CategoryCreateRequest): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.post('/api/budgets/categories', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create category:', error);
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  }

  async updateCategory(categoryId: number, categoryData: Partial<CategoryCreateRequest>): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.put(`/api/budgets/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/budgets/categories/${categoryId}`);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  }

  async getDefaultCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axiosInstance.get('/api/budgets/categories/default');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return []; // Return empty array instead of throwing
      }
      console.error('Failed to fetch default categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch default categories');
    }
  }

  // User Category Operations
  async getUserCategories(): Promise<UserCategoryResponse[]> {
    try {
      const response = await axiosInstance.get('/api/budgets/user-categories');
      return response.data || [];
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return []; // Endpoints don't exist yet or no categories, return empty array
      }
      console.error('Failed to fetch user categories:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  async assignCategoryToUser(categoryData: UserCategoryRequest): Promise<UserCategoryResponse> {
    try {
      const response = await axiosInstance.post('/api/budgets/user-categories', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to assign category to user:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign category to user');
    }
  }

  async removeUserCategory(userCategoryId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/budgets/user-categories/${userCategoryId}`);
    } catch (error: any) {
      console.error('Failed to remove user category:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove user category');
    }
  }

  // Expense Operations
  async getExpenses(page?: number, size?: number): Promise<ExpenseResponse[]> {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      
      // Use the new list endpoint that returns an array instead of Page object
      const response = await axiosInstance.get('/api/budgets/expenses/list', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return []; // Endpoints don't exist yet, return empty array
      }
      console.error('Failed to fetch expenses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }

  // Keep the original method for pagination support if needed
  async getExpensesPaginated(page?: number, size?: number): Promise<{content: ExpenseResponse[], totalElements: number, totalPages: number}> {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      
      const response = await axiosInstance.get('/api/budgets/expenses', { params });
      return {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { content: [], totalElements: 0, totalPages: 0 };
      }
      console.error('Failed to fetch expenses (paginated):', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }

  async getExpenseById(expenseId: number): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.get(`/api/budgets/expenses/${expenseId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expense');
    }
  }

  async createExpense(expenseData: ExpenseCreateRequest): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.post('/api/budgets/expenses', expenseData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to create expense');
    }
  }

  async updateExpense(expenseId: number, expenseData: ExpenseUpdateRequest): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.put(`/api/budgets/expenses/${expenseId}`, expenseData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to update expense');
    }
  }

  async deleteExpense(expenseId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/budgets/expenses/${expenseId}`);
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete expense');
    }
  }

  async getExpensesByCategory(categoryId: number, page?: number, size?: number): Promise<ExpenseResponse[]> {
    try {
      const params: any = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      
      const response = await axiosInstance.get(`/api/expenses/category/${categoryId}`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expenses by category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses by category');
    }
  }

  async getExpensesByDateRange(startDate: string, endDate: string, page?: number, size?: number): Promise<ExpenseResponse[]> {
    try {
      const params: any = { startDate, endDate };
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      
      const response = await axiosInstance.get('/api/expenses/date-range', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expenses by date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses by date range');
    }
  }

  async searchExpenses(query: string, page?: number, size?: number): Promise<ExpenseResponse[]> {
    try {
      const params: any = { query };
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      
      const response = await axiosInstance.get('/api/expenses/search', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to search expenses:', error);
      throw new Error(error.response?.data?.message || 'Failed to search expenses');
    }
  }

  // Analytics Operations
  async getSpendingTrends(period: 'day' | 'week' | 'month', startDate?: string, endDate?: string): Promise<SpendingTrendResponse[]> {
    try {
      // Note: Backend analytics are budget-specific, so we need a budget ID
      // For now, return empty array until we have a specific budget
      console.warn('getSpendingTrends: Backend requires specific budget ID, returning empty array');
      return [];
    } catch (error: any) {
      console.error('Failed to fetch spending trends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch spending trends');
    }
  }

  async getBudgetAnalytics(budgetId: number, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}/analytics`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch budget analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget analytics');
    }
  }

  async getBudgetSummary(budgetId: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}/summary`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch budget summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget summary');
    }
  }

  async getBudgetWarnings(budgetId: number): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}/warnings`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return []; // Return empty array instead of throwing
      }
      console.error('Failed to fetch budget warnings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget warnings');
    }
  }

  async getBudgetSpendingTrends(budgetId: number, months: number = 6): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}/trends`, {
        params: { months }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return { monthlySpending: [], averageSpending: 0, trend: 'stable' };
      }
      console.error('Failed to fetch budget spending trends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget spending trends');
    }
  }

  async getBudgetTopCategories(budgetId: number, limit: number = 5): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/api/budgets/${budgetId}/top-categories`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return []; // Return empty array instead of throwing
      }
      console.error('Failed to fetch budget top categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget top categories');
    }
  }

  async getCategoryBreakdown(startDate?: string, endDate?: string): Promise<CategoryBreakdownResponse[]> {
    try {
      // Note: Backend analytics are budget-specific, returning empty array for now
      console.warn('getCategoryBreakdown: Backend requires specific budget ID, returning empty array');
      return [];
    } catch (error: any) {
      console.error('Failed to fetch category breakdown:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch category breakdown');
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await axiosInstance.get('/api/budgets/currencies');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch supported currencies:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch supported currencies');
    }
  }

}

const financeService = new FinanceService();
export default financeService;
