// Legacy interfaces for backward compatibility with existing components
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  month: string;
  totalAmount: number;
  categories: CategoryBudget[];
  currency: Currency;
}

export interface CategoryBudget {
  id: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  icon: string;
  color: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type BudgetStatus = 'safe' | 'warning' | 'danger';

// New interfaces aligned with backend DTOs
export interface BackendExpense {
  id: number;
  amount: number;
  description: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  categoryId: number;
  category?: BackendCategory;
}

export interface BackendBudget {
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

export interface BackendCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCategory {
  id: number;
  userId: number;
  categoryId: number;
  assignedAt: string;
  category?: BackendCategory;
}

// Request DTOs for API calls
export interface CreateExpenseRequest {
  amount: number;
  description: string;
  categoryId: number;
  date: string;
  tags?: string[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  categoryId?: number;
  date?: string;
  tags?: string[];
}

export interface CreateBudgetRequest {
  totalAmount: number;
  startDate: string;
  endDate: string;
  currency: string;
  description?: string;
}

export interface UpdateBudgetRequest {
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
}

// Analytics interfaces
export interface SpendingTrend {
  date: string;
  totalAmount: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    amount: number;
  }[];
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlySpending {
  month: string;
  totalAmount: number;
  budgetAmount?: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    amount: number;
  }[];
}

// Utility types for transforming data between legacy and new formats
export type ExpenseWithCategory = BackendExpense & {
  category: BackendCategory;
};

export type BudgetWithCategories = BackendBudget & {
  categories: (BackendCategory & { budgetAmount: number; spentAmount: number })[];
};

// Common currency definitions
export const COMMON_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

// Helper functions for data transformation
export const transformBackendExpenseToLegacy = (backendExpense: BackendExpense): Expense => ({
  id: backendExpense.id.toString(),
  amount: backendExpense.amount,
  category: backendExpense.category?.name || 'Unknown',
  description: backendExpense.description,
  date: new Date(backendExpense.date),
  createdAt: new Date(backendExpense.createdAt),
});

export const transformLegacyExpenseToBackend = (legacyExpense: Expense, categoryId: number): CreateExpenseRequest => ({
  amount: legacyExpense.amount,
  description: legacyExpense.description,
  categoryId: categoryId,
  date: legacyExpense.date.toISOString().split('T')[0],
  tags: [],
});

export const transformBackendCategoryToLegacy = (backendCategory: BackendCategory, budgetAmount: number = 0, spentAmount: number = 0): CategoryBudget => ({
  id: backendCategory.id.toString(),
  name: backendCategory.name,
  budgetAmount: budgetAmount,
  spentAmount: spentAmount,
  icon: backendCategory.icon,
  color: backendCategory.color,
});

export const getCurrencyFromCode = (code: string): Currency => {
  const currency = COMMON_CURRENCIES.find(c => c.code === code);
  return currency || { code, symbol: code, name: code };
};