/**
 * Container component that orchestrates expense tracking interface
 * Manages UI state and coordinates child components
 */

import React, { useState } from 'react';
import type { Expense, ExpenseFormData, ViewMode } from '../types/expense.types';
import { useExpenseStore } from '../stores/expense-store';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import NavigationTabs from './NavigationTabs';
import AnalyticsPage from './AnalyticsPage';

export default function ExpenseTrackerContainer() {
  const {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    clearError,
    getExpensesSortedByDate,
  } = useExpenseStore();

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('expenses');

  const sortedExpenses = getExpensesSortedByDate();

  const handleAddExpense = (data: ExpenseFormData) => {
    try {
      addExpense(data);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to add expense:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
  };

  const handleSaveExpense = (id: string, data: ExpenseFormData) => {
    try {
      updateExpense(id, data);
      setEditingExpenseId(null);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to update expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  const handleDeleteExpense = (id: string) => {
    try {
      deleteExpense(id);
      setEditingExpenseId(null);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to delete expense:', error);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
    // Clear any editing state when switching views
    setEditingExpenseId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Tracker
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage your daily expenses with powerful analytics
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <NavigationTabs
          activeTab={activeView}
          onTabChange={handleViewChange}
        />
      </div>

      <div className="py-8">{/* Removed extra div wrapper since AnalyticsPage has its own container */}

        {/* Render Analytics or Expenses View */}
        {activeView === 'analytics' ? (
          <AnalyticsPage />
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Error Display */}
            {error && (
              <div 
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-center justify-between">
                  <div className="text-red-700">
                    <strong>Error:</strong> {error}
                  </div>
                  <button
                    onClick={handleClearError}
                    className="text-red-600 hover:text-red-800 font-medium"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div 
                className="text-center py-4"
                aria-live="polite"
                aria-label="Loading"
              >
                <div className="text-gray-600">Loading...</div>
              </div>
            )}

            <div className="space-y-8">
              {/* Add Expense Form */}
              <ExpenseForm
                onSubmit={handleAddExpense}
                disabled={isLoading}
              />

              {/* Edit Expense Form - Only show when editing */}
              {editingExpenseId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <ExpenseForm
                    initialData={(() => {
                      const expense = expenses.find(e => e.id === editingExpenseId);
                      if (!expense) return undefined;
                      return {
                        amount: expense.amount,
                        category: expense.category,
                        date: expense.date,
                        description: expense.description,
                      };
                    })()}
                    onSubmit={(data) => handleSaveExpense(editingExpenseId, data)}
                    onCancel={handleCancelEdit}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Expense List */}
              <ExpenseList
                expenses={sortedExpenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                editingId={editingExpenseId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}