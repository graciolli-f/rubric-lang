import React from 'react';
import type { Expense } from '../types/expense-types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps): React.JSX.Element {
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
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L9 15l6-6" />
          </svg>
        );
      case 'Transport':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m5.25 4.5V16.5a1.5 1.5 0 011.5-1.5h3V14.25m0 6.75h.008v.008H15v-.008z" />
          </svg>
        );
      case 'Shopping':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'Bills':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'Entertainment':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
      aria-label={`Edit expense: ${expense.description}`}
    >
      <div className="flex items-center justify-between">
        {/* Expense details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {getCategoryIcon(expense.category)}
              {expense.category}
            </span>
            
            {/* Date */}
            <span className="text-sm text-gray-500">
              {formatDate(expense.date)}
            </span>
          </div>
          
          {/* Description */}
          <p className="text-gray-900 font-medium truncate mb-1">
            {expense.description}
          </p>
          
          {/* Timestamps */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Created {formatDate(expense.createdAt)}</span>
            {expense.updatedAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(expense.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Amount and actions */}
        <div className="flex items-center gap-3 ml-4">
          {/* Amount */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(expense.amount)}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              aria-label="Edit expense"
              title="Edit expense"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete expense"
              title="Delete expense"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 