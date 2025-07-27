export const Category = {
  Food: 'Food',
  Transport: 'Transport',
  Shopping: 'Shopping',
  Bills: 'Bills',
  Entertainment: 'Entertainment',
  Other: 'Other'
} as const;

export type Category = typeof Category[keyof typeof Category];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export interface ExpenseFormData {
  amount: number;
  category: Category;
  date: string;
  description: string;
} 