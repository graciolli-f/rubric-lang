import type { Currency, ExchangeRates } from '../types/currency-types';

const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_KEY = 'expense-tracker-exchange-rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function fetchExchangeRates(baseCurrency: Currency): Promise<ExchangeRates> {
  try {
    const response = await fetch(`${BASE_URL}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const exchangeRates: ExchangeRates = {
      base: baseCurrency,
      rates: {
        USD: data.rates.USD || 1,
        EUR: data.rates.EUR || 1,
        GBP: data.rates.GBP || 1,
      },
      lastUpdated: new Date().toISOString(),
    };
    
    setCachedRates(exchangeRates);
    return exchangeRates;
  } catch (error) {
    // If network fails, try to return cached rates
    const cached = getCachedRates();
    if (cached && !isRatesStale(cached)) {
      return cached;
    }
    
    // If no cached rates or they're stale, return default rates
    const defaultRates: ExchangeRates = {
      base: baseCurrency,
      rates: { USD: 1, EUR: 0.85, GBP: 0.73 },
      lastUpdated: new Date().toISOString(),
    };
    
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch exchange rates');
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to base currency first, then to target currency
  const baseAmount = fromCurrency === rates.base 
    ? amount 
    : amount / rates.rates[fromCurrency];
    
  const convertedAmount = toCurrency === rates.base 
    ? baseAmount 
    : baseAmount * rates.rates[toCurrency];
    
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

export function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    return JSON.parse(cached) as ExchangeRates;
  } catch {
    return null;
  }
}

export function setCachedRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // Ignore localStorage errors
  }
}

export function isRatesStale(rates: ExchangeRates): boolean {
  const lastUpdated = new Date(rates.lastUpdated);
  const now = new Date();
  return now.getTime() - lastUpdated.getTime() > CACHE_DURATION;
} 