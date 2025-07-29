import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Budget, BudgetFormData, AnalyticsData, Expense } from '../types/expense-types';

export interface AnalyticsStoreState {
  budget: Budget | null;
  isLoading: boolean;
  error: string | null;
  setBudget: (data: BudgetFormData) => Promise<void>;
  getCurrentMonthTotal: (expenses: Expense[]) => number;
  getAnalyticsData: (expenses: Expense[]) => AnalyticsData;
  getRemainingBudget: (expenses: Expense[]) => number;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        budget: null,
        isLoading: false,
        error: null,

        setBudget: async (data: BudgetFormData) => {
          set({ isLoading: true, error: null });
          
          try {
            const monthlyLimit = parseFloat(data.monthlyLimit);
            if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
              throw new Error('Budget must be a positive number');
            }

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const now = new Date().toISOString();
            
            const newBudget: Budget = {
              monthlyLimit,
              currentMonth,
              createdAt: now,
              updatedAt: now
            };

            set({ budget: newBudget, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to set budget',
              isLoading: false 
            });
            throw error;
          }
        },

        getCurrentMonthTotal: (expenses: Expense[]) => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          
          return expenses
            .filter(expense => expense.date.startsWith(currentMonth))
            .reduce((total, expense) => total + expense.amount, 0);
        },

        getRemainingBudget: (expenses: Expense[]) => {
          const { budget } = get();
          if (!budget) return 0;
          
          const currentMonthTotal = get().getCurrentMonthTotal(expenses);
          return Math.max(0, budget.monthlyLimit - currentMonthTotal);
        },

        getAnalyticsData: (expenses: Expense[]): AnalyticsData => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const currentMonthExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));
          
          // Category breakdown
          const categoryTotals = new Map<string, number>();
          currentMonthExpenses.forEach(expense => {
            const current = categoryTotals.get(expense.category) || 0;
            categoryTotals.set(expense.category, current + expense.amount);
          });
          
          const totalAmount = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          const categoryBreakdown = Array.from(categoryTotals.entries()).map(([category, amount]) => ({
            category: category as any,
            amount,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
          }));

          // Daily trends for last 30 days
          const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
          });

          const dailyTrends = last30Days.map(date => {
            const dayTotal = expenses
              .filter(expense => expense.date === date)
              .reduce((sum, expense) => sum + expense.amount, 0);
            return { date, amount: dayTotal };
          });

          // Calculate average daily spending
          const daysInMonth = new Date().getDate();
          const averageDaily = totalAmount / daysInMonth;

          return {
            categoryBreakdown,
            dailyTrends,
            currentMonthTotal: totalAmount,
            averageDaily,
            transactionCount: currentMonthExpenses.length
          };
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'analytics-data',
        partialize: (state) => ({ budget: state.budget }),
      }
    ),
    {
      name: 'analytics-store',
    }
  )
); 