/**
 * Pure presentation component for individual expense item
 * Props-only, handles edit mode and display
 */

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import clsx from 'clsx';
import type { Expense, ExpenseFormData, Category } from '../types/expense.types';
import { CATEGORIES } from '../types/expense.types';
import { formatCurrency, isValidAmount } from '../utils/currency';
import { formatDate } from '../utils/date';

interface ExpenseItemProps {
  expense: Expense;
  isEditing: boolean;
  onEdit?: (expense: Expense) => void;
  onSave?: (id: string, data: ExpenseFormData) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const ExpenseItem = React.memo<ExpenseItemProps>(({
  expense,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  className,
}) => {
  const [editData, setEditData] = useState<ExpenseFormData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setEditData({
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description,
      });
    } else {
      setEditData(null);
    }
  }, [isEditing, expense]);

  const handleSave = () => {
    if (!editData || !onSave) return;

    if (!isValidAmount(editData.amount) || editData.amount <= 0) return;
    if (!editData.description.trim()) return;

    onSave(expense.id, editData);
  };

  const handleCancel = () => {
    setEditData(null);
    onCancel?.();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(expense.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (isEditing && editData) {
    return (
      <div className={clsx('bg-blue-50 border border-blue-200 rounded-lg p-3', className)} role="listitem">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <input type="number" step="0.01" min="0" value={editData.amount || ''} 
            onChange={(e) => setEditData(prev => prev ? {...prev, amount: parseFloat(e.target.value) || 0} : null)}
            className="px-2 py-1 border rounded" placeholder="Amount" />
          <select value={editData.category} 
            onChange={(e) => setEditData(prev => prev ? {...prev, category: e.target.value as Category} : null)}
            className="px-2 py-1 border rounded">
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="date" value={editData.date} 
            onChange={(e) => setEditData(prev => prev ? {...prev, date: e.target.value} : null)}
            className="px-2 py-1 border rounded" />
          <input type="text" value={editData.description} 
            onChange={(e) => setEditData(prev => prev ? {...prev, description: e.target.value} : null)}
            className="px-2 py-1 border rounded" placeholder="Description" />
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded">
            <Check size={12} />Save
          </button>
          <button onClick={handleCancel} className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded">
            <X size={12} />Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
      aria-label={`Expense: ${expense.description}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Amount */}
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(expense.amount)}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="text-sm font-medium text-gray-600">
              {expense.category}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="text-sm text-gray-600">
              {formatDate(expense.date)}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-sm text-gray-800">
              {expense.description}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={clsx('flex gap-1 transition-opacity', isHovered ? 'opacity-100' : 'opacity-0')}>
          {!showDeleteConfirm ? (
            <>
              <button onClick={() => onEdit?.(expense)} className="p-1 text-blue-600 hover:text-blue-800" aria-label="Edit">
                <Edit2 size={14} />
              </button>
              <button onClick={handleDelete} className="p-1 text-red-600 hover:text-red-800" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Delete</button>
              <button onClick={handleCancelDelete} className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});