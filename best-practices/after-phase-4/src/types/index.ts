export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Other';

export type Currency = 'USD' | 'EUR' | 'GBP';

export type RecurrenceFrequency = 'weekly' | 'monthly';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // User and collaboration fields
  createdBy: string; // User ID
  groupId?: string; // Group ID for shared expenses
  approvalStatus: ApprovalStatus;
  approvedBy?: string; // User ID of approver
  approvedAt?: string; // ISO date string
  // Existing fields
  receipt?: string; // base64 encoded image
  currency: Currency;
  originalAmount: number; // amount in original currency
  originalCurrency: Currency;
  tags: string[];
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  parentExpenseId?: string; // for tracking recurring expense instances
}

export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  date: string;
  description: string;
  // New fields
  receipt?: File | null;
  currency: Currency;
  tags: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
}

export interface ExpenseCreateData {
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  // New fields
  receipt?: string; // base64 encoded
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  tags: string[];
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
}

export interface ExpenseUpdateData extends Partial<ExpenseCreateData> {
  id: string;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// Analytics and Budget Types
export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string; // YYYY-MM-DD format
  amount: number;
}

export interface BudgetState {
  monthlyBudget: number;
  currentMonthSpending: number;
  remainingBudget: number;
  percentageUsed: number;
}

export interface AnalyticsData {
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
  budgetState: BudgetState;
  averageDailySpending: number;
}

export type ViewMode = 'expenses' | 'analytics' | 'groups' | 'activity' | 'profile';

// Currency and Exchange Rate Types
export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyConversionResult {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  convertedAmount: number;
}

// User preferences
export interface UserPreferences {
  preferredCurrency: Currency;
  lastUpdated: string;
}

// Export types
export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  categories?: ExpenseCategory[];
  tags?: string[];
}

// Filter types
export interface ExpenseFilters {
  categories?: ExpenseCategory[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  currency?: Currency;
  groupId?: string;
  approvalStatus?: ApprovalStatus;
}

// Multi-user and collaboration types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  lastActive: string;
}

export type UserRole = 'user' | 'manager' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  invitedBy: string;
}

export type GroupRole = 'member' | 'manager' | 'admin';

export interface GroupInvite {
  id: string;
  groupId: string;
  email: string;
  invitedBy: string;
  role: GroupRole;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface ApprovalRequest {
  id: string;
  expenseId: string;
  requestedBy: string;
  assignedTo?: string; // Manager to review
  reason?: string;
  createdAt: string;
  status: ApprovalStatus;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  groupId?: string;
  entityId: string; // expense, user, group ID
  entityType: EntityType;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

export type ActivityType = 'expense' | 'approval' | 'group' | 'user';
export type EntityType = 'expense' | 'group' | 'user' | 'invite';

// Real-time collaboration types
export interface UserPresence {
  userId: string;
  groupId?: string;
  isOnline: boolean;
  currentPage: string;
  lastSeen: string;
  isEditing?: {
    entityType: string;
    entityId: string;
  };
}

export interface RealtimeUpdate {
  type: RealtimeUpdateType;
  data: any;
  userId: string;
  timestamp: string;
}

export type RealtimeUpdateType = 
  | 'expense_created' 
  | 'expense_updated' 
  | 'expense_deleted'
  | 'approval_requested'
  | 'approval_completed'
  | 'user_joined'
  | 'user_left'
  | 'editing_started'
  | 'editing_stopped';

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

// Extended app state types
export type AppView = 'expenses' | 'analytics' | 'groups' | 'activity' | 'profile';

export interface CollaborationState {
  currentGroup?: Group;
  userPresence: UserPresence[];
  pendingApprovals: ApprovalRequest[];
  activityFeed: ActivityItem[];
  isConnected: boolean;
} 