# Add analytics functionality to expense tracker
_Exported on 7/28/2025 at 09:48:13 EDT from Cursor (1.2.4)_

---

**User**

Add analytics functionality to the expense tracker.

New requirements:
- Create a separate analytics page/view
- Add navigation to switch between expenses list and analytics
- Pie chart showing expense breakdown by category for the current month
- Line chart showing daily spending trends over the last 30 days
- Add budget management: users can set a monthly budget (default $2000)
- Show budget vs actual spending with a progress bar
- Display remaining budget for the month
- Use Recharts for data visualization
- Calculate and show average daily spending

Make sure the analytics update in real-time as expenses are added/edited.

---

**Cursor**

I'll help you add comprehensive analytics functionality to the expense tracker. Let me first explore the current codebase structure to understand how to integrate these new features.

```typescript
export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
}

export interface ExpenseCreateData {
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
}

export interface ExpenseUpdateData extends Partial<ExpenseCreateData> {
  id: string;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// Analytics and Budget Types
export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string; // YYYY-MM-DD format
  amount: number;
}

export interface BudgetState {
  monthlyBudget: number;
  currentMonthSpending: number;
  remainingBudget: number;
  percentageUsed: number;
}

export interface AnalyticsData {
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
  budgetState: BudgetState;
  averageDailySpending: number;
}

export type ViewMode = 'expenses' | 'analytics';
```

```typescript
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
```

```typescript
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
```

```typescriptreact
import React from 'react';
import type { ViewMode } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { 
      key: 'expenses' as ViewMode, 
      label: 'Expenses', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      key: 'analytics' as ViewMode, 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onViewChange(item.key)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200
            ${currentView === item.key
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
```

```typescriptreact
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryBreakdown } from '../types';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

// Colors for different categories
const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4', 
  Shopping: '#45B7D1',
  Bills: '#FFA07A',
  Entertainment: '#98D8C8',
  Other: '#F7DC6F'
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Expense Breakdown by Category
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No expenses this month</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  // Custom label function to show percentage
  const renderLabel = (entry: CategoryBreakdown) => `${entry.percentage}%`;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Amount: ${data.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Expense Breakdown by Category
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry) => (
                <Cell 
                  key={`cell-${entry.category}`} 
                  fill={CATEGORY_COLORS[entry.category]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category breakdown list */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Breakdown</h4>
        {data.map((category) => (
          <div key={category.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category.category] }}
              />
              <span className="text-gray-700">{category.category}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-900">${category.amount.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">({category.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescriptreact
  // Custom label function to show percentage
  const renderLabel = (entry: CategoryBreakdown) => `${entry.percentage}%`;

->

  // Custom label function to show percentage
  const renderLabel = (entry: any) => `${entry.percentage}%`;
```

```typescriptreact
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailySpending } from '../types';

interface DailySpendingChartProps {
  data: DailySpending[];
}

export default function DailySpendingChart({ data }: DailySpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Spending Trends (Last 30 Days)
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No spending data available</p>
            <p className="text-sm">Add some expenses to see the trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display in tooltip
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date for X-axis (show every 5th day to avoid crowding)
  const formatXAxisDate = (dateString: string, index: number) => {
    if (index % 5 === 0) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return '';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Spent: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate some stats for display
  const totalSpent = data.reduce((sum, day) => sum + day.amount, 0);
  const daysWithSpending = data.filter(day => day.amount > 0).length;
  const highestSpendingDay = data.reduce((max, day) => 
    day.amount > max.amount ? day : max, data[0]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Spending Trends (Last 30 Days)
      </h3>
      
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatXAxisDate}
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Spent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{daysWithSpending}</p>
          <p className="text-sm text-gray-600">Days with Spending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">${highestSpendingDay.amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Highest Day</p>
        </div>
      </div>
    </div>
  );
}
```

