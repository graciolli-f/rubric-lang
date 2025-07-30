import React from 'react';
import type { Expense } from '../types/expense-types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ReceiptViewer } from './ReceiptViewer';
import { useCurrencyStore } from '../stores/currency-store';
import { useCurrencyDisplay } from '../hooks/useCurrencyDisplay';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps): React.JSX.Element {
  const { preferredCurrency } = useCurrencyStore();
  const { getDisplayAmount } = useCurrencyDisplay();
  
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Food': 'bg-green-100 text-green-800',
      'Transport': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Bills': 'bg-red-100 text-red-800',
      'Entertainment': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const getCategoryIcon = (category: string): React.JSX.Element => {
    const iconClass = "w-4 h-4";
    
    switch (category) {
      case 'Food':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'Transport':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'Shopping':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'Bills':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'Entertainment':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 002.5-2.5V6a2.5 2.5 0 00-2.5-2.5H9m12 0H9" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  // Use the currency display hook instead of inline business logic
  const displayAmount = getDisplayAmount(expense.amount, expense.currency);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {getCategoryIcon(expense.category)}
              <span className="ml-1">{expense.category}</span>
            </div>
            {expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {expense.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {expense.description}
          </h3>
          
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(expense.date)}
          </p>
          
          {expense.receipt && (
            <div className="mt-2">
              <ReceiptViewer receipt={expense.receipt} />
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 text-right">
          <div className="text-lg font-semibold text-gray-900">
            {displayAmount.symbol}{displayAmount.amount.toFixed(2)}
          </div>
          {displayAmount.isConverted && (
            <div className="text-xs text-gray-500">
              ({expense.currency} {expense.amount.toFixed(2)})
            </div>
          )}
          <div className="mt-2 space-x-2">
            <button
              onClick={onEdit}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 