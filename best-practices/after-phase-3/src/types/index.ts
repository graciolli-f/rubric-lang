export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Other';

export type Currency = 'USD' | 'EUR' | 'GBP';

export type RecurrenceFrequency = 'weekly' | 'monthly';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // New fields
  receipt?: string; // base64 encoded image
  currency: Currency;
  originalAmount: number; // amount in original currency
  originalCurrency: Currency;
  tags: string[];
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  parentExpenseId?: string; // for tracking recurring expense instances
}

export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
  // New fields
  receipt?: File | null;
  currency: Currency;
  tags: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
}

export interface ExpenseCreateData {
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  // New fields
  receipt?: string; // base64 encoded
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  tags: string[];
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
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

// Currency and Exchange Rate Types
export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyConversionResult {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  convertedAmount: number;
}

// User preferences
export interface UserPreferences {
  preferredCurrency: Currency;
  lastUpdated: string;
}

// Export types
export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  categories?: ExpenseCategory[];
  tags?: string[];
}

// Filter types
export interface ExpenseFilters {
  categories?: ExpenseCategory[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  currency?: Currency;
} 