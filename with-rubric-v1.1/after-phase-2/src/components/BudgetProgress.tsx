/**
 * Pure presentation component for displaying budget vs spending progress
 * Props-only, no stores or external state
 */

import React, { memo } from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../utils/currency';

interface BudgetProgressProps {
  budget: number;
  spent: number;
  remaining: number;
  className?: string;
  showDetails?: boolean;
}

const BudgetProgress = memo<BudgetProgressProps>(({ 
  budget, 
  spent, 
  remaining, 
  className,
  showDetails = true 
}) => {
  const progress = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isOverBudget = spent > budget;
  const isNearLimit = progress >= 80 && !isOverBudget;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (isNearLimit) {
      return <TrendingUp className="w-5 h-5 text-yellow-500" />;
    }
    return <DollarSign className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (isOverBudget) {
      return `Over budget by ${formatCurrency(spent - budget)}`;
    }
    if (isNearLimit) {
      return 'Approaching budget limit';
    }
    return 'Within budget';
  };

  return (
    <div className={clsx("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Monthly Budget</h3>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Spent: {formatCurrency(spent)}</span>
          <span>Budget: {formatCurrency(budget)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={clsx("h-3 rounded-full transition-all duration-300", getProgressColor())}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{progress.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-3">
          {/* Status */}
          <div className={clsx(
            "flex items-center gap-2 text-sm font-medium",
            isOverBudget ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-green-600"
          )}>
            {getStatusText()}
          </div>

          {/* Budget Details */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Remaining</p>
              <p className={clsx(
                "text-lg font-semibold",
                isOverBudget ? "text-red-600" : "text-gray-900"
              )}>
                {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining))}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {progress.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Average Daily Spending Hint */}
          {budget > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Daily budget target: {formatCurrency(budget / 30)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

BudgetProgress.displayName = 'BudgetProgress';

export default BudgetProgress;