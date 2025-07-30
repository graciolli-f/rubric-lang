import type { Currency } from './currency-types';
import { CURRENCIES, isValidCurrency } from './currency-types';
import type { ApprovalStatus } from './group-types';

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
  // User tracking
  createdBy: string;
  createdByName: string;
  // Group assignment
  groupId?: string;
  groupName?: string;
  // Approval workflow
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  requiresApproval?: boolean;
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
};

export type ExpenseFormData = {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
  receipt?: File;
  currency: Currency;
  tags: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"
];

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