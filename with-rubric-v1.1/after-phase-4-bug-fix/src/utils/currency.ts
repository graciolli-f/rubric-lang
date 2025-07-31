/**
 * Pure utility functions for currency formatting
 * No side effects, deterministic outputs
 */

// Configuration constants
const CONFIG = {
  symbol: "$",
  maxDecimals: 2,
} as const;

const REGEX_PATTERNS = {
  currency: /^\$?\d+(\.\d{1,2})?$/,
} as const;

const MAX_AMOUNT = 999999.99;

/**
 * Format a number as currency string
 */
export function formatCurrency(value: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "$0.00";
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}



/**
 * Validate if value is a valid amount
 */
export function isValidAmount(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value) && value >= 0;
}

