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