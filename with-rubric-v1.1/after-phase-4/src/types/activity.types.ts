/**
 * Type definitions for activity feed and approval workflows
 * No side effects, pure type definitions
 */

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  groupId?: string;
  entityId: string;
  entityType: EntityType;
  action: ActivityAction;
  details: ActivityDetails;
  timestamp: string;
}

export enum ActivityType {
  EXPENSE = 'expense',
  APPROVAL = 'approval',
  GROUP = 'group',
  MEMBER = 'member'
}

export enum EntityType {
  EXPENSE = 'expense',
  GROUP = 'group',
  USER = 'user',
  INVITATION = 'invitation'
}

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INVITED = 'invited',
  JOINED = 'joined',
  LEFT = 'left'
}

export interface ActivityDetails {
  expenseAmount?: number;
  expenseDescription?: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}

export interface ApprovalRequest {
  id: string;
  expenseId: string;
  requestedBy: string;
  requestedByName: string;
  groupId?: string;
  amount: number;
  description: string;
  status: ApprovalStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reason?: string;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ApprovalAction {
  requestId: string;
  action: ApprovalStatus;
  reason?: string;
}

export interface UserPresence {
  userId: string;
  userName: string;
  groupId?: string;
  location: string;
  isEditing?: boolean;
  editingEntityId?: string;
  lastSeen: string;
}

export interface RealtimeUpdate {
  type: RealtimeUpdateType;
  payload: any;
  userId: string;
  userName: string;
  timestamp: string;
}

export enum RealtimeUpdateType {
  EXPENSE_CREATED = 'expense_created',
  EXPENSE_UPDATED = 'expense_updated',
  EXPENSE_DELETED = 'expense_deleted',
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_DECIDED = 'approval_decided',
  USER_JOINED = 'user_joined',
  USER_EDITING = 'user_editing'
}