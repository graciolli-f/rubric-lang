import React, { useState } from 'react';
import { useExpenseStore } from '../stores/expense-store';
import { useCurrencyStore } from '../stores/currency-store';
import type { ExpenseFormData, RecurringFrequency } from '../types/expense-types';
import { EXPENSE_CATEGORIES } from '../types/expense-types';
import { formatCurrency } from '../utils/formatters';
import { CurrencySelector } from './CurrencySelector';
import { TagInput } from './TagInput';
import { RecurringOptions } from './RecurringOptions';
import { ReceiptUpload } from './ReceiptUpload';
import { processReceiptFile } from '../services/receipt-service';

export function ExpenseForm(): React.JSX.Element {
  const { addExpense, isLoading, error, clearError, getAllTags } = useExpenseStore();
  const { preferredCurrency } = useCurrencyStore();

  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    currency: preferredCurrency,
    tags: '',
    isRecurring: false,
    recurringFrequency: undefined,
    receipt: undefined
  });

  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processedReceipt, setProcessedReceipt] = useState<{
    base64: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const validateForm = (): boolean => {
    const newErrors = new Map<string, string>();

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim()) {
      newErrors.set('amount', 'Amount is required');
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.set('amount', 'Amount must be a positive number');
    } else if (amount > 999999) {
      newErrors.set('amount', 'Amount cannot exceed $999,999');
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.set('description', 'Description is required');
    } else if (formData.description.trim().length < 3) {
      newErrors.set('description', 'Description must be at least 3 characters');
    } else if (formData.description.trim().length > 100) {
      newErrors.set('description', 'Description cannot exceed 100 characters');
    }

    // Date validation
    if (!formData.date) {
      newErrors.set('date', 'Date is required');
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        newErrors.set('date', 'Date cannot be in the future');
      }
    }

    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense(formData);
      
      // Reset form on success
      setFormData({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency: preferredCurrency,
        tags: '',
        isRecurring: false,
        recurringFrequency: undefined,
        receipt: undefined
      });
      setErrors(new Map());
      setProcessedReceipt(null);
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to add expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string | boolean | RecurringFrequency | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors.has(field as string)) {
      const newErrors = new Map(errors);
      newErrors.delete(field as string);
      setErrors(newErrors);
    }
    
    // Clear global error when user makes any change
    if (error) {
      clearError();
    }
  };

  const handleReceiptSelect = async (file: File) => {
    try {
      const processed = await processReceiptFile(file);
      setProcessedReceipt(processed);
      setFormData(prev => ({ ...prev, receipt: file }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process receipt';
      const newErrors = new Map(errors);
      newErrors.set('receipt', errorMessage);
      setErrors(newErrors);
    }
  };

  const getErrorForField = (field: string): string | undefined => {
    return errors.get(field);
  };

  const previewAmount = formData.amount ? parseFloat(formData.amount) : 0;
  const isValidAmount = !isNaN(previewAmount) && previewAmount > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              max="999999"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorForField('amount') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={isSubmitting || isLoading}
            />
          </div>
          {isValidAmount && (
            <p className="text-xs text-gray-500 mt-1">
              Preview: {formatCurrency(previewAmount)}
            </p>
          )}
          {getErrorForField('amount') && (
            <p className="text-sm text-red-600 mt-1">{getErrorForField('amount')}</p>
          )}
        </div>

        {/* Category field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || isLoading}
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
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getErrorForField('date') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting || isLoading}
          />
          {getErrorForField('date') && (
            <p className="text-sm text-red-600 mt-1">{getErrorForField('date')}</p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getErrorForField('description') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Lunch at restaurant"
            disabled={isSubmitting || isLoading}
          />
          <div className="flex justify-between mt-1">
            <div>
              {getErrorForField('description') && (
                <p className="text-sm text-red-600">{getErrorForField('description')}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formData.description.length}/100
            </p>
          </div>
        </div>

        {/* Currency field */}
        <CurrencySelector
          value={formData.currency}
          onChange={(currency) => handleInputChange('currency', currency)}
          label="Currency *"
          error={getErrorForField('currency')}
        />

        {/* Tags field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (Optional)
          </label>
          <TagInput
            value={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            suggestions={getAllTags()}
            placeholder="Enter tags separated by commas (e.g., work, travel, urgent)"
          />
          {getErrorForField('tags') && (
            <p className="text-sm text-red-600 mt-1">{getErrorForField('tags')}</p>
          )}
        </div>

        {/* Receipt upload */}
        <ReceiptUpload
          onReceiptSelect={handleReceiptSelect}
          currentReceipt={processedReceipt || undefined}
          isLoading={isSubmitting}
        />
        {getErrorForField('receipt') && (
          <p className="text-sm text-red-600 mt-1">{getErrorForField('receipt')}</p>
        )}

        {/* Recurring options */}
        <RecurringOptions
          isRecurring={formData.isRecurring}
          frequency={formData.recurringFrequency}
          onRecurringChange={(isRecurring) => handleInputChange('isRecurring', isRecurring)}
          onFrequencyChange={(frequency) => handleInputChange('recurringFrequency', frequency)}
        />

        {/* Global error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSubmitting || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting || isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
} 