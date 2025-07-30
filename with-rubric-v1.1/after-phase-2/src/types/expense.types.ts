/**
 * Type definitions for expense tracking domain
 * No side effects, pure type definitions
 */

export type Category = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// Analytics and Budget interfaces
export interface BudgetState {
  monthlyBudget: number;
  currentMonthSpent: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export interface CategorySpending {
  category: Category;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface AnalyticsData {
  categoryBreakdown: CategorySpending[];
  dailyTrends: DailySpending[];
  budgetData: BudgetState;
  averageDailySpending: number;
  totalCurrentMonth: number;
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation types
export type ViewMode = "expenses" | "analytics";

// Constants for category options
export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

// Default budget amount
export const DEFAULT_MONTHLY_BUDGET = 2000;