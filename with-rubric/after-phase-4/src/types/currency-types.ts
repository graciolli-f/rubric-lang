export type Currency = "USD" | "EUR" | "GBP";

export const CURRENCIES: readonly Currency[] = [
  "USD",
  "EUR", 
  "GBP"
] as const;

export function isValidCurrency(value: unknown): value is Currency {
  return typeof value === "string" && CURRENCIES.includes(value as Currency);
}

export type CurrencyPreferences = {
  preferredCurrency: Currency;
  lastUpdated: string;
};

export type ExchangeRates = {
  base: Currency;
  rates: Record<Currency, number>;
  lastUpdated: string;
}; 