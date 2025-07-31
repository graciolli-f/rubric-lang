/**
 * Pure utility functions for date formatting and manipulation
 * No side effects, deterministic outputs
 */

// Configuration constants
const CONFIG = {
  format: "YYYY-MM-DD",
  timeFormat: "HH:mm",
} as const;

const REGEX_PATTERNS = {
  isoDate: /^\d{4}-\d{2}-\d{2}$/,
} as const;



/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (!isValidDateObject(dateObj)) {
      return "Invalid Date";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}



/**
 * Convert Date to ISO string
 */
export function toISOString(date: Date): string {
  if (!isValidDateObject(date)) throw new Error("Invalid date object");
  return date.toISOString();
}











/**
 * Helper to validate Date object
 */
function isValidDateObject(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}