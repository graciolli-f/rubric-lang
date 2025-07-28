import type { 
  Expense, 
  ExpenseCreateData, 
  ExpenseUpdateData, 
  ExpenseFormData,
  ExpenseCategory 
} from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates expense form data
 */
export function validateExpenseData(data: ExpenseFormData): string[] {
  const errors: string[] = [];

  // Validate amount
  const amount = parseFloat(data.amount);
  if (!data.amount.trim()) {
    errors.push('Amount is required');
  } else if (isNaN(amount)) {
    errors.push('Amount must be a valid number');
  } else if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (amount > 1000000) {
    errors.push('Amount cannot exceed $1,000,000');
  }

  // Validate category
  if (!data.category) {
    errors.push('Category is required');
  }

  // Validate date
  if (!data.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    }
  }

  // Validate description
  if (!data.description.trim()) {
    errors.push('Description is required');
  } else if (data.description.length > 200) {
    errors.push('Description cannot exceed 200 characters');
  }

  return errors;
}

/**
 * Converts form data to expense create data
 */
export function formDataToCreateData(formData: ExpenseFormData): ExpenseCreateData {
  const errors = validateExpenseData(formData);
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return {
    amount: parseFloat(formData.amount),
    category: formData.category,
    date: formData.date,
    description: formData.description.trim()
  };
}

/**
 * Creates a new expense with generated ID and timestamps
 */
export function createExpense(data: ExpenseCreateData): Expense {
  const now = new Date().toISOString();
  
  return {
    id: generateExpenseId(),
    amount: data.amount,
    category: data.category,
    date: data.date,
    description: data.description,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Updates an expense with new data and updated timestamp
 */
export function updateExpense(expense: Expense, updateData: Partial<ExpenseCreateData>): Expense {
  return {
    ...expense,
    ...updateData,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Sorts expenses by date (newest first)
 */
export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest first
  });
}

/**
 * Calculates total amount from expenses
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Determines if total amount should be highlighted (exceeds $1000)
 */
export function shouldHighlightTotal(total: number): boolean {
  return total > 1000;
}

/**
 * Formats amount as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Generates a unique ID for expenses
 */
function generateExpenseId(): string {
  return `expense_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gets initial form data with today's date
 */
export function getInitialFormData(): ExpenseFormData {
  return {
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    description: ''
  };
}

/**
 * Converts expense to form data for editing
 */
export function expenseToFormData(expense: Expense): ExpenseFormData {
  return {
    amount: expense.amount.toString(),
    category: expense.category,
    date: expense.date,
    description: expense.description
  };
} 