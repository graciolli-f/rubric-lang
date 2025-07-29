import type { Currency, ExchangeRates } from '../types';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export class ExchangeService {
  private static instance: ExchangeService;
  private cache: Map<string, { rates: ExchangeRates; timestamp: number }> = new Map();

  static getInstance(): ExchangeService {
    if (!this.instance) {
      this.instance = new ExchangeService();
    }
    return this.instance;
  }

  async getExchangeRates(baseCurrency: Currency = 'USD'): Promise<ExchangeRates> {
    const cacheKey = baseCurrency;
    const cached = this.cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rates;
    }

    try {
      const response = await fetch(`${EXCHANGE_API_URL}/${baseCurrency}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
      }
      
      const data = await response.json();
      const rates: ExchangeRates = data.rates || {};
      
      // Cache the results
      this.cache.set(cacheKey, {
        rates,
        timestamp: Date.now()
      });
      
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.rates;
      }
      
      // Fallback rates if no cache and API fails
      return this.getFallbackRates();
    }
  }

  convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRates: ExchangeRates
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Convert to USD first if needed, then to target currency
    let amountInUSD = amount;
    if (fromCurrency !== 'USD') {
      const usdRate = exchangeRates[fromCurrency];
      if (usdRate) {
        amountInUSD = amount / usdRate;
      }
    }

    if (toCurrency === 'USD') {
      return amountInUSD;
    }

    const targetRate = exchangeRates[toCurrency];
    if (targetRate) {
      return amountInUSD * targetRate;
    }

    return amount; // Return original if conversion fails
  }

  private getFallbackRates(): ExchangeRates {
    // Provide some fallback rates in case API is unavailable
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73
    };
  }

  getCurrencySymbol(currency: Currency): string {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return symbols[currency] || currency;
  }

  formatAmount(amount: number, currency: Currency): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
} 