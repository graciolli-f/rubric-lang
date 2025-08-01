import React from 'react';
import { formatCurrency, shouldHighlightTotal } from '../services/expenseService';

interface ExpenseTotalProps {
  total: number;
  expenseCount: number;
}

export default function ExpenseTotal({ total, expenseCount }: ExpenseTotalProps) {
  const isHighlighted = shouldHighlightTotal(total);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
          <p className="text-sm text-gray-600">
            {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
        
        <div className="text-right">
          <div 
            className={`text-3xl font-bold transition-colors ${
              isHighlighted 
                ? 'text-red-600' 
                : 'text-gray-900'
            }`}
          >
            {formatCurrency(total)}
          </div>
          
          {isHighlighted && (
            <p className="text-sm text-red-600 mt-1 flex items-center justify-end">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Over $1,000
            </p>
          )}
        </div>
      </div>
      
      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Average per expense: {formatCurrency(total / expenseCount)}
          </div>
        </div>
      )}
    </div>
  );
} 