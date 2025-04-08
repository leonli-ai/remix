/**
 * Common currency codes based on ISO 4217
 */
export enum CurrencyCode {
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound Sterling
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan
  AUD = 'AUD', // Australian Dollar
  CAD = 'CAD', // Canadian Dollar
  CHF = 'CHF', // Swiss Franc
  HKD = 'HKD', // Hong Kong Dollar
  SGD = 'SGD'  // Singapore Dollar
}

/**
 * Default currency code to use when none is specified
 */
export const DEFAULT_CURRENCY_CODE = CurrencyCode.USD;

/**
 * Type guard to check if a string is a valid currency code
 */
export function isValidCurrencyCode(code?: string): code is CurrencyCode {
  return !!code && Object.values(CurrencyCode).includes(code as CurrencyCode);
} 