export type ExpenseCategory = "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other";

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

export type ExpenseFormData = {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
};

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "Food",
  "Transport", 
  "Shopping",
  "Bills",
  "Entertainment",
  "Other"
] as const;

export function isValidCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
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
    (expense.updatedAt === undefined || typeof expense.updatedAt === "string")
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