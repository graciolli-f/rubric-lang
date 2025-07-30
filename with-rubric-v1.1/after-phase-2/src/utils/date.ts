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

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm";

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
 * Format date in short format
 */
export function formatDateShort(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (!isValidDateObject(dateObj)) {
      return "N/A";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (!isValidDateObject(dateObj)) {
      return "Invalid Date";
    }
    
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

/**
 * Parse date string to Date object
 */
export function parseDate(text: string): Date {
  if (typeof text !== "string") {
    throw new Error("Invalid date string");
  }
  
  const date = new Date(text);
  
  if (!isValidDateObject(date)) {
    throw new Error("Invalid date format");
  }
  
  return date;
}

/**
 * Convert Date to ISO string
 */
export function toISOString(date: Date): string {
  if (!isValidDateObject(date)) {
    throw new Error("Invalid date object");
  }
  
  return date.toISOString();
}

/**
 * Validate if value is a valid date
 */
export function isValidDate(value: unknown): value is string | Date {
  if (typeof value === "string") {
    return !isNaN(Date.parse(value));
  }
  
  if (value instanceof Date) {
    return isValidDateObject(value);
  }
  
  return false;
}

/**
 * Validate date string format
 */
export function validateDate(date: string): boolean {
  if (typeof date !== "string") {
    return false;
  }
  
  try {
    const parsed = new Date(date);
    return isValidDateObject(parsed);
  } catch {
    return false;
  }
}

/**
 * Sort comparison function for dates
 */
export function sortByDate(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  
  // Sort by newest first (descending)
  return dateB.getTime() - dateA.getTime();
}

/**
 * Check if date is today
 */
export function isToday(date: string): boolean {
  try {
    const inputDate = new Date(date);
    const today = new Date();
    
    return (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Helper to validate Date object
 */
function isValidDateObject(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}