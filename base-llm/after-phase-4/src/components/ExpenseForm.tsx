import React, { useState, useRef } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { Category, Currency } from '../types';
import type { ExpenseFormData } from '../types';
import { ReceiptUtils } from '../utils/receiptUtils';
import { RecurringUtils } from '../utils/recurringUtils';

export const ExpenseForm: React.FC = () => {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const userPreferences = useExpenseStore((state) => state.userPreferences);
  const formatAmount = useExpenseStore((state) => state.formatAmount);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: Category.OTHER,
    date: new Date().toISOString().split('T')[0],
    description: '',
    currency: userPreferences.preferredCurrency,
    receipt: undefined,
    tags: '',
    isRecurring: false,
    recurringFrequency: 'monthly'
  });

  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const parsedTags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const expenseData = {
        originalAmount: amount,
        originalCurrency: formData.currency,
        amount: amount, // Will be converted in store
        category: formData.category,
        date: formData.date,
        description: formData.description.trim(),
        receipt: formData.receipt,
        tags: parsedTags,
        recurring: formData.isRecurring ? {
          frequency: formData.recurringFrequency,
          nextDate: RecurringUtils.calculateNextDate(formData.date, formData.recurringFrequency),
          isActive: true
        } : undefined
      };

      addExpense(expenseData);

      // Reset form
      setFormData({
        amount: '',
        category: Category.OTHER,
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency: userPreferences.preferredCurrency,
        receipt: undefined,
        tags: '',
        isRecurring: false,
        recurringFrequency: 'monthly'
      });
      setReceiptPreview('');
      setUploadError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const { original, thumbnail } = await ReceiptUtils.processReceiptImage(file);
      setFormData(prev => ({ ...prev, receipt: original }));
      setReceiptPreview(thumbnail);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receipt: undefined }));
    setReceiptPreview('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {Object.values(Currency).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {Object.values(Category).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter description..."
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="work, travel, lunch..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt
          </label>
          
          {!receiptPreview ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-sm text-blue-600 mt-1">Processing image...</p>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 mt-1">{uploadError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
              <div className="flex-1">
                <p className="text-sm text-green-600">Receipt uploaded successfully</p>
                <button
                  type="button"
                  onClick={removeReceipt}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Recurring expense</span>
            </label>
            
            {formData.isRecurring && (
              <select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
          
          {formData.isRecurring && (
            <p className="text-xs text-gray-500 mt-1">
              {RecurringUtils.formatRecurringDescription(formData.recurringFrequency)} 
              - Next occurrence: {RecurringUtils.calculateNextDate(formData.date, formData.recurringFrequency)}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
      >
        {isUploading ? 'Processing...' : 'Add Expense'}
      </button>
    </form>
  );
}; 