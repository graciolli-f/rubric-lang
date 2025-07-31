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

// Constants for category options
export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];