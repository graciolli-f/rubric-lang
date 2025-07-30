import type { Expense, RecurrenceFrequency } from '../types';
import { createExpense } from './expenseService';

export class RecurringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecurringError';
  }
}

// Calculate next occurrence date
export function calculateNextOccurrence(
  lastDate: string,
  frequency: RecurrenceFrequency
): string {
  const date = new Date(lastDate);
  
  if (isNaN(date.getTime())) {
    throw new RecurringError('Invalid date provided');
  }
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      throw new RecurringError(`Unsupported frequency: ${frequency}`);
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Generate recurring expenses up to a certain date
export async function generateRecurringExpenses(
  templateExpense: Expense,
  endDate: string,
  maxInstances: number = 12
): Promise<Expense[]> {
  if (!templateExpense.isRecurring || !templateExpense.recurrenceFrequency) {
    throw new RecurringError('Template expense must be recurring');
  }
  
  const generatedExpenses: Expense[] = [];
  const endDateTime = new Date(endDate).getTime();
  let currentDate = templateExpense.date;
  let instanceCount = 0;
  
  while (instanceCount < maxInstances) {
    const nextDate = calculateNextOccurrence(currentDate, templateExpense.recurrenceFrequency);
    const nextDateTime = new Date(nextDate).getTime();
    
    if (nextDateTime > endDateTime) {
      break;
    }
    
    // Create new expense instance
    const newExpense = await createExpense({
      amount: templateExpense.originalAmount,
      category: templateExpense.category,
      date: nextDate,
      description: templateExpense.description,
      receipt: templateExpense.receipt,
      currency: templateExpense.originalCurrency,
      originalAmount: templateExpense.originalAmount,
      originalCurrency: templateExpense.originalCurrency,
      tags: [...templateExpense.tags],
      isRecurring: true,
      recurrenceFrequency: templateExpense.recurrenceFrequency
    });
    
    // Mark as instance of original recurring expense
    newExpense.parentExpenseId = templateExpense.parentExpenseId || templateExpense.id;
    
    generatedExpenses.push(newExpense);
    currentDate = nextDate;
    instanceCount++;
  }
  
  return generatedExpenses;
}

// Check if it's time to generate new recurring expenses
export function shouldGenerateRecurringExpenses(
  templateExpense: Expense,
  existingExpenses: Expense[]
): boolean {
  if (!templateExpense.isRecurring || !templateExpense.recurrenceFrequency) {
    return false;
  }
  
  const parentId = templateExpense.parentExpenseId || templateExpense.id;
  const recurringInstances = existingExpenses.filter(
    expense => expense.parentExpenseId === parentId || expense.id === parentId
  );
  
  if (recurringInstances.length === 0) {
    return true;
  }
  
  // Find the latest occurrence
  const latestExpense = recurringInstances.reduce((latest, current) => {
    return new Date(current.date) > new Date(latest.date) ? current : latest;
  });
  
  const nextDueDate = calculateNextOccurrence(latestExpense.date, templateExpense.recurrenceFrequency);
  const today = new Date().toISOString().split('T')[0];
  
  return nextDueDate <= today;
}

// Get all recurring templates from expenses
export function getRecurringTemplates(expenses: Expense[]): Expense[] {
  return expenses.filter(expense => 
    expense.isRecurring && !expense.parentExpenseId
  );
}

// Get all instances of a recurring expense
export function getRecurringInstances(
  templateExpense: Expense,
  allExpenses: Expense[]
): Expense[] {
  const parentId = templateExpense.parentExpenseId || templateExpense.id;
  
  return allExpenses.filter(expense => 
    expense.parentExpenseId === parentId || expense.id === parentId
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Format recurring frequency for display
export function formatRecurrenceFrequency(frequency: RecurrenceFrequency): string {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return frequency;
  }
}

// Get next due date for a recurring expense
export function getNextDueDate(
  templateExpense: Expense,
  allExpenses: Expense[]
): string | null {
  if (!templateExpense.isRecurring || !templateExpense.recurrenceFrequency) {
    return null;
  }
  
  const instances = getRecurringInstances(templateExpense, allExpenses);
  
  if (instances.length === 0) {
    return templateExpense.date;
  }
  
  const latestInstance = instances[instances.length - 1];
  return calculateNextOccurrence(latestInstance.date, templateExpense.recurrenceFrequency);
} 