import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ReceiptModal } from './ReceiptModal';
import { Category, Currency } from '../types';
import type { Expense } from '../types';
import { RecurringUtils } from '../utils/recurringUtils';

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { updateExpense, deleteExpense, formatAmount, toggleRecurringExpense } = useExpenseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const [editData, setEditData] = useState({
    originalAmount: expense.originalAmount.toString(),
    originalCurrency: expense.originalCurrency,
    category: expense.category,
    date: expense.date,
    description: expense.description,
    tags: expense.tags.join(', ')
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const originalAmount = parseFloat(editData.originalAmount);
    if (isNaN(originalAmount) || originalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const parsedTags = editData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    updateExpense(expense.id, {
      originalAmount,
      originalCurrency: editData.originalCurrency,
      category: editData.category,
      date: editData.date,
      description: editData.description.trim(),
      tags: parsedTags
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      originalAmount: expense.originalAmount.toString(),
      originalCurrency: expense.originalCurrency,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      tags: expense.tags.join(', ')
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    setShowDeleteDialog(false);
  };

  const handleToggleRecurring = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expense.recurring) {
      toggleRecurringExpense(expense.id, !expense.recurring.isActive);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: Category) => {
    const colors = {
      [Category.FOOD]: 'bg-green-100 text-green-800',
      [Category.TRANSPORT]: 'bg-blue-100 text-blue-800',
      [Category.SHOPPING]: 'bg-purple-100 text-purple-800',
      [Category.BILLS]: 'bg-red-100 text-red-800',
      [Category.ENTERTAINMENT]: 'bg-yellow-100 text-yellow-800',
      [Category.OTHER]: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editData.originalAmount}
              onChange={(e) => setEditData({ ...editData, originalAmount: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
            <select
              value={editData.originalCurrency}
              onChange={(e) => setEditData({ ...editData, originalCurrency: e.target.value as Currency })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.values(Currency).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value as Category })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.values(Category).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input
              type="text"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={editData.tags}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="work, travel, lunch..."
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition duration-200"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 cursor-pointer transition duration-200"
        onClick={handleEdit}
      >
        <div className="flex gap-4">
          {/* Receipt thumbnail */}
          {expense.receipt && (
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowReceiptModal(true);
              }}
            >
              <img
                src={expense.receipt}
                alt="Receipt"
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition duration-200"
                title="Click to view full receipt"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Amount display */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </span>
                {expense.originalCurrency !== expense.originalCurrency && (
                  <span className="text-sm text-gray-500">
                    ({formatAmount(expense.originalAmount, expense.originalCurrency)})
                  </span>
                )}
              </div>

              {/* Category */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>

              {/* Date */}
              <span className="text-sm text-gray-500">
                {formatDate(expense.date)}
              </span>

              {/* Recurring indicator */}
              {expense.recurring && (
                <div 
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full cursor-pointer transition duration-200 ${
                    expense.recurring.isActive 
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={handleToggleRecurring}
                  title={`${expense.recurring.isActive ? 'Active' : 'Paused'} recurring expense - click to toggle`}
                >
                  <span>{RecurringUtils.getRecurringIcon(expense.recurring.frequency)}</span>
                  <span>{expense.recurring.frequency}</span>
                  {!expense.recurring.isActive && <span>(paused)</span>}
                </div>
              )}

              {/* Recurring instance indicator */}
              {expense.isRecurringInstance && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Auto-generated
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-2">{expense.description}</p>

            {/* Tags */}
            {expense.tags && expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {expense.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="flex-shrink-0 text-red-500 hover:text-red-700 transition duration-200"
            title="Delete expense"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        expenseDescription={expense.description}
        expenseAmount={expense.amount}
      />

      {expense.receipt && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptImage={expense.receipt}
          expenseDescription={expense.description}
        />
      )}
    </>
  );
}; 