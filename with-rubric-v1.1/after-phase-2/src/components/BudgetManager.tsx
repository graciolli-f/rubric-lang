/**
 * Presentation component for managing monthly budget
 * Has local form state but delegates budget changes to parent
 */

import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface BudgetManagerProps {
  currentBudget: number;
  onBudgetChange: (amount: number) => void;
  className?: string;
}

export function BudgetManager({ currentBudget, onBudgetChange, className }: BudgetManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudgetValue, setTempBudgetValue] = useState(currentBudget.toString());

  const handleEditStart = () => {
    setTempBudgetValue(currentBudget.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const newBudget = parseFloat(tempBudgetValue);
    
    if (isNaN(newBudget) || newBudget <= 0) {
      // Reset to current value if invalid
      setTempBudgetValue(currentBudget.toString());
      return;
    }
    
    onBudgetChange(newBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempBudgetValue(currentBudget.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={clsx("bg-white p-4 rounded-lg border", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Budget</h3>
        
        {!isEditing ? (
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-green-600">
              ${currentBudget.toFixed(2)}
            </span>
            <button
              onClick={handleEditStart}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit budget"
            >
              <Edit3 size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={tempBudgetValue}
                onChange={(e) => setTempBudgetValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-8 pr-3 py-1 border rounded-md w-32 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 transition-colors"
              title="Save budget"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:text-red-700 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <p className="text-sm text-gray-500 mt-2">
          Click the edit icon to update your monthly spending limit
        </p>
      )}
      
      {isEditing && (
        <p className="text-sm text-gray-500 mt-2">
          Press Enter to save or Escape to cancel
        </p>
      )}
    </div>
  );
}