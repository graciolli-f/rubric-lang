# Add analytics functionality to expense tracker
_Exported on 7/30/2025 at 18:51:52 EDT from Cursor (1.3.5)_

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

I'll help you add analytics functionality to the expense tracker. Let me first explore the project structure and understand the existing architecture and rubric requirements.

Now I understand the existing structure. Let me create a comprehensive plan for adding analytics functionality following the architectural constraints.

```typescript
/**
 * Type definitions for expense tracking domain
 * No side effects, pure type definitions
 */

export type Category = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// Analytics and Budget interfaces
export interface BudgetState {
  monthlyBudget: number;
  currentMonthSpent: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export interface CategorySpending {
  category: Category;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface AnalyticsData {
  categoryBreakdown: CategorySpending[];
  dailyTrends: DailySpending[];
  budgetData: BudgetState;
  averageDailySpending: number;
  totalCurrentMonth: number;
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation types
export type ViewMode = "expenses" | "analytics";

// Constants for category options
export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

// Default budget amount
export const DEFAULT_MONTHLY_BUDGET = 2000;
```

```plaintext
module ExpenseTypes {
  @ "Type definitions for expense tracking domain"
  @ "No side effects, pure type definitions"

  type: "utility"
  
  location: "src/types/expense.types.ts"
  
  interface {
    @ "Category enumeration"
    public enum Category = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other"
    
    @ "Main expense interface"
    public interface Expense {
      id: string,
      amount: number,
      category: Category,
      date: string,
      description: string,
      createdAt: string,
      updatedAt: string
    }
    
    @ "Form data interface"
    public interface ExpenseFormData {
      amount: number,
      category: Category,
      date: string,
      description: string
    }
    
    @ "Store state interface"
    public interface ExpenseState {
      expenses: Expense[],
      isLoading: boolean,
      error: string?
    }
    
    @ "Budget state interface"
    public interface BudgetState {
      monthlyBudget: number,
      currentMonthSpent: number,
      remainingBudget: number,
      isOverBudget: boolean
    }
    
    @ "Category spending breakdown"
    public interface CategorySpending {
      category: Category,
      amount: number,
      percentage: number
    }
    
    @ "Daily spending data"
    public interface DailySpending {
      date: string,
      amount: number
    }
    
    @ "Analytics data aggregate"
    public interface AnalyticsData {
      categoryBreakdown: CategorySpending[],
      dailyTrends: DailySpending[],
      budgetData: BudgetState,
      averageDailySpending: number,
      totalCurrentMonth: number
    }
    
    @ "Analytics state interface"
    public interface AnalyticsState {
      data: AnalyticsData?,
      isLoading: boolean,
      error: string?
    }
    
    @ "Navigation view mode"
    public enum ViewMode = "expenses" | "analytics"
  }
  
  state {
    @ "No mutable state allowed in types"
    @ "Constants for category options"
    private readonly CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"]
  }
  
  imports {
    @ "No imports needed for basic types"
    deny imports ["*"]
  }
  
  constraints {
    @ "Pure type definitions only"
    deny io.*  @ "No I/O operations"
    deny pattern.side_effects
    deny pattern.mutations
    
    @ "No async operations"
    deny pattern.async
    deny pattern.promises
    
    @ "Export all public types"
    require exports ["[!_]*"]
    
    @ "Size constraints"
    warn file.lines > 100
    deny file.lines > 200
  }
}
```

```plaintext
module ExpenseTypes {
  @ "Type definitions for expense tracking domain"
  @ "No side effects, pure type definitions"

  type: "utility"
  
  location: "src/types/expense.types.ts"
  
  interface {
    @ "Category enumeration"
    public enum Category = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other"
    
    @ "Main expense interface"
    public interface Expense {
      id: string,
      amount: number,
      category: Category,
      date: string,
      description: string,
      createdAt: string,
      updatedAt: string
    }
    
    @ "Form data interface"
    public interface ExpenseFormData {
      amount: number,
      category: Category,
      date: string,
      description: string
    }
    
    @ "Store state interface"
    public interface ExpenseState {
      expenses: Expense[],
      isLoading: boolean,
      error: string?
    }
    
    @ "Budget state interface"
    public interface BudgetState {
      monthlyBudget: number,
      currentMonthSpent: number,
      remainingBudget: number,
      isOverBudget: boolean
    }
    
    @ "Category spending breakdown"
    public interface CategorySpending {
      category: Category,
      amount: number,
      percentage: number
    }
    
    @ "Daily spending data"
    public interface DailySpending {
      date: string,
      amount: number
    }
    
    @ "Analytics data aggregate"
    public interface AnalyticsData {
      categoryBreakdown: CategorySpending[],
      dailyTrends: DailySpending[],
      budgetData: BudgetState,
      averageDailySpending: number,
      totalCurrentMonth: number
    }
    
    @ "Analytics state interface"
    public interface AnalyticsState {
      data: AnalyticsData?,
      isLoading: boolean,
      error: string?
    }
    
    @ "Navigation view mode"
    public enum ViewMode = "expenses" | "analytics"
  }
  
  state {
    @ "No mutable state allowed in types"
    @ "Constants for category options"
    private readonly CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"]
    
    @ "Default budget constant"
    private readonly DEFAULT_MONTHLY_BUDGET = 2000
  }
  
  imports {
    @ "No imports needed for basic types"
    deny imports ["*"]
  }
  
  constraints {
    @ "Pure type definitions only"
    deny io.*  @ "No I/O operations"
    deny pattern.side_effects
    deny pattern.mutations
    
    @ "No async operations"
    deny pattern.async
    deny pattern.promises
    
    @ "Export all public types"
    require exports ["[!_]*"]
    
    @ "Size constraints"
    warn file.lines > 100
    deny file.lines > 200
  }
}
```

