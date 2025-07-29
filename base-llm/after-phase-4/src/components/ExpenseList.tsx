import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { ExpenseItem } from './ExpenseItem';
import { TagFilter } from './TagFilter';
import { ExportDialog } from './ExportDialog';
import { CurrencySettings } from './CurrencySettings';

export const ExpenseList: React.FC = () => {
  const { 
    getFilteredExpenses, 
    generateOverdueRecurringExpenses,
    tagFilter 
  } = useExpenseStore();
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCurrencySettings, setShowCurrencySettings] = useState(false);
  
  const expenses = getFilteredExpenses();

  // Auto-generate overdue recurring expenses on component mount
  useEffect(() => {
    generateOverdueRecurringExpenses();
  }, [generateOverdueRecurringExpenses]);

  // Sort expenses by date (newest first) and then by creation time
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getFilterSummary = () => {
    if (tagFilter.length === 0) {
      return `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`;
    }
    
    return `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} with ${tagFilter.length} tag${tagFilter.length !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Expenses</h2>
            <p className="text-sm text-gray-600">{getFilterSummary()}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <TagFilter />
            
            <button
              onClick={() => setShowExportDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            
            <button
              onClick={() => setShowCurrencySettings(!showCurrencySettings)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Currency
            </button>
          </div>
        </div>

        {/* Active filter indicators */}
        {tagFilter.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtering by:</span>
              {tagFilter.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Currency settings panel */}
      {showCurrencySettings && (
        <CurrencySettings />
      )}

      {/* Expenses list */}
      {sortedExpenses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tagFilter.length > 0 ? 'No expenses match your filters' : 'No expenses yet'}
          </h3>
          <p className="text-gray-600">
            {tagFilter.length > 0 
              ? 'Try adjusting your tag filters or add some expenses to get started.'
              : 'Start by adding your first expense using the form above.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
      )}

      {/* Export dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
}; 