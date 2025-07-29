import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, Budget, Currency, UserPreferences, ExchangeRates } from '../types';
import { ExchangeService } from '../services/exchangeService';
import { RecurringUtils } from '../utils/recurringUtils';
import { ExportUtils } from '../utils/exportUtils';

interface ExpenseStore {
  expenses: Expense[];
  budget: Budget;
  userPreferences: UserPreferences;
  tagFilter: string[];
  
  // Original methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
  setBudget: (amount: number) => void;
  getCurrentMonthExpenses: () => Expense[];
  getCurrentMonthTotal: () => number;
  getRemainingBudget: () => number;
  getDailySpendingData: () => { date: string; amount: number }[];
  getCategoryBreakdown: () => { category: string; amount: number; count: number }[];
  getAverageDailySpending: () => number;
  
  // New methods for advanced features
  setPreferredCurrency: (currency: Currency) => void;
  updateExchangeRates: () => Promise<void>;
  getConvertedAmount: (originalAmount: number, originalCurrency: Currency) => number;
  formatAmount: (amount: number, currency?: Currency) => string;
  
  // Tag filtering
  setTagFilter: (tags: string[]) => void;
  getFilteredExpenses: () => Expense[];
  getAllTags: () => string[];
  
  // Recurring expenses
  generateOverdueRecurringExpenses: () => void;
  toggleRecurringExpense: (id: string, isActive: boolean) => void;
  
  // Export functionality
  exportToCSV: (startDate?: string, endDate?: string) => Promise<void>;
}

