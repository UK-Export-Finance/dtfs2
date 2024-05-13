import { CurrencyAndAmount, CurrencyAndAmountString } from '../types';

/**
 * Gets the formatted currency and amount
 * @param currencyAndAmount - The currency and amount object
 * @returns The formatted currency and amount
 * @example
 * const amount = getFormattedCurrencyAndAmount({ currency: 'GBP', amount: 3.14159 }); // 'GBP 3.14'
 */
export const getFormattedCurrencyAndAmount = (currencyAndAmount: CurrencyAndAmount): CurrencyAndAmountString =>
  `${currencyAndAmount.currency} ${currencyAndAmount.amount.toFixed(2)}`;
