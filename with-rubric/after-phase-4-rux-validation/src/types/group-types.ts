export interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
  settings: GroupSettings;
}

export interface GroupMember {
  userId: string;
  role: "member" | "manager" | "admin";
  joinedAt: string;
  invitedBy: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string;
  role: "member" | "manager";
  invitedBy: string;
  invitedAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
}

export interface GroupSettings {
  approvalThreshold: number;
  requireApproval: boolean;
  allowMemberInvites: boolean;
}

export interface GroupExpense {
  expenseId: string;
  groupId: string;
  splitType: "equal" | "custom";
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
} 