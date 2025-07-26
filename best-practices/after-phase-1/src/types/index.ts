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