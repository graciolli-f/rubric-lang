export interface ApprovalRequest {
  id: string;
  expenseId: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  approvers: ApprovalAction[];
  reason?: string;
  amount: number;
  category: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ApprovalAction {
  id: string;
  approverId: string;
  action: "approve" | "reject" | "request_changes";
  actionAt: string;
  comment?: string;
  isRequired: boolean;
}

export interface ApprovalRule {
  id: string;
  groupId: string;
  threshold: number;
  requiredApprovers: string[];
  anyApproverCount?: number;
  isActive: boolean;
}

export interface ApprovalNotification {
  id: string;
  approvalRequestId: string;
  recipientId: string;
  type: "approval_request" | "approval_granted" | "approval_rejected";
  sentAt: string;
  readAt?: string;
} 