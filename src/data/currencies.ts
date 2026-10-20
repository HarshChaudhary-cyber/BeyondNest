/**
 * BeyondNest — Supported Currencies Registry
 * 
 * Shared currency definitions with ISO 4217 codes, symbols, and formatting metadata.
 * Ensures consistent currency validation across input forms, local storage restoration,
 * and completion validation.
 */

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimals: number
}

export const SUPPORTED_CURRENCIES: readonly CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', decimals: 2 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', decimals: 0 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', decimals: 2 },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar (SGD)', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZD)', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona (SEK)', decimals: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone (NOK)', decimals: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone (DKK)', decimals: 2 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', decimals: 2 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)', decimals: 2 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso (MXN)', decimals: 2 }
] as const

export const SUPPORTED_CURRENCY_CODES = new Set<string>(
  SUPPORTED_CURRENCIES.map(c => c.code)
)

export function isSupportedCurrency(code: unknown): code is string {
  if (typeof code !== 'string') return false
  return SUPPORTED_CURRENCY_CODES.has(code.trim().toUpperCase())
}

export function findCurrencyByCode(code: string): CurrencyInfo | undefined {
  const normalized = code.trim().toUpperCase()
  return SUPPORTED_CURRENCIES.find(c => c.code === normalized)
}