```plaintext
module AnalyticsUtils {
  @ "Pure utility functions for analytics calculations"
  @ "No side effects, deterministic outputs"

  type: "utility"
  
  location: "src/utils/analytics.ts"
  
  interface {
    @ "Formatting functions"
    public format[Something](value: [InputType]) -> string
    public parse[Something](text: string) -> [OutputType]
    
    @ "Validation functions"
    public validate[Something](value: [InputType]) -> boolean
    public is[Condition](value: unknown) -> boolean
    
    @ "Transformation functions"
    public transform[Input]To[Output](input: [InputType]) -> [OutputType]
    public normalize[Data](data: [DataType]) -> [NormalizedType]
    
    @ "Calculation functions"
    public calculate[Metric](params: [Params]) -> number
    public aggregate[Data](items: [Item][]) -> [Summary]
    
    @ "Helper types and constants"
    public readonly [CONSTANT_NAME]: [ConstantType]
    public type [HelperType] = [TypeDefinition]
  }
  
  state {
    @ "No mutable state allowed in utilities"
    @ "Use module-level constants instead"
    private readonly CONFIG = { [config]: [value] }
    private readonly REGEX_PATTERNS = { [pattern]: /[regex]/ }
  }
  
  imports {
    @ "Types only"
    allow "../types" as types
    
    @ "Pure external libraries"
    allow "date-fns" as external
    allow "lodash" as external
    allow "ramda" as external
    
    @ "Other utilities for composition"
    allow "./[other-util]" as {[specific, functions]}
    
    @ "No framework imports"
    deny imports ["react", "vue", "@angular/*"]
    
    @ "No side-effect imports"
    deny imports ["../stores/*", "../services/*", "../data/*"]
    
    @ "No component imports"
    deny imports ["../components/*"]
  }
  
  constraints {
    @ "Pure functions only"
    deny io.*  @ "No I/O operations"
    deny pattern.side_effects
    deny pattern.mutations
    
    @ "No async operations"
    deny pattern.async
    deny pattern.promises
    
    @ "Deterministic behavior"
    require pattern.deterministic
    deny pattern.random_without_seed
    deny pattern.date_now @ "Use passed timestamps"
    
    @ "Error handling"
    require pattern.defensive @ "Validate inputs"
    
    @ "Documentation"
    require pattern.jsdoc @ "Document complex functions"
    
    @ "Testing"
    require pattern.unit_testable
    
    @ "Export all public functions"
    require exports ["[!_]*"]
    
    @ "Size constraints"
    warn file.lines > 200
    deny file.lines > 400
    warn function.lines > 20
  }
}
```

```plaintext
module AnalyticsUtils {
  @ "Pure utility functions for analytics calculations"
  @ "No side effects, deterministic outputs"

  type: "utility"
  
  location: "src/utils/analytics.ts"
  
  interface {
    @ "Category analysis functions"
    public calculateCategoryBreakdown(expenses: Expense[], totalAmount: number) -> CategorySpending[]
    public getCategoryPercentage(categoryAmount: number, totalAmount: number) -> number
    
    @ "Time-based analysis functions"
    public generateDailyTrends(expenses: Expense[], days: number) -> DailySpending[]
    public filterExpensesForCurrentMonth(expenses: Expense[]) -> Expense[]
    public getAverageDailySpending(expenses: Expense[], days: number) -> number
    
    @ "Budget calculation functions"
    public calculateBudgetState(expenses: Expense[], monthlyBudget: number) -> BudgetState
    public getCurrentMonthTotal(expenses: Expense[]) -> number
    public getRemainingBudget(spent: number, budget: number) -> number
    
    @ "Date utility functions"
    public isCurrentMonth(dateString: string) -> boolean
    public getDaysInCurrentMonth() -> number
    public getStartOfMonth(date?: Date) -> Date
    public formatDateForChart(date: Date) -> string
    
    @ "Helper types and constants"
    public readonly CHART_COLORS: string[]
  }
  
  state {
    @ "No mutable state allowed in utilities"
    @ "Chart configuration constants"
    private readonly CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]
    private readonly DAYS_TO_ANALYZE = 30
  }
  
  imports {
    @ "Types only"
    allow "../types/expense.types" as types
    
    @ "Date manipulation libraries"
    allow "date-fns" as date
    
    @ "No framework imports"
    deny imports ["react", "vue", "@angular/*"]
    
    @ "No side-effect imports"
    deny imports ["../stores/*", "../services/*", "../data/*"]
    
    @ "No component imports"
    deny imports ["../components/*"]
  }
  
  constraints {
    @ "Pure functions only"
    deny io.*  @ "No I/O operations"
    deny pattern.side_effects
    deny pattern.mutations
    
    @ "No async operations"
    deny pattern.async
    deny pattern.promises
    
    @ "Deterministic behavior"
    require pattern.deterministic
    deny pattern.random_without_seed
    deny pattern.date_now @ "Use passed timestamps"
    
    @ "Error handling"
    require pattern.defensive @ "Validate inputs"
    
    @ "Documentation"
    require pattern.jsdoc @ "Document complex functions"
    
    @ "Testing"
    require pattern.unit_testable
    
    @ "Export all public functions"
    require exports ["[!_]*"]
    
    @ "Size constraints"
    warn file.lines > 200
    deny file.lines > 400
    warn function.lines > 20
  }
}
```

```typescript
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
```

