import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { Currency } from '../types';

export const CurrencySettings: React.FC = () => {
  const { 
    userPreferences, 
    setPreferredCurrency, 
    updateExchangeRates,
    formatAmount 
  } = useExpenseStore();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(userPreferences.lastRateUpdate);

  const handleCurrencyChange = async (currency: Currency) => {
    setIsUpdating(true);
    try {
      setPreferredCurrency(currency);
      await updateExchangeRates();
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRates = async () => {
    setIsUpdating(true);
    try {
      await updateExchangeRates();
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      alert('Failed to update exchange rates. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatLastUpdate = () => {
    const date = new Date(lastUpdate);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just updated';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </label>
          <div className="flex gap-2">
            {Object.values(Currency).map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencyChange(currency)}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium rounded-md transition duration-200 ${
                  userPreferences.preferredCurrency === currency
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Exchange Rates
            </label>
            <button
              onClick={handleUpdateRates}
              disabled={isUpdating}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Rates'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            {Object.entries(userPreferences.exchangeRates).map(([currency, rate]) => (
              <div
                key={currency}
                className={`p-2 rounded-md border ${
                  currency === userPreferences.preferredCurrency
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{currency}</div>
                <div className="text-gray-600">
                  {currency === 'USD' ? '1.00' : rate.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {formatLastUpdate()}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Conversions</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>$100 USD = {formatAmount(100 * userPreferences.exchangeRates[userPreferences.preferredCurrency])}</div>
            <div>€50 EUR = {formatAmount(50 * (userPreferences.exchangeRates.EUR || 1) * userPreferences.exchangeRates[userPreferences.preferredCurrency])}</div>
            <div>£25 GBP = {formatAmount(25 * (userPreferences.exchangeRates.GBP || 1) * userPreferences.exchangeRates[userPreferences.preferredCurrency])}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 