import { create } from 'zustand';
import { ExpenseService } from '../services/expense-service';
import type { Expense, ExpenseFormData } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
  isOverBudget: () => boolean;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],

  addExpense: (data: ExpenseFormData) => {
    const validation = ExpenseService.validateExpense(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const newExpense: Expense = {
      id: ExpenseService.generateId(),
      ...data
    };

    set((state) => ({
      expenses: [...state.expenses, newExpense]
    }));
  },

  updateExpense: (id: string, data: Partial<Expense>) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...data } : expense
      )
    }));
  },

  deleteExpense: (id: string) => {
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    }));
  },

  getTotal: () => {
    return ExpenseService.calculateTotal(get().expenses);
  },

  isOverBudget: () => {
    return get().getTotal() > 1000;
  }
})); 