import { create } from 'zustand';
import type { Expense, ExpenseFormData, ExpenseState } from '../types';
import { 
  createExpense, 
  formDataToCreateData, 
  updateExpense, 
  sortExpensesByDate,
  calculateTotal,
  ValidationError,
  expenseToFormData 
} from '../services/expenseService';
import { 
  loadExpenses, 
  saveExpenses, 
  StorageError,
  isStorageAvailable 
} from '../data/expenseStorage';

interface ExpenseStore extends ExpenseState {
  // Actions
  loadExpenses: () => Promise<void>;
  addExpense: (formData: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, formData: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Computed values
  getSortedExpenses: () => Expense[];
  getTotal: () => number;
  getExpenseById: (id: string) => Expense | undefined;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,

  // Actions
  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (!isStorageAvailable()) {
        throw new StorageError('localStorage is not available');
      }
      
      const expenses = loadExpenses();
      set({ expenses, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load expenses';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  addExpense: async (formData: ExpenseFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      const createData = formDataToCreateData(formData);
      const newExpense = createExpense(createData);
      
      const currentExpenses = get().expenses;
      const updatedExpenses = [...currentExpenses, newExpense];
      
      saveExpenses(updatedExpenses);
      set({ expenses: updatedExpenses, isLoading: false });
    } catch (error) {
      let errorMessage = 'Failed to add expense';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof StorageError) {
        errorMessage = error.message;
      }
      
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateExpense: async (id: string, formData: ExpenseFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentExpenses = get().expenses;
      const existingExpense = currentExpenses.find(expense => expense.id === id);
      
      if (!existingExpense) {
        throw new Error('Expense not found');
      }
      
      const updateData = formDataToCreateData(formData);
      const updatedExpense = updateExpense(existingExpense, updateData);
      
      const updatedExpenses = currentExpenses.map(expense =>
        expense.id === id ? updatedExpense : expense
      );
      
      saveExpenses(updatedExpenses);
      set({ expenses: updatedExpenses, isLoading: false });
    } catch (error) {
      let errorMessage = 'Failed to update expense';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof StorageError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentExpenses = get().expenses;
      const updatedExpenses = currentExpenses.filter(expense => expense.id !== id);
      
      if (updatedExpenses.length === currentExpenses.length) {
        throw new Error('Expense not found');
      }
      
      saveExpenses(updatedExpenses);
      set({ expenses: updatedExpenses, isLoading: false });
    } catch (error) {
      let errorMessage = 'Failed to delete expense';
      
      if (error instanceof StorageError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Computed values
  getSortedExpenses: () => {
    return sortExpensesByDate(get().expenses);
  },

  getTotal: () => {
    return calculateTotal(get().expenses);
  },

  getExpenseById: (id: string) => {
    return get().expenses.find(expense => expense.id === id);
  }
})); 