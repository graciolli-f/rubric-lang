import React from 'react';
import type { Currency } from '../types/currency-types';
import { CURRENCIES } from '../types/currency-types';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  label?: string;
  error?: string;
}

export function CurrencySelector({ value, onChange, label, error }: CurrencySelectorProps): React.JSX.Element {
  const getCurrencySymbol = (currency: Currency): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300'
        }`}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {getCurrencySymbol(currency)} {currency}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 