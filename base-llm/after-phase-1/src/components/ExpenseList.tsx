import React from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { ExpenseItem } from './ExpenseItem';

export const ExpenseList: React.FC = () => {
  const { expenses, getTotal } = useExpenseStore();
  
  // Sort expenses by date (newest first), then by creation time
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return dateCompare;
  });

  const total = getTotal();
  const isOverBudget = total > 1000;

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense using the form above</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Expenses ({expenses.length})
        </h2>
        
        <div className="space-y-3">
          {sortedExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total:</span>
            <span 
              className={`text-2xl font-bold ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              ${total.toFixed(2)}
            </span>
          </div>
          {isOverBudget && (
            <p className="text-sm text-red-600 mt-2 text-right">
              Warning: You've exceeded $1,000 in expenses
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 