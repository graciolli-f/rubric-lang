import type { Currency, ExchangeRates, CurrencyConversionResult, UserPreferences } from '../types';

export class CurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CurrencyError';
  }
}

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest';
const STORAGE_KEY = 'expense-tracker-exchange-rates';
const PREFERENCES_KEY = 'expense-tracker-user-preferences';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedRates {
  rates: ExchangeRates;
  baseCurrency: Currency;
  timestamp: number;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound'
};

// User preferences
export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        preferredCurrency: parsed.preferredCurrency || 'USD',
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('Failed to load user preferences:', error);
  }
  
  return {
    preferredCurrency: 'USD',
    lastUpdated: new Date().toISOString()
  };
}

export function setUserPreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save user preferences:', error);
  }
}

// Exchange rate caching
function getCachedRates(): CachedRates | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const cached: CachedRates = JSON.parse(stored);
      const now = Date.now();
      
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached exchange rates:', error);
  }
  
  return null;
}

function setCachedRates(rates: ExchangeRates, baseCurrency: Currency): void {
  try {
    const cached: CachedRates = {
      rates,
      baseCurrency,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache exchange rates:', error);
  }
}

// Fetch exchange rates from API
export async function fetchExchangeRates(baseCurrency: Currency = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates();
  if (cached && cached.baseCurrency === baseCurrency) {
    return cached.rates;
  }
  
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_URL}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new CurrencyError(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.rates) {
      throw new CurrencyError('Invalid exchange rate data received');
    }
    
    // Cache the rates
    setCachedRates(data.rates, baseCurrency);
    
    return data.rates;
  } catch (error) {
    if (error instanceof CurrencyError) {
      throw error;
    }
    
    // Return cached rates if available, even if expired
    const fallbackCached = getCachedRates();
    if (fallbackCached) {
      console.warn('Using cached exchange rates due to fetch error:', error);
      return fallbackCached.rates;
    }
    
    throw new CurrencyError('Failed to fetch exchange rates and no cached data available');
  }
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): CurrencyConversionResult {
  if (amount < 0) {
    throw new CurrencyError('Amount must be positive');
  }
  
  if (fromCurrency === toCurrency) {
    return {
      amount,
      fromCurrency,
      toCurrency,
      rate: 1,
      convertedAmount: amount
    };
  }
  
  // Rates are typically based on USD, so we need to handle conversion properly
  let rate: number;
  let convertedAmount: number;
  
  if (fromCurrency === 'USD') {
    rate = exchangeRates[toCurrency];
    if (!rate) {
      throw new CurrencyError(`Exchange rate not available for ${toCurrency}`);
    }
    convertedAmount = amount * rate;
  } else if (toCurrency === 'USD') {
    rate = 1 / exchangeRates[fromCurrency];
    if (!exchangeRates[fromCurrency]) {
      throw new CurrencyError(`Exchange rate not available for ${fromCurrency}`);
    }
    convertedAmount = amount * rate;
  } else {
    // Convert from -> USD -> to
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) {
      throw new CurrencyError(`Exchange rates not available for ${fromCurrency} or ${toCurrency}`);
    }
    
    rate = toRate / fromRate;
    convertedAmount = amount * rate;
  }
  
  return {
    amount,
    fromCurrency,
    toCurrency,
    rate,
    convertedAmount: Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
  };
}

// Format currency amount with symbol
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toFixed(2)}`;
}

// Get all supported currencies
export function getSupportedCurrencies(): Currency[] {
  return ['USD', 'EUR', 'GBP'];
} 