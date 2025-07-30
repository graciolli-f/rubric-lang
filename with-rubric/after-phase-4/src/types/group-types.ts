export type GroupRole = "member" | "admin";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export type GroupMember = {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  invitedBy: string;
};

export type ExpenseGroup = {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  members: GroupMember[];
};

export type GroupInvitation = {
  id: string;
  groupId: string;
  email: string;
  role: GroupRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
};

export type GroupFormData = {
  name: string;
  description?: string;
};

export type InviteFormData = {
  email: string;
  role: GroupRole;
};

export const GROUP_ROLES: readonly GroupRole[] = [
  "member",
  "admin"
] as const;

export const INVITATION_STATUSES: readonly InvitationStatus[] = [
  "pending",
  "accepted", 
  "declined",
  "expired"
] as const;

export function isValidGroupRole(value: unknown): value is GroupRole {
  return typeof value === "string" && GROUP_ROLES.includes(value as GroupRole);
}

export function isValidInvitationStatus(value: unknown): value is InvitationStatus {
  return typeof value === "string" && INVITATION_STATUSES.includes(value as InvitationStatus);
}

export function isValidExpenseGroup(value: unknown): value is ExpenseGroup {
  if (!value || typeof value !== "object") return false;
  
  const group = value as Record<string, unknown>;
  
  return (
    typeof group.id === "string" &&
    typeof group.name === "string" &&
    (group.description === undefined || typeof group.description === "string") &&
    typeof group.createdBy === "string" &&
    typeof group.createdAt === "string" &&
    (group.updatedAt === undefined || typeof group.updatedAt === "string") &&
    Array.isArray(group.members) &&
    group.members.every((member: unknown) => {
      if (!member || typeof member !== "object") return false;
      const m = member as Record<string, unknown>;
      return (
        typeof m.userId === "string" &&
        isValidGroupRole(m.role) &&
        typeof m.joinedAt === "string" &&
        typeof m.invitedBy === "string"
      );
    })
  );
} 