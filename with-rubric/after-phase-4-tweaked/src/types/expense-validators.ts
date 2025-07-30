import type { ExpenseCategory, RecurringFrequency, Expense, Budget } from './expense-types';
import { isValidCurrency } from './currency-types';

export const RECURRING_FREQUENCIES: RecurringFrequency[] = ["weekly", "monthly"];

export function isValidCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && [
    "Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"
  ].includes(value);
}

export function isValidRecurringFrequency(value: unknown): value is RecurringFrequency {
  return typeof value === "string" && RECURRING_FREQUENCIES.includes(value as RecurringFrequency);
}

export function isValidExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  
  const expense = value as Record<string, unknown>;
  
  return validateExpenseCore(expense) && validateExpenseExtended(expense);
}

function validateExpenseCore(expense: Record<string, unknown>): boolean {
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
    typeof expense.createdByName === "string"
  );
}

function validateExpenseExtended(expense: Record<string, unknown>): boolean {
  return (
    (expense.groupId === undefined || typeof expense.groupId === "string") &&
    (expense.groupName === undefined || typeof expense.groupName === "string") &&
    isValidCurrency(expense.currency) &&
    typeof expense.originalAmount === "number" &&
    expense.originalAmount >= 0 &&
    isValidCurrency(expense.originalCurrency) &&
    Array.isArray(expense.tags) &&
    expense.tags.every((tag: unknown) => typeof tag === "string") &&
    typeof expense.isRecurring === "boolean" &&
    (expense.recurringFrequency === undefined || isValidRecurringFrequency(expense.recurringFrequency)) &&
    (expense.parentRecurringId === undefined || typeof expense.parentRecurringId === "string") &&
    (expense.isRecurringInstance === undefined || typeof expense.isRecurringInstance === "boolean") &&
    (expense.requiresApproval === undefined || typeof expense.requiresApproval === "boolean") &&
    (expense.approvedBy === undefined || typeof expense.approvedBy === "string") &&
    (expense.approvedAt === undefined || typeof expense.approvedAt === "string") &&
    (expense.rejectionReason === undefined || typeof expense.rejectionReason === "string")
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