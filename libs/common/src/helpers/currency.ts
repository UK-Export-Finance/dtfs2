import { CURRENCY } from '../constants';
import { Currency, CurrencyAndAmount, CurrencyAndAmountString } from '../types';
import { getFormattedMonetaryValue } from './monetary-value';
import { isNonEmptyString } from './string';

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

/**
 * Checks if a currency string is valid by verifying it is a non-empty string
 * and exists in the CURRENCY enum.
 * @param currency - The currency string to validate
 * @returns True if the currency is valid, false otherwise
 */
export const isCurrencyValid = (currency?: string): currency is Currency => {
  return isNonEmptyString(currency) && Object.values(CURRENCY).includes(currency as Currency);
};
