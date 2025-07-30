/**
 * Pure presentation component for displaying budget progress bar
 * Props-only, no stores or external state
 */

import React from 'react';
import clsx from 'clsx';
import type { BudgetState } from '../types/expense.types';

interface BudgetProgressProps {
  budgetData: BudgetState;
  className?: string;
  showDetails?: boolean;
}

export function BudgetProgress({ budgetData, className, showDetails = true }: BudgetProgressProps) {
  const { monthlyBudget, currentMonthSpent, remainingBudget, isOverBudget } = budgetData;
  
  // Calculate percentage spent
  const percentageSpent = Math.min((currentMonthSpent / monthlyBudget) * 100, 100);
  
  // Progress bar color based on usage
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentageSpent > 80) return 'bg-yellow-500';
    if (percentageSpent > 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getBackgroundColor = () => {
    if (isOverBudget) return 'bg-red-100';
    return 'bg-gray-200';
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Budget Overview */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Monthly Budget</div>
            <div className="text-lg font-semibold text-gray-800">
              ${monthlyBudget.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Spent This Month</div>
            <div className={clsx(
              "text-lg font-semibold",
              isOverBudget ? "text-red-600" : "text-gray-800"
            )}>
              ${currentMonthSpent.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">
              {isOverBudget ? "Over Budget" : "Remaining"}
            </div>
            <div className={clsx(
              "text-lg font-semibold",
              isOverBudget ? "text-red-600" : "text-green-600"
            )}>
              {isOverBudget ? "-" : ""}${Math.abs(remainingBudget).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Budget Progress</span>
          <span className={clsx(
            "font-medium",
            isOverBudget ? "text-red-600" : "text-gray-700"
          )}>
            {percentageSpent.toFixed(1)}%
          </span>
        </div>
        
        <div className={clsx(
          "w-full rounded-full h-4",
          getBackgroundColor()
        )}>
          <div
            className={clsx(
              "h-4 rounded-full transition-all duration-300 ease-in-out",
              getProgressColor()
            )}
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
        
        {/* Over-budget indicator */}
        {isOverBudget && (
          <div className="text-sm text-red-600 font-medium text-center">
            ⚠️ You've exceeded your monthly budget by ${(currentMonthSpent - monthlyBudget).toFixed(2)}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>$0</span>
        <span>${monthlyBudget.toFixed(0)}</span>
      </div>
    </div>
  );
}