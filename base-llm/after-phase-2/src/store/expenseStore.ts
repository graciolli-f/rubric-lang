import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, Budget } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  budget: Budget;
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
}

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
        return get().expenses.filter(expense => 
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
        
        const expenses = get().expenses.filter(expense => 
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
    }),
    {
      name: 'expense-store',
    }
  )
); 