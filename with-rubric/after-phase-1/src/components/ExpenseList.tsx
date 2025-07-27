import React from 'react';
import { useExpenseStore } from '../stores/expense-store';
import { ExpenseItem } from './ExpenseItem';
import type { Expense } from '../types';

export function ExpenseList() {
  const { expenses, updateExpense, deleteExpense, getTotal, isOverBudget } = useExpenseStore();

  // Sort expenses by date (newest first)
  const sortedExpenses = React.useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const total = getTotal();
  const overBudget = isOverBudget();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500 text-lg">No expenses yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Expenses</h2>
        
        <div className="space-y-3">
          {sortedExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
            />
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow-md ${overBudget ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-700">
            Total Expenses:
          </span>
          <span className={`text-2xl font-bold ${overBudget ? 'text-red-600' : 'text-gray-800'}`}>
            {formatCurrency(total)}
          </span>
        </div>
        
        {overBudget && (
          <div className="mt-3 text-red-600 font-medium">
            Warning: You have exceeded $1,000 in expenses!
          </div>
        )}
      </div>
    </div>
  );
} 