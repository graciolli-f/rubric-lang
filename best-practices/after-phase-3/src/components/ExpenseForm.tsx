import React, { useState, useRef } from 'react';
import type { ExpenseFormData, ExpenseCategory, Currency, RecurrenceFrequency } from '../types';
import { getInitialFormData, validateExpenseData } from '../services/expenseService';
import { useExpenseStore } from '../stores/expenseStore';
import { getSupportedCurrencies, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../services/currencyService';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport', 
  'Shopping',
  'Bills',
  'Entertainment',
  'Other'
];

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>(getInitialFormData());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addExpense, error: storeError, clearError } = useExpenseStore();
  const supportedCurrencies = getSupportedCurrencies();

  const handleInputChange = (
    field: keyof ExpenseFormData,
    value: string | ExpenseCategory | Currency | RecurrenceFrequency | boolean | File | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    
    // Clear store error when user makes changes
    if (storeError) {
      clearError();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('receipt', file);
  };

  const clearReceipt = () => {
    handleInputChange('receipt', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const errors = validateExpenseData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      await addExpense(formData);
      
      // Reset form after successful submission
      setFormData(getInitialFormData());
      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the store
      console.error('Failed to add expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = validationErrors.length > 0 || !!storeError;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {CURRENCY_SYMBOLS[formData.currency]}
            </span>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="What was this expense for?"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </div>
        </div>

        {/* Currency Field */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            {supportedCurrencies.map(currency => (
              <option key={currency} value={currency}>
                {CURRENCY_SYMBOLS[currency]} - {CURRENCY_NAMES[currency]}
              </option>
            ))}
          </select>
        </div>

        {/* Receipt Upload Field */}
        <div>
          <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-1">
            Receipt (Optional)
          </label>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              id="receipt"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSubmitting}
            />
            {formData.receipt && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-700">{formData.receipt.name}</span>
                </div>
                <button
                  type="button"
                  onClick={clearReceipt}
                  className="text-red-600 hover:text-red-800 text-sm"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            )}
            <div className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, WebP (max 5MB)
            </div>
          </div>
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="business, travel, urgent (comma-separated)"
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </div>
        </div>

        {/* Recurring Expense Options */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700">
              This is a recurring expense
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                How often does this expense occur?
              </label>
              <select
                id="recurrenceFrequency"
                value={formData.recurrenceFrequency || ''}
                onChange={(e) => handleInputChange('recurrenceFrequency', e.target.value as RecurrenceFrequency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-600">
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
              {storeError && <div>{storeError}</div>}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
} 