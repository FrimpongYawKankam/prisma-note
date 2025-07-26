// 🏦 PrismaNote Finance Service - New Simplified System
// API service layer for budget and expense management

import {
    Budget,
    BudgetSummary,
    Category,
    CategoryBreakdown,
    CreateBudgetRequest,
    CreateExpenseRequest,
    Expense,
    FIXED_CATEGORIES,
    UpdateBudgetRequest,
    UpdateExpenseRequest,
    ValidationError
} from '../types/finance';
import axiosInstance from '../utils/axiosInstance';

/**
 * Finance Service Class
 * Handles all finance-related API calls with proper error handling
 */
class FinanceService {
  private readonly baseUrl = '/api/finance';

  // ===============================
  // BUDGET OPERATIONS
  // ===============================

  /**
   * Get current active budget
   * Returns 204 if no budget exists
   */
  async getCurrentBudget(): Promise<Budget | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/budget`);
      
      if (response.status === 204) {
        return null; // No active budget
      }
      
      return response.data as Budget;
    } catch (error: any) {
      if (error.response?.status === 204 || error.response?.status === 404) {
        return null; // No budget found
      }
      console.error('Failed to fetch current budget:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create a new budget
   * Automatically deactivates any existing budget
   */
  async createBudget(budgetData: CreateBudgetRequest): Promise<Budget> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/budget`, budgetData);
      const apiData = response.data;
      
      console.log('🔄 API createBudget response:', apiData);
      
      // Transform API response to match our Budget interface
      const budget: Budget = {
        id: apiData.id || Date.now(), // Use API id or fallback to timestamp
        totalBudget: apiData.amount || budgetData.totalBudget,
        currency: apiData.currency || budgetData.currency,
        period: apiData.period || budgetData.period,
        startDate: budgetData.startDate, // Use original request data
        endDate: budgetData.endDate,     // Use original request data
        isActive: true, // Assume newly created budget is active
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalSpent: 0, // Default values for calculated fields
        remainingBudget: apiData.amount || budgetData.totalBudget,
        spentPercentage: 0,
      };
      
      console.log('✅ Transformed budget:', budget);
      return budget;
    } catch (error: any) {
      console.error('Failed to create budget:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update current active budget
   * All fields are optional for partial updates
   */
  async updateBudget(budgetData: UpdateBudgetRequest): Promise<Budget> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/budget`, budgetData);
      const apiData = response.data;
      
      console.log('🔄 API updateBudget response:', apiData);
      
      // Transform API response to match our Budget interface
      const budget: Budget = {
        id: apiData.id || Date.now(),
        totalBudget: apiData.amount || budgetData.totalBudget || 0,
        currency: apiData.currency || budgetData.currency || 'USD',
        period: apiData.period || budgetData.period || 'MONTHLY',
        startDate: budgetData.startDate || new Date().toISOString(),
        endDate: budgetData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalSpent: 0,
        remainingBudget: apiData.amount || budgetData.totalBudget || 0,
        spentPercentage: 0,
      };
      
      console.log('✅ Transformed updated budget:', budget);
      return budget;
    } catch (error: any) {
      console.error('Failed to update budget:', error);
      throw this.handleApiError(error);
    }
  }

  // ===============================
  // EXPENSE OPERATIONS
  // ===============================

  /**
   * Get all expenses for the current budget
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/expenses`);
      return response.data as Expense[];
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/expenses`, expenseData);
      return response.data as Expense;
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(expenseId: number, expenseData: UpdateExpenseRequest): Promise<Expense> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/expenses/${expenseId}`, expenseData);
      return response.data as Expense;
    } catch (error: any) {
      console.error('Failed to update expense:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/expenses/${expenseId}`);
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      throw this.handleApiError(error);
    }
  }

  // ===============================
  // CATEGORY OPERATIONS
  // ===============================

  /**
   * Get all fixed categories
   * Since categories are fixed, we can return them immediately
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/categories`);
      return response.data as Category[];
    } catch (error: any) {
      console.error('Failed to fetch categories from API, using fallback:', error);
      // Fallback to local fixed categories if API fails
      return FIXED_CATEGORIES.map(cat => ({ ...cat }));
    }
  }

  /**
   * Get categories synchronously (using local fixed categories)
   * Useful for immediate UI rendering
   */
  getCategoriesSync(): Category[] {
    return FIXED_CATEGORIES.map(cat => ({ ...cat }));
  }

  // ===============================
  // ANALYTICS & SUMMARY
  // ===============================

  /**
   * Get comprehensive budget summary with analytics
   */
  async getBudgetSummary(): Promise<BudgetSummary | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/summary`);
      
      // Validate response data - API might return empty string instead of null
      const data = response.data;
      if (!data || data === "" || typeof data !== 'object') {
        console.log('📊 getBudgetSummary: Invalid response data, returning null');
        return null;
      }
      
      return data as BudgetSummary;
    } catch (error: any) {
      if (error.response?.status === 204 || error.response?.status === 404) {
        return null; // No budget or summary available
      }
      console.error('Failed to fetch budget summary:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get category analytics only
   */
  async getCategoryAnalytics(): Promise<CategoryBreakdown[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/analytics/categories`);
      return response.data as CategoryBreakdown[];
    } catch (error: any) {
      if (error.response?.status === 204 || error.response?.status === 404) {
        return []; // No analytics available
      }
      console.error('Failed to fetch category analytics:', error);
      throw this.handleApiError(error);
    }
  }

  // ===============================
  // HELPER METHODS
  // ===============================

  /**
   * Check if user has an active budget
   */
  async hasActiveBudget(): Promise<boolean> {
    try {
      const budget = await this.getCurrentBudget();
      return budget !== null && budget.isActive;
    } catch {
      return false;
    }
  }

  /**
   * Get complete finance data in one call
   * Useful for initial app load
   */
  async getFinanceOverview(): Promise<{
    budget: Budget | null;
    expenses: Expense[];
    summary: BudgetSummary | null;
    categories: Category[];
  }> {
    try {
      // Execute all requests in parallel for better performance
      const [budget, expenses, summary, categories] = await Promise.allSettled([
        this.getCurrentBudget(),
        this.getExpenses(),
        this.getBudgetSummary(),
        this.getCategories(),
      ]);

      return {
        budget: budget.status === 'fulfilled' ? budget.value : null,
        expenses: expenses.status === 'fulfilled' ? expenses.value : [],
        summary: summary.status === 'fulfilled' ? summary.value : null,
        categories: categories.status === 'fulfilled' ? categories.value : this.getCategoriesSync(),
      };
    } catch (error) {
      console.error('Failed to fetch finance overview:', error);
      throw error;
    }
  }

  /**
   * Refresh budget calculations after expense changes
   * Gets fresh budget and summary data
   */
  async refreshBudgetData(): Promise<{ budget: Budget | null; summary: BudgetSummary | null }> {
    try {
      const [budget, summary] = await Promise.all([
        this.getCurrentBudget(),
        this.getBudgetSummary(),
      ]);

      return { budget, summary };
    } catch (error) {
      console.error('Failed to refresh budget data:', error);
      throw error;
    }
  }

  // ===============================
  // ERROR HANDLING
  // ===============================

  /**
   * Transform API errors into user-friendly messages
   */
  private handleApiError(error: any): Error {
    if (!error.response) {
      // Network error
      return new Error('Network error. Please check your connection and try again.');
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        // Validation error
        if (data.validationErrors) {
          const validationError = data as ValidationError;
          const firstError = Object.values(validationError.validationErrors)[0];
          return new Error(firstError || 'Invalid data provided');
        }
        return new Error(data.error || 'Bad request');

      case 401:
        return new Error('Authentication required. Please log in again.');

      case 403:
        return new Error('Access denied. You do not have permission to perform this action.');

      case 404:
        return new Error(data.error || 'Requested resource not found.');

      case 500:
        return new Error('Server error. Please try again later.');

      default:
        return new Error(data.error || `Unexpected error (${status})`);
    }
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: any): error is ValidationError {
    return error.response?.status === 400 && error.response?.data?.validationErrors;
  }

  /**
   * Extract validation errors for form handling
   */
  static getValidationErrors(error: any): Record<string, string> {
    if (error.response?.status === 400 && error.response?.data?.validationErrors) {
      return error.response.data.validationErrors;
    }
    return {};
  }

  // ===============================
  // VALIDATION HELPERS
  // ===============================

  /**
   * Client-side validation for budget creation
   */
  validateBudgetData(data: CreateBudgetRequest): string[] {
    const errors: string[] = [];

    if (data.totalBudget < 0.01) {
      errors.push('Budget amount must be at least ₵0.01');
    }

    if (data.totalBudget > 999999999.99) {
      errors.push('Budget amount cannot exceed ₵999,999,999.99');
    }

    if (!['GHS', 'USD', 'EUR', 'GBP'].includes(data.currency)) {
      errors.push('Invalid currency selected');
    }

    if (!['WEEKLY', 'MONTHLY'].includes(data.period)) {
      errors.push('Budget period must be Weekly or Monthly');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      errors.push('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }

    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference < 7) {
      errors.push('Budget period must be at least 7 days');
    }

    return errors;
  }

  /**
   * Client-side validation for expense creation
   */
  validateExpenseData(data: CreateExpenseRequest): string[] {
    const errors: string[] = [];

    if (data.amount < 0.01) {
      errors.push('Expense amount must be at least ₵0.01');
    }

    if (data.amount > 999999999.99) {
      errors.push('Expense amount cannot exceed ₵999,999,999.99');
    }

    if (data.categoryId < 1 || data.categoryId > 11) {
      errors.push('Invalid category selected');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    const expenseDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (expenseDate > today) {
      errors.push('Expense date cannot be in the future');
    }

    return errors;
  }
}

// Export singleton instance
const financeService = new FinanceService();
export default financeService;

// Export the class for testing
export { FinanceService };

