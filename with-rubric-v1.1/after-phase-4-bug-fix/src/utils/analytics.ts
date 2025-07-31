/**
 * Pure utility functions for expense analytics calculations
 * No side effects, deterministic outputs
 */

import type { Expense, Category, CategoryData, DailySpendingData } from '../types/expense.types';
import { CATEGORY_COLORS } from '../types/expense.types';
import { formatDate } from './date';

// Constants
const DEFAULT_DAYS = 30;

/**
 * Calculate expense breakdown by category with percentages
 */
export function calculateCategoryBreakdown(expenses: Expense[]): CategoryData[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const categoryTotals = groupExpensesByCategory(expenses);
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return Object.entries(categoryTotals).map(([category, categoryExpenses]) => {
    const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    
    return {
      category: category as Category,
      amount,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      color: CATEGORY_COLORS[category as Category]
    };
  }).filter(item => item.amount > 0);
}

/**
 * Calculate daily spending trends over specified number of days
 */
export function calculateDailySpending(expenses: Expense[], days: number = DEFAULT_DAYS): DailySpendingData[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days + 1);

  // Filter expenses within the date range
  const filteredExpenses = filterExpensesByDateRange(
    expenses,
    startDate.toISOString().slice(0, 10),
    endDate.toISOString().slice(0, 10)
  );

  // Group expenses by date
  const dailyTotals = groupExpensesByDate(filteredExpenses);

  // Create array for all days in range, including days with no expenses
  const result: DailySpendingData[] = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().slice(0, 10);
    
    const dayExpenses = dailyTotals[dateString] || [];
    const amount = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    result.push({
      date: dateString,
      amount,
      formattedDate: formatDate(dateString)
    });
  }

  return result;
}

/**
 * Get total spending for a specific month
 */
export function getMonthlySpending(expenses: Expense[], month?: string): number {
  if (!expenses || expenses.length === 0) {
    return 0;
  }

  const targetMonth = month || new Date().toISOString().slice(0, 7);
  return filterExpensesByMonth(expenses, targetMonth)
    .reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculate average daily spending over specified number of days
 */
export function getAverageDailySpending(expenses: Expense[], days: number = DEFAULT_DAYS): number {
  if (!expenses || expenses.length === 0 || days <= 0) {
    return 0;
  }

  const dailySpending = calculateDailySpending(expenses, days);
  const totalSpent = dailySpending.reduce((sum, day) => sum + day.amount, 0);
  
  return totalSpent / days;
}

/**
 * Calculate remaining budget amount
 */
export function getRemainingBudget(budget: number, spent: number): number {
  return Math.max(0, budget - spent);
}

/**
 * Calculate budget progress percentage
 */
export function getBudgetProgress(budget: number, spent: number): number {
  if (budget <= 0) return 0;
  return Math.min(100, (spent / budget) * 100);
}

/**
 * Filter expenses by month (YYYY-MM format)
 */
export function filterExpensesByMonth(expenses: Expense[], month?: string): Expense[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const targetMonth = month || new Date().toISOString().slice(0, 7);
  return expenses.filter(expense => expense.date.startsWith(targetMonth));
}

/**
 * Filter expenses by date range (inclusive)
 */
export function filterExpensesByDateRange(expenses: Expense[], startDate: string, endDate: string): Expense[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  return expenses.filter(expense => {
    const expenseDate = expense.date;
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/**
 * Group expenses by category
 */
export function groupExpensesByCategory(expenses: Expense[]): Record<Category, Expense[]> {
  if (!expenses || expenses.length === 0) {
    return {} as Record<Category, Expense[]>;
  }

  return expenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {} as Record<Category, Expense[]>);
}

/**
 * Group expenses by date (YYYY-MM-DD format)
 */
export function groupExpensesByDate(expenses: Expense[]): Record<string, Expense[]> {
  if (!expenses || expenses.length === 0) {
    return {};
  }

  return expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
}