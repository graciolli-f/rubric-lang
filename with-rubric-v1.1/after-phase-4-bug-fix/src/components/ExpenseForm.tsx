/**
 * Pure presentation component for expense form
 * Props-only, handles form input and validation
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';
import type { ExpenseFormData, Category } from '../types/expense.types';
import { CATEGORIES } from '../types/expense.types';


interface ExpenseFormProps {
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  validationErrors?: string[];
}

export const ExpenseForm = React.memo<ExpenseFormProps>(({
  initialData,
  onSubmit,
  onCancel,
  className,
  disabled = false,
  validationErrors = [],
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount ?? 0,
    category: initialData?.category ?? 'Food',
    date: initialData?.date ?? new Date().toISOString().split('T')[0],
    description: initialData?.description ?? '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onSubmit(formData);
      if (!initialData) {
        setFormData({
          amount: 0,
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          description: '',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    onCancel?.();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={clsx(
        'bg-white p-6 rounded-lg shadow-md border border-gray-200',
        className
      )}
      aria-label="Expense form"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="text-red-700 text-sm">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input type="number" id="amount" step="0.01" min="0" value={formData.amount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled} />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="category" value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="date" value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled} />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input type="text" id="description" value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter expense description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled} />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={disabled || isSubmitting}
          className={clsx('flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
            (disabled || isSubmitting) && 'opacity-50 cursor-not-allowed')}>
          <Plus size={16} />
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Add Expense')}
        </button>
        {onCancel && (
          <button type="button" onClick={handleCancel} disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            <X size={16} />Cancel
          </button>
        )}
      </div>
    </form>
  );
});