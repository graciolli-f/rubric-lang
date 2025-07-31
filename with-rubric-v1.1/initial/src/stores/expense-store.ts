/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { Expense, ExpenseFormData } from '../types/expense.types';
import { toISOString } from '../utils/date';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      };
      
      set((state) => ({
        expenses: [...state.expenses, newExpense],
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add expense',
      });
    }
  },
  
  updateExpense: (id: string, data: ExpenseFormData) => {
    try {
      const now = new Date();
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
                updatedAt: toISOString(now),
              }
            : expense
        ),
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update expense',
      });
    }
  },
  
  deleteExpense: (id: string) => {
    try {
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete expense',
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
    });
  },
  
  // Computed values
  getTotalAmount: () => {
    const { expenses } = get();
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },
  
  getExpensesSortedByDate: () => {
    const { expenses } = get();
    return [...expenses].sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },
}));