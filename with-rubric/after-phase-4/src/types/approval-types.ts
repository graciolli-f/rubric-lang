export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRequest = {
  id: string;
  expenseId: string;
  requestedBy: string;
  requestedAt: string;
  reason?: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
};

export type ApprovalAction = {
  action: "approve" | "reject";
  comments?: string;
};

export type ExpenseApprovalInfo = {
  isRequired: boolean;
  threshold: number;
  request?: ApprovalRequest;
};

export const APPROVAL_STATUSES: readonly ApprovalStatus[] = [
  "pending",
  "approved",
  "rejected"
] as const;

export const APPROVAL_THRESHOLD = 500;

export function isValidApprovalStatus(value: unknown): value is ApprovalStatus {
  return typeof value === "string" && APPROVAL_STATUSES.includes(value as ApprovalStatus);
}

export function requiresApproval(amount: number): boolean {
  return amount > APPROVAL_THRESHOLD;
}

export function isValidApprovalRequest(value: unknown): value is ApprovalRequest {
  if (!value || typeof value !== "object") return false;
  
  const request = value as Record<string, unknown>;
  
  return (
    typeof request.id === "string" &&
    typeof request.expenseId === "string" &&
    typeof request.requestedBy === "string" &&
    typeof request.requestedAt === "string" &&
    (request.reason === undefined || typeof request.reason === "string") &&
    isValidApprovalStatus(request.status) &&
    (request.reviewedBy === undefined || typeof request.reviewedBy === "string") &&
    (request.reviewedAt === undefined || typeof request.reviewedAt === "string") &&
    (request.reviewComments === undefined || typeof request.reviewComments === "string")
  );
} 