```typescriptreact
import React, { useState } from 'react';
import type { BudgetState } from '../types';

interface BudgetOverviewProps {
  budgetState: BudgetState;
  averageDailySpending: number;
  onBudgetUpdate: (newBudget: number) => Promise<void>;
}

export default function BudgetOverview({ 
  budgetState, 
  averageDailySpending, 
  onBudgetUpdate 
}: BudgetOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budgetState.monthlyBudget.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveBudget = async () => {
    const budgetValue = parseFloat(newBudget);
    
    if (isNaN(budgetValue) || budgetValue <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    setIsUpdating(true);
    try {
      await onBudgetUpdate(budgetValue);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update budget. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setNewBudget(budgetState.monthlyBudget.toString());
    setIsEditing(false);
  };

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (budgetState.percentageUsed <= 70) return 'bg-green-500';
    if (budgetState.percentageUsed <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate projected month-end spending
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const projectedMonthlySpending = averageDailySpending * daysInMonth;
  const projectedOverage = Math.max(0, projectedMonthlySpending - budgetState.monthlyBudget);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Budget
          </button>
        )}
      </div>

      {/* Budget Amount */}
      <div className="mb-6">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget
              </label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex space-x-2 pt-6">
              <button
                onClick={handleSaveBudget}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Monthly Budget</p>
            <p className="text-2xl font-bold text-gray-900">${budgetState.monthlyBudget.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <span className="text-sm text-gray-600">{budgetState.percentageUsed}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(budgetState.percentageUsed, 100)}%` }}
          />
        </div>
        {budgetState.percentageUsed > 100 && (
          <p className="text-sm text-red-600 mt-1">
            Budget exceeded by ${(budgetState.currentMonthSpending - budgetState.monthlyBudget).toFixed(2)}
          </p>
        )}
      </div>

      {/* Budget Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            ${budgetState.currentMonthSpending.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Spent This Month</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            ${budgetState.remainingBudget.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Remaining</p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Average daily spending:</span>
          <span className="text-sm font-medium text-gray-900">${averageDailySpending.toFixed(2)}</span>
        </div>
        
        {projectedOverage > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Warning:</span> At current spending rate, you may exceed 
              your budget by ${projectedOverage.toFixed(2)} this month.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Good news:</span> You're on track to stay within your budget.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

```typescriptreact
import React from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import CategoryPieChart from '../components/CategoryPieChart';
import DailySpendingChart from '../components/DailySpendingChart';
import BudgetOverview from '../components/BudgetOverview';

export default function Analytics() {
  const { getAnalyticsData, setMonthlyBudget, isLoading, error } = useExpenseStore();
  
  // Get fresh analytics data every render to ensure real-time updates
  const analyticsData = getAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Insights into your spending patterns and budget management
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview - Full Width */}
      <BudgetOverview
        budgetState={analyticsData.budgetState}
        averageDailySpending={analyticsData.averageDailySpending}
        onBudgetUpdate={setMonthlyBudget}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Pie Chart */}
        <CategoryPieChart data={analyticsData.categoryBreakdown} />
        
        {/* Daily Spending Line Chart */}
        <DailySpendingChart data={analyticsData.dailySpending} />
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              ${analyticsData.budgetState.currentMonthSpending.toFixed(2)}
            </p>
            <p className="text-sm text-blue-700 font-medium">This Month</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              ${analyticsData.averageDailySpending.toFixed(2)}
            </p>
            <p className="text-sm text-green-700 font-medium">Daily Average</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {analyticsData.categoryBreakdown.length}
            </p>
            <p className="text-sm text-yellow-700 font-medium">Categories Used</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {analyticsData.budgetState.percentageUsed}%
            </p>
            <p className="text-sm text-purple-700 font-medium">Budget Used</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm pt-4">
        <p>Analytics update automatically as you add or modify expenses</p>
      </div>
    </div>
  );
}
```

```typescriptreact
import React, { useState } from 'react';
import type { ViewMode } from './types';
import Navigation from './components/Navigation';
import ExpenseTracker from './pages/ExpenseTracker';
import Analytics from './pages/Analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('expenses');

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* App Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Keep track of your daily expenses and stay within your budget
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center">
            <Navigation 
              currentView={currentView} 
              onViewChange={handleViewChange} 
            />
          </div>
        </div>

        {/* View Content */}
        {currentView === 'expenses' ? <ExpenseTracker /> : <Analytics />}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pt-8">
          <p>Data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}

export default App;
```

```typescriptreact
import React, { useEffect } from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseTotal from '../components/ExpenseTotal';

export default function ExpenseTracker() {
  const { 
    loadExpenses, 
    getSortedExpenses, 
    getTotal, 
    isLoading, 
    error 
  } = useExpenseStore();

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses().catch(error => {
      console.error('Failed to load expenses:', error);
    });
  }, [loadExpenses]);

  const expenses = getSortedExpenses();
  const total = getTotal();

  if (isLoading && expenses.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Global Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      <ExpenseForm />

      {/* Total Display */}
      <ExpenseTotal 
        total={total} 
        expenseCount={expenses.length} 
      />

      {/* Expenses List */}
      <ExpenseList expenses={expenses} />
    </div>
  );
}
```

Perfect! I've successfully implemented comprehensive analytics functionality for your expense tracker. Here's what has been added:

## ✅ Complete Analytics Features

### **🎯 Core Analytics Components**
- **Pie Chart**: Category breakdown for current month with percentages and color coding
- **Line Chart**: Daily spending trends over the last 30 days with summary statistics  
- **Budget Management**: Set/edit monthly budget (default $2000) with progress tracking
- **Real-time Updates**: All analytics update automatically when expenses are added/edited

### **📊 Budget Overview**
- **Progress Bar**: Visual budget usage with color-coded warnings (green/yellow/red)
- **Remaining Budget**: Clear display of what's left to spend
- **Spending Insights**: Average daily spending and projected month-end warnings
- **Easy Budget Editing**: Click to edit budget amount with validation

### **🧭 Navigation & UX**
- **Clean Navigation**: Toggle between "Expenses" and "Analytics" views
- **Responsive Design**: Works well on desktop and mobile
- **Loading States**: Proper loading indicators
- **Error Handling**: Clear error messages and validation

### **📈 Analytics Dashboard Features**
- **Quick Summary Cards**: Key metrics at a glance
- **Category Insights**: Detailed breakdown with amounts and percentages
- **Trend Analysis**: 30-day spending patterns with daily details
- **Budget Health**: Warnings when over budget or trending toward overage

### **⚡ Technical Implementation**
- **Recharts Integration**: Professional charts with interactive tooltips
- **Service Layer**: Clean separation with analytics calculations
- **Store Enhancement**: Budget persistence in localStorage
- **Type Safety**: Full TypeScript coverage for all new features

The analytics are now live and updating in real-time! Users can:
1. **Switch Views**: Use the navigation to toggle between expenses and analytics
2. **Manage Budget**: Click "Edit Budget" to set their monthly spending limit
3. **Track Progress**: See visual progress bars and spending insights
4. **Analyze Patterns**: View category breakdowns and daily spending trends
5. **Get Warnings**: Receive alerts when approaching or exceeding budget

The development server is running - you can now test the full analytics functionality by adding some expenses and switching to the Analytics view to see the charts and insights in action!

