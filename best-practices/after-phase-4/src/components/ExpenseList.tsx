import React, { useState } from 'react';
import type { Expense, ExpenseFormData, ExpenseCategory } from '../types';
import { useExpenseStore } from '../stores/expenseStore';
import { expenseToFormData, validateExpenseData } from '../services/expenseService';
import { formatCurrency } from '../services/currencyService';
import { formatRecurrenceFrequency } from '../services/recurringService';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport', 
  'Shopping',
  'Bills',
  'Entertainment',
  'Other'
];

interface ExpenseListProps {
  expenses: Expense[];
}

interface DeleteConfirmProps {
  expense: Expense;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ expense, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Expense</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this expense?
        </p>
        <div className="bg-gray-50 p-3 rounded mb-6">
          <div className="text-sm">
            <div><strong>Amount:</strong> {formatCurrency(expense.amount, expense.currency)}</div>
            <div><strong>Category:</strong> {expense.category}</div>
            <div><strong>Description:</strong> {expense.description}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReceiptViewerProps {
  receiptBase64: string;
  onClose: () => void;
}

function ReceiptViewer({ receiptBase64, onClose }: ReceiptViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-screen w-full h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 shadow-lg z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden">
          <img
            src={receiptBase64}
            alt="Receipt"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (id: string) => void;
  isEditing: boolean;
  onSave: (id: string, formData: ExpenseFormData) => void;
  onCancelEdit: () => void;
}

function ExpenseItem({ expense, onEdit, onDelete, onViewReceipt, isEditing, onSave, onCancelEdit }: ExpenseItemProps) {
  const [editFormData, setEditFormData] = useState<ExpenseFormData>(expenseToFormData(expense));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof ExpenseFormData, value: string | ExpenseCategory) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSave = () => {
    const errors = validateExpenseData(editFormData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    onSave(expense.id, editFormData);
  };

  const handleCancel = () => {
    setEditFormData(expenseToFormData(expense));
    setValidationErrors([]);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={editFormData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                step="0.01"
                min="0"
                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={editFormData.category}
              onChange={(e) => handleInputChange('category', e.target.value as ExpenseCategory)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={editFormData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={editFormData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={200}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
            <div className="text-xs text-red-600">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onEdit(expense.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Main expense info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(expense.amount, expense.currency)}
              </div>
              {expense.originalCurrency !== expense.currency && (
                <span className="text-xs text-gray-500">
                  (orig: {formatCurrency(expense.originalAmount, expense.originalCurrency)})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {expense.category}
              </span>
              {expense.isRecurring && (
                <div className="flex items-center text-xs text-blue-600" title={`Recurring ${formatRecurrenceFrequency(expense.recurrenceFrequency!)}`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {formatRecurrenceFrequency(expense.recurrenceFrequency!)}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {new Date(expense.date).toLocaleDateString()}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 truncate flex-1">
                {expense.description}
              </div>
              {expense.receipt && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReceipt(expense.id);
                  }}
                  className="flex-shrink-0 w-8 h-8 rounded border border-gray-300 overflow-hidden hover:border-blue-500 transition-colors"
                  title="View receipt"
                >
                  <img
                    src={expense.receipt}
                    alt="Receipt thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {expense.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {expense.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(expense.id);
          }}
          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
          title="Delete expense"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingReceiptId, setViewingReceiptId] = useState<string | null>(null);
  const { updateExpense, deleteExpense } = useExpenseStore();

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (id: string, formData: ExpenseFormData) => {
    try {
      await updateExpense(id, formData);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteExpense(deleteConfirmId);
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleViewReceipt = (id: string) => {
    setViewingReceiptId(id);
  };

  const handleCloseReceipt = () => {
    setViewingReceiptId(null);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No expenses yet</p>
          <p className="text-gray-600">Add your first expense using the form above.</p>
        </div>
      </div>
    );
  }

  const expenseToDelete = deleteConfirmId ? expenses.find(e => e.id === deleteConfirmId) : null;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Expenses ({expenses.length})
      </h2>
      
      {/* Header for desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
        <div>Amount</div>
        <div>Category</div>
        <div>Date</div>
        <div>Description</div>
      </div>

      {expenses.map(expense => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewReceipt={handleViewReceipt}
          isEditing={editingId === expense.id}
          onSave={handleSave}
          onCancelEdit={handleCancelEdit}
        />
      ))}

      {/* Delete Confirmation Dialog */}
      {expenseToDelete && (
        <DeleteConfirmDialog
          expense={expenseToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Receipt Viewer */}
      {viewingReceiptId && (() => {
        const expenseWithReceipt = expenses.find(e => e.id === viewingReceiptId);
        return expenseWithReceipt?.receipt ? (
          <ReceiptViewer
            receiptBase64={expenseWithReceipt.receipt}
            onClose={handleCloseReceipt}
          />
        ) : null;
      })()}
    </div>
  );
} 