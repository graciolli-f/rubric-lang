import React, { useState, useEffect } from 'react';
import type { Expense } from '../types/expense-types';
import { EXPENSE_CATEGORIES } from '../types/expense-types';
import { formatCurrency } from '../utils/formatters';

interface ExpenseItemEditProps {
  expense: Expense;
  onSave: (updates: Partial<Expense>) => void;
  onCancel: () => void;
}

export function ExpenseItemEdit({ expense, onSave, onCancel }: ExpenseItemEditProps): React.JSX.Element {
  const [editData, setEditData] = useState<Partial<Expense>>({
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    description: expense.description
  });

  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // Reset form data when expense changes
  useEffect(() => {
    setEditData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description
    });
    setErrors(new Map());
  }, [expense]);

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'amount':
        if (typeof value !== 'number' || isNaN(value) || value <= 0) {
          return 'Amount must be a positive number';
        }
        if (value > 999999) {
          return 'Amount cannot exceed $999,999';
        }
        return null;

      case 'description':
        const desc = String(value).trim();
        if (!desc) {
          return 'Description is required';
        }
        if (desc.length < 3) {
          return 'Description must be at least 3 characters';
        }
        if (desc.length > 100) {
          return 'Description cannot exceed 100 characters';
        }
        return null;

      case 'date':
        if (!value) {
          return 'Date is required';
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (selectedDate > today) {
          return 'Date cannot be in the future';
        }
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors = new Map<string, string>();

    // Validate each field
    Object.entries(editData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors.set(field, error);
      }
    });

    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Only include fields that have actually changed
    const changes: Partial<Expense> = {};
    
    if (editData.amount !== expense.amount) {
      changes.amount = editData.amount;
    }
    if (editData.category !== expense.category) {
      changes.category = editData.category;
    }
    if (editData.date !== expense.date) {
      changes.date = editData.date;
    }
    if (editData.description !== expense.description) {
      changes.description = editData.description;
    }

    // Only save if there are actual changes
    if (Object.keys(changes).length > 0) {
      onSave(changes);
    } else {
      onCancel(); // No changes, just cancel
    }
  };

  const handleCancel = () => {
    setEditData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description
    });
    setErrors(new Map());
    onCancel();
  };

  const handleFieldChange = (field: keyof typeof editData, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts editing
    if (errors.has(field)) {
      const newErrors = new Map(errors);
      newErrors.delete(field);
      setErrors(newErrors);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const getErrorForField = (field: string): string | undefined => {
    return errors.get(field);
  };

  const hasChanges = () => {
    return (
      editData.amount !== expense.amount ||
      editData.category !== expense.category ||
      editData.date !== expense.date ||
      editData.description !== expense.description
    );
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Amount field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="999999"
              value={editData.amount || ''}
              onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              className={`w-full pl-6 pr-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                getErrorForField('amount') ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
          </div>
          {getErrorForField('amount') && (
            <p className="text-xs text-red-600 mt-1">{getErrorForField('amount')}</p>
          )}
          {editData.amount && !getErrorForField('amount') && (
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(editData.amount)}
            </p>
          )}
        </div>

        {/* Category field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={editData.category || ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={editData.date || ''}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            onKeyDown={handleKeyDown}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              getErrorForField('date') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getErrorForField('date') && (
            <p className="text-xs text-red-600 mt-1">{getErrorForField('date')}</p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={editData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              getErrorForField('description') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter description"
          />
          <div className="flex justify-between mt-1">
            <div>
              {getErrorForField('description') && (
                <p className="text-xs text-red-600">{getErrorForField('description')}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {(editData.description || '').length}/100
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-gray-600">
          Press Ctrl+Enter to save, Escape to cancel
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges() || errors.size > 0}
            className={`px-3 py-1 text-sm text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !hasChanges() || errors.size > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 