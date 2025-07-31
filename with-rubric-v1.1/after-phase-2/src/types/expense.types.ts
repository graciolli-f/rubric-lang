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

// Budget-related types
export interface Budget {
  monthlyLimit: number;
  currentMonth: string;
}

// Analytics-related types
export interface CategoryData {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailySpendingData {
  date: string;
  amount: number;
  formattedDate: string;
}

export interface AnalyticsData {
  categoryBreakdown: CategoryData[];
  dailySpending: DailySpendingData[];
  totalSpent: number;
  averageDailySpending: number;
}

// Navigation types
export type ViewMode = "expenses" | "analytics";

// Constants for category options
export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

// Category colors for charts
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#8884d8",
  Transport: "#82ca9d",
  Shopping: "#ffc658", 
  Bills: "#ff7c7c",
  Entertainment: "#8dd1e1",
  Other: "#d084d0"
};