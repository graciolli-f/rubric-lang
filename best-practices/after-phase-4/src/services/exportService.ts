import type { Expense, ExportFilters, ExpenseCategory } from '../types';

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportError';
  }
}

// Filter expenses based on export criteria
export function filterExpensesForExport(
  expenses: Expense[],
  filters: ExportFilters
): Expense[] {
  return expenses.filter(expense => {
    // Date range filter
    if (filters.startDate && expense.date < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && expense.date > filters.endDate) {
      return false;
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(expense.category)) {
        return false;
      }
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        expense.tags.some(expenseTag => 
          expenseTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
}

// Convert expense data to CSV row
function expenseToCSVRow(expense: Expense): string[] {
  return [
    expense.id,
    expense.date,
    expense.description,
    expense.category,
    expense.originalAmount.toString(),
    expense.originalCurrency,
    expense.amount.toString(),
    expense.currency,
    expense.tags.join('; '),
    expense.isRecurring ? 'Yes' : 'No',
    expense.recurrenceFrequency || '',
    expense.parentExpenseId || '',
    expense.receipt ? 'Yes' : 'No',
    expense.createdAt,
    expense.updatedAt
  ];
}

// Generate CSV content from expenses
export function generateCSV(expenses: Expense[]): string {
  if (expenses.length === 0) {
    throw new ExportError('No expenses to export');
  }
  
  // CSV headers
  const headers = [
    'ID',
    'Date',
    'Description',
    'Category',
    'Original Amount',
    'Original Currency',
    'Display Amount',
    'Display Currency',
    'Tags',
    'Recurring',
    'Frequency',
    'Parent ID',
    'Has Receipt',
    'Created At',
    'Updated At'
  ];
  
  // Convert headers to CSV row
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  
  // Convert expenses to CSV rows
  const csvRows = expenses.map(expense => {
    const row = expenseToCSVRow(expense);
    return row.map(field => `"${field.replace(/"/g, '""')}"`).join(',');
  });
  
  // Combine headers and rows
  return [csvHeaders, ...csvRows].join('\n');
}

// Download CSV file
export function downloadCSV(csvContent: string, filename?: string): void {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Set filename
    const defaultFilename = `expenses-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename || defaultFilename);
    
    // Trigger download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new ExportError('Failed to download CSV file');
  }
}

// Export expenses with filters
export function exportExpenses(
  expenses: Expense[],
  filters: ExportFilters = {},
  filename?: string
): void {
  try {
    const filteredExpenses = filterExpensesForExport(expenses, filters);
    
    if (filteredExpenses.length === 0) {
      throw new ExportError('No expenses match the export criteria');
    }
    
    const csvContent = generateCSV(filteredExpenses);
    downloadCSV(csvContent, filename);
  } catch (error) {
    if (error instanceof ExportError) {
      throw error;
    }
    throw new ExportError('Failed to export expenses');
  }
}

// Generate summary statistics for export
export function generateExportSummary(
  expenses: Expense[],
  filters: ExportFilters
): {
  totalExpenses: number;
  totalAmount: number;
  dateRange: { start: string; end: string };
  categories: { category: ExpenseCategory; count: number; amount: number }[];
  tags: { tag: string; count: number; amount: number }[];
} {
  const filteredExpenses = filterExpensesForExport(expenses, filters);
  
  if (filteredExpenses.length === 0) {
    return {
      totalExpenses: 0,
      totalAmount: 0,
      dateRange: { start: '', end: '' },
      categories: [],
      tags: []
    };
  }
  
  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Date range
  const dates = filteredExpenses.map(e => e.date).sort();
  const dateRange = {
    start: dates[0],
    end: dates[dates.length - 1]
  };
  
  // Category breakdown
  const categoryMap = new Map<ExpenseCategory, { count: number; amount: number }>();
  filteredExpenses.forEach(expense => {
    const existing = categoryMap.get(expense.category) || { count: 0, amount: 0 };
    categoryMap.set(expense.category, {
      count: existing.count + 1,
      amount: existing.amount + expense.amount
    });
  });
  
  const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    amount: data.amount
  }));
  
  // Tag breakdown
  const tagMap = new Map<string, { count: number; amount: number }>();
  filteredExpenses.forEach(expense => {
    expense.tags.forEach(tag => {
      const existing = tagMap.get(tag) || { count: 0, amount: 0 };
      tagMap.set(tag, {
        count: existing.count + 1,
        amount: existing.amount + expense.amount
      });
    });
  });
  
  const tags = Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    count: data.count,
    amount: data.amount
  }));
  
  return {
    totalExpenses: filteredExpenses.length,
    totalAmount,
    dateRange,
    categories,
    tags
  };
}

// Validate export filters
export function validateExportFilters(filters: ExportFilters): string[] {
  const errors: string[] = [];
  
  if (filters.startDate && filters.endDate) {
    if (filters.startDate > filters.endDate) {
      errors.push('Start date must be before end date');
    }
  }
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
  }
  
  return errors;
} 