/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { Expense, ExpenseFormData, Budget, Currency, ExportOptions } from '../types/expense.types';
import { DEFAULT_CURRENCY } from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as receiptService from '../services/receipt-service';
import * as currencyService from '../services/currency-service';
import * as exportService from '../services/export-service';
import * as recurringService from '../services/recurring-service';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  budget: Budget;
  preferredCurrency: Currency;
  tagFilter: string[];
  
  // Basic expense actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Advanced expense actions
  uploadReceipt: (file: File) => Promise<string>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  exportExpenses: (options?: ExportOptions) => Promise<void>;
  generateRecurringExpenses: () => Promise<void>;
  
  // Currency actions
  setPreferredCurrency: (currency: Currency) => Promise<void>;
  convertExpenseAmount: (expense: Expense, toCurrency: Currency) => Promise<number>;
  
  // Filter actions
  setTagFilter: (tags: string[]) => void;
  clearFilters: () => void;
  
  // Budget actions
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  getFilteredExpenses: () => Expense[];
  getCurrentMonthSpending: () => number;
  getRemainingBudget: () => number;
  getBudgetProgress: () => number;
  getAllTags: () => string[];
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
  preferredCurrency: DEFAULT_CURRENCY,
  tagFilter: [],
  
  // Basic expense actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const { preferredCurrency } = get();
      
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        amount: data.amount || 0,
        category: data.category || 'Other',
        date: data.date || toISOString(now),
        description: data.description || '',
        currency: preferredCurrency,
        originalAmount: data.amount || 0,
        originalCurrency: data.currency || preferredCurrency,
        tags: data.tags || [],
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency,
        receiptImage: data.receiptImage,
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
      const { preferredCurrency } = get();
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                amount: data.amount || expense.amount,
                category: data.category || expense.category,
                date: data.date || expense.date,
                description: data.description || expense.description,
                currency: preferredCurrency,
                originalAmount: data.amount || expense.originalAmount,
                originalCurrency: data.currency || expense.originalCurrency,
                tags: data.tags || expense.tags,
                isRecurring: data.isRecurring !== undefined ? data.isRecurring : expense.isRecurring,
                recurringFrequency: data.recurringFrequency || expense.recurringFrequency,
                receiptImage: data.receiptImage || expense.receiptImage,
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
      // Also delete associated receipt if it exists
      const { expenses } = get();
      const expense = expenses.find(e => e.id === id);
      if (expense?.receiptImage) {
        receiptService.deleteReceipt(expense.receiptImage).catch(console.error);
      }
      
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
  
  // Advanced expense actions
  uploadReceipt: async (file: File) => {
    try {
      set({ isLoading: true });
      const receiptId = await receiptService.uploadReceipt(file);
      set({ isLoading: false, error: null });
      return receiptId;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to upload receipt',
      });
      throw error;
    }
  },
  
  deleteReceipt: async (receiptId: string) => {
    try {
      set({ isLoading: true });
      await receiptService.deleteReceipt(receiptId);
      
      // Update expense to remove receipt reference
      set((state) => ({
        isLoading: false,
        expenses: state.expenses.map(expense =>
          expense.receiptImage === receiptId
            ? { ...expense, receiptImage: undefined, updatedAt: toISOString(new Date()) }
            : expense
        ),
        error: null,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete receipt',
      });
    }
  },
  
  exportExpenses: async (options: ExportOptions = {}) => {
    try {
      set({ isLoading: true });
      const { expenses, preferredCurrency } = get();
      
      const exportOptions = {
        ...options,
        currency: options.currency || preferredCurrency
      };
      
      const csvContent = await exportService.exportExpensesToCSV(expenses, exportOptions);
      const filename = exportService.generateFilename(exportOptions);
      
      await exportService.downloadCSV(csvContent, filename);
      
      set({ isLoading: false, error: null });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to export expenses',
      });
    }
  },
  
  generateRecurringExpenses: async () => {
    try {
      set({ isLoading: true });
      const { expenses } = get();
      
      const newExpenses = await recurringService.generateRecurringExpenses(expenses);
      
      if (newExpenses.length > 0) {
        set((state) => ({
          isLoading: false,
          expenses: [...state.expenses, ...newExpenses],
          error: null,
        }));
      } else {
        set({ isLoading: false, error: null });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate recurring expenses',
      });
    }
  },
  
  // Currency actions
  setPreferredCurrency: async (currency: Currency) => {
    try {
      await currencyService.setPreferredCurrency(currency);
      set({ preferredCurrency: currency, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to set preferred currency',
      });
    }
  },
  
  convertExpenseAmount: async (expense: Expense, toCurrency: Currency) => {
    try {
      return await currencyService.convertAmount(expense.originalAmount, expense.originalCurrency, toCurrency);
    } catch (error) {
      console.error('Failed to convert expense amount:', error);
      return expense.amount; // Fallback to display amount
    }
  },
  
  // Filter actions
  setTagFilter: (tags: string[]) => {
    set({ tagFilter: tags });
  },
  
  clearFilters: () => {
    set({ tagFilter: [] });
  },
  
  // Budget actions
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
  
  // UI state actions
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
      preferredCurrency: DEFAULT_CURRENCY,
      tagFilter: [],
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
  
  getFilteredExpenses: () => {
    const { expenses, tagFilter } = get();
    
    if (tagFilter.length === 0) {
      return expenses;
    }
    
    return expenses.filter(expense => 
      tagFilter.some(tag => expense.tags.includes(tag))
    );
  },
  
  getCurrentMonthSpending: () => {
    const { budget } = get();
    const filteredExpenses = get().getFilteredExpenses();
    const currentMonth = budget.currentMonth;
    
    return filteredExpenses
      .filter((expense) => {
        const expenseMonth = expense.date.slice(0, 7); // YYYY-MM
        return expenseMonth === currentMonth;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  },
  
  getRemainingBudget: () => {
    const { budget } = get();
    const currentMonthSpending = get().getCurrentMonthSpending();
    return Math.max(0, budget.monthlyLimit - currentMonthSpending);
  },
  
  getBudgetProgress: () => {
    const { budget } = get();
    const currentMonthSpending = get().getCurrentMonthSpending();
    return budget.monthlyLimit > 0 
      ? Math.min(100, (currentMonthSpending / budget.monthlyLimit) * 100)
      : 0;
  },
  
  getAllTags: () => {
    const { expenses } = get();
    const allTags = new Set<string>();
    
    expenses.forEach(expense => {
      expense.tags.forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort();
  },
}));