/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { Expense, ExpenseFormData, Budget } from '../types/expense.types';
import { toISOString } from '../utils/date';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  budget: Budget;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Budget actions
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  getCurrentMonthSpending: () => number;
  getRemainingBudget: () => number;
  getBudgetProgress: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  budget: {
    monthlyLimit: 2000, // Default $2000
    currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  },
  
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
  
  setBudget: (amount: number) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      set((state) => ({
        budget: {
          monthlyLimit: amount,
          currentMonth,
        },
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to set budget',
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
      budget: {
        monthlyLimit: 2000,
        currentMonth: new Date().toISOString().slice(0, 7),
      },
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
  
  getCurrentMonthSpending: () => {
    const { expenses, budget } = get();
    const currentMonth = budget.currentMonth;
    return expenses
      .filter((expense) => expense.date.startsWith(currentMonth))
      .reduce((total, expense) => total + expense.amount, 0);
  },
  
  getRemainingBudget: () => {
    const { budget } = get();
    const spent = get().getCurrentMonthSpending();
    return Math.max(0, budget.monthlyLimit - spent);
  },
  
  getBudgetProgress: () => {
    const { budget } = get();
    const spent = get().getCurrentMonthSpending();
    return Math.min(100, (spent / budget.monthlyLimit) * 100);
  },
}));