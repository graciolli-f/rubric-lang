import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Currency, ExchangeRates } from '../types/currency-types';
import { fetchExchangeRates, getCachedRates } from '../services/currency-service';

export interface CurrencyStoreState {
  preferredCurrency: Currency;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  setPreferredCurrency: (currency: Currency) => Promise<void>;
  refreshExchangeRates: () => Promise<void>;
  clearError: () => void;
}

export const useCurrencyStore = create<CurrencyStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        preferredCurrency: 'USD',
        exchangeRates: getCachedRates(),
        isLoading: false,
        error: null,

        setPreferredCurrency: async (currency: Currency) => {
          set({ isLoading: true, error: null });
          
          try {
            set({ preferredCurrency: currency });
            
            // Fetch new exchange rates for the preferred currency
            const rates = await fetchExchangeRates(currency);
            set({ 
              exchangeRates: rates,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update currency',
              isLoading: false 
            });
          }
        },

        refreshExchangeRates: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const { preferredCurrency } = get();
            const rates = await fetchExchangeRates(preferredCurrency);
            set({ 
              exchangeRates: rates,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to refresh exchange rates',
              isLoading: false 
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'currency-preferences',
        partialize: (state) => ({ 
          preferredCurrency: state.preferredCurrency,
          exchangeRates: state.exchangeRates 
        }),
      }
    ),
    {
      name: 'currency-store',
    }
  )
); 