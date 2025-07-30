import type { Currency } from './currency-types';
import { CURRENCIES, isValidCurrency } from './currency-types';
import type { ApprovalRequest } from './approval-types';

export type ExpenseCategory = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other";

export type RecurringFrequency = "weekly" | "monthly";

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  // Multi-user support
  createdBy: string;
  groupId?: string;
  // Receipt management
  receipt?: {
    base64: string;
    fileName: string;
    fileSize: number;
  };
  // Multi-currency support
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  // Tags
  tags: string[];
  // Recurring expenses
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  parentRecurringId?: string;
  isRecurringInstance?: boolean;
  // Approval workflow
  approvalRequest?: ApprovalRequest;
};

export type ExpenseFormData = {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
  currency: Currency;
  tags: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  receipt?: File;
  groupId?: string;
};

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "Food",
  "Transport", 
  "Shopping",
  "Bills",
  "Entertainment",
  "Other"
] as const;



export const RECURRING_FREQUENCIES: readonly RecurringFrequency[] = [
  "weekly",
  "monthly"
] as const;

export function isValidCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
}



export function isValidRecurringFrequency(value: unknown): value is RecurringFrequency {
  return typeof value === "string" && RECURRING_FREQUENCIES.includes(value as RecurringFrequency);
}

export type Budget = {
  monthlyLimit: number;
  currentMonth: string;
  createdAt: string;
  updatedAt?: string;
};

export type BudgetFormData = {
  monthlyLimit: string;
};



export type ExportOptions = {
  startDate?: string;
  endDate?: string;
  categories?: ExpenseCategory[];
  includeTags?: boolean;
};

export type AnalyticsData = {
  categoryBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }>;
  dailyTrends: Array<{
    date: string;
    amount: number;
  }>;
  currentMonthTotal: number;
  averageDaily: number;
  transactionCount: number;
};

export function isValidExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  
  const expense = value as Record<string, unknown>;
  
  return (
    typeof expense.id === "string" &&
    typeof expense.amount === "number" &&
    expense.amount >= 0 &&
    isValidCategory(expense.category) &&
    typeof expense.date === "string" &&
    typeof expense.description === "string" &&
    typeof expense.createdAt === "string" &&
    (expense.updatedAt === undefined || typeof expense.updatedAt === "string") &&
    typeof expense.createdBy === "string" &&
    (expense.groupId === undefined || typeof expense.groupId === "string") &&
    isValidCurrency(expense.currency) &&
    typeof expense.originalAmount === "number" &&
    expense.originalAmount >= 0 &&
    isValidCurrency(expense.originalCurrency) &&
    Array.isArray(expense.tags) &&
    expense.tags.every((tag: unknown) => typeof tag === "string") &&
    typeof expense.isRecurring === "boolean" &&
    (expense.recurringFrequency === undefined || isValidRecurringFrequency(expense.recurringFrequency)) &&
    (expense.parentRecurringId === undefined || typeof expense.parentRecurringId === "string") &&
    (expense.isRecurringInstance === undefined || typeof expense.isRecurringInstance === "boolean")
  );
}

export function isValidBudget(value: unknown): value is Budget {
  if (!value || typeof value !== "object") return false;
  
  const budget = value as Record<string, unknown>;
  
  return (
    typeof budget.monthlyLimit === "number" &&
    budget.monthlyLimit > 0 &&
    typeof budget.currentMonth === "string" &&
    typeof budget.createdAt === "string" &&
    (budget.updatedAt === undefined || typeof budget.updatedAt === "string")
  );
} 