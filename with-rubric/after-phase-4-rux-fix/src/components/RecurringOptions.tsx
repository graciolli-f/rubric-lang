import React from 'react';
import type { RecurringFrequency } from '../types/expense-types';
import { RECURRING_FREQUENCIES } from '../types/expense-types';

interface RecurringOptionsProps {
  isRecurring: boolean;
  frequency?: RecurringFrequency;
  onRecurringChange: (isRecurring: boolean) => void;
  onFrequencyChange: (frequency?: RecurringFrequency) => void;
}

export function RecurringOptions({ 
  isRecurring, 
  frequency, 
  onRecurringChange, 
  onFrequencyChange 
}: RecurringOptionsProps): React.JSX.Element {
  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onRecurringChange(checked);
    
    if (!checked) {
      onFrequencyChange(undefined);
    } else if (!frequency) {
      onFrequencyChange('monthly'); // Default to monthly
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFrequencyChange(e.target.value as RecurringFrequency);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <input
          id="recurring-checkbox"
          type="checkbox"
          checked={isRecurring}
          onChange={handleRecurringChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="recurring-checkbox" className="ml-2 text-sm font-medium text-gray-700">
          Make this a recurring expense
        </label>
      </div>

      {isRecurring && (
        <div className="ml-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <select
            value={frequency || 'monthly'}
            onChange={handleFrequencyChange}
            className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {RECURRING_FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Future expenses will be automatically generated
          </p>
        </div>
      )}
    </div>
  );
} 