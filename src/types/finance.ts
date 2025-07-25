// 🏦 PrismaNote Finance Types - New Simplified System
// Based on the redesigned backend API

// ===============================
// ENUMS & CONSTANTS
// ===============================

export const SUPPORTED_CURRENCIES = ['GHS', 'USD', 'EUR', 'GBP'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

export const BUDGET_PERIODS = ['WEEKLY', 'MONTHLY'] as const;
export type BudgetPeriod = typeof BUDGET_PERIODS[number];

// Fixed Categories (Pre-defined, cannot be modified)
export const FIXED_CATEGORIES = [
  { id: 1, name: 'Food & Dining', icon: '🍽️' },
  { id: 2, name: 'Transportation', icon: '🚗' },
  { id: 3, name: 'Shopping', icon: '🛒' },
  { id: 4, name: 'Entertainment', icon: '🎬' },
  { id: 5, name: 'Bills & Utilities', icon: '🏠' },
  { id: 6, name: 'Healthcare', icon: '🏥' },
  { id: 7, name: 'Education', icon: '📚' },
  { id: 8, name: 'Travel', icon: '✈️' },
  { id: 9, name: 'Personal Care', icon: '💳' },
  { id: 10, name: 'Gifts & Donations', icon: '🎁' },
  { id: 11, name: 'Other', icon: '📦' },
] as const;

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// ===============================
// CORE DATA TYPES
// ===============================

/**
 * Budget Response from API
 * Represents a user's active budget with calculated fields
 */
export interface Budget {
  id: number;
  totalBudget: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  isActive: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  // Calculated fields from backend
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
}

/**
 * Expense from API
 * Individual spending record with category information
 */
export interface Expense {
  id: number;
  categoryId: CategoryId;
  amount: number;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  // Category information included in response
  categoryName: string;
  categoryIcon: string;
}

/**
 * Category information
 * Fixed categories from the system
 */
export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

/**
 * Budget Summary with analytics
 * Comprehensive overview of budget status and spending breakdown
 */
export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
  currency: Currency;
  daysRemaining: number;
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Category spending breakdown
 * Analytics for spending by category
 */
export interface CategoryBreakdown {
  categoryId: CategoryId;
  categoryName: string;
  categoryIcon: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

// ===============================
// REQUEST TYPES
// ===============================

/**
 * Create Budget Request
 * All fields required for creating a new budget
 */
export interface CreateBudgetRequest {
  totalBudget: number;    // Min: 0.01, Max: 999999999.99
  currency: Currency;     // Must be one of: GHS, USD, EUR, GBP
  period: BudgetPeriod;   // WEEKLY or MONTHLY
  startDate: string;      // Cannot be in the past
  endDate: string;        // Must be in future, min 7 days from startDate
}

/**
 * Update Budget Request
 * All fields optional for partial updates
 */
export interface UpdateBudgetRequest {
  totalBudget?: number;
  currency?: Currency;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Create Expense Request
 * Required fields for adding new expense
 */
export interface CreateExpenseRequest {
  categoryId: CategoryId; // Must be 1-11
  amount: number;         // Min: 0.01, Max: 999999999.99
  description?: string;   // Optional, max 500 characters
  date: string;          // Cannot be in the future
}

/**
 * Update Expense Request
 * All fields optional for partial updates
 */
export interface UpdateExpenseRequest {
  categoryId?: CategoryId;
  amount?: number;
  description?: string;
  date?: string;
}

// ===============================
// ERROR TYPES
// ===============================

/**
 * API Error Response
 * Standard error format from backend
 */
export interface ApiError {
  timestamp: string;
  error: string;
  exception?: string;
}

/**
 * Validation Error Response
 * Detailed field-level validation errors
 */
export interface ValidationError extends ApiError {
  validationErrors: Record<string, string>;
}

// ===============================
// UI STATE TYPES
// ===============================

/**
 * Loading states for different operations
 */
export interface FinanceLoadingState {
  budget: boolean;
  expenses: boolean;
  summary: boolean;
  categories: boolean;
  creatingBudget: boolean;
  creatingExpense: boolean;
  updatingBudget: boolean;
  updatingExpense: boolean;
  deletingExpense: boolean;
}

/**
 * Error states for different operations
 */
export interface FinanceErrorState {
  budget: string | null;
  expenses: string | null;
  summary: string | null;
  categories: string | null;
  general: string | null;
}

/**
 * Finance Context State
 * Global state for finance module
 */
export interface FinanceState {
  // Core data
  budget: Budget | null;
  expenses: Expense[];
  summary: BudgetSummary | null;
  categories: Category[];
  
  // UI states
  loading: FinanceLoadingState;
  errors: FinanceErrorState;
  
  // Computed values
  hasActiveBudget: boolean;
  isExpenseListEmpty: boolean;
  topSpendingCategories: CategoryBreakdown[];
}

// ===============================
// UTILITY TYPES
// ===============================

/**
 * Currency information with display formatting
 */
export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

/**
 * Date range utility
 */
export interface DateRange {
  startDate: string;
  endDate: string;
  daysCount: number;
}

/**
 * Expense filters for UI
 */
export interface ExpenseFilters {
  categoryId?: CategoryId;
  dateRange?: DateRange;
  searchQuery?: string;
}

/**
 * Sorting options for expenses
 */
export interface ExpenseSortOptions {
  field: 'date' | 'amount' | 'category' | 'description';
  order: 'asc' | 'desc';
}

// ===============================
// VALIDATION CONSTANTS
// ===============================

export const VALIDATION_RULES = {
  BUDGET: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999.99,
    MIN_DURATION_DAYS: 7,
  },
  EXPENSE: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999.99,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  CATEGORY: {
    MIN_ID: 1,
    MAX_ID: 11,
  },
} as const;

// ===============================
// HELPER FUNCTIONS
// ===============================

/**
 * Get currency information by code
 */
export const getCurrencyInfo = (code: Currency): CurrencyInfo => {
  const currencyMap: Record<Currency, CurrencyInfo> = {
    GHS: { code: 'GHS', symbol: '₵', name: 'Ghana Cedi' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  };
  return currencyMap[code];
};

/**
 * Get category information by ID
 */
export const getCategoryById = (id: CategoryId): Category => {
  const category = FIXED_CATEGORIES.find(cat => cat.id === id);
  if (!category) {
    throw new Error(`Invalid category ID: ${id}`);
  }
  return category;
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const { symbol } = getCurrencyInfo(currency);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Validate budget amount
 */
export const isValidBudgetAmount = (amount: number): boolean => {
  return amount >= VALIDATION_RULES.BUDGET.MIN_AMOUNT && 
         amount <= VALIDATION_RULES.BUDGET.MAX_AMOUNT;
};

/**
 * Validate expense amount
 */
export const isValidExpenseAmount = (amount: number): boolean => {
  return amount >= VALIDATION_RULES.EXPENSE.MIN_AMOUNT && 
         amount <= VALIDATION_RULES.EXPENSE.MAX_AMOUNT;
};

/**
 * Validate category ID
 */
export const isValidCategoryId = (id: number): id is CategoryId => {
  return id >= VALIDATION_RULES.CATEGORY.MIN_ID && 
         id <= VALIDATION_RULES.CATEGORY.MAX_ID;
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

/**
 * Check if date is in the future
 */
export const isDateInFuture = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate > today;
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date in API format
 */
export const getTodayApiFormat = (): string => {
  return formatDateForApi(new Date());
};
