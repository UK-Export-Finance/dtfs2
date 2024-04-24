import { CurrencyAndAmount, CurrencyAndAmountString } from '../types';

/**
 * Gets the amount string from a currency and amount object
 * @param currencyAndAmount - The currency and amount object
 * @returns The currency and value string
 * @example
 * const amount = getCurrencyAndAmountString({ currency: 'GBP', amount: 3.14159 }); // 'GBP 3.14'
 */
export const getCurrencyAndAmountString = (currencyAndAmount: CurrencyAndAmount): CurrencyAndAmountString =>
  `${currencyAndAmount.currency} ${currencyAndAmount.amount.toFixed(2)}`;
