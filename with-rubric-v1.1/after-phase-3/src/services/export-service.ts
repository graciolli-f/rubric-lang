/**
 * Business logic for exporting expense data
 * Handles CSV generation, date filtering, and file downloads
 */

import type { Expense, ExportOptions, Currency } from '../types/expense.types';
import type { ValidationResult } from '../utils/validation';
import { isValidDate } from '../utils/validation';
import { convertAmount, formatCurrency } from './currency-service';

// Service configuration
const CONFIG = {
  dateFormat: 'YYYY-MM-DD',
  csvDelimiter: ',',
  maxExportRecords: 10000
} as const;

/**
 * Export expenses to CSV format
 */
export async function exportExpensesToCSV(expenses: Expense[], options: ExportOptions = {}): Promise<string> {
  try {
    // Validate options
    const validation = validateExportOptions(options);
    if (!validation.isValid) {
      throw new Error(`Invalid export options: ${validation.errors.join(', ')}`);
    }

    // Filter expenses by date range if specified
    let filteredExpenses = expenses;
    if (options.startDate || options.endDate) {
      filteredExpenses = filterExpensesByDateRange(expenses, options.startDate, options.endDate);
    }

    // Sort by date (newest first)
    filteredExpenses = sortExpensesByDate(filteredExpenses, false);

    // Limit records
    if (filteredExpenses.length > CONFIG.maxExportRecords) {
      filteredExpenses = filteredExpenses.slice(0, CONFIG.maxExportRecords);
      console.warn(`Export limited to ${CONFIG.maxExportRecords} records`);
    }

    // Create CSV header
    const headers = createCSVHeader();
    
    // Format each expense
    const rows = await Promise.all(
      filteredExpenses.map(expense => formatExpenseForCSV(expense, options.currency))
    );

    // Convert to CSV string
    const csvRows = [headers.join(CONFIG.csvDelimiter)];
    rows.forEach(row => {
      const values = headers.map(header => escapeCSVField(row[header] || ''));
      csvRows.push(values.join(CONFIG.csvDelimiter));
    });

    return csvRows.join('\n');
  } catch (error) {
    throw new Error(`Failed to export expenses to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download CSV content as a file
 */
export async function downloadCSV(csvContent: string, filename: string): Promise<void> {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      // Use download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      window.open(URL.createObjectURL(blob));
    }
  } catch (error) {
    throw new Error(`Failed to download CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate filename for export
 */
export function generateFilename(options: ExportOptions = {}): string {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let filename = `expenses_${dateStr}`;
    
    if (options.startDate && options.endDate) {
      filename = `expenses_${options.startDate}_to_${options.endDate}`;
    } else if (options.startDate) {
      filename = `expenses_from_${options.startDate}`;
    } else if (options.endDate) {
      filename = `expenses_until_${options.endDate}`;
    }
    
    if (options.currency) {
      filename += `_${options.currency}`;
    }
    
    return `${filename}.csv`;
  } catch (error) {
    console.error('Failed to generate filename:', error);
    return 'expenses_export.csv';
  }
}

/**
 * Filter expenses by date range
 */
export function filterExpensesByDateRange(expenses: Expense[], startDate?: string, endDate?: string): Expense[] {
  try {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      if (startDate) {
        const start = new Date(startDate);
        if (expenseDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        // Include the entire end date
        end.setHours(23, 59, 59, 999);
        if (expenseDate > end) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Failed to filter expenses by date range:', error);
    return expenses;
  }
}

/**
 * Sort expenses by date
 */
export function sortExpensesByDate(expenses: Expense[], ascending: boolean = true): Expense[] {
  try {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to sort expenses by date:', error);
    return expenses;
  }
}

/**
 * Format expense for CSV output
 */
export async function formatExpenseForCSV(expense: Expense, preferredCurrency?: Currency): Promise<Record<string, string>> {
  try {
    const formatted: Record<string, string> = {
      'ID': expense.id,
      'Date': expense.date,
      'Description': expense.description,
      'Category': expense.category,
      'Original Amount': expense.originalAmount.toFixed(2),
      'Original Currency': expense.originalCurrency,
      'Tags': expense.tags.join('; '),
      'Recurring': expense.isRecurring ? 'Yes' : 'No',
      'Recurring Frequency': expense.recurringFrequency || '',
      'Has Receipt': expense.receiptImage ? 'Yes' : 'No',
      'Created At': expense.createdAt,
      'Updated At': expense.updatedAt
    };

    // Add converted amount if preferred currency is specified and different
    if (preferredCurrency && preferredCurrency !== expense.originalCurrency) {
      try {
        const convertedAmount = await convertAmount(expense.originalAmount, expense.originalCurrency, preferredCurrency);
        formatted['Converted Amount'] = convertedAmount.toFixed(2);
        formatted['Converted Currency'] = preferredCurrency;
        formatted['Display Amount'] = formatCurrency(convertedAmount, preferredCurrency);
      } catch (error) {
        console.warn('Failed to convert currency for export:', error);
        formatted['Converted Amount'] = expense.amount.toFixed(2);
        formatted['Converted Currency'] = expense.currency;
        formatted['Display Amount'] = formatCurrency(expense.amount, expense.currency);
      }
    } else {
      formatted['Converted Amount'] = expense.amount.toFixed(2);
      formatted['Converted Currency'] = expense.currency;
      formatted['Display Amount'] = formatCurrency(expense.amount, expense.currency);
    }

    return formatted;
  } catch (error) {
    console.error('Failed to format expense for CSV:', error);
    // Return basic format as fallback
    return {
      'ID': expense.id,
      'Date': expense.date,
      'Description': expense.description,
      'Category': expense.category,
      'Amount': expense.amount.toFixed(2),
      'Currency': expense.currency
    };
  }
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 */
export function escapeCSVField(field: string): string {
  try {
    if (typeof field !== 'string') {
      field = String(field);
    }
    
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  } catch (error) {
    console.error('Failed to escape CSV field:', error);
    return '';
  }
}

/**
 * Create CSV header row
 */
export function createCSVHeader(): string[] {
  return [
    'ID',
    'Date',
    'Description',
    'Category',
    'Original Amount',
    'Original Currency',
    'Converted Amount',
    'Converted Currency',
    'Display Amount',
    'Tags',
    'Recurring',
    'Recurring Frequency',
    'Has Receipt',
    'Created At',
    'Updated At'
  ];
}

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): ValidationResult {
  try {
    const errors: string[] = [];
    
    // Validate date range
    const dateValidation = validateDateRange(options.startDate, options.endDate);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }
    
    // Validate currency if provided
    if (options.currency && !['USD', 'EUR', 'GBP'].includes(options.currency)) {
      errors.push(`Invalid currency: ${options.currency}`);
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
 * Validate date range
 */
export function validateDateRange(startDate?: string, endDate?: string): ValidationResult {
  try {
    const errors: string[] = [];
    
    if (startDate && !isValidDate(startDate)) {
      errors.push('Start date is invalid');
    }
    
    if (endDate && !isValidDate(endDate)) {
      errors.push('End date is invalid');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push('Start date must be before or equal to end date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Date validation failed']
    };
  }
}