const exchangeService = ExchangeService.getInstance();

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      budget: {
        monthlyLimit: 2000,
        month: getCurrentMonth(),
      },
      userPreferences: {
        preferredCurrency: 'USD',
        exchangeRates: { USD: 1, EUR: 0.85, GBP: 0.73 },
        lastRateUpdate: new Date().toISOString()
      },
      tagFilter: [],
      
      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          // Convert amount to user's preferred currency for storage
          amount: get().getConvertedAmount(expense.originalAmount, expense.originalCurrency),
          tags: expense.tags || [],
        };
        
        set((state) => ({
          expenses: [...state.expenses, newExpense]
        }));

        // Auto-generate recurring instances if needed
        if (expense.recurring && expense.recurring.isActive) {
          get().generateOverdueRecurringExpenses();
        }
      },
      
      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) => {
            if (expense.id === id) {
              const updatedExpense = { ...expense, ...updates };
              // Recalculate converted amount if currency changed
              if (updates.originalAmount !== undefined || updates.originalCurrency !== undefined) {
                updatedExpense.amount = get().getConvertedAmount(
                  updatedExpense.originalAmount,
                  updatedExpense.originalCurrency
                );
              }
              return updatedExpense;
            }
            return expense;
          })
        }));
      },
      
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id)
        }));
      },
      
      getTotal: () => {
        return get().expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      setBudget: (amount) => {
        set((state) => ({
          budget: {
            ...state.budget,
            monthlyLimit: amount,
            month: getCurrentMonth(),
          }
        }));
      },

      getCurrentMonthExpenses: () => {
        const currentMonth = getCurrentMonth();
        return get().getFilteredExpenses().filter(expense => 
          expense.date.startsWith(currentMonth)
        );
      },

      getCurrentMonthTotal: () => {
        return get().getCurrentMonthExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getRemainingBudget: () => {
        const { budget } = get();
        const spent = get().getCurrentMonthTotal();
        return budget.monthlyLimit - spent;
      },

      getDailySpendingData: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const expenses = get().getFilteredExpenses().filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        );

        const dailyTotals: { [key: string]: number } = {};
        
        // Initialize all days with 0
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyTotals[dateStr] = 0;
        }

        // Sum expenses by day
        expenses.forEach(expense => {
          const date = expense.date;
          dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
        });

        return Object.entries(dailyTotals)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCategoryBreakdown: () => {
        const currentMonthExpenses = get().getCurrentMonthExpenses();
        const breakdown: { [key: string]: { amount: number; count: number } } = {};

        currentMonthExpenses.forEach(expense => {
          if (!breakdown[expense.category]) {
            breakdown[expense.category] = { amount: 0, count: 0 };
          }
          breakdown[expense.category].amount += expense.amount;
          breakdown[expense.category].count += 1;
        });

        return Object.entries(breakdown).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        }));
      },

      getAverageDailySpending: () => {
        const currentMonthExpenses = get().getCurrentMonthExpenses();
        const currentDate = new Date();
        const dayOfMonth = currentDate.getDate();
        const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return dayOfMonth > 0 ? total / dayOfMonth : 0;
      },

      // New currency methods
      setPreferredCurrency: (currency) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            preferredCurrency: currency
          }
        }));
        // Recalculate all amounts in new currency
        get().updateExchangeRates();
      },

      updateExchangeRates: async () => {
        try {
          const rates = await exchangeService.getExchangeRates('USD');
          set((state) => {
            const updatedExpenses = state.expenses.map(expense => ({
              ...expense,
              amount: exchangeService.convertAmount(
                expense.originalAmount,
                expense.originalCurrency,
                state.userPreferences.preferredCurrency,
                rates
              )
            }));

            return {
              expenses: updatedExpenses,
              userPreferences: {
                ...state.userPreferences,
                exchangeRates: rates,
                lastRateUpdate: new Date().toISOString()
              }
            };
          });
        } catch (error) {
          console.error('Failed to update exchange rates:', error);
        }
      },

      getConvertedAmount: (originalAmount, originalCurrency) => {
        const { userPreferences } = get();
        return exchangeService.convertAmount(
          originalAmount,
          originalCurrency,
          userPreferences.preferredCurrency,
          userPreferences.exchangeRates
        );
      },

      formatAmount: (amount, currency) => {
        const { userPreferences } = get();
        const targetCurrency = currency || userPreferences.preferredCurrency;
        return exchangeService.formatAmount(amount, targetCurrency);
      },

      // Tag filtering methods
      setTagFilter: (tags) => {
        set({ tagFilter: tags });
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

      getAllTags: () => {
        const { expenses } = get();
        const tagSet = new Set<string>();
        expenses.forEach(expense => {
          expense.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
      },

      // Recurring expense methods
      generateOverdueRecurringExpenses: () => {
        const { expenses } = get();
        const overdueList = RecurringUtils.getOverdueRecurringExpenses(expenses);
        
        const newExpenses: Expense[] = [];
        const updatedExpenses = [...expenses];

        overdueList.forEach(({ originalExpense, missedDates }) => {
          missedDates.forEach(missedDate => {
            const recurringExpense = RecurringUtils.generateRecurringExpense(
              originalExpense,
              missedDate
            );
            
            const newExpense: Expense = {
              ...recurringExpense,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              amount: get().getConvertedAmount(recurringExpense.originalAmount, recurringExpense.originalCurrency)
            };
            
            newExpenses.push(newExpense);
          });

          // Update the original expense's next date
          const lastMissedDate = missedDates[missedDates.length - 1];
          const updatedRecurring = RecurringUtils.updateRecurringNextDate(
            originalExpense.recurring!,
            lastMissedDate
          );

          const originalIndex = updatedExpenses.findIndex(e => e.id === originalExpense.id);
          if (originalIndex !== -1) {
            updatedExpenses[originalIndex] = {
              ...updatedExpenses[originalIndex],
              recurring: updatedRecurring
            };
          }
        });

        if (newExpenses.length > 0) {
          set({
            expenses: [...updatedExpenses, ...newExpenses]
          });
        }
      },

      toggleRecurringExpense: (id, isActive) => {
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === id && expense.recurring
              ? {
                  ...expense,
                  recurring: { ...expense.recurring, isActive }
                }
              : expense
          )
        }));
      },

      // Export functionality
      exportToCSV: async (startDate, endDate) => {
        const { expenses, userPreferences } = get();
        await ExportUtils.exportToCSV(
          expenses,
          {
            startDate,
            endDate,
            preferredCurrency: userPreferences.preferredCurrency
          },
          userPreferences.exchangeRates
        );
      },
    }),
    {
      name: 'expense-store',
    }
  )
); 