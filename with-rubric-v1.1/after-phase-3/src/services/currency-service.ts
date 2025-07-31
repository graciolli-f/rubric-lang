/**
 * Business logic for currency conversion and exchange rates
 * Fetches exchange rates and handles currency conversions
 */

import type { Currency, ExchangeRate } from '../types/expense.types';
import { validateCurrency } from '../utils/validation';
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../types/expense.types';

// Service configuration
const CONFIG = {
  apiUrl: 'https://api.exchangerate-api.com/v4/latest',
  cacheTimeout: 3600000, // 1 hour
  retryAttempts: 3,
  storageKeys: {
    rates: 'currency_rates',
    timestamp: 'currency_rates_timestamp',
    preferred: 'preferred_currency'
  }
} as const;

// In-memory cache
let rateCache = new Map<string, ExchangeRate>();
let cacheTimestamp = 0;

/**
 * Fetch exchange rates from API for a base currency
 */
export async function fetchExchangeRates(baseCurrency: Currency): Promise<Record<Currency, number>> {
  try {
    // Validate input
    const validation = validateCurrency(baseCurrency);
    if (!validation.isValid) {
      throw new Error(`Invalid base currency: ${validation.errors.join(', ')}`);
    }

    const response = await fetch(`${CONFIG.apiUrl}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.rates) {
      throw new Error('Invalid response format from exchange rate API');
    }
    
    // Extract only the currencies we support
    const supportedRates: Record<Currency, number> = {
      USD: data.rates.USD || 1,
      EUR: data.rates.EUR || 1,
      GBP: data.rates.GBP || 1
    };
    
    // Cache the rates
    const timestamp = new Date().toISOString();
    Object.entries(supportedRates).forEach(([toCurrency, rate]) => {
      const key = `${baseCurrency}-${toCurrency}`;
      rateCache.set(key, {
        fromCurrency: baseCurrency,
        toCurrency: toCurrency as Currency,
        rate,
        timestamp
      });
    });
    
    // Store in localStorage
    localStorage.setItem(CONFIG.storageKeys.rates, JSON.stringify(Array.from(rateCache.entries())));
    localStorage.setItem(CONFIG.storageKeys.timestamp, timestamp);
    cacheTimestamp = Date.now();
    
    return supportedRates;
  } catch (error) {
    throw new Error(`Failed to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): Promise<number> {
  try {
    // Validate inputs
    const fromValidation = validateCurrency(fromCurrency);
    const toValidation = validateCurrency(toCurrency);
    
    if (!fromValidation.isValid || !toValidation.isValid) {
      throw new Error('Invalid currency codes');
    }
    
    // Same currency = 1:1 rate
    if (fromCurrency === toCurrency) {
      return 1;
    }
    
    const key = `${fromCurrency}-${toCurrency}`;
    
    // Check cache first
    if (rateCache.has(key) && !isCacheExpired()) {
      const cachedRate = rateCache.get(key);
      return cachedRate?.rate || 1;
    }
    
    // Load from localStorage if cache is empty
    if (rateCache.size === 0) {
      loadCacheFromStorage();
    }
    
    // Check cache again after loading
    if (rateCache.has(key) && !isCacheExpired()) {
      const cachedRate = rateCache.get(key);
      return cachedRate?.rate || 1;
    }
    
    // Fetch fresh rates
    await fetchExchangeRates(fromCurrency);
    
    const rate = rateCache.get(key);
    return rate?.rate || 1;
  } catch (error) {
    console.error('Failed to get exchange rate:', error);
    return 1; // Fallback to 1:1 rate
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): Promise<number> {
  try {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      throw new Error('Invalid amount for conversion');
    }
    
    const rate = await getExchangeRate(fromCurrency, toCurrency);
    return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    throw new Error(`Failed to convert amount: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format currency amount with appropriate symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  try {
    const validation = validateCurrency(currency);
    if (!validation.isValid) {
      throw new Error(`Invalid currency: ${currency}`);
    }
    
    const symbol = CURRENCY_SYMBOLS[currency];
    const formattedAmount = Math.abs(amount).toFixed(2);
    
    // Different formatting for different currencies
    switch (currency) {
      case 'EUR':
        return `${formattedAmount}${symbol}`;
      case 'USD':
      case 'GBP':
      default:
        return `${symbol}${formattedAmount}`;
    }
  } catch (error) {
    console.error('Failed to format currency:', error);
    return `${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Parse formatted currency string to number
 */
export function parseCurrencyAmount(formattedAmount: string, currency: Currency): number {
  try {
    const symbol = CURRENCY_SYMBOLS[currency];
    let cleaned = formattedAmount.replace(symbol, '').trim();
    cleaned = cleaned.replace(/,/g, ''); // Remove thousands separators
    
    const amount = parseFloat(cleaned);
    if (isNaN(amount)) {
      throw new Error('Invalid currency format');
    }
    
    return amount;
  } catch (error) {
    throw new Error(`Failed to parse currency amount: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Refresh exchange rates cache
 */
export async function refreshExchangeRates(): Promise<void> {
  try {
    // Clear cache
    rateCache.clear();
    localStorage.removeItem(CONFIG.storageKeys.rates);
    localStorage.removeItem(CONFIG.storageKeys.timestamp);
    
    // Fetch fresh rates for all supported currencies
    const currencies: Currency[] = ['USD', 'EUR', 'GBP'];
    await Promise.all(currencies.map(currency => fetchExchangeRates(currency)));
  } catch (error) {
    throw new Error(`Failed to refresh exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clear exchange rates cache
 */
export async function clearCache(): Promise<void> {
  try {
    rateCache.clear();
    localStorage.removeItem(CONFIG.storageKeys.rates);
    localStorage.removeItem(CONFIG.storageKeys.timestamp);
    cacheTimestamp = 0;
  } catch (error) {
    throw new Error(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get cache age in milliseconds
 */
export async function getCacheAge(): Promise<number> {
  try {
    if (cacheTimestamp === 0) {
      return Infinity;
    }
    return Date.now() - cacheTimestamp;
  } catch (error) {
    console.error('Failed to get cache age:', error);
    return Infinity;
  }
}

/**
 * Set user's preferred currency
 */
export async function setPreferredCurrency(currency: Currency): Promise<void> {
  try {
    const validation = validateCurrency(currency);
    if (!validation.isValid) {
      throw new Error(`Invalid currency: ${currency}`);
    }
    
    localStorage.setItem(CONFIG.storageKeys.preferred, currency);
  } catch (error) {
    throw new Error(`Failed to set preferred currency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's preferred currency
 */
export async function getPreferredCurrency(): Promise<Currency> {
  try {
    const stored = localStorage.getItem(CONFIG.storageKeys.preferred);
    if (stored && ['USD', 'EUR', 'GBP'].includes(stored)) {
      return stored as Currency;
    }
    return DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Failed to get preferred currency:', error);
    return DEFAULT_CURRENCY;
  }
}

// Helper functions
function isCacheExpired(): boolean {
  return cacheTimestamp === 0 || (Date.now() - cacheTimestamp) > CONFIG.cacheTimeout;
}

function loadCacheFromStorage(): void {
  try {
    const storedRates = localStorage.getItem(CONFIG.storageKeys.rates);
    const storedTimestamp = localStorage.getItem(CONFIG.storageKeys.timestamp);
    
    if (storedRates && storedTimestamp) {
      const entries = JSON.parse(storedRates);
      rateCache = new Map(entries);
      cacheTimestamp = new Date(storedTimestamp).getTime();
    }
  } catch (error) {
    console.error('Failed to load cache from storage:', error);
    rateCache.clear();
    cacheTimestamp = 0;
  }
}