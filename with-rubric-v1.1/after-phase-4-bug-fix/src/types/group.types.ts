/**
 * Type definitions for expense groups and collaboration
 * No side effects, pure type definitions
 */

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  settings: GroupSettings;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: GroupRole;
  joinedAt: string;
  isActive: boolean;
}

export enum GroupRole {
  MEMBER = 'member',
  MANAGER = 'manager',
  OWNER = 'owner'
}

export interface GroupSettings {
  approvalThreshold: number;
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  defaultCurrency: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedEmail: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface GroupFormData {
  name: string;
  description?: string;
  settings?: Partial<GroupSettings>;
}

export interface InviteMemberData {
  email: string;
  role: GroupRole;
}

// Default group settings
export const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  approvalThreshold: 500,
  allowMemberInvites: true,
  requireApprovalForExpenses: true,
  defaultCurrency: 'USD'
};