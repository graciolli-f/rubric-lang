import { create } from 'zustand';
import type { Expense } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      expenses: [...state.expenses, newExpense]
    }));
  },
  
  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    }));
  },
  
  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    }));
  },
  
  getTotal: () => {
    return get().expenses.reduce((total, expense) => total + expense.amount, 0);
  }
})); 