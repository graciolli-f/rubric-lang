import type { Expense, RecurringFrequency } from '../types/expense-types';
import { generateId } from '../utils/formatters';

const MAX_FUTURE_INSTANCES = 12; // Generate up to 12 future instances

export function generateRecurringExpenses(expense: Expense): Expense[] {
  if (!expense.isRecurring || !expense.recurringFrequency) {
    return [];
  }
  
  const instances: Expense[] = [];
  let currentDate = new Date(expense.date);
  
  for (let i = 0; i < MAX_FUTURE_INSTANCES; i++) {
    const nextDate = getNextRecurringDate(expense, currentDate);
    const futureInstance = createRecurringInstance(expense, nextDate);
    instances.push(futureInstance);
    currentDate = new Date(nextDate);
  }
  
  return instances;
}

export function getNextRecurringDate(expense: Expense, fromDate?: Date): string {
  const baseDate = fromDate || new Date(expense.date);
  const nextDate = new Date(baseDate);
  
  if (expense.recurringFrequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (expense.recurringFrequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

export function shouldGenerateRecurring(expense: Expense): boolean {
  return expense.isRecurring && 
         !!expense.recurringFrequency && 
         !expense.isRecurringInstance;
}

export function createRecurringInstance(parentExpense: Expense, date: string): Expense {
  const now = new Date().toISOString();
  
  return {
    ...parentExpense,
    id: generateId(),
    date,
    createdAt: now,
    updatedAt: undefined,
    parentRecurringId: parentExpense.id,
    isRecurringInstance: true,
  };
} 