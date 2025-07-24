import axiosInstance from '../utils/axiosInstance';

// Request DTOs matching backend
export interface BudgetCreateRequest {
  totalAmount: number;
  startDate: string;
  endDate: string;
  currency: string;
  description?: string;
}

export interface BudgetUpdateRequest {
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
  description?: string;
}

export interface CategoryCreateRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface ExpenseCreateRequest {
  amount: number;
  description: string;
  categoryId: number;
  date: string;
  tags?: string[];
}

export interface ExpenseUpdateRequest {
  amount?: number;
  description?: string;
  categoryId?: number;
  date?: string;
  tags?: string[];
}

export interface UserCategoryRequest {
  categoryId: number;
}

// Response DTOs matching backend
export interface BudgetResponse {
  id: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  id: number;
  amount: number;
  description: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  categoryId: number;
  category?: CategoryResponse;
}

export interface UserCategoryResponse {
  id: number;
  userId: number;
  categoryId: number;
  assignedAt: string;
  category?: CategoryResponse;
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
      if (error.response?.status === 404) {
        return null; // No current budget found
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
      const response = await axiosInstance.get('/api/categories');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  async getCategoryById(categoryId: number): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.get(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  }

  async createCategory(categoryData: CategoryCreateRequest): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.post('/api/categories', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create category:', error);
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  }

  async updateCategory(categoryId: number, categoryData: Partial<CategoryCreateRequest>): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.put(`/api/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/categories/${categoryId}`);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  }

  // User Category Operations
  async getUserCategories(): Promise<UserCategoryResponse[]> {
    try {
      const response = await axiosInstance.get('/api/user-categories');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user categories');
    }
  }

  async assignCategoryToUser(categoryData: UserCategoryRequest): Promise<UserCategoryResponse> {
    try {
      const response = await axiosInstance.post('/api/user-categories', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to assign category to user:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign category to user');
    }
  }

  async removeUserCategory(userCategoryId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/user-categories/${userCategoryId}`);
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
      
      const response = await axiosInstance.get('/api/expenses', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }

  async getExpenseById(expenseId: number): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.get(`/api/expenses/${expenseId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expense');
    }
  }

  async createExpense(expenseData: ExpenseCreateRequest): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.post('/api/expenses', expenseData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to create expense');
    }
  }

  async updateExpense(expenseId: number, expenseData: ExpenseUpdateRequest): Promise<ExpenseResponse> {
    try {
      const response = await axiosInstance.put(`/api/expenses/${expenseId}`, expenseData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to update expense');
    }
  }

  async deleteExpense(expenseId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/expenses/${expenseId}`);
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
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axiosInstance.get('/api/analytics/spending-trends', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch spending trends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch spending trends');
    }
  }

  async getCategoryBreakdown(startDate?: string, endDate?: string): Promise<CategoryBreakdownResponse[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axiosInstance.get('/api/analytics/category-breakdown', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch category breakdown:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch category breakdown');
    }
  }

  async getMonthlySpending(year: number, month: number): Promise<MonthlySpendingResponse> {
    try {
      const response = await axiosInstance.get('/api/analytics/monthly-spending', {
        params: { year, month }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch monthly spending:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly spending');
    }
  }

  async getTotalSpending(startDate?: string, endDate?: string): Promise<{ totalAmount: number }> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axiosInstance.get('/api/analytics/total-spending', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch total spending:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch total spending');
    }
  }

  async getSpendingComparison(currentStartDate: string, currentEndDate: string, previousStartDate: string, previousEndDate: string): Promise<{
    currentPeriod: { totalAmount: number; categoryBreakdown: CategoryBreakdownResponse[] };
    previousPeriod: { totalAmount: number; categoryBreakdown: CategoryBreakdownResponse[] };
    percentageChange: number;
  }> {
    try {
      const response = await axiosInstance.get('/api/analytics/spending-comparison', {
        params: {
          currentStartDate,
          currentEndDate,
          previousStartDate,
          previousEndDate
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch spending comparison:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch spending comparison');
    }
  }
}

const financeService = new FinanceService();
export default financeService;
