import type { Expense } from '../types';
import { ExchangeService } from '../services/exchangeService';

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  preferredCurrency: string;
}

export class ExportUtils {
  private static exchangeService = ExchangeService.getInstance();

  static async exportToCSV(
    expenses: Expense[],
    options: ExportOptions,
    exchangeRates: any
  ): Promise<void> {
    const { startDate, endDate, preferredCurrency } = options;
    
    // Filter expenses by date range if provided
    let filteredExpenses = expenses;
    if (startDate || endDate) {
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        return expenseDate >= start && expenseDate <= end;
      });
    }

    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // CSV headers
    const headers = [
      'Date',
      'Description',
      'Category',
      'Original Amount',
      'Original Currency',
      `Amount (${preferredCurrency})`,
      'Tags',
      'Recurring',
      'Has Receipt',
      'Created At'
    ];

    // Convert expenses to CSV rows
    const rows = filteredExpenses.map(expense => {
      const convertedAmount = this.exchangeService.convertAmount(
        expense.originalAmount,
        expense.originalCurrency,
        preferredCurrency as any,
        exchangeRates
      );

      return [
        expense.date,
        `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
        expense.category,
        expense.originalAmount.toFixed(2),
        expense.originalCurrency,
        convertedAmount.toFixed(2),
        `"${expense.tags.join(', ')}"`,
        expense.recurring ? `${expense.recurring.frequency}` : 'No',
        expense.receipt ? 'Yes' : 'No',
        expense.createdAt
      ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${this.formatDateForFilename()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  private static formatDateForFilename(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
} 