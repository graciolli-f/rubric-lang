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
  // Multi-user fields
  createdBy: string; // User ID
  groupId?: string; // Optional group assignment
  approval?: ApprovalStatus;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
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

// Multi-user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  createdAt: string;
  avatar?: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  settings: GroupSettings;
}

export interface GroupMember {
  userId: string;
  role: 'member' | 'manager' | 'admin';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface GroupSettings {
  requireApprovalThreshold: number; // Default 500
  allowedCategories?: Category[];
  approvalRequired: boolean;
}

export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  userId: string;
  action: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'expense_approved' | 'expense_rejected' | 'member_added' | 'member_removed';
  target: string; // expense ID or user ID
  details: string;
  timestamp: string;
}

export interface PresenceInfo {
  userId: string;
  userName: string;
  lastSeen: string;
  isOnline: boolean;
  currentView?: string; // 'expenses' | 'analytics' | specific expense ID
}

export interface RealtimeMessage {
  type: 'expense_update' | 'expense_create' | 'expense_delete' | 'presence_update' | 'approval_update' | 'activity_update';
  payload: any;
  groupId?: string;
  userId: string;
  timestamp: string;
} 