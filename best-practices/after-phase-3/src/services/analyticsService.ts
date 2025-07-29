import type { 
  Expense, 
  ExpenseCategory, 
  CategoryBreakdown, 
  DailySpending, 
  BudgetState, 
  AnalyticsData 
} from '../types';

/**
 * Get the start and end dates for the current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

/**
 * Get the date range for the last 30 days
 */
export function getLast30DaysRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29); // Include today, so 29 days back + today = 30 days
  return { start, end };
}

/**
 * Filter expenses by date range
 */
export function filterExpensesByDateRange(
  expenses: Expense[], 
  startDate: Date, 
  endDate: Date
): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/**
 * Get expenses for the current month
 */
export function getCurrentMonthExpenses(expenses: Expense[]): Expense[] {
  const { start, end } = getCurrentMonthRange();
  return filterExpensesByDateRange(expenses, start, end);
}

/**
 * Get expenses for the last 30 days
 */
export function getLast30DaysExpenses(expenses: Expense[]): Expense[] {
  const { start, end } = getLast30DaysRange();
  return filterExpensesByDateRange(expenses, start, end);
}

/**
 * Calculate category breakdown for given expenses
 */
export function calculateCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (total === 0) {
    return [];
  }

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    amount,
    percentage: Math.round((amount / total) * 100)
  })).sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate daily spending for the last 30 days
 */
export function calculateDailySpending(expenses: Expense[]): DailySpending[] {
  const { start, end } = getLast30DaysRange();
  const last30DaysExpenses = filterExpensesByDateRange(expenses, start, end);
  
  // Create a map of all dates in the range with 0 spending
  const dailySpendingMap = new Map<string, number>();
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0];
    dailySpendingMap.set(dateString, 0);
  }
  
  // Add actual spending for each day
  last30DaysExpenses.forEach(expense => {
    const dateString = expense.date.split('T')[0]; // Extract YYYY-MM-DD part
    const currentAmount = dailySpendingMap.get(dateString) || 0;
    dailySpendingMap.set(dateString, currentAmount + expense.amount);
  });
  
  // Convert to array and sort by date
  return Array.from(dailySpendingMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate budget state
 */
export function calculateBudgetState(
  expenses: Expense[], 
  monthlyBudget: number
): BudgetState {
  const currentMonthExpenses = getCurrentMonthExpenses(expenses);
  const currentMonthSpending = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  const remainingBudget = Math.max(0, monthlyBudget - currentMonthSpending);
  const percentageUsed = monthlyBudget > 0 
    ? Math.min(100, Math.round((currentMonthSpending / monthlyBudget) * 100))
    : 0;

  return {
    monthlyBudget,
    currentMonthSpending,
    remainingBudget,
    percentageUsed
  };
}

/**
 * Calculate average daily spending over the last 30 days
 */
export function calculateAverageDailySpending(expenses: Expense[]): number {
  const last30DaysExpenses = getLast30DaysExpenses(expenses);
  const totalSpending = last30DaysExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  return Math.round((totalSpending / 30) * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate complete analytics data
 */
export function generateAnalyticsData(
  expenses: Expense[], 
  monthlyBudget: number
): AnalyticsData {
  const currentMonthExpenses = getCurrentMonthExpenses(expenses);
  
  return {
    categoryBreakdown: calculateCategoryBreakdown(currentMonthExpenses),
    dailySpending: calculateDailySpending(expenses),
    budgetState: calculateBudgetState(expenses, monthlyBudget),
    averageDailySpending: calculateAverageDailySpending(expenses)
  };
} 