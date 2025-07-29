import React, { useEffect } from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseTotal from '../components/ExpenseTotal';
import ExpenseFiltersComponent from '../components/ExpenseFilters';

export default function ExpenseTracker() {
  const { 
    loadExpenses, 
    getSortedExpenses,
    getFilteredExpenses,
    isLoading, 
    error,
    filters,
    setFilters,
    generatePendingRecurringExpenses,
    refreshExchangeRates
  } = useExpenseStore();

  // Load expenses and initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadExpenses();
        await refreshExchangeRates();
        await generatePendingRecurringExpenses();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initializeData();
  }, [loadExpenses, refreshExchangeRates, generatePendingRecurringExpenses]);

  const allExpenses = getSortedExpenses();
  const expenses = getFilteredExpenses();

  if (isLoading && allExpenses.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Calculate filtered total
  const filteredTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
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

      {/* Filters and Export */}
      <ExpenseFiltersComponent 
        currentFilters={filters}
        onFiltersChange={setFilters}
      />

      {/* Total Display */}
      <ExpenseTotal 
        total={filteredTotal} 
        expenseCount={expenses.length} 
      />

      {/* Expenses List */}
      <ExpenseList expenses={expenses} />
    </div>
  );
} 