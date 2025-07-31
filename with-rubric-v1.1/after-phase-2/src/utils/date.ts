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
    if (!isValidDateObject(dateObj)) return "N/A";
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "N/A";
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
 * Validate date string format
 */
export function validateDate(date: string): boolean {
  if (typeof date !== "string") return false;
  try {
    return isValidDateObject(new Date(date));
  } catch {
    return false;
  }
}

/**
 * Sort comparison function for dates
 */
export function sortByDate(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime(); // Sort by newest first
}

/**
 * Check if date is today
 */
export function isToday(date: string): boolean {
  try {
    const inputDate = new Date(date);
    const today = new Date();
    return inputDate.getFullYear() === today.getFullYear() &&
           inputDate.getMonth() === today.getMonth() &&
           inputDate.getDate() === today.getDate();
  } catch {
    return false;
  }
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: string): boolean {
  try {
    const inputDate = new Date(date);
    const today = new Date();
    return inputDate.getFullYear() === today.getFullYear() &&
           inputDate.getMonth() === today.getMonth();
  } catch {
    return false;
  }
}

/**
 * Get date range for analytics
 */
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days + 1);
  
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10)
  };
}

/**
 * Helper to validate Date object
 */
function isValidDateObject(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}