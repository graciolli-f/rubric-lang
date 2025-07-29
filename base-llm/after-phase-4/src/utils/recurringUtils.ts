import type { Expense, RecurringSettings } from '../types';

export class RecurringUtils {
  static calculateNextDate(date: string, frequency: 'weekly' | 'monthly'): string {
    const currentDate = new Date(date);
    
    if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return currentDate.toISOString().split('T')[0];
  }

  static shouldGenerateNext(recurringSettings: RecurringSettings): boolean {
    if (!recurringSettings.isActive) {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    return recurringSettings.nextDate <= today;
  }

  static generateRecurringExpense(
    originalExpense: Expense,
    targetDate: string
  ): Omit<Expense, 'id' | 'createdAt'> {
    const recurring = originalExpense.recurring;
    if (!recurring) {
      throw new Error('Cannot generate recurring expense: no recurring settings');
    }

    const nextDate = this.calculateNextDate(targetDate, recurring.frequency);

    return {
      amount: originalExpense.amount,
      originalAmount: originalExpense.originalAmount,
      originalCurrency: originalExpense.originalCurrency,
      category: originalExpense.category,
      date: targetDate,
      description: `${originalExpense.description} (recurring)`,
      receipt: undefined, // Don't copy receipt to new instances
      tags: [...originalExpense.tags],
      recurring: {
        ...recurring,
        nextDate
      },
      isRecurringInstance: true,
      parentRecurringId: originalExpense.id
    };
  }

  static getOverdueRecurringExpenses(expenses: Expense[]): Array<{
    originalExpense: Expense;
    missedDates: string[];
  }> {
    const today = new Date();
    const overdueList: Array<{ originalExpense: Expense; missedDates: string[] }> = [];

    const recurringExpenses = expenses.filter(
      expense => expense.recurring && expense.recurring.isActive && !expense.isRecurringInstance
    );

    for (const expense of recurringExpenses) {
      const recurring = expense.recurring!;
      const missedDates: string[] = [];
      
      let checkDate = new Date(recurring.nextDate);
      
      // Check for missed dates up to today
      while (checkDate <= today) {
        missedDates.push(checkDate.toISOString().split('T')[0]);
        
        // Calculate next check date
        if (recurring.frequency === 'weekly') {
          checkDate.setDate(checkDate.getDate() + 7);
        } else {
          checkDate.setMonth(checkDate.getMonth() + 1);
        }
      }

      if (missedDates.length > 0) {
        overdueList.push({
          originalExpense: expense,
          missedDates
        });
      }
    }

    return overdueList;
  }

  static updateRecurringNextDate(
    recurringSettings: RecurringSettings,
    generatedDate: string
  ): RecurringSettings {
    return {
      ...recurringSettings,
      nextDate: this.calculateNextDate(generatedDate, recurringSettings.frequency)
    };
  }

  static getRecurringIcon(frequency: 'weekly' | 'monthly'): string {
    return frequency === 'weekly' ? '🔄' : '📅';
  }

  static formatRecurringDescription(frequency: 'weekly' | 'monthly'): string {
    return frequency === 'weekly' ? 'Repeats weekly' : 'Repeats monthly';
  }
} 