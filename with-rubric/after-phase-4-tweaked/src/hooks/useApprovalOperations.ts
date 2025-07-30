import { useExpenseStore } from '../stores/expense-store';
import { useAuthStore } from '../stores/auth-store';
import type { ApprovalStatus } from '../types/group-types';

export function useApprovalOperations() {
  const { user } = useAuthStore();
  const { updateExpense } = useExpenseStore();

  const handleApprove = async (expenseId: string): Promise<void> => {
    await updateExpense(expenseId, { 
      approvalStatus: 'approved' as ApprovalStatus,
      approvedBy: user?.id,
      approvedAt: new Date().toISOString()
    });
  };

  const handleReject = async (expenseId: string): Promise<void> => {
    await updateExpense(expenseId, { 
      approvalStatus: 'rejected' as ApprovalStatus,
      rejectionReason: 'Rejected by manager'
    });
  };

  return {
    handleApprove,
    handleReject
  };
} 