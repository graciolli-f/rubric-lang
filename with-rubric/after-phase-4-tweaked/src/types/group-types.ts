import type { User, UserRole } from './auth-types';

export type GroupMember = {
  user: User;
  role: "member" | "manager" | "admin";
  joinedAt: string;
  invitedBy: string;
};

export type ExpenseGroup = {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  settings: {
    requireApprovalOver: number;
    allowInvites: boolean;
    isPrivate: boolean;
  };
};

export type GroupInvitation = {
  id: string;
  groupId: string;
  groupName: string;
  invitedEmail: string;
  invitedBy: User;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
  expiresAt: string;
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ActivityType = 
  | "expense_created" 
  | "expense_updated" 
  | "expense_deleted"
  | "expense_approved"
  | "expense_rejected"
  | "member_joined"
  | "member_left"
  | "group_created"
  | "group_updated";

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  groupId?: string;
  expenseId?: string;
  details: {
    expenseAmount?: number;
    expenseDescription?: string;
    previousValue?: any;
    newValue?: any;
  };
  timestamp: string;
};

export type PresenceInfo = {
  userId: string;
  userName: string;
  avatar?: string;
  status: "viewing" | "editing" | "away";
  lastSeen: string;
  currentPage?: string;
  editingExpenseId?: string;
};

export const APPROVAL_STATUSES: readonly ApprovalStatus[] = [
  "pending",
  "approved", 
  "rejected"
] as const;

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "expense_created",
  "expense_updated",
  "expense_deleted",
  "expense_approved",
  "expense_rejected",
  "member_joined",
  "member_left",
  "group_created",
  "group_updated"
] as const;

export function isValidApprovalStatus(value: unknown): value is ApprovalStatus {
  return typeof value === "string" && APPROVAL_STATUSES.includes(value as ApprovalStatus);
}

export function isValidGroup(value: unknown): value is ExpenseGroup {
  if (!value || typeof value !== "object") return false;
  
  const group = value as Record<string, unknown>;
  
  return (
    typeof group.id === "string" &&
    typeof group.name === "string" &&
    group.name.length > 0 &&
    typeof group.description === "string" &&
    Array.isArray(group.members) &&
    typeof group.createdBy === "string" &&
    typeof group.createdAt === "string" &&
    (group.updatedAt === undefined || typeof group.updatedAt === "string") &&
    typeof group.settings === "object" &&
    group.settings !== null
  );
} 