```plaintext
module ExpenseStore {
  @ "State management for expense tracking"
  @ "Coordinates between UI and manages expense data"

  type: "store"
  
  location: "src/stores/expense-store.ts"
  
  interface {
    @ "Zustand store hook"
    public useExpenseStore() -> {
      @ "State"
      expenses: Expense[],
      isLoading: boolean,
      error: string?,
      
      @ "Actions"
      addExpense: (data: ExpenseFormData) -> void,
      updateExpense: (id: string, data: ExpenseFormData) -> void,
      deleteExpense: (id: string) -> void,
      
      @ "UI state actions"
      clearError: () -> void,
      reset: () -> void,
      
      @ "Computed values"
      getTotalAmount: () -> number,
      getExpensesSortedByDate: () -> Expense[],
      
      @ "Budget management"
      monthlyBudget: number,
      setBudget: (amount: number) -> void,
      
      @ "Analytics computed values"
      getAnalyticsData: () -> AnalyticsData,
      getCategoryBreakdown: () -> CategorySpending[],
      getDailyTrends: () -> DailySpending[],
      getBudgetState: () -> BudgetState,
      getAverageDailySpending: () -> number
    }
  }
  
  state {
    @ "Internal state shape"
    private _expenses: Expense[]
    private _isLoading: boolean
    private _error: string?
  }
  
  imports {
    @ "State management library"
    allow "zustand" as external
    
    @ "Types"
    allow "../types/expense.types" as types
    
    @ "Utilities for ID generation and date handling"
    allow "../utils/date" as {toISOString}
    
    @ "No services since no backend yet"
    deny imports ["../services/*"]
    
    @ "Cannot import data layer directly"
    deny imports ["../data/*"]
    
    @ "Cannot import components"
    deny imports ["../components/*"]
  }
  
  constraints {
    @ "State management patterns"
    require pattern.immutable_updates
    require pattern.action_error_handling
    
    @ "No business logic beyond basic CRUD"
    deny pattern.complex_calculations
    deny pattern.validation_logic
    
    @ "No API calls - in-memory only for now"
    deny io.network.*
    
    @ "No storage for now"
    deny io.localStorage.*
    
    @ "DevTools support"
    allow io.console.* when NODE_ENV="development"
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Size constraints"
    warn file.lines > 150
    deny file.lines > 250
  }
}
```

```plaintext
module ExpenseStore {
  @ "State management for expense tracking"
  @ "Coordinates between UI and manages expense data"

  type: "store"
  
  location: "src/stores/expense-store.ts"
  
  interface {
    @ "Zustand store hook"
    public useExpenseStore() -> {
      @ "State"
      expenses: Expense[],
      isLoading: boolean,
      error: string?,
      
      @ "Actions"
      addExpense: (data: ExpenseFormData) -> void,
      updateExpense: (id: string, data: ExpenseFormData) -> void,
      deleteExpense: (id: string) -> void,
      
      @ "UI state actions"
      clearError: () -> void,
      reset: () -> void,
      
      @ "Computed values"
      getTotalAmount: () -> number,
      getExpensesSortedByDate: () -> Expense[],
      
      @ "Budget management"
      monthlyBudget: number,
      setBudget: (amount: number) -> void,
      
      @ "Analytics computed values"
      getAnalyticsData: () -> AnalyticsData,
      getCategoryBreakdown: () -> CategorySpending[],
      getDailyTrends: () -> DailySpending[],
      getBudgetState: () -> BudgetState,
      getAverageDailySpending: () -> number
    }
  }
  
  state {
    @ "Internal state shape"
    private _expenses: Expense[]
    private _isLoading: boolean
    private _error: string?
    private _monthlyBudget: number
  }
  
  imports {
    @ "State management library"
    allow "zustand" as external
    
    @ "Types"
    allow "../types/expense.types" as types
    
    @ "Utilities for ID generation and date handling"
    allow "../utils/date" as {toISOString}
    
    @ "No services since no backend yet"
    deny imports ["../services/*"]
    
    @ "Cannot import data layer directly"
    deny imports ["../data/*"]
    
    @ "Cannot import components"
    deny imports ["../components/*"]
  }
  
  constraints {
    @ "State management patterns"
    require pattern.immutable_updates
    require pattern.action_error_handling
    
    @ "No business logic beyond basic CRUD"
    deny pattern.complex_calculations
    deny pattern.validation_logic
    
    @ "No API calls - in-memory only for now"
    deny io.network.*
    
    @ "No storage for now"
    deny io.localStorage.*
    
    @ "DevTools support"
    allow io.console.* when NODE_ENV="development"
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Size constraints"
    warn file.lines > 150
    deny file.lines > 250
  }
}
```

```plaintext
module ExpenseStore {
  @ "State management for expense tracking"
  @ "Coordinates between UI and manages expense data"

  type: "store"
  
  location: "src/stores/expense-store.ts"
  
  interface {
    @ "Zustand store hook"
    public useExpenseStore() -> {
      @ "State"
      expenses: Expense[],
      isLoading: boolean,
      error: string?,
      
      @ "Actions"
      addExpense: (data: ExpenseFormData) -> void,
      updateExpense: (id: string, data: ExpenseFormData) -> void,
      deleteExpense: (id: string) -> void,
      
      @ "UI state actions"
      clearError: () -> void,
      reset: () -> void,
      
      @ "Computed values"
      getTotalAmount: () -> number,
      getExpensesSortedByDate: () -> Expense[],
      
      @ "Budget management"
      monthlyBudget: number,
      setBudget: (amount: number) -> void,
      
      @ "Analytics computed values"
      getAnalyticsData: () -> AnalyticsData,
      getCategoryBreakdown: () -> CategorySpending[],
      getDailyTrends: () -> DailySpending[],
      getBudgetState: () -> BudgetState,
      getAverageDailySpending: () -> number
    }
  }
  
  state {
    @ "Internal state shape"
    private _expenses: Expense[]
    private _isLoading: boolean
    private _error: string?
    private _monthlyBudget: number
  }
  
  imports {
    @ "State management library"
    allow "zustand" as external
    
    @ "Types"
    allow "../types/expense.types" as types
    
    @ "Utilities for ID generation and date handling"
    allow "../utils/date" as {toISOString}
    
    @ "Analytics utilities for computed values"
    allow "../utils/analytics" as analytics
    
    @ "No services since no backend yet"
    deny imports ["../services/*"]
    
    @ "Cannot import data layer directly"
    deny imports ["../data/*"]
    
    @ "Cannot import components"
    deny imports ["../components/*"]
  }
  
  constraints {
    @ "State management patterns"
    require pattern.immutable_updates
    require pattern.action_error_handling
    
    @ "No business logic beyond basic CRUD"
    deny pattern.complex_calculations
    deny pattern.validation_logic
    
    @ "No API calls - in-memory only for now"
    deny io.network.*
    
    @ "No storage for now"
    deny io.localStorage.*
    
    @ "DevTools support"
    allow io.console.* when NODE_ENV="development"
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Size constraints"
    warn file.lines > 150
    deny file.lines > 250
  }
}
```

