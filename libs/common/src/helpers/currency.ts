import { CurrencyAndAmount, CurrencyAndAmountString } from '../types';
import { getFormattedMonetaryValue } from './monetary-value';

/**
 * Gets the formatted currency and amount with the amount formatted to 2 decimal
 * places with thousands separators
 * @param currencyAndAmount - The currency and amount object
 * @returns The formatted currency and amount
 * @example
 * const amount = getFormattedCurrencyAndAmount({ currency: 'GBP', amount: 3.14159 }); // 'GBP 3.14'
 */
export const getFormattedCurrencyAndAmount = (currencyAndAmount: CurrencyAndAmount): CurrencyAndAmountString =>
  `${currencyAndAmount.currency} ${getFormattedMonetaryValue(currencyAndAmount.amount)}`;
