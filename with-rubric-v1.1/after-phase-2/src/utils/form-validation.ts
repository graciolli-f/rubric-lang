/**
 * Pure utility functions for form validation
 * No side effects, deterministic outputs
 */

import type { ExpenseFormData } from '../types/expense.types';
import { isValidAmount } from './currency';

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate expense form data
 */
export function validateExpenseForm(formData: ExpenseFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isValidAmount(formData.amount) || formData.amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.date) {
    errors.date = 'Date is required';
  }

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}