```typescript
/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { 
  Expense, 
  ExpenseFormData, 
  AnalyticsData, 
  CategorySpending, 
  DailySpending, 
  BudgetState,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as analytics from '../utils/analytics';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
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
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
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
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
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
}));
```

```typescript
/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { 
  Expense, 
  ExpenseFormData, 
  AnalyticsData, 
  CategorySpending, 
  DailySpending, 
  BudgetState,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as analytics from '../utils/analytics';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  monthlyBudget: number;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Budget management
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  
  // Analytics computed values
  getAnalyticsData: () => AnalyticsData;
  getCategoryBreakdown: () => CategorySpending[];
  getDailyTrends: () => DailySpending[];
  getBudgetState: () => BudgetState;
  getAverageDailySpending: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
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
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
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
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
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
}));
```

```typescript
/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { 
  Expense, 
  ExpenseFormData, 
  AnalyticsData, 
  CategorySpending, 
  DailySpending, 
  BudgetState,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as analytics from '../utils/analytics';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  monthlyBudget: number;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Budget management
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  
  // Analytics computed values
  getAnalyticsData: () => AnalyticsData;
  getCategoryBreakdown: () => CategorySpending[];
  getDailyTrends: () => DailySpending[];
  getBudgetState: () => BudgetState;
  getAverageDailySpending: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  monthlyBudget: 2000, // DEFAULT_MONTHLY_BUDGET
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
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
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
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
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
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
}));
```

```typescript
/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { 
  Expense, 
  ExpenseFormData, 
  AnalyticsData, 
  CategorySpending, 
  DailySpending, 
  BudgetState,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as analytics from '../utils/analytics';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  monthlyBudget: number;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Budget management
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  
  // Analytics computed values
  getAnalyticsData: () => AnalyticsData;
  getCategoryBreakdown: () => CategorySpending[];
  getDailyTrends: () => DailySpending[];
  getBudgetState: () => BudgetState;
  getAverageDailySpending: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  monthlyBudget: 2000, // DEFAULT_MONTHLY_BUDGET
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
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
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
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
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
      monthlyBudget: 2000, // DEFAULT_MONTHLY_BUDGET
    });
  },

  // Budget management
  setBudget: (amount: number) => {
    if (amount < 0) {
      set({ error: 'Budget amount must be positive' });
      return;
    }
    set({ monthlyBudget: amount, error: null });
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
}));
```

```typescript
/**
 * State management for expense tracking
 * Coordinates between UI and manages expense data
 */

import { create } from 'zustand';
import type { 
  Expense, 
  ExpenseFormData, 
  AnalyticsData, 
  CategorySpending, 
  DailySpending, 
  BudgetState,
  DEFAULT_MONTHLY_BUDGET 
} from '../types/expense.types';
import { toISOString } from '../utils/date';
import * as analytics from '../utils/analytics';

interface ExpenseStore {
  // State
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  monthlyBudget: number;
  
  // Actions
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  // Budget management
  setBudget: (amount: number) => void;
  
  // UI state actions
  clearError: () => void;
  reset: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getExpensesSortedByDate: () => Expense[];
  
  // Analytics computed values
  getAnalyticsData: () => AnalyticsData;
  getCategoryBreakdown: () => CategorySpending[];
  getDailyTrends: () => DailySpending[];
  getBudgetState: () => BudgetState;
  getAverageDailySpending: () => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  expenses: [],
  isLoading: false,
  error: null,
  monthlyBudget: 2000, // DEFAULT_MONTHLY_BUDGET
  
  // Actions
  addExpense: (data: ExpenseFormData) => {
    try {
      const now = new Date();
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
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
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...data,
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
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
      monthlyBudget: 2000, // DEFAULT_MONTHLY_BUDGET
    });
  },

  // Budget management
  setBudget: (amount: number) => {
    if (amount < 0) {
      set({ error: 'Budget amount must be positive' });
      return;
    }
    set({ monthlyBudget: amount, error: null });
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

  // Analytics computed values
  getAnalyticsData: () => {
    const { expenses, monthlyBudget } = get();
    const totalAmount = get().getTotalAmount();
    
    return {
      categoryBreakdown: analytics.calculateCategoryBreakdown(expenses, totalAmount),
      dailyTrends: analytics.generateDailyTrends(expenses),
      budgetData: analytics.calculateBudgetState(expenses, monthlyBudget),
      averageDailySpending: analytics.getAverageDailySpending(expenses),
      totalCurrentMonth: analytics.getCurrentMonthTotal(
        analytics.filterExpensesForCurrentMonth(expenses)
      )
    };
  },

  getCategoryBreakdown: () => {
    const { expenses } = get();
    const totalAmount = get().getTotalAmount();
    return analytics.calculateCategoryBreakdown(expenses, totalAmount);
  },

  getDailyTrends: () => {
    const { expenses } = get();
    return analytics.generateDailyTrends(expenses);
  },

  getBudgetState: () => {
    const { expenses, monthlyBudget } = get();
    return analytics.calculateBudgetState(expenses, monthlyBudget);
  },

  getAverageDailySpending: () => {
    const { expenses } = get();
    return analytics.getAverageDailySpending(expenses);
  },
}));
```

