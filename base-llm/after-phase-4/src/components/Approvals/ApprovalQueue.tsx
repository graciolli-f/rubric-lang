import React, { useState } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import AuthService from '../../services/authService';
import type { Expense, User } from '../../types';

interface ApprovalQueueProps {
  className?: string;
}

export default function ApprovalQueue({ className = '' }: ApprovalQueueProps) {
  const {
    currentUser,
    getPendingApprovals,
    approveExpense,
    formatAmount
  } = useCollaborativeExpenseStore();

  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);

  const pendingApprovals = getPendingApprovals();
  const authService = AuthService.getInstance();

  // Check if current user can approve expenses
  const canApprove = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  const handleApprove = async (expenseId: string) => {
    if (!canApprove) return;

    setLoading(expenseId);
    try {
      await approveExpense(expenseId, true);
    } catch (error) {
      console.error('Failed to approve expense:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (expenseId: string) => {
    if (!canApprove || !rejectionReason.trim()) return;

    setLoading(expenseId);
    try {
      await approveExpense(expenseId, false, rejectionReason.trim());
      setRejectionReason('');
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to reject expense:', error);
    } finally {
      setLoading(null);
    }
  };

  const getCreatorName = async (userId: string): Promise<string> => {
    try {
      const user = await authService.getUserById(userId);
      return user?.name || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => {
    const [creatorName, setCreatorName] = useState<string>('Loading...');
    const isExpanded = expandedExpense === expense.id;
    const isLoading = loading === expense.id;

    React.useEffect(() => {
      getCreatorName(expense.createdBy).then(setCreatorName);
    }, [expense.createdBy]);

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {expense.description}
                </h4>
                <p className="text-sm text-gray-500">
                  by {creatorName} • {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </div>
                <div className="text-sm text-gray-500">
                  {expense.originalCurrency !== 'USD' && 
                    `${formatAmount(expense.originalAmount, expense.originalCurrency)} original`
                  }
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Approval
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {expense.category}
              </span>
              {expense.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Expandable Details */}
            <button
              onClick={() => setExpandedExpense(isExpanded ? null : expense.id)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>

            {isExpanded && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <div className="text-gray-600">
                      {new Date(expense.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <div className="text-gray-600">
                      {formatAmount(expense.originalAmount, expense.originalCurrency)}
                      {expense.originalCurrency !== 'USD' && 
                        ` (${formatAmount(expense.amount)} USD)`
                      }
                    </div>
                  </div>
                  {expense.groupId && (
                    <div>
                      <span className="font-medium text-gray-700">Group:</span>
                      <div className="text-gray-600">Group Expense</div>
                    </div>
                  )}
                  {expense.receipt && (
                    <div>
                      <span className="font-medium text-gray-700">Receipt:</span>
                      <div className="text-gray-600">Attached</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {selectedExpense === expense.id ? (
              // Rejection form
              <div className="space-y-3">
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                    Reason for rejection
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please provide a reason for rejecting this expense..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReject(expense.id)}
                    disabled={!rejectionReason.trim() || isLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpense(null);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Approval buttons
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprove(expense.id)}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setSelectedExpense(expense.id)}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Please log in to view approval queue.</p>
      </div>
    );
  }

  if (!canApprove) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Restricted
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Only managers and administrators can approve expenses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Approval Queue</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve expenses over the approval threshold
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">
            All expenses have been reviewed and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {pendingApprovals.length} expense{pendingApprovals.length !== 1 ? 's' : ''} pending approval
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Review each expense carefully before approving or rejecting.</p>
                </div>
              </div>
            </div>
          </div>

          {pendingApprovals.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
} 