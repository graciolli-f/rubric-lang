/**
 * Type definitions for expense tracking domain
 * No side effects, pure type definitions
 */

import type { ApprovalStatus } from './activity.types';

export type Category = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other";

export type Currency = "USD" | "EUR" | "GBP";

export type RecurringFrequency = "weekly" | "monthly";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  tags: string[];
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  receiptImage?: string;
  // Multi-user fields
  createdBy: string;
  createdByName: string;
  groupId?: string;
  groupName?: string;
  // Approval workflow fields
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ExpenseFormData {
  amount: number;
  category: Category;
  date: string;
  description: string;
  currency?: Currency;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  receiptImage?: string;
  // Multi-user fields
  groupId?: string;
}

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  timestamp: string;
}

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  currency?: Currency;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// Budget-related types
export interface Budget {
  monthlyLimit: number;
  currentMonth: string;
}

// Analytics-related types
export interface CategoryData {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailySpendingData {
  date: string;
  amount: number;
  formattedDate: string;
}

export interface AnalyticsData {
  categoryBreakdown: CategoryData[];
  dailySpending: DailySpendingData[];
  totalSpent: number;
  averageDailySpending: number;
}

// Navigation types
export type ViewMode = "expenses" | "analytics";

// Constants for category options
export const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

// Currency constants
export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP"];
export const DEFAULT_CURRENCY: Currency = "USD";

// Recurring frequency constants
export const RECURRING_FREQUENCIES: RecurringFrequency[] = ["weekly", "monthly"];

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£"
};

// Category colors for charts
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#8884d8",
  Transport: "#82ca9d",
  Shopping: "#ffc658", 
  Bills: "#ff7c7c",
  Entertainment: "#8dd1e1",
  Other: "#d084d0"
};