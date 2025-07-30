import React, { useState } from 'react';
import { useExpenseStore } from '../stores/expense-store';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseItemEdit } from './ExpenseItemEdit';
import { ConfirmDialog } from './ConfirmDialog';
import { TagFilter } from './TagFilter';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '../utils/formatters';

export function ExpenseList(): React.JSX.Element {
  const { 
    getSortedExpenses, 
    getFilteredExpenses,
    getTotal, 
    getAllTags,
    updateExpense, 
    deleteExpense,
    isLoading,
    error,
    clearError
  } = useExpenseStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    expenseId: string | null;
    expenseDescription: string;
  }>({
    isOpen: false,
    expenseId: null,
    expenseDescription: ''
  });

  const allExpenses = getSortedExpenses();
  const expenses = selectedTags.length > 0 ? getFilteredExpenses(selectedTags) : allExpenses;
  const availableTags = getAllTags();
  
  // Calculate total for currently filtered expenses
  const filteredTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const total = getTotal(); // Total of all expenses
  const isOverBudget = total > 1000;

  const handleEdit = (expenseId: string) => {
    setEditingId(expenseId);
    if (error) clearError();
  };

  const handleSaveEdit = async (expenseId: string, updates: Partial<any>) => {
    try {
      await updateExpense(expenseId, updates);
      setEditingId(null);
    } catch (err) {
      // Error handling is done in the store
      console.error('Failed to update expense:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    if (error) clearError();
  };

  const handleDeleteClick = (expenseId: string, description: string) => {
    setDeleteConfirm({
      isOpen: true,
      expenseId,
      expenseDescription: description
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.expenseId) return;

    try {
      await deleteExpense(deleteConfirm.expenseId);
      setDeleteConfirm({
        isOpen: false,
        expenseId: null,
        expenseDescription: ''
      });
    } catch (err) {
      // Error handling is done in the store
      console.error('Failed to delete expense:', err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      expenseId: null,
      expenseDescription: ''
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.124-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V9.75m-2.25-1.5H15.75" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">
          Start tracking your expenses by adding your first expense above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenses list */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Expenses ({expenses.length}{selectedTags.length > 0 && ` filtered`})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Click any expense to edit it inline
              </p>
            </div>
            <ExportButton expenses={expenses} disabled={isLoading} />
          </div>
          
          {/* Filtering section */}
          {availableTags.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-xs">
                <TagFilter
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4">
              {editingId === expense.id ? (
                <ExpenseItemEdit
                  expense={expense}
                  onSave={(updates) => handleSaveEdit(expense.id, updates)}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <ExpenseItem
                  expense={expense}
                  onEdit={() => handleEdit(expense.id)}
                  onDelete={() => handleDeleteClick(expense.id, expense.description)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Total section */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {selectedTags.length > 0 ? 'Filtered Total' : 'Total Expenses'}
              </h3>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  All expenses total: {formatCurrency(total)}
                </p>
              )}
              {isOverBudget && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Over $1,000 budget limit
                </p>
              )}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(selectedTags.length > 0 ? filteredTotal : total)}
              </div>
              {expenses.length > 0 && (
                <p className="text-xs text-gray-500">
                  Average: {formatCurrency((selectedTags.length > 0 ? filteredTotal : total) / expenses.length)}
                </p>
              )}
            </div>
          </div>
          
          {isOverBudget && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Budget Alert
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    You've exceeded your $1,000 spending limit by {formatCurrency(total - 1000)}.
                    Consider reviewing your expenses and adjusting your budget.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteConfirm.expenseDescription}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
} 