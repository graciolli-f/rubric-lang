import React, { useState } from 'react';
import type { BudgetState } from '../types';

interface BudgetOverviewProps {
  budgetState: BudgetState;
  averageDailySpending: number;
  onBudgetUpdate: (newBudget: number) => Promise<void>;
}

export default function BudgetOverview({ 
  budgetState, 
  averageDailySpending, 
  onBudgetUpdate 
}: BudgetOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budgetState.monthlyBudget.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveBudget = async () => {
    const budgetValue = parseFloat(newBudget);
    
    if (isNaN(budgetValue) || budgetValue <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    setIsUpdating(true);
    try {
      await onBudgetUpdate(budgetValue);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update budget. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setNewBudget(budgetState.monthlyBudget.toString());
    setIsEditing(false);
  };

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (budgetState.percentageUsed <= 70) return 'bg-green-500';
    if (budgetState.percentageUsed <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate projected month-end spending
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const projectedMonthlySpending = averageDailySpending * daysInMonth;
  const projectedOverage = Math.max(0, projectedMonthlySpending - budgetState.monthlyBudget);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Budget
          </button>
        )}
      </div>

      {/* Budget Amount */}
      <div className="mb-6">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget
              </label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex space-x-2 pt-6">
              <button
                onClick={handleSaveBudget}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Monthly Budget</p>
            <p className="text-2xl font-bold text-gray-900">${budgetState.monthlyBudget.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <span className="text-sm text-gray-600">{budgetState.percentageUsed}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(budgetState.percentageUsed, 100)}%` }}
          />
        </div>
        {budgetState.percentageUsed > 100 && (
          <p className="text-sm text-red-600 mt-1">
            Budget exceeded by ${(budgetState.currentMonthSpending - budgetState.monthlyBudget).toFixed(2)}
          </p>
        )}
      </div>

      {/* Budget Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            ${budgetState.currentMonthSpending.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Spent This Month</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            ${budgetState.remainingBudget.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Remaining</p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Average daily spending:</span>
          <span className="text-sm font-medium text-gray-900">${averageDailySpending.toFixed(2)}</span>
        </div>
        
        {projectedOverage > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Warning:</span> At current spending rate, you may exceed 
              your budget by ${projectedOverage.toFixed(2)} this month.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Good news:</span> You're on track to stay within your budget.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 