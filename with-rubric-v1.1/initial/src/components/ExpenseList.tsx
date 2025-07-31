/**
 * Pure presentation component for displaying expense list
 * Props-only, renders list of expenses with total
 */

import React from 'react';
import clsx from 'clsx';
import type { Expense } from '../types/expense.types';
import { ExpenseItem } from './ExpenseItem';
import { formatCurrency } from '../utils/currency';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  editingId?: string;
  className?: string;
}

export const ExpenseList = React.memo<ExpenseListProps>(({
  expenses,
  onEdit,
  onDelete,
  editingId,
  className,
}) => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const isOverBudget = total > 1000;

  if (expenses.length === 0) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <div className="text-gray-500 text-lg">
          No expenses yet
        </div>
        <div className="text-gray-400 text-sm mt-2">
          Add your first expense using the form above
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Expenses ({expenses.length})
        </h2>
        <div className={clsx(
          'text-xl font-bold',
          isOverBudget ? 'text-red-600' : 'text-gray-800'
        )}>
          Total: {formatCurrency(total)}
        </div>
      </div>

      {/* Budget Warning */}
      {isOverBudget && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center">
            <div className="text-red-600 font-medium">
              ⚠️ Budget Alert
            </div>
          </div>
          <div className="text-red-700 text-sm mt-1">
            Your total expenses exceed $1,000. Consider reviewing your spending.
          </div>
        </div>
      )}

      {/* Expense List */}
      <div 
        className="space-y-3"
        role="list"
        aria-label="Expense list"
      >
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            isEditing={editingId === expense.id}
            onEdit={onEdit}
            onSave={(id, data) => {
              // This will be handled by the container component
              // The ExpenseItem calls onEdit to start editing mode
              // The actual save logic is handled in the container
            }}
            onCancel={() => {
              // This will be handled by the container component
              // to exit editing mode
            }}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
          </div>
          <div className={clsx(
            'text-lg font-semibold',
            isOverBudget ? 'text-red-600' : 'text-gray-800'
          )}>
            {formatCurrency(total)}
          </div>
        </div>
        
        {isOverBudget && (
          <div className="text-sm text-red-600 mt-1">
            Over budget by {formatCurrency(total - 1000)}
          </div>
        )}
      </div>
    </div>
  );
});