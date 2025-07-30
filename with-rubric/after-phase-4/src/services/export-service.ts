import type { Expense, ExportOptions } from '../types/expense-types';

const CSV_HEADERS = [
  'Date',
  'Description', 
  'Category',
  'Amount',
  'Currency',
  'Original Amount',
  'Original Currency',
  'Tags',
  'Recurring',
  'Created',
  'Updated'
];

export function exportExpensesToCSV(expenses: Expense[], options: ExportOptions = {}): void {
  const filteredExpenses = filterExpensesByDateRange(
    expenses, 
    options.startDate, 
    options.endDate
  );
  
  const csvContent = generateCSVContent(filteredExpenses, options.includeTags ?? true);
  const filename = generateFilename(options.startDate, options.endDate);
  
  downloadCSV(csvContent, filename);
}

export function filterExpensesByDateRange(
  expenses: Expense[], 
  startDate?: string, 
  endDate?: string
): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = expense.date;
    
    if (startDate && expenseDate < startDate) {
      return false;
    }
    
    if (endDate && expenseDate > endDate) {
      return false;
    }
    
    return true;
  });
}

export function generateCSVContent(expenses: Expense[], includeTags: boolean): string {
  const headers = includeTags ? CSV_HEADERS : CSV_HEADERS.filter(h => h !== 'Tags');
  const csvRows = [headers.join(',')];
  
  expenses.forEach(expense => {
    const row = [
      expense.date,
      `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
      expense.category,
      expense.amount.toString(),
      expense.currency,
      expense.originalAmount.toString(),
      expense.originalCurrency,
      ...(includeTags ? [`"${expense.tags && expense.tags.length > 0 ? expense.tags.join(', ') : ''}"`] : []),
      expense.isRecurring ? 'Yes' : 'No',
      expense.createdAt.split('T')[0], // Just the date part
      expense.updatedAt ? expense.updatedAt.split('T')[0] : ''
    ];
    
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

function generateFilename(startDate?: string, endDate?: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  if (startDate && endDate) {
    return `expenses_${startDate}_to_${endDate}.csv`;
  } else if (startDate) {
    return `expenses_from_${startDate}.csv`;
  } else if (endDate) {
    return `expenses_until_${endDate}.csv`;
  } else {
    return `expenses_${timestamp}.csv`;
  }
} 