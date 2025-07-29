import { create } from 'zustand';
import type { Expense, ExpenseFormData, ExpenseState, AnalyticsData, ExchangeRates, UserPreferences, ExpenseFilters } from '../types';
import { 
  createExpense, 
  formDataToCreateData, 
  updateExpense, 
  sortExpensesByDate,
  calculateTotal,
  ValidationError
} from '../services/expenseService';
import { 
  getUserPreferences, 
  setUserPreferences, 
  fetchExchangeRates,
  CurrencyError 
} from '../services/currencyService';
import { 
  getRecurringTemplates, 
  shouldGenerateRecurringExpenses, 
  generateRecurringExpenses
} from '../services/recurringService';
import { 
  exportExpenses, 
  ExportError 
} from '../services/exportService';
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
  
  // New state
  exchangeRates: ExchangeRates | null;
  userPreferences: UserPreferences;
  filters: ExpenseFilters;
  
  // Actions
  loadExpenses: () => Promise<void>;
  addExpense: (formData: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, formData: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Budget actions
  setMonthlyBudget: (budget: number) => Promise<void>;
  
  // New feature actions
  setUserPreferences: (preferences: UserPreferences) => void;
  refreshExchangeRates: () => Promise<void>;
  generatePendingRecurringExpenses: () => Promise<void>;
  exportExpenses: (filters?: any, filename?: string) => Promise<void>;
  setFilters: (filters: ExpenseFilters) => void;
  
  // Computed values
  getSortedExpenses: () => Expense[];
  getFilteredExpenses: () => Expense[];
  getTotal: () => number;
  getExpenseById: (id: string) => Expense | undefined;
  getAnalyticsData: () => AnalyticsData;
  getAllTags: () => string[];
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  monthlyBudget: loadBudget(),
  exchangeRates: null,
  userPreferences: getUserPreferences(),
  filters: {},

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
      const createData = await formDataToCreateData(formData);
      const newExpense = await createExpense(createData);
      
      const currentExpenses = get().expenses;
      const updatedExpenses = [...currentExpenses, newExpense];
      
      saveExpenses(updatedExpenses);
      set({ expenses: updatedExpenses, isLoading: false });
      
      // Generate recurring expenses if this is a recurring expense
      if (newExpense.isRecurring) {
        await get().generatePendingRecurringExpenses();
      }
    } catch (error) {
      let errorMessage = 'Failed to add expense';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof StorageError) {
        errorMessage = error.message;
      } else if (error instanceof CurrencyError) {
        errorMessage = `Currency error: ${error.message}`;
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
      
      const updateData = await formDataToCreateData(formData);
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
      } else if (error instanceof CurrencyError) {
        errorMessage = `Currency error: ${error.message}`;
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
  },

  // New feature actions
  setUserPreferences: (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    set({ userPreferences: preferences });
  },

  refreshExchangeRates: async () => {
    try {
      const rates = await fetchExchangeRates();
      set({ exchangeRates: rates });
    } catch (error) {
      console.warn('Failed to refresh exchange rates:', error);
    }
  },

  generatePendingRecurringExpenses: async () => {
    try {
      const { expenses } = get();
      const recurringTemplates = getRecurringTemplates(expenses);
      let newExpenses: Expense[] = [];

      for (const template of recurringTemplates) {
        if (shouldGenerateRecurringExpenses(template, expenses)) {
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          
          const generated = await generateRecurringExpenses(
            template,
            oneYearFromNow.toISOString().split('T')[0],
            12 // Max 12 instances
          );
          newExpenses.push(...generated);
        }
      }

      if (newExpenses.length > 0) {
        const updatedExpenses = [...expenses, ...newExpenses];
        saveExpenses(updatedExpenses);
        set({ expenses: updatedExpenses });
      }
    } catch (error) {
      console.warn('Failed to generate recurring expenses:', error);
    }
  },

  exportExpenses: async (filters = {}, filename?: string) => {
    try {
      const { expenses } = get();
      await exportExpenses(expenses, filters, filename);
    } catch (error) {
      let errorMessage = 'Failed to export expenses';
      if (error instanceof ExportError) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  setFilters: (filters: ExpenseFilters) => {
    set({ filters });
  },

  getFilteredExpenses: () => {
    const { expenses, filters } = get();
    
    return expenses.filter(expense => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(expense.category)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
          expense.tags.some(expenseTag =>
            expenseTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate && expense.date < filters.startDate) {
        return false;
      }
      
      if (filters.endDate && expense.date > filters.endDate) {
        return false;
      }

      return true;
    });
  },

  getAllTags: () => {
    const { expenses } = get();
    const allTags = new Set<string>();
    
    expenses.forEach(expense => {
      expense.tags.forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort();
  }
})); 