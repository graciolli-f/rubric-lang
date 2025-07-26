export const Category = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  SHOPPING: 'Shopping',
  BILLS: 'Bills',
  ENTERTAINMENT: 'Entertainment',
  OTHER: 'Other'
} as const;

export type Category = typeof Category[keyof typeof Category];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string for sorting
}

export interface ExpenseFormData {
  amount: string;
  category: Category;
  date: string;
  description: string;
} 