```plaintext
module CategoryPieChart {
  @ "Pure presentation component for displaying category spending breakdown"
  @ "Props-only, no stores or external state"

  type: "presentation"
  
  location: "src/components/CategoryPieChart.tsx"
  
  interface {
    @ "Props interface"
    public CategoryPieChart(props: {
      data: CategorySpending[],
      className?: string,
      title?: string
    }) -> JSX.Element
  }
  
  state {
    @ "No local state needed for chart display"
  }
  
  imports {
    @ "React only"
    allow "react" as external
    
    @ "Chart library"
    allow "recharts" as external
    
    @ "UI libraries"
    allow "clsx" as external
    
    @ "Type imports only"
    allow "../types/expense.types" as types
    
    @ "Chart utilities"
    allow "../utils/analytics" as {CHART_COLORS}
    
    @ "No stores, services, or data access"
    deny imports ["../stores/*", "../services/*", "../data/*", "../hooks/*"]
  }
  
  constraints {
    @ "No side effects"
    deny io.*
    
    @ "No async operations"
    deny pattern.async_operations
    
    @ "Props validation"
    require pattern.prop_types_or_typescript
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Keep it simple"
    warn file.lines > 100
    deny file.lines > 150
    
    @ "Performance"
    require pattern.memo_if_expensive
  }
}
```

```plaintext
module DailyTrendsChart {
  @ "Pure presentation component for displaying daily spending trends"
  @ "Props-only, no stores or external state"

  type: "presentation"
  
  location: "src/components/DailyTrendsChart.tsx"
  
  interface {
    @ "Props interface"
    public DailyTrendsChart(props: {
      data: DailySpending[],
      className?: string,
      title?: string
    }) -> JSX.Element
  }
  
  state {
    @ "No local state needed for chart display"
  }
  
  imports {
    @ "React only"
    allow "react" as external
    
    @ "Chart library"
    allow "recharts" as external
    
    @ "UI libraries"
    allow "clsx" as external
    
    @ "Type imports only"
    allow "../types/expense.types" as types
    
    @ "No stores, services, or data access"
    deny imports ["../stores/*", "../services/*", "../data/*", "../hooks/*"]
  }
  
  constraints {
    @ "No side effects"
    deny io.*
    
    @ "No async operations"
    deny pattern.async_operations
    
    @ "Props validation"
    require pattern.prop_types_or_typescript
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Keep it simple"
    warn file.lines > 100
    deny file.lines > 150
    
    @ "Performance"
    require pattern.memo_if_expensive
  }
}
```

