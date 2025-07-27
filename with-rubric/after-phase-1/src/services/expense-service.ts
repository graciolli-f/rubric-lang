import type { Expense, ExpenseFormData } from '../types';
import { Category } from '../types';

export class ExpenseService {
  static validateExpense(expense: ExpenseFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!expense.amount || expense.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!expense.description || expense.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!expense.date) {
      errors.push('Date is required');
    }

    if (!Object.values(Category).includes(expense.category)) {
      errors.push('Invalid category');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static calculateTotal(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static sortExpensesByDate(expenses: Expense[]): Expense[] {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 