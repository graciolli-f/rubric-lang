import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

interface BudgetProgressProps {
  budget: number;
  spent: number;
  onBudgetUpdate: (newBudget: number) => void;
}

export function BudgetProgress({ budget, spent, onBudgetUpdate }: BudgetProgressProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState(budget.toString());

  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = Math.max(budget - spent, 0);
  const isOverBudget = spent > budget;

  const handleBudgetUpdate = () => {
    const parsedBudget = parseFloat(newBudgetValue);
    if (!isNaN(parsedBudget) && parsedBudget > 0) {
      onBudgetUpdate(parsedBudget);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBudgetUpdate();
    } else if (e.key === 'Escape') {
      setNewBudgetValue(budget.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Monthly Budget</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit Budget
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleBudgetUpdate}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewBudgetValue(budget.toString());
                setIsEditing(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Budget:</span>
          {!isEditing ? (
            <span className="font-medium">{formatCurrency(budget)}</span>
          ) : (
            <input
              type="number"
              value={newBudgetValue}
              onChange={(e) => setNewBudgetValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Spent:</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(spent)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining:</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            {isOverBudget ? `-${formatCurrency(spent - budget)}` : formatCurrency(remaining)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          {isOverBudget && (
            <p className="text-sm text-red-600 mt-2">
              You have exceeded your budget by {formatCurrency(spent - budget)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 