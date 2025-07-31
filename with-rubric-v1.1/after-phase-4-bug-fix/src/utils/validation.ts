/**
 * Pure utility functions for validation
 * No side effects, deterministic outputs
 */

import type { ExpenseFormData, ExchangeRate } from '../types/expense.types';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// File validation options type
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

// Configuration constants
const VALIDATION_CONFIG = {
  maxFileSize: 5242880, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  maxTagLength: 20,
  maxDescriptionLength: 200
} as const;

/**
 * Creates a validation result object
 */
function createValidationResult(isValid: boolean, errors: string[] = []): ValidationResult {
  return { isValid, errors };
}

/**
 * Combines multiple validation results into one
 */
function combineValidationResults(results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(result => result.errors);
  const isValid = results.every(result => result.isValid);
  return createValidationResult(isValid, allErrors);
}

/**
 * Validates if a value is required (not null, undefined, or empty string)
 */
function isRequired(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Validates if a number is positive
 */
function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates if a date string is valid
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates an amount value
 */
function validateAmount(amount: number): ValidationResult {
  if (!isPositiveNumber(amount)) {
    return createValidationResult(false, ['Amount must be a positive number']);
  }
  if (amount > 1000000) {
    return createValidationResult(false, ['Amount cannot exceed $1,000,000']);
  }
  return createValidationResult(true);
}

/**
 * Validates an array of tags
 */
function validateTags(tags: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (tags.length > 10) {
    errors.push('Cannot have more than 10 tags');
  }
  
  for (const tag of tags) {
    if (tag.length > VALIDATION_CONFIG.maxTagLength) {
      errors.push(`Tag "${tag}" exceeds maximum length of ${VALIDATION_CONFIG.maxTagLength} characters`);
    }
    if (tag.trim() !== tag) {
      errors.push(`Tag "${tag}" cannot have leading or trailing spaces`);
    }
    if (tag.includes(',')) {
      errors.push(`Tag "${tag}" cannot contain commas`);
    }
  }
  
  return createValidationResult(errors.length === 0, errors);
}

/**
 * Validates a currency string
 */
export function validateCurrency(currency: string): ValidationResult {
  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!validCurrencies.includes(currency)) {
    return createValidationResult(false, [`Invalid currency: ${currency}`]);
  }
  return createValidationResult(true);
}

/**
 * Validates an exchange rate object
 */
function validateExchangeRate(rate: ExchangeRate): ValidationResult {
  const errors: string[] = [];
  
  if (!isPositiveNumber(rate.rate)) {
    errors.push('Exchange rate must be a positive number');
  }
  
  if (!isValidDate(rate.timestamp)) {
    errors.push('Exchange rate timestamp must be a valid date');
  }
  
  const currencyValidation = combineValidationResults([
    validateCurrency(rate.fromCurrency),
    validateCurrency(rate.toCurrency)
  ]);
  
  if (!currencyValidation.isValid) {
    errors.push(...currencyValidation.errors);
  }
  
  return createValidationResult(errors.length === 0, errors);
}

/**
 * Validates a file object
 */
export function validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const maxSize = options.maxSize ?? VALIDATION_CONFIG.maxFileSize;
  const allowedTypes = options.allowedTypes ?? VALIDATION_CONFIG.allowedImageTypes;
  
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return createValidationResult(errors.length === 0, errors);
}

/**
 * Validates an image file specifically
 */
export function validateImageFile(file: File): ValidationResult {
  return validateFile(file, {
    maxSize: VALIDATION_CONFIG.maxFileSize,
    allowedTypes: VALIDATION_CONFIG.allowedImageTypes
  });
}

/**
 * Validates expense form data
 */
export function validateExpenseData(data: ExpenseFormData): ValidationResult {
  const validations: ValidationResult[] = [];
  
  // Validate amount
  validations.push(validateAmount(data.amount));
  
  // Validate date
  if (!isValidDate(data.date)) {
    validations.push(createValidationResult(false, ['Date must be valid']));
  }
  
  // Validate description
  if (!isRequired(data.description)) {
    validations.push(createValidationResult(false, ['Description is required']));
  } else if (data.description.length > VALIDATION_CONFIG.maxDescriptionLength) {
    validations.push(createValidationResult(false, [`Description cannot exceed ${VALIDATION_CONFIG.maxDescriptionLength} characters`]));
  }
  
  // Validate currency if provided
  if (data.currency) {
    validations.push(validateCurrency(data.currency));
  }
  
  // Validate tags if provided
  if (data.tags && data.tags.length > 0) {
    validations.push(validateTags(data.tags));
  }
  
  return combineValidationResults(validations);
}