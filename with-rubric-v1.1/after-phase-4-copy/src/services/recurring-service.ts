/**
 * Business logic for recurring expense management
 * Handles automatic generation and scheduling of recurring expenses
 */

import type { Expense, ExpenseFormData, RecurringFrequency } from '../types/expense.types';
import type { ValidationResult } from '../utils/validation';
import { validateExpenseData } from '../utils/validation';
import { toISOString } from '../utils/date';

// Service configuration
const CONFIG = {
  maxFutureGeneration: 90, // days
  maxRecurrences: 52 // maximum occurrences to generate
} as const;

/**
 * Generate recurring expenses that are due
 */
export async function generateRecurringExpenses(expenses: Expense[], currentDate: Date = new Date()): Promise<Expense[]> {
  try {
    const newExpenses: Expense[] = [];
    
    // Find all recurring expenses
    const recurringExpenses = expenses.filter(expense => expense.isRecurring && expense.recurringFrequency);
    
    for (const expense of recurringExpenses) {
      if (isExpenseDue(expense, currentDate)) {
        const nextExpense = await createNextRecurrence(expense, currentDate);
        newExpenses.push(nextExpense);
      }
    }
    
    return newExpenses;
  } catch (error) {
    throw new Error(`Failed to generate recurring expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate the next due date for a recurring expense
 */
export function calculateNextDueDate(expense: Expense, fromDate: Date = new Date()): Date {
  try {
    if (!expense.isRecurring || !expense.recurringFrequency) {
      throw new Error('Expense is not recurring');
    }
    
    const expenseDate = new Date(expense.date);
    const daysBetween = getDaysBetweenOccurrences(expense.recurringFrequency);
    
    // Find the next occurrence after fromDate
    let nextDate = new Date(expenseDate);
    while (nextDate <= fromDate) {
      nextDate.setDate(nextDate.getDate() + daysBetween);
    }
    
    return nextDate;
  } catch (error) {
    throw new Error(`Failed to calculate next due date: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a recurring expense is due
 */
export function isExpenseDue(expense: Expense, currentDate: Date = new Date()): boolean {
  try {
    if (!expense.isRecurring || !expense.recurringFrequency) {
      return false;
    }
    
    const expenseDate = new Date(expense.date);
    const daysBetween = getDaysBetweenOccurrences(expense.recurringFrequency);
    
    // Calculate days since the expense date
    const daysSinceExpense = Math.floor((currentDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if it's time for the next occurrence
    return daysSinceExpense >= daysBetween && daysSinceExpense % daysBetween === 0;
  } catch (error) {
    console.error('Failed to check if expense is due:', error);
    return false;
  }
}

/**
 * Create a recurring expense with proper validation
 */
export async function createRecurringExpense(formData: ExpenseFormData): Promise<Expense> {
  try {
    // Validate recurring data
    const validation = validateRecurringData(formData);
    if (!validation.isValid) {
      throw new Error(`Invalid recurring expense data: ${validation.errors.join(', ')}`);
    }
    
    const now = new Date();
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: formData.amount || 0,
      category: formData.category || 'Other',
      date: formData.date || toISOString(now),
      description: formData.description || '',
      currency: formData.currency || 'USD',
      originalAmount: formData.amount || 0,
      originalCurrency: formData.currency || 'USD',
      tags: formData.tags || [],
      isRecurring: formData.isRecurring || false,
      recurringFrequency: formData.recurringFrequency,
      receiptImage: formData.receiptImage,
      createdAt: toISOString(now),
      updatedAt: toISOString(now)
    };
    
    return expense;
  } catch (error) {
    throw new Error(`Failed to create recurring expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a recurring expense
 */
export async function updateRecurringExpense(id: string, formData: ExpenseFormData): Promise<Expense> {
  try {
    // Validate recurring data
    const validation = validateRecurringData(formData);
    if (!validation.isValid) {
      throw new Error(`Invalid recurring expense data: ${validation.errors.join(', ')}`);
    }
    
    const now = new Date();
    const updatedExpense: Expense = {
      id,
      amount: formData.amount || 0,
      category: formData.category || 'Other',
      date: formData.date || toISOString(now),
      description: formData.description || '',
      currency: formData.currency || 'USD',
      originalAmount: formData.amount || 0,
      originalCurrency: formData.currency || 'USD',
      tags: formData.tags || [],
      isRecurring: formData.isRecurring || false,
      recurringFrequency: formData.recurringFrequency,
      receiptImage: formData.receiptImage,
      createdAt: '', // This should be preserved from original
      updatedAt: toISOString(now)
    };
    
    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to update recurring expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Stop a recurring expense (set isRecurring to false)
 */
export async function stopRecurringExpense(id: string): Promise<Expense> {
  try {
    // This would typically update the existing expense in the store
    // For now, return a mock updated expense
    const now = new Date();
    const stoppedExpense: Expense = {
      id,
      amount: 0,
      category: 'Other',
      date: toISOString(now),
      description: '',
      currency: 'USD',
      originalAmount: 0,
      originalCurrency: 'USD',
      tags: [],
      isRecurring: false,
      recurringFrequency: undefined,
      createdAt: '',
      updatedAt: toISOString(now)
    };
    
    return stoppedExpense;
  } catch (error) {
    throw new Error(`Failed to stop recurring expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get next occurrences for a recurring expense
 */
export function getNextOccurrences(expense: Expense, count: number): Date[] {
  try {
    if (!expense.isRecurring || !expense.recurringFrequency) {
      return [];
    }
    
    const startDate = new Date(expense.date);
    return getRecurringSchedule(expense.recurringFrequency, startDate, count);
  } catch (error) {
    console.error('Failed to get next occurrences:', error);
    return [];
  }
}

/**
 * Get recurring schedule for a frequency
 */
export function getRecurringSchedule(frequency: RecurringFrequency, startDate: Date, count: number): Date[] {
  try {
    const schedule: Date[] = [];
    const daysBetween = getDaysBetweenOccurrences(frequency);
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < Math.min(count, CONFIG.maxRecurrences); i++) {
      schedule.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + daysBetween);
    }
    
    return schedule;
  } catch (error) {
    console.error('Failed to get recurring schedule:', error);
    return [];
  }
}

/**
 * Get days between occurrences for a frequency
 */
export function getDaysBetweenOccurrences(frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 7;
    case 'monthly':
      return 30; // Approximate, could be improved with actual month calculation
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
}

/**
 * Validate recurring expense data
 */
export function validateRecurringData(data: ExpenseFormData): ValidationResult {
  try {
    const errors: string[] = [];
    
    // Basic expense data validation
    const basicValidation = validateExpenseData(data);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }
    
    // Recurring-specific validation
    if (data.isRecurring) {
      if (!data.recurringFrequency) {
        errors.push('Recurring frequency is required for recurring expenses');
      } else {
        const frequencyValidation = validateRecurringFrequency(data.recurringFrequency);
        if (!frequencyValidation.isValid) {
          errors.push(...frequencyValidation.errors);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed']
    };
  }
}

/**
 * Validate recurring frequency
 */
export function validateRecurringFrequency(frequency: RecurringFrequency): ValidationResult {
  try {
    const validFrequencies: RecurringFrequency[] = ['weekly', 'monthly'];
    
    if (!validFrequencies.includes(frequency)) {
      return {
        isValid: false,
        errors: [`Invalid recurring frequency: ${frequency}. Must be one of: ${validFrequencies.join(', ')}`]
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Frequency validation failed']
    };
  }
}

// Helper function to create the next recurrence
async function createNextRecurrence(expense: Expense, currentDate: Date): Promise<Expense> {
  try {
    const nextDate = calculateNextDueDate(expense, currentDate);
    
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      date: toISOString(nextDate),
      createdAt: toISOString(currentDate),
      updatedAt: toISOString(currentDate)
    };
    
    return newExpense;
  } catch (error) {
    throw new Error(`Failed to create next recurrence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}