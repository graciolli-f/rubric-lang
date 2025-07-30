import { useCurrencyStore } from '../stores/currency-store';
import { convertAmount } from '../services/currency-service';
import type { Currency } from '../types/currency-types';

export interface CurrencyDisplayResult {
  amount: number;
  currency: string;
  isConverted: boolean;
  symbol: string;
}

export function useCurrencyDisplay() {
  const { preferredCurrency, exchangeRates } = useCurrencyStore();

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const getDisplayAmount = (
    originalAmount: number,
    originalCurrency: string
  ): CurrencyDisplayResult => {
    if (!exchangeRates || originalCurrency === preferredCurrency) {
      return {
        amount: originalAmount,
        currency: originalCurrency,
        isConverted: false,
        symbol: getCurrencySymbol(originalCurrency)
      };
    }
    
    try {
      const convertedAmount = convertAmount(
        originalAmount,
        originalCurrency as Currency,
        preferredCurrency,
        exchangeRates
      );
      return {
        amount: convertedAmount,
        currency: preferredCurrency,
        isConverted: true,
        symbol: getCurrencySymbol(preferredCurrency)
      };
    } catch {
      return {
        amount: originalAmount,
        currency: originalCurrency,
        isConverted: false,
        symbol: getCurrencySymbol(originalCurrency)
      };
    }
  };

  return {
    getDisplayAmount,
    getCurrencySymbol
  };
} 