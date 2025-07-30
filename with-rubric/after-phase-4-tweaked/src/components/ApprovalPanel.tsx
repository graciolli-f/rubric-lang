import React from 'react';
import { useExpenseStore } from '../stores/expense-store';
import { useAuthStore } from '../stores/auth-store';
import { useGroupStore } from '../stores/group-store';
import { useApprovalOperations } from '../hooks/useApprovalOperations';
import type { Expense } from '../types/expense-types';
import type { ApprovalStatus } from '../types/group-types';

export function ApprovalPanel(): React.JSX.Element {
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();
  const { expenses } = useExpenseStore();
  const { handleApprove, handleReject } = useApprovalOperations();

  // Filter expenses that are pending approval
  const pendingExpenses = expenses.filter(expense => 
    expense.approvalStatus === 'pending' && 
    expense.groupId === activeGroup?.id &&
    expense.createdBy !== user?.id // Don't show own expenses
  );

  if (!user || !activeGroup) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Approvals</h2>
        <p className="text-gray-500">Please select a group to view pending approvals.</p>
      </div>
    );
  }

  if (pendingExpenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Approvals</h2>
        <p className="text-gray-500">No pending approvals at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Expense Approvals ({pendingExpenses.length})
      </h2>
      
      <div className="space-y-4">
        {pendingExpenses.map((expense) => (
          <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{expense.description}</h3>
                <p className="text-sm text-gray-500">
                  Submitted by: {expense.createdByName || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ${expense.amount.toFixed(2)} {expense.currency}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {expense.category}
                </span>
              </div>
            </div>
            
            {expense.receipt && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Receipt attached</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleApprove(expense.id)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(expense.id)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 