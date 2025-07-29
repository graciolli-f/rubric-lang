export const Category = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  SHOPPING: 'Shopping',
  BILLS: 'Bills',
  ENTERTAINMENT: 'Entertainment',
  OTHER: 'Other'
} as const;

export type Category = typeof Category[keyof typeof Category];

export const Currency = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
} as const;

export type Currency = typeof Currency[keyof typeof Currency];

export interface RecurringSettings {
  frequency: 'weekly' | 'monthly';
  nextDate: string; // ISO date string for next occurrence
  isActive: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  originalAmount: number;
  originalCurrency: Currency;
  category: Category;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string for sorting
  receipt?: string; // base64 encoded image
  tags: string[];
  recurring?: RecurringSettings;
  isRecurringInstance?: boolean;
  parentRecurringId?: string;
}

export interface ExpenseFormData {
  amount: string;
  category: Category;
  date: string;
  description: string;
  currency: Currency;
  receipt?: string;
  tags: string;
  isRecurring: boolean;
  recurringFrequency: 'weekly' | 'monthly';
}

export interface Budget {
  monthlyLimit: number;
  month: string; // Format: YYYY-MM
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface UserPreferences {
  preferredCurrency: Currency;
  exchangeRates: ExchangeRates;
  lastRateUpdate: string;
} 