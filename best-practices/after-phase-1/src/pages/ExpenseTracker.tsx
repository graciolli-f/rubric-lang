import React, { useEffect } from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseTotal from '../components/ExpenseTotal';

export default function ExpenseTracker() {
  const { 
    loadExpenses, 
    getSortedExpenses, 
    getTotal, 
    isLoading, 
    error 
  } = useExpenseStore();

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses().catch(error => {
      console.error('Failed to load expenses:', error);
    });
  }, [loadExpenses]);

  const expenses = getSortedExpenses();
  const total = getTotal();

  if (isLoading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Keep track of your daily expenses and stay within your budget
          </p>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        <ExpenseForm />

        {/* Total Display */}
        <ExpenseTotal 
          total={total} 
          expenseCount={expenses.length} 
        />

        {/* Expenses List */}
        <ExpenseList expenses={expenses} />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pt-8">
          <p>Data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
} 