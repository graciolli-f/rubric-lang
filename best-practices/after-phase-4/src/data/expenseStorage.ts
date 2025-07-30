import type { Expense } from '../types';

const STORAGE_KEY = 'expense_tracker_data';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Loads expenses from localStorage
 */
export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid expense data format in localStorage, resetting...');
      return [];
    }

    // Validate expense structure
    return parsed.filter(isValidExpense);
  } catch (error) {
    console.error('Failed to load expenses from localStorage:', error);
    throw new StorageError('Failed to load expenses');
  }
}

/**
 * Saves expenses to localStorage
 */
export function saveExpenses(expenses: Expense[]): void {
  try {
    const data = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save expenses to localStorage:', error);
    throw new StorageError('Failed to save expenses');
  }
}

/**
 * Clears all expenses from localStorage
 */
export function clearExpenses(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear expenses from localStorage:', error);
    throw new StorageError('Failed to clear expenses');
  }
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates expense object structure
 */
function isValidExpense(expense: any): expense is Expense {
  return (
    typeof expense === 'object' &&
    expense !== null &&
    typeof expense.id === 'string' &&
    typeof expense.amount === 'number' &&
    typeof expense.category === 'string' &&
    typeof expense.date === 'string' &&
    typeof expense.description === 'string' &&
    typeof expense.createdAt === 'string' &&
    typeof expense.updatedAt === 'string' &&
    expense.amount >= 0
  );
} 