```typescriptreact
/**
 * Pure presentation component for displaying category spending breakdown
 * Props-only, no stores or external state
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import clsx from 'clsx';
import type { CategorySpending } from '../types/expense.types';
import { CHART_COLORS } from '../utils/analytics';

interface CategoryPieChartProps {
  data: CategorySpending[];
  className?: string;
  title?: string;
}

export function CategoryPieChart({ data, className, title = "Expenses by Category" }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center h-64 text-gray-500", className)}>
        No category data available
      </div>
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percentage }) => `${category}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`, 
              'Amount'
            ]}
            labelFormatter={(label: string) => `Category: ${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div 
            key={item.category} 
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-gray-700">{item.category}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">${item.amount.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescriptreact
/**
 * Pure presentation component for displaying daily spending trends
 * Props-only, no stores or external state
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import type { DailySpending } from '../types/expense.types';

interface DailyTrendsChartProps {
  data: DailySpending[];
  className?: string;
  title?: string;
}

export function DailyTrendsChart({ data, className, title = "Daily Spending Trends (Last 30 Days)" }: DailyTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center h-64 text-gray-500", className)}>
        No trend data available
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={clsx("w-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            labelFormatter={(label: string) => formatTooltipDate(label)}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#0088FE" 
            strokeWidth={2}
            dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary statistics below chart */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-500">Max Daily</div>
          <div className="font-medium">
            ${Math.max(...data.map(d => d.amount)).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Average</div>
          <div className="font-medium">
            ${(data.reduce((sum, d) => sum + d.amount, 0) / data.length).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Total Period</div>
          <div className="font-medium">
            ${data.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
```

```plaintext
module BudgetProgress {
  @ "Pure presentation component for displaying budget progress bar"
  @ "Props-only, no stores or external state"

  type: "presentation"
  
  location: "src/components/BudgetProgress.tsx"
  
  interface {
    @ "Props interface"
    public BudgetProgress(props: {
      budgetData: BudgetState,
      className?: string,
      showDetails?: boolean
    }) -> JSX.Element
  }
  
  state {
    @ "No local state needed for progress display"
  }
  
  imports {
    @ "React only"
    allow "react" as external
    
    @ "UI libraries"
    allow "clsx" as external
    
    @ "Type imports only"
    allow "../types/expense.types" as types
    
    @ "No stores, services, or data access"
    deny imports ["../stores/*", "../services/*", "../data/*", "../hooks/*"]
  }
  
  constraints {
    @ "No side effects"
    deny io.*
    
    @ "No async operations"
    deny pattern.async_operations
    
    @ "Props validation"
    require pattern.prop_types_or_typescript
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Keep it simple"
    warn file.lines > 100
    deny file.lines > 150
    
    @ "Performance"
    require pattern.memo_if_expensive
  }
}
```

```plaintext
module BudgetManager {
  @ "Presentation component for managing monthly budget"
  @ "Has local form state but delegates budget changes to parent"

  type: "presentation"
  
  location: "src/components/BudgetManager.tsx"
  
  interface {
    @ "Props interface"
    public BudgetManager(props: {
      currentBudget: number,
      onBudgetChange: (amount: number) -> void,
      className?: string
    }) -> JSX.Element
  }
  
  state {
    @ "Local form state for budget input"
    private isEditing: boolean
    private tempBudgetValue: string
  }
  
  imports {
    @ "React only"
    allow "react" as external
    
    @ "UI libraries"
    allow "clsx" as external
    allow "lucide-react" as external
    
    @ "Type imports only"
    allow "../types/expense.types" as types
    
    @ "No stores, services, or data access"
    deny imports ["../stores/*", "../services/*", "../data/*", "../hooks/*"]
  }
  
  constraints {
    @ "No side effects beyond form handling"
    deny io.*
    
    @ "No async operations"
    deny pattern.async_operations
    
    @ "Props validation"
    require pattern.prop_types_or_typescript
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Keep it simple"
    warn file.lines > 150
    deny file.lines > 200
    
    @ "Performance"
    require pattern.memo_if_expensive
  }
}
```

```typescriptreact
/**
 * Pure presentation component for displaying budget progress bar
 * Props-only, no stores or external state
 */

import React from 'react';
import clsx from 'clsx';
import type { BudgetState } from '../types/expense.types';

interface BudgetProgressProps {
  budgetData: BudgetState;
  className?: string;
  showDetails?: boolean;
}

export function BudgetProgress({ budgetData, className, showDetails = true }: BudgetProgressProps) {
  const { monthlyBudget, currentMonthSpent, remainingBudget, isOverBudget } = budgetData;
  
  // Calculate percentage spent
  const percentageSpent = Math.min((currentMonthSpent / monthlyBudget) * 100, 100);
  
  // Progress bar color based on usage
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentageSpent > 80) return 'bg-yellow-500';
    if (percentageSpent > 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getBackgroundColor = () => {
    if (isOverBudget) return 'bg-red-100';
    return 'bg-gray-200';
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Budget Overview */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Monthly Budget</div>
            <div className="text-lg font-semibold text-gray-800">
              ${monthlyBudget.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Spent This Month</div>
            <div className={clsx(
              "text-lg font-semibold",
              isOverBudget ? "text-red-600" : "text-gray-800"
            )}>
              ${currentMonthSpent.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">
              {isOverBudget ? "Over Budget" : "Remaining"}
            </div>
            <div className={clsx(
              "text-lg font-semibold",
              isOverBudget ? "text-red-600" : "text-green-600"
            )}>
              {isOverBudget ? "-" : ""}${Math.abs(remainingBudget).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Budget Progress</span>
          <span className={clsx(
            "font-medium",
            isOverBudget ? "text-red-600" : "text-gray-700"
          )}>
            {percentageSpent.toFixed(1)}%
          </span>
        </div>
        
        <div className={clsx(
          "w-full rounded-full h-4",
          getBackgroundColor()
        )}>
          <div
            className={clsx(
              "h-4 rounded-full transition-all duration-300 ease-in-out",
              getProgressColor()
            )}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
        
        {/* Over-budget indicator */}
        {isOverBudget && (
          <div className="text-sm text-red-600 font-medium text-center">
            ⚠️ You've exceeded your monthly budget by ${(currentMonthSpent - monthlyBudget).toFixed(2)}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>$0</span>
        <span>${monthlyBudget.toFixed(0)}</span>
      </div>
    </div>
  );
}
```

```typescriptreact
/**
 * Presentation component for managing monthly budget
 * Has local form state but delegates budget changes to parent
 */

import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface BudgetManagerProps {
  currentBudget: number;
  onBudgetChange: (amount: number) => void;
  className?: string;
}

export function BudgetManager({ currentBudget, onBudgetChange, className }: BudgetManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudgetValue, setTempBudgetValue] = useState(currentBudget.toString());

  const handleEditStart = () => {
    setTempBudgetValue(currentBudget.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const newBudget = parseFloat(tempBudgetValue);
    
    if (isNaN(newBudget) || newBudget <= 0) {
      // Reset to current value if invalid
      setTempBudgetValue(currentBudget.toString());
      return;
    }
    
    onBudgetChange(newBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempBudgetValue(currentBudget.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={clsx("bg-white p-4 rounded-lg border", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Budget</h3>
        
        {!isEditing ? (
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-green-600">
              ${currentBudget.toFixed(2)}
            </span>
            <button
              onClick={handleEditStart}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit budget"
            >
              <Edit3 size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={tempBudgetValue}
                onChange={(e) => setTempBudgetValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-8 pr-3 py-1 border rounded-md w-32 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 transition-colors"
              title="Save budget"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:text-red-700 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <p className="text-sm text-gray-500 mt-2">
          Click the edit icon to update your monthly spending limit
        </p>
      )}
      
      {isEditing && (
        <p className="text-sm text-gray-500 mt-2">
          Press Enter to save or Escape to cancel
        </p>
      )}
    </div>
  );
}
```

```plaintext
module AnalyticsContainer {
  @ "Container component that orchestrates analytics dashboard"
  @ "Manages UI state and coordinates analytics components"

  type: "container"
  
  location: "src/components/AnalyticsContainer.tsx"
  
  interface {
    @ "Default export for the container component"
    public default AnalyticsContainer() -> JSX.Element
  }
  
  state {
    @ "Local UI state only - complex state should be in stores"
    private selectedTimeRange: "7d" | "30d" | "90d"
    private isLoading: boolean
  }
  
  imports {
    @ "React and UI libraries"
    allow "react" as external
    allow "clsx" as external
    
    @ "Can import analytics components for composition"
    allow "./CategoryPieChart" as {CategoryPieChart}
    allow "./DailyTrendsChart" as {DailyTrendsChart}
    allow "./BudgetProgress" as {BudgetProgress}
    allow "./BudgetManager" as {BudgetManager}
    
    @ "Can import from stores for data"
    allow "../stores/expense-store" as {useExpenseStore}
    
    @ "Type imports"
    allow "../types/expense.types" as types
    
    @ "Cannot import services or data layers directly"
    deny imports ["../services/*", "../data/*"]
  }
  
  constraints {
    @ "No direct API calls"
    deny io.network.*
    
    @ "No direct storage access"
    deny io.localStorage.*
    
    @ "Limited console usage"
    warn io.console.*
    
    @ "No business logic"
    deny pattern.business_logic
    
    @ "Must handle loading and error states from stores"
    require pattern.error_boundary
    require pattern.loading_state
    
    @ "Accessibility requirements"
    require pattern.aria_labels
    
    @ "Size constraints"
    warn file.lines > 200
    deny file.lines > 300
  }
}
```

```typescriptreact
/**
 * Container component that orchestrates analytics dashboard
 * Manages UI state and coordinates analytics components
 */

import React, { useState } from 'react';
import clsx from 'clsx';
import { useExpenseStore } from '../stores/expense-store';
import { CategoryPieChart } from './CategoryPieChart';
import { DailyTrendsChart } from './DailyTrendsChart';
import { BudgetProgress } from './BudgetProgress';
import { BudgetManager } from './BudgetManager';

export default function AnalyticsContainer() {
  const {
    expenses,
    isLoading,
    error,
    monthlyBudget,
    setBudget,
    getAnalyticsData,
    getCategoryBreakdown,
    getDailyTrends,
    getBudgetState,
    getAverageDailySpending,
    clearError
  } = useExpenseStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Get analytics data
  const analyticsData = getAnalyticsData();
  const categoryBreakdown = getCategoryBreakdown();
  const dailyTrends = getDailyTrends();
  const budgetState = getBudgetState();
  const averageDailySpending = getAverageDailySpending();

  const handleBudgetChange = (amount: number) => {
    setBudget(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Analytics
          </h1>
          <p className="text-gray-600">
            Track your spending patterns and manage your budget
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
                aria-label="Clear error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 text-lg mb-4">
              No expenses recorded yet
            </div>
            <p className="text-gray-400">
              Add some expenses to see your analytics dashboard
            </p>
          </div>
        ) : (
          <>
            {/* Budget Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetManager
                currentBudget={monthlyBudget}
                onBudgetChange={handleBudgetChange}
                className="h-fit"
              />
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Budget Status
                </h3>
                <BudgetProgress budgetData={budgetState} />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Monthly Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${analyticsData.totalCurrentMonth.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${averageDailySpending.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Average Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {categoryBreakdown.length}
                  </div>
                  <div className="text-sm text-gray-500">Categories Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {expenses.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Expenses</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <CategoryPieChart 
                  data={categoryBreakdown}
                  title="Current Month Spending by Category"
                />
              </div>

              {/* Daily Trends */}
              <div className="bg-white p-6 rounded-lg shadow">
                <DailyTrendsChart 
                  data={dailyTrends}
                  title="Daily Spending Trends"
                />
              </div>
            </div>

            {/* Additional insights */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Insights & Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">
                    💡 Spending Pattern
                  </div>
                  <div className="text-blue-700">
                    {budgetState.isOverBudget
                      ? "You're over budget this month. Consider reviewing your largest expense categories."
                      : `You have $${budgetState.remainingBudget.toFixed(2)} left for this month.`
                    }
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">
                    📊 Top Category
                  </div>
                  <div className="text-green-700">
                    {categoryBreakdown.length > 0
                      ? `Your highest spending category is ${categoryBreakdown[0].category} (${categoryBreakdown[0].percentage}%)`
                      : "No spending data available"
                    }
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800 mb-2">
                    🎯 Budget Goal
                  </div>
                  <div className="text-purple-700">
                    {budgetState.currentMonthSpent < monthlyBudget * 0.8
                      ? "Great job staying within budget!"
                      : "Consider reducing spending in your top categories."
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

```plaintext
module Navigation {
  @ "Pure presentation component for main navigation"
  @ "Props-only, delegates navigation actions to parent"

  type: "presentation"
  
  location: "src/components/Navigation.tsx"
  
  interface {
    @ "Props interface"
    public Navigation(props: {
      currentView: ViewMode,
      onViewChange: (view: ViewMode) -> void,
      className?: string
    }) -> JSX.Element
  }
  
  state {
    @ "No local state needed for navigation"
  }
  
  imports {
    @ "React only"
    allow "react" as external
    
    @ "UI libraries"
    allow "clsx" as external
    allow "lucide-react" as external
    
    @ "Type imports only"
    allow "../types/expense.types" as types
    
    @ "No stores, services, or data access"
    deny imports ["../stores/*", "../services/*", "../data/*", "../hooks/*"]
  }
  
  constraints {
    @ "No side effects"
    deny io.*
    
    @ "No async operations"
    deny pattern.async_operations
    
    @ "Props validation"
    require pattern.prop_types_or_typescript
    
    @ "Export restrictions"
    deny exports ["_*"]
    
    @ "Keep it simple"
    warn file.lines > 80
    deny file.lines > 120
    
    @ "Performance"
    require pattern.memo_if_expensive
  }
}
```

```typescriptreact
/**
 * Pure presentation component for main navigation
 * Props-only, delegates navigation actions to parent
 */

import React from 'react';
import { List, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import type { ViewMode } from '../types/expense.types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function Navigation({ currentView, onViewChange, className }: NavigationProps) {
  const navigationItems = [
    {
      id: 'expenses' as ViewMode,
      label: 'Expenses',
      icon: List,
      description: 'Manage your expenses'
    },
    {
      id: 'analytics' as ViewMode,
      label: 'Analytics',
      icon: BarChart3,
      description: 'View insights and reports'
    }
  ];

  return (
    <nav className={clsx("bg-white shadow-sm border-b", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Expense Tracker
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  aria-label={item.description}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

```plaintext
module App {
  @ "Root application component with navigation orchestration"
  @ "Special privileges as root component"

  type: "container"
  
  location: "src/App.tsx"
  
  interface {
    @ "Default export for the root App component"
    public default App() -> JSX.Element
  }
  
  state {
    @ "Global app state - navigation view mode"
    private currentView: ViewMode
  }
  
  imports {
    @ "React and UI libraries"
    allow "react" as external
    
    @ "Can import and compose main containers"
    allow "./components/ExpenseTrackerContainer" as {default as ExpenseTrackerContainer}
    allow "./components/AnalyticsContainer" as {default as AnalyticsContainer}
    allow "./components/Navigation" as {Navigation}
    
    @ "Type imports"
    allow "./types/expense.types" as types
    
    @ "Root components can orchestrate stores"
    allow "./stores/expense-store" as {useExpenseStore}
    
    @ "Cannot import services or data layers directly"
    deny imports ["./services/*", "./data/*"]
  }
  
  constraints {
    @ "No direct API calls"
    deny io.network.*
    
    @ "No direct storage access"
    deny io.localStorage.*
    
    @ "Limited console usage"
    warn io.console.*
    
    @ "Root components can handle top-level routing"
    allow pattern.routing_logic
    
    @ "Can set up global error boundaries"
    allow pattern.error_boundary
    
    @ "Size constraints"
    warn file.lines > 100
    deny file.lines > 200
  }
}
```

```typescriptreact
/**
 * Root application component with navigation orchestration
 * Special privileges as root component
 */

import React, { useState } from 'react';
import type { ViewMode } from './types/expense.types';
import { Navigation } from './components/Navigation';
import ExpenseTrackerContainer from './components/ExpenseTrackerContainer';
import AnalyticsContainer from './components/AnalyticsContainer';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('expenses');

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'expenses':
        return <ExpenseTrackerContainer />;
      case 'analytics':
        return <AnalyticsContainer />;
      default:
        return <ExpenseTrackerContainer />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;

```

```typescriptreact
/**
 * Container component that orchestrates expense tracking interface
 * Manages UI state and coordinates child components
 */

import React, { useState } from 'react';
import type { Expense, ExpenseFormData } from '../types/expense.types';
import { useExpenseStore } from '../stores/expense-store';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';

export default function ExpenseTrackerContainer() {
  const {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    clearError,
    getExpensesSortedByDate,
  } = useExpenseStore();

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const sortedExpenses = getExpensesSortedByDate();

  const handleAddExpense = (data: ExpenseFormData) => {
    try {
      addExpense(data);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to add expense:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
  };

  const handleSaveExpense = (id: string, data: ExpenseFormData) => {
    try {
      updateExpense(id, data);
      setEditingExpenseId(null);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to update expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  const handleDeleteExpense = (id: string) => {
    try {
      deleteExpense(id);
      setEditingExpenseId(null);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to delete expense:', error);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Expenses
          </h2>
          <p className="text-gray-600 mt-2">
            Track and manage your daily expenses
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center justify-between">
              <div className="text-red-700">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={handleClearError}
                className="text-red-600 hover:text-red-800 font-medium"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div 
            className="text-center py-4"
            aria-live="polite"
            aria-label="Loading"
          >
            <div className="text-gray-600">Loading...</div>
          </div>
        )}

        <div className="space-y-8">
          {/* Add Expense Form */}
          <ExpenseForm
            onSubmit={handleAddExpense}
            disabled={isLoading}
          />

          {/* Edit Expense Form - Only show when editing */}
          {editingExpenseId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <ExpenseForm
                initialData={(() => {
                  const expense = expenses.find(e => e.id === editingExpenseId);
                  if (!expense) return undefined;
                  return {
                    amount: expense.amount,
                    category: expense.category,
                    date: expense.date,
                    description: expense.description,
                  };
                })()}
                onSubmit={(data) => handleSaveExpense(editingExpenseId, data)}
                onCancel={handleCancelEdit}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Expense List */}
          <ExpenseList
            expenses={sortedExpenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            editingId={editingExpenseId}
          />
        </div>
      </div>
    </div>
  );
}
```

## ✅ Analytics Functionality Successfully Added!

I've successfully implemented comprehensive analytics functionality for your expense tracker, following the strict architectural constraints. Here's what was added:

### 🎯 **New Features Implemented:**

1. **📊 Analytics Dashboard**
   - Separate analytics view accessible via navigation
   - Pie chart showing expense breakdown by category for current month
   - Line chart displaying daily spending trends over last 30 days
   - Real-time updates as expenses are added/edited

2. **💰 Budget Management**
   - Monthly budget setting (default $2000)
   - Budget vs actual spending progress bar
   - Remaining budget display
   - Over-budget warnings and indicators

3. **📈 Key Metrics & Insights**
   - Total current month spending
   - Average daily spending calculation
   - Category usage statistics
   - Smart insights and spending tips

4. **🧭 Navigation System**
   - Clean navigation between "Expenses" and "Analytics" views
   - Consistent UI with active state indicators

### 🔧 **Technical Implementation:**

**Architecture Compliance:**
- ✅ All constraint files created first (.rux)
- ✅ Followed layered architecture (Types → Utils → Store → Components)
- ✅ All rubric validations passed (0 violations)
- ✅ Real-time analytics updates

**New Components Created:**
- `CategoryPieChart` - Interactive pie chart with Recharts
- `DailyTrendsChart` - Line chart showing spending trends
- `BudgetProgress` - Visual progress bar with status
- `BudgetManager` - Editable budget setting interface
- `AnalyticsContainer` - Main analytics dashboard
- `Navigation` - App navigation component

**Enhanced Store:**
- Extended expense store with budget management
- Added analytics computed values
- Real-time data calculations using pure utility functions

**Utility Functions:**
- Pure analytics calculations (category breakdown, daily trends, budget state)
- Date utilities for current month filtering
- Chart color constants and formatting

### 🎨 **User Experience:**

- **Intuitive Navigation:** Easy switching between expense management and analytics
- **Visual Data:** Beautiful charts showing spending patterns
- **Budget Awareness:** Clear progress indicators and warnings
- **Real-time Updates:** Analytics refresh immediately when expenses change
- **Responsive Design:** Works on different screen sizes
- **Accessibility:** Proper ARIA labels and keyboard navigation

### 🚀 **Ready to Use:**

The development server is running! You can now:
1. Add some expenses in the "Expenses" view
2. Switch to "Analytics" to see your data visualized
3. Set and adjust your monthly budget
4. View spending trends and category breakdowns
5. Get insights about your spending patterns

All analytics update in real-time as you add, edit, or delete expenses. The budget management system helps you stay on track with visual progress indicators and helpful insights.

