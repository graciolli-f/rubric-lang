/**
 * Service for business logic validation
 * Validates data according to business rules
 */

import type { ExpenseFormData } from '../types/expense.types';
import type { ValidationResult } from '../utils/validation';
import { validateExpenseData as validateExpenseDataUtil, validateImageFile } from '../utils/validation';

/**
 * Validates expense form data according to business rules
 */
export function validateExpenseData(data: ExpenseFormData): ValidationResult {
  return validateExpenseDataUtil(data);
}

/**
 * Validates receipt file according to business rules
 */
export function validateReceiptFile(file: File): ValidationResult {
  return validateImageFile(file);
}