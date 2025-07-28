import { create } from 'zustand';
import type { Expense, ExpenseFormData, ExpenseState, AnalyticsData } from '../types';
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
import { generateAnalyticsData } from '../services/analyticsService';

// Budget storage keys
const BUDGET_STORAGE_KEY = 'expense-tracker-budget';
const DEFAULT_MONTHLY_BUDGET = 2000;

interface BudgetData {
  monthlyBudget: number;
}

// Budget storage functions
function loadBudget(): number {
  try {
    if (!isStorageAvailable()) {
      return DEFAULT_MONTHLY_BUDGET;
    }
    
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_MONTHLY_BUDGET;
    }
    
    const parsed: BudgetData = JSON.parse(stored);
    return typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget > 0 
      ? parsed.monthlyBudget 
      : DEFAULT_MONTHLY_BUDGET;
  } catch {
    return DEFAULT_MONTHLY_BUDGET;
  }
}

function saveBudget(monthlyBudget: number): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }
  
  const budgetData: BudgetData = { monthlyBudget };
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData));
}

interface ExpenseStore extends ExpenseState {
  // Budget state
  monthlyBudget: number;
  
  // Actions
  loadExpenses: () => Promise<void>;
  addExpense: (formData: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, formData: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Budget actions
  setMonthlyBudget: (budget: number) => Promise<void>;
  
  // Computed values
  getSortedExpenses: () => Expense[];
  getTotal: () => number;
  getExpenseById: (id: string) => Expense | undefined;
  getAnalyticsData: () => AnalyticsData;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  monthlyBudget: loadBudget(),

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

  // Budget actions
  setMonthlyBudget: async (budget: number) => {
    try {
      if (budget <= 0) {
        throw new ValidationError('Budget must be greater than 0');
      }
      
      saveBudget(budget);
      set({ monthlyBudget: budget });
    } catch (error) {
      let errorMessage = 'Failed to update budget';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof StorageError) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage });
      throw error;
    }
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
  },

  getAnalyticsData: () => {
    const { expenses, monthlyBudget } = get();
    return generateAnalyticsData(expenses, monthlyBudget);
  }
})); 