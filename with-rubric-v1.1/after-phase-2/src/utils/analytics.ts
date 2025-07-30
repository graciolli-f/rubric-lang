/**
 * Pure utility functions for analytics calculations
 * No side effects, deterministic outputs
 */

import type { 
  Expense, 
  CategorySpending, 
  DailySpending, 
  BudgetState, 
  Category,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';

// Chart configuration constants
export const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
const DAYS_TO_ANALYZE = 30;

/**
 * Calculate category breakdown with percentages
 */
export function calculateCategoryBreakdown(expenses: Expense[], totalAmount: number): CategorySpending[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const categoryTotals = new Map<Category, number>();
  
  // Sum amounts by category
  expenses.forEach(expense => {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount);
  });

  // Convert to array with percentages
  return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: getCategoryPercentage(amount, totalAmount)
  })).sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate percentage for a category
 */
export function getCategoryPercentage(categoryAmount: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  return Math.round((categoryAmount / totalAmount) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate daily spending trends for the last N days
 */
export function generateDailyTrends(expenses: Expense[], days: number = DAYS_TO_ANALYZE): DailySpending[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Create a map for daily totals
  const dailyTotals = new Map<string, number>();

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateKey = formatDateForChart(date);
    dailyTotals.set(dateKey, 0);
  }

  // Sum expenses by day
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    if (expenseDate >= startDate && expenseDate <= endDate) {
      const dateKey = formatDateForChart(expenseDate);
      const current = dailyTotals.get(dateKey) || 0;
      dailyTotals.set(dateKey, current + expense.amount);
    }
  });

  // Convert to array and sort by date
  return Array.from(dailyTotals.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Filter expenses for current month only
 */
export function filterExpensesForCurrentMonth(expenses: Expense[]): Expense[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  return expenses.filter(expense => isCurrentMonth(expense.date));
}

/**
 * Calculate average daily spending over given period
 */
export function getAverageDailySpending(expenses: Expense[], days: number = DAYS_TO_ANALYZE): number {
  if (!expenses || expenses.length === 0 || days === 0) {
    return 0;
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return Math.round((total / days) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate complete budget state
 */
export function calculateBudgetState(expenses: Expense[], monthlyBudget: number): BudgetState {
  const currentMonthExpenses = filterExpensesForCurrentMonth(expenses);
  const currentMonthSpent = getCurrentMonthTotal(currentMonthExpenses);
  const remainingBudget = getRemainingBudget(currentMonthSpent, monthlyBudget);

  return {
    monthlyBudget,
    currentMonthSpent,
    remainingBudget,
    isOverBudget: currentMonthSpent > monthlyBudget
  };
}

/**
 * Get total spending for current month
 */
export function getCurrentMonthTotal(expenses: Expense[]): number {
  if (!expenses || expenses.length === 0) {
    return 0;
  }

  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculate remaining budget
 */
export function getRemainingBudget(spent: number, budget: number): number {
  return Math.max(0, budget - spent);
}

/**
 * Check if date string is in current month
 */
export function isCurrentMonth(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date.getFullYear() === now.getFullYear() && 
         date.getMonth() === now.getMonth();
}

/**
 * Get number of days in current month
 */
export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Get start of current month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Format date for chart display (YYYY-MM-DD)
 */
export function formatDateForChart(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString().split('T')[0];
}